import config from './settings/config'
import UI from './ui/ui'

import 'marx-css/css/marx.css'

import '../assets/css/mainSpinner.css'
import '../assets/css/credits.css'
import '../assets/css/general.css'
import '../assets/css/toggle.css'

fetch('/api/public/network', { credentials: 'include' }).then(d => d.json())
	.then(resp => {
		const data = resp.result		
		UI().init(data)
	})