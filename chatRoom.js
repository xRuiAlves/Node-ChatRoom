/////////////////////////////////
//  Import everything necessary

var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// List of all connected users
connectedUsers = [];

app.use(express.static('public'));

// Declare which port server is listening too
server.listen(3000);
console.log('Server started.');


////////////////////////
//  Declare all events

app.get('/' , application);
io.sockets.on('connection' , clientConnected);


//////////////////
// Event Handlers

function application(request , response){
    // Send the index.html file to the client
    response.sendFile(__dirname + '/public/index.html');
}

function clientConnected(socket){
    // New connected user
    socket.nickname = '';   // Not 'logged in' yet , not nickname associated

    // Client disconnected
    socket.on('disconnect' , function (){
        // Remove the user that disconnected, if it was 'logged in'
        if (socket.nickname != ''){
            // Notify the other Users
            io.sockets.emit('system message' , 'User <b>' + socket.nickname + '</b> has left the chatroom.');

            connectedUsers.splice(connectedUsers.indexOf(socket),1);
            updateConnectedUsers();
        }
    });

    // Broadcast the message to all clients
    socket.on('send message' , sendMessage);

    // Client chose nickname
    socket.on('new client nickname', function(nickname){
        socket.nickname = nickname;
        connectedUsers.push(socket);
        updateConnectedUsers();
    });
}

function sendMessage(message){
    io.sockets.emit('new message' , '<b>' + message.nickname + '</b>:&nbsp&nbsp' + message.content);
}

function updateConnectedUsers(){
    nicknames = [];

    for (i=0 ; i<connectedUsers.length ; i++){
        nicknames.push(connectedUsers[i].nickname);
    }

    io.sockets.emit('update current users' , nicknames);
}
