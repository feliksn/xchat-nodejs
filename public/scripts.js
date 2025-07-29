
// Создаем функцию получения шаблона сообщения, которую можно вызывать в разных местах программы
function getMsgHtml(content, time, isYours = false) {
    const wrapClass = isYours ? "alert-dark" : "alert-light ms-auto";
    return `<div class="alert ${wrapClass}">
                <div class="text-break lh-sm">${content}</div>
                <div class="font-monospace text-end small">${time}</div>
            </div>`;
}

const socket = io(
    window.location.origin,
    {
        path: window.location.pathname + 'socket.io'
    }
);

const form = document.getElementById('form-message');
const input = document.getElementById('input-message');
const messages = document.getElementById('messages');

// Don't display dublicated messages on the page
let areDbMessages = false;
socket.on('db_messages', (dbMessages) => {
    if (areDbMessages === false) {
        dbMessages.forEach(dbMsg => {
            messages.innerHTML += getMsgHtml(dbMsg.content, "12:00");
        });
        messages.scrollTo(0, 100000);
    }
    areDbMessages = true;
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat_message', input.value);
        input.value = '';
    }
});

socket.on('chat_message', (msg) => {
    messages.innerHTML += getMsgHtml(msg, "12:00");
    messages.scrollTo(0, 100000);
});

socket.on("connect_error", (err) => {
    console.log(err.message);
    console.log(err.description);
    console.log(err.context);
});