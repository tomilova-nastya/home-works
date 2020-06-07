let express = require("express");
let app = express();
app.use(express.static('dist'));

let http = require('http').createServer(app);
let io = require('socket.io')(http);


app.get('/', (req, res) => {
});


let globalMessages = [];
let participants = [];
let activeParticipantsCount = 0;

io.on('connection', function(socket) {

    socket.on('participantLogin', (loginString) => {
        let loginData = loginString.split(';');
        participants.push(newParticipant(loginData[0], loginData[1], '', ''));
        activeParticipantsCount++;

        socket.emit('getParticipants', { description: JSON.stringify(participants) });
        socket.emit('getActiveParticipantsCount', { description: `${activeParticipantsCount}` });
    });

    socket.on('disconnect', function () {
        //activeParticipantsCount--;
    });
});


let port = 8080;
http.listen(port, function() {
    console.log('listening on *:' + port);
});

function newParticipant(name, nickname, photoUrl, lastMessage){
    return {
        name: name,
        nickname: nickname,
        photoUrl: photoUrl,
        lastMessage: lastMessage
    };
}