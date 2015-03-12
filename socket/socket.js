module.exports = function (io, rooms) {

	var Schema = mongoose.Schema,
    	ObjectId = Schema.ObjectId;
	var chatRoom = new Schema({
		room_name:String,
		room_number:Number
	});
	chatRoom.virtual('chatRoomId').get(function() {
	    return this._id;
	});
	var roomModel = mongoose.model('chatRoom', chatRoom);

	var chatMessage = new Schema({
		chatRoomId: ObjectId,
		chatUserId: ObjectId,
		posted: Date,
		message: String
	});

	var chatMessageModel = mongoose.model('chatMessage', chatMessage);

	roomModel.find(function (err, result) {
		if(result){
			rooms = result;
		}
	});

	var chatrooms = io.of('/roomlist').on('connection', function (socket) {
		
		console.log("Connections Established on the Server");
		
		socket.emit('roomupdate', JSON.stringify(rooms));
		
		socket.on('newroom', function(data){
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
			socket.chatUserId = data._id;
			socket.join(data.room);
			updateUserList(data.room, true);
		});

		socket.on('newMessage', function (data) {
			
			// chatMessage.create({
			// 	chatRoomId: data.room_number,
			// 	chatUserId: data.userId,
			// 	posted: new Date(),
			// 	message: data.message
			// }, function (err, newChatUser) {
			// 	socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
			// });
			socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
		});

		function updateUserList(rooms, updateAll) {
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

		socket.on('updateList', function (data) {
			updateUserList(data.room);
		})
	});
}