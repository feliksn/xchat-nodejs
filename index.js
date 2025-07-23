// Константа port для работы на локальном сервере и удаленном на https://xapp.one/xchat
// process.env.PORT - PORT это переменная которая создается в панели управления хостингом когда создаем новое приложение нод на удаленном|оригинальном сервере. Для протокола https по умолчанию используеться порт 443. Для локального сервера на рабочем компе используем протокол http c портом 3000
// Если не существует переменной порт в среде нода тогда в константу запишеться порт 3000
const port = process.env.PORT || 3000;

// Еще одна переменная пути к папке/директории где находиться приложение нод относительно главного адреса сайта
// Если не существует переменной в среде нод тогда в константу запишеться пустая строка
const socketPath =  process.env.SOCKET_PATH || '';

// подключаем разные библиотеки/модули для работы чата (доп. библиотеки/модули - express, socket, внутр. библиотеки/модули нод - http, path)
const http  = require('node:http');
const path = require('node:path');
const express = require('express');
const { Server } = require('socket.io');

// создаем приложение express
const app = express();

// создаем сервер из модуля http используя метод createServer() передавая настройки для сервера из переменной app
const server = http.createServer(app);

// создаем сервер сокета передавая параметры для работы данного сервера
const io = new Server(
	// настройки сокет сервера из переменной с приложением express
	server,
	// доп. настройки сокет сервера в данном случае путь где находится наше приложение нод относительно адреса сайта 
	{
		path: socketPath,
	}
);

app.use('/img', express.static(__dirname + '/img'));

// В этом месте express.js вступает в работу. Вроде что можно обойтись и без него на этом этапе. Но пока что оставим.
// Работает и хорошо. Не трогаем то, что работает:))) В будущем решим можно ли без него. 
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

// массив подключений, чтобы отражалось кто онлайн кто оффлайн кто вышел кто зашел
connections = []

// Подключаемся к соединению сокета для работы чата
io.on('connection', (socket) => {
	// Информация в консоль о новом пользователе в чате
	console.log('User connected!')
	// со стороны сервера подключаемся к событию "chat_message" для получения сообщений от пользователей
	socket.on('chat_message', (msg) => {
		// Информация в консоль о новом сообщении в чате
		console.log('User message:', msg);
		// как только получаем какое-либо сообщение от какого-либо пользователя то высылаем это сообщение для всех остальных пользователей, ну и для того кто отправил 
		io.emit('chat_message', msg);
	});
	// при выходе из чата удаляем соединение и будем отображать кто онлайн кто оффлайн
	socket.on('disconnect', (data) => {
		console.log(connections)
		connections.splice(connections.indexOf(socket), 1)
		console.log("User disconnect!")
	})
});
 
// функция прослушивания порта сайта на котором запущено приложение нода
server.listen(port, () => {
	console.log('Server is running on port:' + port)
	console.log('http://localhost:' + port)
});

// код для ловли ошибок на стороне сервера
io.engine.on("connection_error", (err) => {
  console.log(err.code);     
  console.log(err.message);
  console.log(err.context); 
});