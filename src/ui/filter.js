/**
 * Generate and handle the GUI search bar.
 * It downloads its content from the backend and generate the 
 * search bar suggestion list.
 * 
 * It uses a fork of choices.js, which was adapted to our needs.
 * The package will not be updated.
 * https://github.com/ogiermaitre/Choices
 * https://github.com/jshjohnson/Choices
 * 
 */

import Choices from 'choices.js'
import 'choices.js/assets/styles/css/choices.min.css'
import 'choices.js/assets/styles/css/base.min.css'

import { zoomToLab } from '../main/zoom'
import {foldAccents} from '../tools/generalTools'
import config from '../settings/config'

export default (previewLabSet, filterLabs) => {
	const that = { highlighted: [], items: [], previousFilters: [] }

	const cats = {
		kw: 'kw',
		iCo: 'iCountry',
		iN: 'iName',
		iCl: 'iClass',
		inst: 'inst',
		tc: 'themClus',
		lab: 'lab',
	}
	const invCats = Object.keys(cats).reduce((o, k) => ({ ...o, [cats[k]]: k }), {})
	const catNames = {
		kw: ['keyword', 'keywords'],
		inst: ['Institute', 'Institutes'],
		themClus: ['Thematic cluster', 'Thematic clusters'],
		lab: ['Zoom to Laboratory', 'Laboratories'],
	}

	const matcherRe = /([a-zA-Z]+):(.*)/

	/******************************************************************************
	 * Check for each filter, if it applies to something in the graph.
 	 * Update the choices after.
	 ******************************************************************************/
	const validateFilters = () => {
		if (that.graph && that.choices) {
			const set = that.graph.nodes.reduce((o, v) => o.add(v.attr.name), new Set())
			that.choices = that.choices
				.map(v => ({
					...v,
					choices: v.choices.filter(o => o.customProperties.labs.some(l => set.has(l))),
				}))

			that.multipleDefault.setChoices(that.choices, 'value', 'label', true)
		}
	}


	const loadData = privateAccess => {
		let id = 0
		const proms = Promise.all([
			fetch(privateAccess ? `/api/private/filter?years=${config.years}` : `/api/public/filter?years=${config.years}`, { credentials: 'include' }).then(d => d.json()),
			fetch(`/api/public/search?years=${config.years}`, { credentials: 'include' }).then(d => d.json()),
		])

		proms.then(([filterData, searchData]) => {
			// give the choices in a given order
			//	institutes
			// 	themClusters
			//	laboratories
			// 	keywords

			const addCat = (cat, i) => {
				return {
					label: catNames[cat.cat][1],
					id: i,
					disabled: false,
					choices: cat.result.sort((a, b) => a.key.localeCompare(b.key)).map(res => ({ value: res.key, label: res.key, customProperties: { cat: cat.cat, labs: res.value, dataId: id++, ...res.attr } })),
				}
			}

			that.choices = filterData.result.filter(o => ['inst', 'themClus'].indexOf(o.cat) !== -1).map(addCat)

			that.choices = searchData.result
				.reduce((o, cat) => [
					...o,
					{
						label: catNames[cat.cat][1],
						id: o.length,
						choices: cat.result.sort((a, b) => a.acronym.localeCompare(b.acronym)).map(v => ({
							value: v.acronym,
							label: v.enName,
							customProperties: { notItemize: true, cat: cat.cat, labs: [v.acronym], acronym: v.acronym, displayName: v.displayName },
						})),
					},
				], that.choices)

			that.choices = filterData.result.filter(o => o.cat === 'iClass').reduce((o, cat) => [...o, addCat(cat, that.choices.length)], that.choices)
			that.choices = filterData.result.filter(o => o.cat === 'iCountry').reduce((o, cat) => [...o, addCat(cat, that.choices.length)], that.choices)
			that.choices = filterData.result.filter(o => o.cat === 'iName').reduce((o, cat) => [...o, addCat(cat, that.choices.length)], that.choices)
			that.choices = filterData.result.filter(o => o.cat === 'kw').reduce((o, cat) => [...o, addCat(cat, that.choices.length)], that.choices)

			that.multipleDefault.setChoices(that.choices, 'value', 'label', true)

			validateFilters()
			// if (clbk) { clbk() }
		})
	}

	/******************************************************************************
     * Custom search handler. Returns a function that search all the searchFields
     * for the term found in the pattern of in kw:term
    ******************************************************************************/
	const searchCustomFun = (value, searchFields) => {
		const foldedValue = foldAccents(value)
		const match = matcherRe.exec(foldedValue)
		const cmpFieldsAndValue = (o, v = foldedValue) =>
			searchFields.some(f => foldAccents(o[f]).toLowerCase().indexOf(v.toLowerCase()) !== -1)
			|| (o.customProperties.displayName ? foldAccents(o.customProperties.displayName).toLowerCase().indexOf(v.toLowerCase()) !== -1 : false)

		return o => {
			if (match) {
				const cat = match[1]
				if (Object.keys(cats).indexOf(cat) !== -1) {
					const queryTerm = match[2]
					return cats[cat] === o.customProperties.cat && cmpFieldsAndValue(o, queryTerm)
				}
				else { return cmpFieldsAndValue(o) }
			}
			else { return cmpFieldsAndValue(o) }
		}
	}

	const callbackOnCreateTemplates = function (template) {
		const { classNames } = this.config
		return {
			item: data =>
				template(`
                    <div class="${classNames.item} ${data.highlighted ? classNames.highlightedState : classNames.itemSelectable}" data-item data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
                        ${invCats[data.customProperties.cat]}: ${data.label}
                        <span class="choices__button" data-button aria-label="Remove item: '${data.value}'">x</span>
                    </div>
                `),
			choice: data => {
				if (data.customProperties.cat === 'inst') {
					return template(`
					<div class="${classNames.item} ${classNames.itemChoice} ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable}" data-select-text="${data.customProperties ? catNames[data.customProperties.cat][0] : this.config.itemSelectText}" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
						<img src=${require('../../assets/svg/filter.svg')} class='choiceIcon'>
						${data.customProperties.displayName} <span class="labacronym">${data.label}</span>
					</div>`
					)
				}

				return template(`
                    <div class="${classNames.item} ${classNames.itemChoice} ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable}" data-select-text="${data.customProperties ? catNames[data.customProperties.cat][0] : this.config.itemSelectText}" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
						<img src=${data.customProperties.notItemize ? require('../../assets/svg/search.svg') : require('../../assets/svg/filter.svg')} class='choiceIcon'>
						${data.label}${data.customProperties.acronym ? ` <span class="labacronym">${(data.customProperties.displayName ? data.customProperties.displayName : data.customProperties.acronym)}</span>` : ''}
					</div>`
				)
			},
		}
	}

	const previewCPArray = cpa => {
		const labSet = cpa.reduce((o, v) => {
			return v.customProperties.labs.reduce((o, v) => o.add(v), o)
		}, new Set())

		previewLabSet(that.graph, labSet)
	}

	const previewHighlighted = () => previewCPArray(that.highlighted)
	const previewItems = () => previewCPArray(that.items)

	const createFormula = () => {
		return that.previousFilters.map(pf => {
			if (pf.length === 1) { return `${invCats[pf[0].customProperties.cat]}:${pf[0].label}` }
			else {
				const conjuction = pf.map(v => `${invCats[v.customProperties.cat]}:${v.label}`).join(' ∪ ')
				return `(${conjuction})`
			}
		}).join(' ∩ ')
	}

	const refreshButtons = () => {
		if (that.items.length > 0) {
			document.getElementById('validate').disabled = false
		} else { document.getElementById('validate').disabled = true }

		if (that.previousFilters.length > 0) {
			document.getElementById('reset').disabled = false
		} else { document.getElementById('reset').disabled = true }
	}

	/******************************************************************************
     * here are the different event handlers
    ******************************************************************************/
	const onHighlightItem = ({ detail }) => {
		that.highlighted.push(detail)
		previewHighlighted()
	}

	const onUnhighlightItem = ({ detail }) => {
		const removeIndex = that.highlighted.findIndex(e => e.value === detail.value && e.groupValue === detail.groupValue)
		that.highlighted.splice(removeIndex, 1)

		if (that.highlighted.size) { previewHighlighted() }
		else { previewItems() }
	}

	const onHighlightChoice = ({ detail }) => {
		const labSet = detail.customProperties.labs.reduce((o, v) => o.add(v), new Set())
		previewLabSet(that.graph, labSet)
	}

	const onAddItem = e => {
		/******************************************************************************
         * If object has customProperties.notItemize property, 
         * just zoom on its first lab, otherwise add it to the items array
        ******************************************************************************/
		if (e.detail.customProperties.notItemize) {
			zoomToLab(that.graph, e.detail.customProperties.labs[0])
			that.multipleDefault.hideDropdown()
		}
		else { that.items.push(e.detail) }

		refreshButtons()

		// that.multipleDefault.hideDropdown()
	}

	const onRemoveItem = ({ detail }) => {
		that.items.splice(
			that.items.findIndex(e => e.value === detail.value && e.groupValue === detail.groupValue),
			1
		)

		refreshButtons()
		previewItems()
	}

	const onHideDropdown = () => {
		previewItems()
	}

	const refreshFormula = () => {
		const formula = createFormula()
		document.getElementById('formula').innerText = formula ? `Current filter(s): ${createFormula()}` : ''

		refreshButtons()
	}

	const onValidate = () => {
		if (that.items.length) {
			const labSet = that.items.reduce((o, v) => {
				return v.customProperties.labs.reduce((o, v) => o.add(v), o)
			}, new Set())

			filterLabs(that.graph, labSet)

			that.previousFilters.push(that.items)
			that.items = []

			const unionLabs = filters => filters.reduce((o, v) => v.customProperties.labs.reduce((o, v) => o.add(v), o), new Set())

			// get the labs that passe through the filters
			const gLabSet = that.previousFilters.slice(1).reduce(
				(o, v) =>
					[...unionLabs(v)].reduce((ret, v) => {
						if (o.has(v)) { ret.add(v) }
						return ret
					}, new Set()),
				unionLabs(that.previousFilters[0]))

			// now update the choices that are still pertinent with the available labs
			that.choices.forEach(cat => {
				cat.choices.forEach(choice => {
					choice.disabled = !choice.customProperties.labs.some(lab => {
						return gLabSet.has(lab)
					})
				})
			})


			that.multipleDefault.removeActiveItems()
			that.multipleDefault.setChoices(that.choices, 'value', 'label', true)
			refreshFormula()

			that.multipleDefault.clearInput()
		}
	}

	const attachEventListeners = () => {
		that.multipleDefault.passedElement.addEventListener('highlightItem', onHighlightItem, false)
		that.multipleDefault.passedElement.addEventListener('unhighlightItem', onUnhighlightItem, false)
		that.multipleDefault.passedElement.addEventListener('highlightChoice', onHighlightChoice, false)

		that.multipleDefault.passedElement.addEventListener('addItem', onAddItem, false)
		that.multipleDefault.passedElement.addEventListener('removeItem', onRemoveItem, false)
		that.multipleDefault.passedElement.addEventListener('hideDropdown', onHideDropdown, false)

		document.getElementById('validate').addEventListener('click', onValidate, false)
	}

	/******************************************************************************
     * Finally the external functions,
     *  to initialize the component
     *  and to set the graph on which the filter will act
    ******************************************************************************/
	that.init = (privateAccess = false) => {
		that.multipleDefault = new Choices(
			document.getElementById('choices-multiple-groups'),
			{
				placeholder: true,
				placeholderValue: 'Start typing and select from list...',
				removeItemButton: true,
				searchCustomFun,
				callbackOnCreateTemplates,
				focusDropdownAfterItemSelect: false,
				searchResultLimit: 1000,
				shouldSort: false,
			})

		attachEventListeners()
		loadData(privateAccess)
		return that
	}

	that.reinit = privateAccess => {
		loadData(privateAccess)
	}

	that.setGraph = graph => {
		that.graph = graph

		validateFilters()
		return that
	}

	that.reset = () => {
		// reset disable choices
		that.choices.forEach(cat => cat.choices.forEach(choice => { choice.disabled = false }))
		that.multipleDefault.setChoices(that.choices, 'value', 'label', true)

		// clear formula
		that.previousFilters = []
		refreshFormula()

		// clear items
		that.multipleDefault.removeActiveItems()


		return that
	}

	return that
}
