// Find the most central space
export default string => {
	const middle = Math.round(string.length / 2)
	for (let i = middle, j = middle; i < string.length || j >= 0; i++ , j--) {
		if (string[i] === ' ') return i
		if (string[j] === ' ') return j
	}
	return 0
}