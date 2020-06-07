var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendfile(__dirname + '/dist/index.html');
});

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
    console.log('A user connected');

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
});

http.listen(8080, function() {
    console.log('listening on *:8080');
});

io.on('exit', function () {
    http.close();
});

io.on('uncaughtException', function (){
    io.on('SIGTERM', 'kill');
})
