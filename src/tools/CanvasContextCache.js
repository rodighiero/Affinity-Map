/**
 * A cache system, which stores canvas contexts for vizualisation elements (nodes, satellites, ...) at different scales.
 */
export default size => {
	const that = { content: {}, size, memSize: 0, companionCaches: [] }

	that.getCachedContext = (nodeName, scale) => {
		if (that.isCached(nodeName, scale)) {
			return that.content[nodeName][scale]
		} else {
			return undefined
		}
	}

	that.getNewContext = (nodeName, scale) => {
		that.memSize += ((size * scale) ** 2) * 4

		const canvas = document.createElement('canvas')
		canvas.height = size * scale
		canvas.width = size * scale

		const cachedElement = {
			memSize: ((size * scale) ** 2) * 4,
			canvas: canvas,
			context: canvas.getContext('2d'),
			// creationDate:
		};

		(that.content[nodeName] || (that.content[nodeName] = {}))[scale] = cachedElement

		return cachedElement.context
	}

	that.emptyCache = () => {
		
		Object.keys(that.content).forEach(k => {
			const labContent = that.content[k]
			Object.keys(labContent).forEach(scale => {
				const element = labContent[scale]
				element.canvas.height = 0
				element.canvas.width = 0
				that.content[k][scale] = undefined
				delete that.content[k][scale]
			})
			delete that.content[k]
		})
	}

	const getNewElement = (nodeName, scale, creationDate) => {
		that.memSize += ((size * scale) ** 2) * 4

		const canvas = document.createElement('canvas')
		canvas.height = size * scale
		canvas.width = size * scale

		const cachedElement = {
			memSize: ((size * scale) ** 2) * 4,
			canvas: canvas,
			context: canvas.getContext('2d'),
			creationDate,
			scale,
			nodeName,
		};

		(that.content[nodeName] || (that.content[nodeName] = {}))[scale] = cachedElement

		return cachedElement
	}

	that.render = (currentDate, cachedK, nodeName, drawer, finalRenderer) => {
		try {
			if (that.isCached(nodeName, cachedK)) {
				const element = that.content[nodeName][cachedK]
				element.creationDate = currentDate
				finalRenderer(element.canvas)

				return 0
			} else {
				const element = getNewElement(nodeName, cachedK, currentDate)
				drawer(element.canvas, element.context)
				finalRenderer(element.canvas)
				return 1
			}
		}
		catch (e) {
			console.warn(e)
			that.emptyCache(0.5)
			that.companionCaches.forEach(cache => cache.emptyCache())
			return that.render(currentDate, cachedK, nodeName, drawer, finalRenderer)
		}
	}

	that.isCached = (nodeName, scale) => {
		return that.content[nodeName] && that.content[nodeName][scale] && that.content[nodeName][scale].context
	}

	that.getCurrentMemSize = () => {
		return Object.keys(that.content).reduce((o, k1) => {
			return Object.keys(that.content[k1]).reduce((o, k2) => {
				return o + that.content[k1][k2].memSize
			}, o)
		}, 0)
	}

	that.invalidateAll = () => {
		that.content = {}
		return that
	}

	that.init = () => {
		return that
	}

	that.flushCache = () => {
		that.content = {}
		return that
	}

	that.setCompanionCaches = a => {
		that.companionCaches = a
	}

	that.showCurrentMemSize = () => {
		console.log(`Current mem consumption ${that.memSize / (1024 * 1024)}`)
	}

	return that
}