export default {
	
	years:[2017],

	node: {
		arc: {
			max: 2,
		},
		distance: 110,
		gap: .5,
		min: .1,
		max: 8,
		radius: 55,
		scholarThickness: 4,
	},

	satellite: {
		width: {
			empty: .2,
			gap: .2,
			min: .2,
			max: 3,
		},
		radius: 3,
	},

	screen: {
		width: null,
		height: null,
		density: 1,
	},

	visibility: {
		acronym: true,
		chords: true,
		filter: true,
		individuals: true,
		institutions: true,
		keywords: false,
		links: true,
		nodes: true,
		satellites: true,
		headNames: true,
		labNames: true,
		orbits: true,
	},

	zoom: {
		min: .1,
		init: .3,
		visibility: 2,
		finder: 5,
	},

}