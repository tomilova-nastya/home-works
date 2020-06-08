let express = require("express");
let app = express();
app.use(express.static('dist'));
let fs = require('fs');

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
            io.sockets.emit('updateParticipantsCount', { description: activeParticipantsCount });
        });

        socket.on('writeFile', (data) => {
            let dataSplit = data.description.split('&&&&&');

            let participantNickname = dataSplit[0];
            let file = dataSplit[1];
            let fileUrl = `./src/img/${participantNickname}.png`;

            console.log(dataSplit[0]);
            fs.writeFile(fileUrl, file, function (err) {
                if (err) throw err;
            });

            setPhotoUrlByNickname(participantNickname, fileUrl)
        })
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


function setPhotoUrlByNickname(nickname, photoUrl) {
    for (let participant of participants) {
        if (participant.nickname === nickname) {
            participant.photoUrl = photoUrl;
        }
    }
}

function updateParticipantLastMessage(message, fio) {
    for (let participant of participants) {
        if (participant.name === fio) {
            participant.lastMessage = message;
        }
    }
}