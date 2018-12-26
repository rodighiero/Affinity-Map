const state = {
	acronyms: [],
	names: [],
	description: [],
	keyDescription: {},
}

export default {
	init(dataDescription) {
		state.acronyms = dataDescription.affinities.map(desc => desc.acronym).sort()
		state.names = dataDescription.affinities.map(desc => desc.name)
		state.keyDescription = dataDescription.affinities.reduce((o, desc) => {
			return { ...o, [desc.acronym]: desc }
		}, {})
		state.description = dataDescription.affinities

		state.orderedAcronyms = dataDescription.affinities.sort((a,b)=>{return a.order-b.order}).map(desc => desc.acronym)
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
		if( state.visibleAffs ){
			return state.visibleAffs
		} else {
			state.visibleAffs = state.description.filter(o=>o.visibility===true).map(o=>o.acronym).reverse()
			return state.visibleAffs
		}
	},
	reverseVisibleAcronyms(){
		if( state.rvisibleAffs ){
			return state.rvisibleAffs
		} else {
			state.rvisibleAffs = state.description.filter(o=>o.visibility===true).map(o=>o.acronym)
			return state.rvisibleAffs
		}
	},
	orderedAcronyms(){
		return state.orderedAcronyms
	},
}
