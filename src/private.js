import config from './settings/config'
import UI from './ui/ui'

require('marx-css/css/marx.css')

require('../assets/css/mainSpinner.css')
require('../assets/css/credits.css')
require('../assets/css/general.css')
require('../assets/css/toggle.css')

config.private = false

const json = require('../assets/data/network-0.2.json')

console.log(json)

UI().init(json, true)