let express = require("express");
let app = express();
app.use(express.static('dist'));

let http = require('http').createServer(app);
let io = require('socket.io')(http);


app.get('/', (req, res) => {
});


let messages = [];
let participants = [];
let activeParticipantsCount = 0;

io.on('connection', function(socket) {

    socket.on('participantLogin', (loginString) => {
        let loginData = loginString.split(';');

        participants.push(getNewParticipantObject(loginData[0], loginData[1], '', ''));

        activeParticipantsCount++;
        io.sockets.emit('updateParticipants', { description: JSON.stringify(participants) });
        socket.emit('updateMessages', { description: JSON.stringify(messages) });
        io.sockets.emit('updateParticipantsCount', { description: activeParticipantsCount });

        // Учитываю количество только залогинившихся пользователей
        socket.on('disconnect', function () {
            activeParticipantsCount--;
            io.sockets.emit('updateParticipantsCount', { description: activeParticipantsCount });
            io.sockets.emit('updateParticipants', { description: JSON.stringify(participants) });
        });

        socket.on('sendMessage', (data) => {
            let messageInfo = data.split("&&&");

            let message = messageInfo[0];
            let fio = messageInfo[1];
            let currentDateTime = new Date();

            let newMessage = getNewMessageObject(message, fio, currentDateTime);
            messages.unshift(newMessage);

            io.sockets.emit('updateMessages', { description: JSON.stringify(messages) });

            updateParticipantLastMessage(message, fio);
            io.sockets.emit('updateParticipants', { description: JSON.stringify(participants) });
        });
    });
});


let port = 8080;
http.listen(port, function() {
    console.log('listening on *:' + port);
});

function getNewParticipantObject(name, nickname, photoUrl, lastMessage) {
    return {
        name: name,
        nickname: nickname,
        photoUrl: photoUrl,
        lastMessage: lastMessage
    };
}

function getNewMessageObject(message, fio, currentDateTime) {
    return {
        message: message,
        photoUrl: getPhotoUrlByFio(fio),
        time: `${currentDateTime.getHours()}:${currentDateTime.getMinutes()}`
    };
}

function getPhotoUrlByFio(fio) {
    for (let participant of participants) {
        if (participant.name === fio) {
            return participant.photoUrl;
        }
    }

    return '';
}

function updateParticipantLastMessage(message, fio) {
    for (let participant of participants) {
        if (participant.name === fio) {
            participant.lastMessage = message;
        }
    }
}