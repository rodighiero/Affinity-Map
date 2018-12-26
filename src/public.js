import config from './settings/config'
import { setInstitutionsFromBackend } from './main/init'
import UI from './ui/ui'

require('marx-css/css/marx.css')

require('../assets/css/mainSpinner.css')
require('../assets/css/inputBar.css')
require('../assets/css/credits.css')
require('../assets/css/general.css')
require('../assets/css/toggle.css')

config.private = true

const json = require('../assets/data.json')

console.log(json)

UI().init(json, true)
