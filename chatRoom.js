/////////////////////////////////
//  Import everything necessary

var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// List of all connected users
connectedUsers = [];

// Express is using the 'public' folder (for accessing style.css)
app.use(express.static('public'));

// Declare which port server is listening too
server.listen(3000);
console.log('Server started.');


////////////////////////
//  Declare all events

io.sockets.on('connection' , clientConnected);


//////////////////
// Event Handlers

function clientConnected(socket){
    // New connected user
    socket.nickname = '';   // Not 'logged in' yet , not nickname associated
    console.log('Client  ' + socket.handshake.address + '  connected.');

    // Client disconnected
    socket.on('disconnect' , function (){
        console.log('Client  ' + socket.handshake.address + '  disconnected.');

        // Remove the user that disconnected, if it was 'logged in'
        if (socket.nickname != ''){
            // Notify the other Users
            socket.broadcast.emit('system message' , 'User <b>' + socket.nickname + '</b> has left the chat-room.');

            connectedUsers.splice(connectedUsers.indexOf(socket),1);
            updateConnectedUsers();
        }
    });

    // Broadcast the message to all clients
    socket.on('send message' , sendMessage);

    // Client chose nickname
    socket.on('new client nickname', function(nickname){
        // Add the new client to the sockets list
        socket.nickname = nickname;
        connectedUsers.push(socket);

        // Notify other clients only that this new clients has joined the chat-room
        socket.broadcast.emit('system message' , 'User <b>' + socket.nickname + '</b> has joined the chat-room.');

        updateConnectedUsers();
    });
}

function sendMessage(message){
    // Broadcast the message to all clients
    io.sockets.emit('new message' , message);
}

function updateConnectedUsers(){
    // Make a list of all the clients nicknames
    nicknames = [];
    for (i=0 ; i<connectedUsers.length ; i++){
        nicknames.push(connectedUsers[i].nickname);
    }

    // Tell all the clients which clients are currently in the chat-room
    io.sockets.emit('update current users' , nicknames);
}
