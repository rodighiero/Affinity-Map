import config from './settings/config'
import UI from './ui/ui'

require('marx-css/css/marx.css')

require('../assets/css/mainSpinner.css')
require('../assets/css/credits.css')
require('../assets/css/general.css')
require('../assets/css/toggle.css')

const json = require('../assets/data/network-0.2.json')

UI().init(json, true)