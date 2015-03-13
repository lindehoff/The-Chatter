module.exports = function (io, rooms, roomModel) {
	var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	var chatMessage = new Schema({
		chatRoom: [{ type :ObjectId, ref : 'chatRoom' }],
		chatUser: [{ type :ObjectId, ref : 'chatUser' }],
		posted: Date,
		message: String
	});

	var chatMessageModel = mongoose.model('chatMessage', chatMessage);
	roomModel.find(function (err, result) {
		if(result){
			rooms = result;
		}
		console.log(rooms);
	});

	var chatrooms = io.of('/roomlist').on('connection', function (socket) {
		
		console.log("Connections Established on the Server");
		
		socket.emit('roomupdate', JSON.stringify(rooms));
		
		socket.on('newroom', function(data){
			data.room_name = validator.escape(data.room_name);
			roomModel.create(data, function (err, newChatRoom) {
				rooms.push(newChatRoom);
				socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
				socket.emit('roomupdate', JSON.stringify(rooms));
			});
		});

		socket.on('deleteroom', function(data){
			roomModel.remove(data, function (err) {
				rooms.pop(data);
				socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
				socket.emit('roomupdate', JSON.stringify(rooms));
			});
		});
	})

	var messages = io.of('/messages').on('connection', function (socket) {
		console.log("Connections Established on the Server");
		socket.on('joinroom', function (data) {
			socket.username = data.user;
			socket.userPic = data.userPic;
			socket.join(data.room_number);
			updateUserList(data.room_number, true);
			updateMessageList(data.room_number);
		});

		socket.on('newMessage', function (data) {
			console.log(data.room);
			data.message = validator.escape(data.message);
			chatMessageModel.create({
				chatRoom: data.room._id,
				chatUser: data.user._id,
				posted: new Date(),
				message: data.message
			}, function (err, newChatUser) {
				socket.broadcast.to(data.room._id).emit('messagefeed', JSON.stringify(data));
				socket.to(data.room._id).emit('messagefeed', JSON.stringify(data));
			});
		});

		function updateUserList(room, updateAll) {
			var getUsers = io.of('/messages').clients(room);
			var userlist = [];
			for (var i in getUsers) {
				userlist.push({user:getUsers[i].username, userPic: getUsers[i].userPic});
			};
			socket.to(room).emit('updateUsersList', JSON.stringify(userlist));
			if(updateAll){
				socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userlist))
			}
		}
		function updateMessageList(roomId) {
			chatMessageModel.find({ 'chatRoom': roomId }).populate('chatUser').exec(function (err, messages) {
				socket.to(roomId).emit('messagefeed', JSON.stringify(messages));
			})
		}

		socket.on('updateList', function (data) {
			updateUserList(data.room_number);
		})
	});
}