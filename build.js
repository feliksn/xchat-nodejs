// Получаем настройки подключения БД из файла .env
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS; 
const DB_NAME = process.env.DB_NAME;

// модуль для работы с базой данных
const mysql = require('mysql2');

// создаем коснтанту подлкючения к базе данных с передачей параметров подключения к базе данных
// параметры для базы данных берем из файла .env с данными покдлючения к БД
const db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
});

// Добавить аргумент для скрипта если хотим добавить доп. действие
// process.argv => [npm, run, dev, custom_arg]
// process.argv[3] = custom_arg

// Создаем БД если ее не cуществует
const sqlCreateDB = `CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
db.execute(sqlCreateDB, (err) => {
    if (err instanceof Error) {
        console.log(err); return;
    }
});

// Создаем таблицу пользователей если ее нет в БД
const sqlCreateTableUsers = `
    CREATE TABLE IF NOT EXISTS ${DB_NAME}.users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        nickname VARCHAR(30) NOT NULL,
        password varchar(255) NOT NULL,
        dt_created DATETIME
    );`;
db.execute(sqlCreateTableUsers, (err) => {
    if (err instanceof Error) {
        console.log(err);
        return;
    }
});

// Создаем таблицу комнтат если ее нет в БД
const sqlCreateTableRooms = `
    CREATE TABLE IF NOT EXISTS ${DB_NAME}.rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        dt_created DATETIME
    );`;
db.execute(sqlCreateTableRooms, (err) => {
    if (err instanceof Error) {
        console.log(err); return;
    }
});

// Создаем таблицу сообщений если ее нет в БД
const sqlCreateTableMessages = `
    CREATE TABLE IF NOT EXISTS ${DB_NAME}.messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        room_id INT NOT NULL,
        content VARCHAR(2000) NOT NULL,
        dt_created DATETIME
    );`;
db.execute(sqlCreateTableMessages, (err) => { 
    if (err instanceof Error) {
        console.log(err); return;
    }
    // После создания последней таблицы в БД, завершаем задачу запущенную в терминале "npm run build"
    // Передаем параметр - 0, что означает успешное выполнение
    process.exit(0); 
});
