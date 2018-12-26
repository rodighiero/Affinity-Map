import { max } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import { ribbon } from 'd3-chord'

import state from '../settings/state'
import config from '../settings/config'
import { staticColor, unitColor } from '../settings/colors'
import a from '../tools/affinities'


/******************************************************************************
*
* Primitives
*
******************************************************************************/

const drawAcronym = (text, context) => {
	context.fillStyle = staticColor('foreground')
	context.font = 'normal 500 6pt Arial'
	context.textAlign = 'center'
	context.fillText(text, 0, 2)
}

const drawArc = (r, width, startAngle, endAngle, stroke, context) => {
	context.beginPath()
	context.arc(0, 0, r, startAngle, endAngle, false)
	context.lineWidth = width
	context.strokeStyle = stroke
	context.stroke()
}

const drawChord = (chord, alpha, ribbon, context) => {
	let color = staticColor('chord')
	color.opacity = alpha
	context.beginPath()
	ribbon(chord)
	context.fillStyle = color.toString()
	context.fill()
}

const drawHead = (text, context) => {
	context.scale(0.1, 0.1)
	context.fillStyle = staticColor('foreground')
	context.font = 'normal 400 23pt Arial'
	context.textAlign = 'center'
	context.fillText(text, 0, 80)
	context.scale(10, 10)
}

const drawIndividuals = (individuals, context) => {
	context.scale(0.1, 0.1)
	context.fillStyle = staticColor('foreground')
	context.font = 'normal 350 7pt Arial'
	context.textAlign = 'center'

	individuals.forEach(individual => {
		context.rotate(individual.rotation)
		context.fillText(individual.string_a, 0, (- individual.distance - .1) * 10) // Mirroring labels
		context.fillText(individual.string_b, 0, (- individual.distance + 1.1) * 10) // Mirroring labels
		context.rotate(-individual.rotation)
	})
	context.scale(10, 10)
}

export const drawInnerCircle = (r, fill, context) => {
	context.beginPath()
	context.ellipse(0, 0, r, r, 0, 0, Math.PI * 2)
	context.fillStyle = fill
	context.fill()
}

const lineSpacing = 5
const maxKeywords = 10

export const drawKeywords = pairs => {
	pairs.forEach(pair => {
		state.context.beginPath()
		state.context.font = 'normal 500 3pt Arial'
		state.context.textAlign = 'center'
		state.context.fillStyle = pair.color
		state.context.fill()
		const offSet = Math.min(maxKeywords, pair.keywords.length) / 2 * lineSpacing
		state.context.translate(pair.x, pair.y - offSet)
		pair.keywords.slice(0, maxKeywords).forEach((text, i) => state.context.fillText(text, 0, i * lineSpacing))
		state.context.translate(-pair.x, -pair.y + offSet)
	})
}

export const drawLinks = (links, ctx) => {

	Object.entries(links).forEach(([key, value]) => {
		ctx.beginPath()
		ctx.strokeStyle = staticColor('link')
		ctx.lineWidth = key
		value.forEach(link => {
			ctx.moveTo(link.source.x, link.source.y)
			ctx.lineTo(link.target.x, link.target.y)
		})
		ctx.stroke()
	})
}

const drawName = (text_a, text_b, context) => {
	context.scale(0.1, 0.1)
	context.fillStyle = staticColor('foreground')
	context.font = 'normal 400 18pt Arial'
	context.textAlign = 'center'
	context.fillText(text_a, 0, -100)
	context.fillText(text_b, 0, -70)
	context.scale(10, 10)
}

const drawOuterCircle = (r, width, stroke, context) => {
	context.beginPath()
	context.ellipse(0, 0, r, r, 0, 0, Math.PI * 2)
	context.lineWidth = width
	context.strokeStyle = stroke
	context.stroke()
}

const width = .4

export const drawOrbit = (distance, x, y, ctx) => {
	ctx.translate(x, y)
	ctx.globalCompositeOperation = 'destination-over'
	drawOuterCircle(distance, width, staticColor('orbits'), ctx)
	ctx.globalCompositeOperation = 'source-over'
	ctx.translate(-x, -y)
}

export const drawSatelliteAcronym = (text, ctx) => {

	ctx.scale(.1, .1)
	ctx.fillStyle = staticColor('foreground')
	ctx.font = 'normal 400 8pt Arial'
	ctx.textAlign = 'center'
	ctx.fillText(text, 0, 4)
	ctx.scale(10, 10)
}



const drawInstitutions = (node, context) => {

	if (config.institutions) {
		context.scale(0.1, 0.1)
		const lab = config.institutions.filter(obj =>
			obj.Acronym === node.attr.name
		)[0] // Select the lab

		if ((typeof lab !== 'undefined') && (lab.Institutions.length > 0)) {

			lab.Institutions.forEach((d, i) => {

				let _o = Math.asin(i / lab.Institutions.length * 2 - 1)
				if (i % 2)
					_o += Math.PI
				const x = 1.02 * config.node.radius * Math.cos(_o),
					y = 1.02 * config.node.radius * Math.sin(_o),
					align = Math.cos(_o) > 0 ? 'left' : 'right'

				context.font = 'normal 300 13pt Arial'
				context.fillStyle = staticColor('institutions')
				context.textAlign = align
				context.fillText(d.Name, x * 10, y * 10)

			})
		}
		context.scale(10, 10)
	}
}

/******************************************************************************
*
* Nodes
*
******************************************************************************/

const _s = scaleLinear().range([config.node.min, config.node.max])

export const drawNode = (node, context, labNameScale) => {

	// Init
	let _r = config.node.radius // Inheritance of size		
	const chords = state.chordLayouts[node.attr.name].chords()
	const groups = state.chordLayouts[node.attr.name].groups()

	// Background
	drawInnerCircle(config.node.radius, staticColor('background'), context)

	// Quantitative rings
	if (node.attr.faculty === 'ENAC') {
		const total = a.visibleAcronyms().reduce((total, key) => total + node.metrics.std[key], 0)
		_s.domain([0, total])
		a.visibleAcronyms().forEach(affinity => {
			const _w = _s(node.metrics.std[affinity])
			_r -= config.node.gap + _w
			drawOuterCircle(_r + _w / 2, _w, unitColor(node.attr.institute, affinity), context)
		})
	} else {
		const total = 1
		_s.domain([0, total])
		const _w = _s(1)
		_r -= config.node.gap + _w
		drawOuterCircle(_r + _w / 2, _w, staticColor('externalNode'), context)
	}

	// Scholars' names
	_r -= config.node.gap + config.node.scholarThickness
	drawOuterCircle(_r + config.node.scholarThickness / 2, config.node.scholarThickness, staticColor('lighterBackground'), context) // Background
	if (node.attr.faculty === 'ENAC') {
		if (config.visibility.individuals) {
			const individuals = groups.reduce((array, individual) => {
				array.push({
					distance: _r + (config.node.gap + config.node.scholarThickness) / 2,
					rotation: individual.startAngle + (individual.endAngle - individual.startAngle) / 2,
					string_a: node.network.nodes[individual.index].attr.name_a,
					string_b: node.network.nodes[individual.index].attr.name_b,
				})
				return array
			}, [])
			drawIndividuals(individuals, context)
		}
	}

	// Segments: visible affinities
	const setBackground = () => {
		_r -= config.node.gap + config.node.arc.max
		drawOuterCircle(_r + config.node.arc.max / 2, config.node.arc.max, staticColor('lighterBackground'), context)
	}
	const scaleAff = scaleLinear().range([0, config.node.arc.max])
	a.visibleAcronyms().forEach(aff => {
		const hasAff = individual => node.network.nodes[individual.index].metrics.values[aff] > 0
		scaleAff.domain([0, node.metrics.max[aff]])
		setBackground()
		if (node.attr.faculty === 'ENAC') {
			groups.filter(hasAff).forEach(individual =>
				drawArc(
					_r + config.node.arc.max / 2,
					scaleAff(node.network.nodes[individual.index].metrics.values[aff]),
					individual.startAngle - Math.PI / 2, individual.endAngle - Math.PI / 2,
					unitColor(node.attr.institute, aff),
					context
				)
			)
		}
	})

	// Chords diagram
	if (node.attr.faculty === 'ENAC') {
		if (config.visibility.chords) {
			_r -= config.node.gap
			const valid = chord => chord.source.value > 0 && chord.target.value > 0,
				_max = max(chords, chord => chord.source.value),
				_scaleTransparency = scaleLinear().domain([0, _max]).range([0.05, 0.2])
			chords.filter(valid).forEach(chord => drawChord(chord, _scaleTransparency(chord.source.value), ribbon().context(context).radius(_r), context))
		}
	}

	if (labNameScale)
		context.scale(labNameScale, labNameScale)

	// Laboratory informations
	if (config.visibility.labNames)
		drawName(node.attr.enName_a, node.attr.enName_b, context)
	if (config.visibility.acronym)
		drawAcronym(node.attr.displayName ? node.attr.displayName : node.attr.name, context)
	if (config.visibility.headNames)
		drawHead(node.attr.labProfNames, context)
	if (labNameScale)
		context.scale(1 / labNameScale, 1 / labNameScale)

	// Institutions
	if (config.visibility.institutions && !config.client.isMobile && !config.client.isTablet)
		drawInstitutions(node, context)

	// Set visibility
	if (!node.visibility)
		drawInnerCircle(config.node.radius, staticColor('filteredBackground'), context)
}

/******************************************************************************
*
* Satellites
*
******************************************************************************/

export const drawSatellite = (satellite, link, ctx, satScale, nameScale) => {
	const { widths, values } = link.metrics
	const satConf = config.satellite

	// Translate context
	// ctx.translate(satellite.pos.abs.x, satellite.pos.abs.y)
	if (satScale && satScale !== 1) { ctx.scale(satScale, satScale) }

	// Drawing background
	drawInnerCircle(link.satelliteRadius, staticColor('background'), ctx)

	// Drawing acronym
	if (nameScale && nameScale !== 1)
		ctx.scale(nameScale, nameScale)
	drawSatelliteAcronym(satellite.name, ctx)
	if (nameScale && nameScale !== 1)
		ctx.scale(1 / nameScale, 1 / nameScale)

	// Drawings halos
	a.reverseVisibleAcronyms().reduce((_r, aff) => {
		if (!values[aff]) {
			_r += satConf.width.gap + satConf.width.empty
			drawOuterCircle(_r - satConf.width.empty * .5, satConf.width.empty, staticColor('placeholder'), ctx)
		} else {
			_r += satConf.width.gap + widths[aff]
			if (satellite.faculty === 'ENAC') {
				drawOuterCircle(_r - widths[aff] * .5, widths[aff], unitColor(satellite.institute, aff), ctx)
			} else {
				drawOuterCircle(_r - widths[aff] * .5, widths[aff], staticColor('externalNode'), ctx)
			}

		}
		return _r
	}, satConf.radius)

	// Set visibility
	if (!satellite.visibility)
		drawInnerCircle(link.satelliteRadius, staticColor('filteredBackground'), ctx)

	// Restore
	if (satScale && satScale !== 1)
		ctx.scale(1 / satScale, 1 / satScale)
}