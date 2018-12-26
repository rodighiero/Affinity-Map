import state from '../settings/state'
import { staticColor } from '../settings/colors'
// import { drawKeywords } from './graphics'
import aff from '../tools/affinities'

import spinner from '../ui/spinner'
import config from '../settings/config'

// TODO - All is blocked

// check effective and potential keywords

const isActual = (a, b, link) =>
	((link.source.attr.name === a && link.target.attr.name === b) || (link.target.attr.name === a && link.source.attr.name === b))
	&& aff.visibleAcronyms().some(aff => link.metrics.values[aff])

const setColor = (a, b, links) =>
	links.filter(link => isActual(a, b, link)).length > 0 ? staticColor('keywordsOn') : staticColor('keywordsOff')



// DrawKeywords

const d_min = Math.pow(200, 2)
const d_max = Math.pow(300, 2)

const hashCode = str => {
	let hash = 0
	if (str.length === 0) return hash

	for (let i = 0; i < str.length; i++) {
		const chr = str.charCodeAt(i)
		hash = ((hash << 5) - hash) + chr
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}

const keywordCaches = new Map()

const keywordRequest = (pairs, clbk) => {
	const requestPairs = pairs.map(v => {
		// mark element in cache as INPROGRESS
		keywordCaches.set(v.key, {
			...v,
			status: 'INPROGRESS',
		})

		return { labs: v.labs, key: v.key }
	})

	const allStrings = requestPairs.reduce((o, v) => o + v.key, '')
	const allStringHashes = hashCode(allStrings)

	spinner.start('keywords')
	fetch(`/api/public/keywords?years=${config.years}&hash=${allStringHashes}`, {
		credentials: 'include',
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(requestPairs),
	})
		.then(d => d.json())
		.then(({ result }) => {
			result.forEach(v => {
				const cacheElement = keywordCaches.get(v.key)
				cacheElement.status = 'DONE'
				cacheElement.keywords = v.keywords.map(keyword => keyword.kw)
			})
			spinner.stop('keywords')
			clbk()
		})
}

// TODO : remove that if possible 
window.kc = keywordCaches

export default (links, isAlmostConverged, clbk) => {
	const labCouples = state.pairs.toArray().reduce((o, pair) => {
		const n1 = pair[0].attr.name < pair[1].attr.name ? pair[0] : pair[1]
		const n2 = pair[0].attr.name >= pair[1].attr.name ? pair[0] : pair[1]

		const a = Math.abs(n1.x - n2.x)
		const b = Math.abs(n1.y - n2.y)
		const distance = Math.pow(a, 2) + Math.pow(b, 2)

		if (d_min < distance && distance < d_max) {
			const key = `${n1.attr.name}-${n2.attr.name}-${config.years}`
			const cachedContent = keywordCaches.get(key)
			if (!cachedContent && isAlmostConverged) {
				o.request.push({
					labs: [n1.attr.name, n2.attr.name],
					key: key,
					color: setColor(n1.attr.name, n2.attr.name, links),
				})
			} else {
				if (cachedContent && cachedContent.status === 'DONE') {
					o.ready.push({
						keywords: cachedContent.keywords.filter((v, i, a) => a.indexOf(v) === i),
						color: cachedContent.color,
						x: (n1.x < n2.x ? n1.x : n2.x) + a / 2,
						y: (n1.y < n2.y ? n1.y : n2.y) + b / 2,
					})
				}
			}
		}

		return o
	}, { ready: [], request: [] })

	if (labCouples.request.length > 0) {
		keywordRequest(labCouples.request, clbk)
	}

	// if (labCouples.ready.length > 0) {
	// 	drawKeywords(labCouples.ready)
	// }
}