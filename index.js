const PORT = process.env.PORT || 3000;
const SOCKET_PATH =  process.env.SOCKET_PATH || '';

// Переменные в среде nodejs для подключения к базе данных (У каждого программера могут быть разные имена пользователей, пароли и название базы данных. Для этого нужне будет внешний файл настроек .env, который будет у каждого с своими данными)
// Чтобы подключить приложение к базе нужно создать в корне проекта файл .env
// В созданный файл внести следующие данные:
// DB_HOST='your host name'
// DB_USER='user name'
// DB_PASS='your password'
// DB_NAME='your database name'
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS; 
const DB_NAME = process.env.DB_NAME;

const http  = require('node:http');
const path = require('node:path');
const express = require('express');
const { Server } = require('socket.io');

// модуль для работы с базой данных
const mysql = require('mysql2');

// создаем коснтанту подлкючения к базе данных с передачей параметров подключения к базе данных
// параметры для базы данных берем из констант с данными покдлючения
const db = mysql.createConnection({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASS,
	database: DB_NAME
});

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
		path: SOCKET_PATH,
	}
);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

// Подключаемся к соединению сокета для работы чата
io.on('connection', (socket) => {
	
	// создаем запрос БД для получения всех сообщений из базы данных
	const sqlSelectMessages = 'SELECT `content` FROM `messages`';
	// исполняем запрос получения всех сообщений из БД
	db.execute(sqlSelectMessages, (err, rows) => {
		// если ловим ошибку то покажем в консоли и далее прерываем выполнение кода
		if (err instanceof Error) {
			console.log(err);
			return;
		}
		// если все хорошо отправляем то получаем все сообщения из БД, которые находятся в переменной "rows" и отправляем эти сообщения для события чата под имененм "db_messages" - данное событие служит только для отправки сообщений из базы данных когда пользователь загружет/перезагружает страницу чата. Когда стараница чата уже загружена и пользователи общаються между собой то в работу вступает событие чата "chat_message" - которое уже в реальном времени показывает все сообщения отправленые пользователями друг другу. При перезагрузке страницы снова срабатывает событие чата "db_messages" подгружая все сообщения из БД
		io.emit('db_messages', rows);
	});

	// со стороны сервера подключаемся к событию "chat_message" для получения сообщений от пользователей
	socket.on('chat_message', (msg) => {
		// внутри функции получения сообщений от пользователей создаем константу в которую будет записываться дата получения сообщения
		const date = new Date();
		// далее создаем несколько простых констант для разделения даты и времени на год, месяц, день, часы, минуты, секунды
		const year = date.getFullYear();
		const month = date.getMonth();
		const day = date.getDay();
		const hh = date.getHours();
		const mm = date.getMinutes();
		const ss = date.getSeconds();
		// записываем данные даты и времени в строку в определенном формате для записи в базе данных
		const created = `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
		// пример передачи значений в базу данных, который будет ниже, взят с:
		// https://sidorares.github.io/node-mysql2/docs/examples/queries/prepared-statements/insert
		// записываем в константу запрос в базу данных в виде строки
		const sql = 'INSERT INTO `messages`(`user_id`, `room_id`, `content`, `created`) VALUES (?, ?, ?, ?)';
		// записываем значения передаваемые в базу в видем массива
		// первые два значения это user_id, room_id - пока что вставленны простые числа без привязки к реальным пользователям и комнатам чтобы проверить как работает запрос. Не можем оставить эти значения в стороне, т.к. без них вылетает ошибка и не можем подключиться к базе данных чтобы вносить изменения
		// последние два значения должны быть понятны. Без комментариев)))
		const values = [1, 1, msg, created];
		// исполняем запрос и передаем в базу данных значения записанные в константе
		db.execute(sql, values, (err, result, fields) => {
			if (err instanceof Error) {
				// если словим ошибку то увидим в консоли
				console.log(err);
				return;
			}
			// если все удалось в консоль вылетять некоторые данные в виде объекта, что все хоршо закончилось
			console.log(result);
			console.log(fields);
		});

		// Информация в консоль о новом сообщении в чате
		console.log('User message:', msg);
		// как только получаем какое-либо сообщение от какого-либо пользователя то высылаем это сообщение для всех остальных пользователей, ну и для того кто отправил 
		io.emit('chat_message', msg);
	});
});

// функция прослушивания порта сайта на котором запущено приложение нода
server.listen(PORT, () => {
	console.log('Server is running on port:' + PORT)
});

// код для ловли ошибок на стороне сервера
io.engine.on("connection_error", (err) => {
	console.log(err.code);     
	console.log(err.message);
	console.log(err.context); 
});