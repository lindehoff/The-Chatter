var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	config = require('./config/config.js'),
	ConnectMongo = require('connect-mongo')(session)
	mongoose = require('mongoose').connect(config.dbURL),
	passport = require('passport');
	FacebookStrategy = require('passport-facebook').Strategy,
	validator = require('validator'),
	rooms = [];

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

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
var Schema = mongoose.Schema;

var chatRoom = new Schema({
	room_name:String
});
chatRoom.virtual('chatRoomId').get(function() {
    return this._id;
});
var roomModel = mongoose.model('chatRoom', chatRoom);

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

require('./routers/routers.js')(express, app,passport, config, rooms, roomModel);

app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms, roomModel);
server.listen(app.get('port'), function () {
	console.log('ChatCAT on port: '+ app.get('port'));
})