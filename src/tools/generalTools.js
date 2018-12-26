import combinatorics from 'js-combinatorics'
import state from '../settings/state'

// Find the most central space
export const middleSpace = string => {
	const middle = Math.round(string.length / 2)
	for (let i = middle, j = middle; i < string.length || j >= 0; i++ , j--) {
		if (string[i] === ' ') return i
		if (string[j] === ' ') return j
	}
	return 0
}

// Create all pairs
export const initPairs = nodes => {
	state.pairs = nodes.length > 1 ? combinatorics.bigCombination(nodes, 2) : []
}