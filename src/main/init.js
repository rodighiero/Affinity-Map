import { scaleLinear } from 'd3-scale'
import { range } from 'd3-array'
import MobileDetect from 'mobile-detect'

import config from '../settings/config'
import state from '../settings/state'
import lab from '../elements/chord'

import affinities from '../tools/affinities'
import { initCaches } from '../elements/cachedElements'

state.debug = new URL(window.location.href).searchParams.get('debug') !== null

export const init = data => {

	window.state = state
	window.config = config

	state.init(data)
	affinities.init(data.description)

	// Object { aff1:0, aff2:0, ...}
	const aObject = affinities.acronyms().reduce((o, v) => ({ ...o, [v]: 0 }), {})

	// Initialize chord diagrams and ribbon
	state.chordLayouts = data.graph.nodes.reduce((o, node) => {
		// create an empty matrix, if its current length is 0
		if (node.network.matrix.length === 0) {
			const internalNodeLength = node.network.nodes.length
			node.network.matrix = range(0, internalNodeLength).map(() => range(0, internalNodeLength).map(() => 0))
		}
		o[node.attr.name] = lab()
			.padding(.02)
			.matrix(node.network.matrix)
		return o
	}, {})


	// compute the mean link.sizes values, store them into link.std
	// Set metrics.values for the links
	const meanLinkValue = data.graph.links.reduce((o, link) => {
		affinities.acronyms().forEach(k => o[k] += link.metrics.values[k] / data.graph.links.length)
		return o
	}, { ...aObject })

	data.graph.links.forEach(link => {
		link.metrics.std = affinities.acronyms().reduce((o, aff) => {
			return { ...o, [aff]: link.metrics.values[aff] / meanLinkValue[aff] }
		}, {})
	})


	// Set satellites rings width

	const maxLinks = data.graph.links.reduce((o, link) => {
		const sum = affinities.visibleAcronyms().reduce((o, v) => o + link.metrics.values[v], 0)
		return o > sum ? o : sum
	}, 0)

	const scale = scaleLinear().domain([1, maxLinks]).range([config.satellite.width.min, config.satellite.width.max])

	data.graph.links.forEach(link => {
		link.metrics.widths = affinities.acronyms().reduce((o, aff) => {
			o[aff] = scale(link.metrics.values[aff])
			return o
		}, {})
	})

	// Set satellite radius

	data.graph.links.forEach(link => {
		const widths = link.metrics.widths,
			values = link.metrics.values
		link.satelliteRadius = config.satellite.radius + config.satellite.width.gap * 4 +
		affinities.visibleAcronyms().reduce((o, v) => {
				return o + (values[v] > 0 ? widths[v] : config.satellite.width.empty)
			}, 0)
	})

	const md = new MobileDetect(window.navigator.userAgent)
	config.client = {
		isMobile: md.mobile() !== null,
		isTablet: md.tablet() !== null,
		md,
	}

	initCaches()
}