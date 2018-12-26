import combinatorics from 'js-combinatorics'
import state from '../settings/state'

// Create all pairs
export default nodes => {
	state.pairs = nodes.length > 1 ? combinatorics.bigCombination(nodes, 2) : []
}