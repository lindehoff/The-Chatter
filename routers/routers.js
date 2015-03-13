module.exports = function (express, app, passport, config, rooms, roomModel) {
	var router = express.Router();

	router.get('/', function (req, res, next) {
		res.render('index', {title: 'Welcome to the Chatter'})
	});
	
	function securePages (req, res, next) {
		if(req.isAuthenticated()){
			next();
		}else{
			res.redirect("/");
		}
	}
	router.get('/auth/facebook', passport.authenticate('facebook'));
	router.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/chatrooms',
		failureRedirect: '/'
	}));

	router.get('/chatrooms', securePages, function (req, res, next) {
		res.render('chatrooms', {title: 'Chatrooms', user: req.user})
	});
	router.get('/room/:id', securePages, function(req, res, next){
		console.log("Render room");
		roomModel.findById(req.params.id,  function (err, result) {
			console.log(JSON.stringify(req.user));
			res.render('room', {userString: JSON.stringify(req.user), roomString: JSON.stringify(result),user: req.user, room: result, config: config});
		});		
	});
	
	router.get('/logout', function(req, res, next){
		req.logout();
		res.redirect('/');
	});

	app.use('/', router)
}