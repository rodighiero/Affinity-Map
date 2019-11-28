const state = {
	acronyms: [],
	affinities: [],
	names: [],
	keyDescription: {},
}

export default {
	init(affinities) {
		state.acronyms = affinities.map(desc => desc.acronym).sort()
		state.names = affinities.map(desc => desc.name)
		state.keyDescription = affinities.reduce((o, desc) => {
			return { ...o, [desc.acronym]: desc }
		}, {})
		state.affinities = affinities

		state.orderedAcronyms = affinities.sort((a,b)=>{return a.order-b.order}).map(desc => desc.acronym)
	},
	acronyms() {
		return state.acronyms
	},
	name(i) {
		if (typeof i === 'string') {
			return state.keyDescription[i].name
		} else { return state.names[i] }
	},
	names(){
		return state.names
	},
	defaultStatus(i) {
		return state.keyDescription[i].default
	},

	visibleAcronyms(){
		// if( state.visibleAffs ){
		// 	return state.visibleAffs
		// } else {

		// 	// console.log(state.affinities)

		// 	state.visibleAffs = state.affinities.filter(o=>o.visibility===true).map(o=>o.acronym).reverse()
		// 	return state.visibleAffs
		// }
		return ['adv', 'pub', 'tea']
	},
	reverseVisibleAcronyms(){
		// if( state.rvisibleAffs ){
		// 	return state.rvisibleAffs
		// } else {
		// 	// state.rvisibleAffs = state.affinities.filter(o=>o.visibility===true).map(o=>o.acronym)
		// 	state.rvisibleAffs =  [...state.visibleAcronyms()].reverse()
		// 	return state.rvisibleAffs
		// }
		return ['tea', 'pub', 'adv']
	},
	orderedAcronyms(){
		return state.orderedAcronyms
	},
}
