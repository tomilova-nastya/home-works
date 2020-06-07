var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendfile(__dirname + '/dist/index.html');
});

let port = 8080;
http.listen(port, function() {
    console.log('listening on *:' + port);
});

//Whenever someone connects this gets executed
io.on('connection', function(socket) {
    console.log('A user connected');

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
});

io.on('exit', function () {
    http.close();
});

io.on('uncaughtException', function (){
    io.on('SIGTERM', 'kill');
})
