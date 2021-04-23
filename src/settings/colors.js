import { lab, rgb } from 'd3-color'
import state from './state'

// Setting color palettes

const enac = {
	IA: rgb(255, 255, 255),
	IIC: rgb(255, 255, 255),
	IIE: rgb(255, 255, 255),
}

const elements = {
	background: rgb(255, 0, 0).toString(),
	backgroundSatellites: rgb(255, 255, 255).toString(),
	foreground: rgb(255, 255, 255).toString(),
	lighterBackground: rgb(45, 45, 45).toString(),
	filteredBackground: rgb(45, 45, 45, .8).toString(),
	placeholder: rgb(80, 80, 80).toString(),
	link: rgb(255, 255, 255).toString(),
	orbits: rgb(255, 255, 255).toString(),
	externalNode: rgb(60, 60, 60),
	keywordsOn: rgb(220, 220, 220).toString(),
	keywordsOff: rgb(150, 150, 150).toString(),
	transparent: rgb(0, 0, 0, 0).toString(),
	chord: rgb(255, 255, 255),
}

// Get static colors
export function staticColor(code) {
	return elements[code]
}

// Get institute colors
export function unitColor(institute, affinity) {
	return state.activation[affinity] ? enac[institute].toString() : enac[institute].brighter(1.5).toString()
}