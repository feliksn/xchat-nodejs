// Environment variables
const PORT = process.env.PORT || 3000;
const SOCKET_PATH =  process.env.SOCKET_PATH || '';
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS; 
const DB_NAME = process.env.DB_NAME;

// Node modules
const http  = require('node:http');
const path = require('node:path');
const express = require('express');
const { Server } = require('socket.io');
const mysql = require('mysql2');

// Create a db connection
const db = mysql.createConnection({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASS,
	database: DB_NAME
});

// Create a server
const app = express();
const server = http.createServer(app);
const io = new Server(
	server,
	{
		path: SOCKET_PATH,
	}
);

// Public dir (css,js,images)
app.use(express.static('public'));

// Run a client-side file in the root dir
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'client.html'));
});

// Create a socket connection
io.on('connection', (socket) => {
	console.log(socket);
	// Create a sql request - get DB messages
	const sqlSelectMessages = 'SELECT `content` FROM `messages`';
	// Run the SQL request 
	db.execute(sqlSelectMessages, (err, rows) => {
		if (err instanceof Error) {
			console.log(err);
			return;
		}
		// Send DB messages for the socket event
		io.emit('db_messages', rows);
	});

	// Listening a socket event
	socket.on('chat_message', (msg) => {
		// Create datetime data of the message
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth();
		const day = date.getDate();
		const hh = date.getHours();
		const mm = date.getMinutes();
		const ss = date.getSeconds();
		// Create datetime data for SQL request
		const dt_created = `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
		// Create SQL request - write a new message to DB
		const sqlInsertNewMessage = 'INSERT INTO `messages`(`user_id`, `room_id`, `content`, `dt_created`) VALUES (?, ?, ?, ?)';
		// Prepare message data in array
		const sqlInsertNewMessageValues = [1, 1, msg, dt_created];
		// Run the SQL request to add a new message to DB
		db.execute(sqlInsertNewMessage, sqlInsertNewMessageValues, (err, result, fields) => {
			if (err instanceof Error) {
				console.log(err);
				return;
			}
		});
		// Send message for the socket event
		io.emit('chat_message', msg);
	});
	
	// Disconnect handler
	socket.on('disconnect', () => {
		console.log("User disconnect!")
	})
});

// Show information in console
server.listen(PORT, () => {
	console.log('Server is running on port:' + PORT)
	console.log('http://localhost:' + PORT)
});

// Error handler
io.engine.on("connection_error", (err) => {
	console.log(err.code);     
	console.log(err.message);
	console.log(err.context); 
});