var express = require('express'),
	app = express(),
	path = require('path');

app.set('view', path.join(__dirname, 'views'));
app.engine('html', require('hogen-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

