import { range } from 'd3-array'

const π = Math.PI
const τ = 2 * π

export default () => {
	const chord = {}
	let chords
	let groups
	let matrix
	let n
	let padding = 0

	const relayout = () => {
		const subgroups = {}
		const groupSums = []
		const groupIndex = range(n)
		const subgroupIndex = []
		let k
		let x
		let x0
		let i
		let j

		chords = []
		groups = []

		// Compute the sum.
		k = 0, i = -1

		while (++i < n) {
			x = 0, j = -1

			while (++j < n) {
				x += matrix[i][j]
			}
			groupSums.push(x)
			subgroupIndex.push(range(n))
			k += x
		}

		// Convert the sum to scaling factor for [0, 2pi].
		// TODO Allow start and end angle to be specified.
		// TODO Allow padding to be specified as percentage?

		k = (τ - padding * n) / n

		// Compute the start and end angle for each group and subgroup.

		x = 0, i = -1
		while (++i < n) {

			x0 = x, j = -1
			const di = groupIndex[i]

			while (++j < n) {
				const dj = subgroupIndex[di][j]
				const v = matrix[di][dj]
				const a0 = x
				const a1 = x += groupSums[di] > 0 ? v * (k / groupSums[di]) : 0

				subgroups[di + '-' + dj] = {
					index: di,
					subindex: dj,
					startAngle: a0,
					endAngle: a1,
					value: v,
				}
			}
			if (groupSums[di] === 0) x += k

			groups[di] = {
				index: di,
				startAngle: x0,
				endAngle: x,
				value: groupSums[di],
			}
			x += padding
		}

		// Generate chords for each (non-empty) subgroup-subgroup link.
		i = -1
		while (++i < n) {
			j = i - 1
			while (++j < n) {
				const source = subgroups[i + '-' + j]
				const target = subgroups[j + '-' + i]
				chords.push(source.value < target.value
					? { source: target, target: source }
					: { source: source, target: target })
			}
		}
	}

	chord.matrix = x => {
		if (!arguments.length) return matrix
		n = (matrix = x) && matrix.length
		chords = groups = null
		return chord
	}

	chord.padding = x => {
		if (!arguments.length) return padding
		padding = x
		chords = groups = null
		return chord
	}

	chord.chords = () => {
		if (!chords) relayout()
		return chords
	}

	chord.groups = () => {
		if (!groups) relayout()
		return groups
	}

	return chord
}
