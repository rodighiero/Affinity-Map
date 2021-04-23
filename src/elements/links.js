import { scaleLinear } from 'd3-scale'

import state from '../settings/state'
import { drawLinks } from './graphics'
import a from '../tools/affinities'


const tickness = 2

export default (links, ctx = state.context) => {

	const _s = scaleLinear().domain([0, state.linksMax]).range([1, tickness]) // Linear
	const affinities = a.visibleAcronyms()

	const linksToDraw = links.reduce((object, link) => {

		// sum metrics.std[x] values, if state.distance[x] is enabled
		const value = affinities.reduce((o, aff) => o + (state.activation[aff] ? link.metrics.std[aff] : 0), 0)


		const d = Math.sqrt(Math.pow(link.target.x - link.source.x, 2) + Math.pow(link.target.y - link.source.y, 2))

		if ((value > 0) && (
			(d > 0 && d < 700) || 
			(d > 750 && d < 1000)
			)) {

			const thickness = _s(value)
			if (!object[thickness]) object[thickness] = []
			object[thickness].push({
				source: link.source,
				target: link.target,
			})
		}

		return object
	}, {})

	drawLinks(linksToDraw, ctx)

}
