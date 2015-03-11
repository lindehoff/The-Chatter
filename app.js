var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	config = require('./config/config.js'),
	ConnectMongo = require('connect-mongo')(session)
	mongoose = require('mongoose').connect(config.dbURL);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
var env = process.env.NODE_ENV || 'development';

var env = process.env.NODE_ENV || 'development';
if(env === 'development'){
	app.use(session({
		secret: config.sessionSecret, 
		saveUninitialized:true, 
		resave:true
	}));
}else{
	app.use(session({
		secret: config.sessionSecret, 
		store: new ConnectMongo({
			//url:config.dbURL,
			mongoose_connection: mongoose.connections[0],
			stringify:true
		}),
		saveUninitialized:true, 
		resave:true
	}));	
}

require('./routers/routers.js')(express, app);

app.listen(3000, function() {
	console.log('The Chatter is running on port: 3000')
})