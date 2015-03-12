module.exports = function (passport, FacebookStrategy, config, mongoose) {

	var chatUser = new mongoose.Schema({
		profileID:String,
		fullname:String,
		profilePic:String
	});
	
	chatUser.virtual('chatUserId').get(function() {
	    return this._id;
	});
	var userModel = mongoose.model('chatUser', chatUser);

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		userModel.findById(id, function (err, user) {
			done(err, user);
		});
	})

	passport.use(new FacebookStrategy({
		clientID: config.fb.appID,
		clientSecret: config.fb.appSecret,
		callbackURL: config.fb.callbackURL,
		profileFields: ['id', 'displayName', 'photos']
	}, function (accessToken, refreshToken, profile, done) {
		userModel.findOne({'profileID': profile.id}, function (err, result) {
			if(result){
				done(null, result);
			}else{
				userModel.create({
					profileID: profile.id,
					fullname: profile.displayName,
					profilePic: profile.photos[0].value || ''
				}, function (err, newChatUser) {
					done(null, newChatUser);
				});
			}
		})
	}))
}