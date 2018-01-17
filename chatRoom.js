/////////////////////////////////
//  Import everything necessary

var express = require('express')
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// List of all connected users
connectedUsers = [];


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
    connectedUsers.push(socket);
    updateConnectedUsers();

    // Client disconnected
    socket.on('disconnect' , function (){
        // Remove the user that disconnected
        connectedUsers.splice(connectedUsers.indexOf(socket),1);
        updateConnectedUsers();
    });

    // Broadcast the message to all clients
    socket.on('send message' , sendMessage);
}

function sendMessage(message){
    io.sockets.emit('new message' , '<b>' + message.nickname + '</b>: ' + message.content);
}

function updateConnectedUsers(){
    nicknames = [];

    for (i=0 ; i<connectedUsers.length ; i++){
        nicknames.push(connectedUsers[i].id);
        console.log(connectedUsers[i].id);
    }

    io.sockets.emit('update current users' , nicknames);
}
