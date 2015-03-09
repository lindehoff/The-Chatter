var express = require('express'),
	app = express(),
	path = require('path');

app.set('view', path.join(__dirname, 'views'));