/******************************************************************************
* This object describes the state of the applications
*  - zoom informations
*  - canvas node and context
*  - data (graph and description)
*  - ...
*  - simulation state
******************************************************************************/
const state = {
	activation: undefined,
	canvas: undefined,
	chordLayouts: undefined,
	context: undefined,
	// initialGraph: undefined,
	pairs: undefined,
	linksMax: undefined,
	zoom: undefined,
	zoomTransform: undefined,
	enacOnly: false,

	// some helper functions
	init: data => {

		// Set initial graph
		// state.initialGraph = {
		// 	nodes: data.graph.nodes,
		// 	links: data.graph.links
		// }

		// Set affinity activation
		state.activation = data.affinities.reduce((o, affinity) => ({
			...o,
			[affinity.acronym]: affinity.default,
		}), {})
	},

	
	initGraphs(graph) {
		graph.nodes.forEach(n => n.visibility = true)

		state.epGraph = {
			links: graph.links,
			nodes: graph.nodes,
		}

		state.enGraph = {
			links: graph.links.filter(l => {
				const sourceNode = typeof l.source === 'string' ? graph.nodes.find(o => o.attr.name === l.source) : l.source
				const targetNode = typeof l.target === 'string' ? graph.nodes.find(o => o.attr.name === l.target) : l.target

				return sourceNode.attr.faculty === 'ENAC' && targetNode.attr.faculty === 'ENAC'
			}),
			nodes: state.epGraph.nodes.filter(n => n.attr.faculty === 'ENAC'),
		}
	},
}

export default state