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

fetch('/api/private/institutions?years=2017', { credentials: 'include' }).then(d => d.json())
	.then(data => config.institutions = setInstitutionsFromBackend(data.result))


fetch('/api/private/network?years=2017', { credentials: 'include' }).then(d => d.json())
	.then(resp => UI().init(resp.result, true))
