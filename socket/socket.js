module.exports = function (io) {
	var chatrooms = io.of('/roomlist').on('connection', function (socket) {
		
		console.log("Connections Established on the Server");
		
		socket.emit('roomupdate', JSON.stringify(rooms));
		
		socket.on('newroom', function(data){
			rooms.push(data);
			socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
			socket.emit('roomupdate', JSON.stringify(rooms));
		});
	})
}