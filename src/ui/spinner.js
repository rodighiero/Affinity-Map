/**
 * A global object to manage the loader spinner located in the bottom bar (left to the menu).
 */

import { select } from 'd3-selection'

import state from '../settings/state'
import '../../assets/css/littleSpinner.css'


// from: http://tobiasahlin.com/spinkit/
export default {
	counterSet:new Set(),
	start(name) {
		this.counterSet.add(name)
		select('div.littleSpinner').style('visibility', 'visible')
		if (state.debug) {
			console.log(`Start spinner: ${[...this.counterSet]} task(s)`)
		}

		window.debugSpin = this
	},
	stop(name) {
		this.counterSet.delete(name)
		if (this.counterSet.size===0) {
			select('div.littleSpinner').style('visibility', 'hidden')
		}
		if (state.debug) {
			console.log(`Stop spinner: ${[...this.counterSet]} remaining task(s)`)
		}
	},
}