$(function(){
    // Connection
    var socket = io.connect();

    // Login 'screen' variables
    var $loginArea = $('#loginArea');
    var $loginForm = $('#loginForm');
    var $nickname = $('#nickname');

    // Chatroom variables
    var $chatroomArea = $('#chatroomArea');
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $connectedUsers = $('#connectedUsers');

    $chatroomArea.hide();   // Chatroom is not visible before choosing a nickname

    // Send the user's nickname to the server
    $loginForm.submit(function(e){
        // Prevent page from refreshing
        e.preventDefault();

        var nn = $nickname.val();
        
        // Special characters that are not accepted
        var forbiddenCharacters = /[<>!|/\\\[\]{}()='?,.;.*+ºª^~´`]/;

        // Only accept the nickname if it isn't 'empty' and if it doesn't have certain special characters
        if ( (nn != '') && !forbiddenCharacters.test(nn) ){
            // Associate the nickname to the socket
            socket.nickname = nn;

            // Hide the login area and display the chatroom itself
            $loginArea.hide();
            $chatroomArea.show();

            // Display a 'welcoming' message
            $chat.append('<p class="systemMessage" ><i>Welcome <b>' + socket.nickname + '</b>! To communicate with the other users, write your message in the <b>Text Area</b> and press \'<b>ENTER</b>\' to send it!</i></p>');

            // Notify the server that the new user chose a nickname
            socket.emit('new client nickname' , socket.nickname);
        }
        else{
            // Clear the input area
            $nickname.val('');
        }
    });

    // Send the message to Server on 'Send' button click
    $messageForm.submit(function(e){
        // Prevent page from refreshing
        e.preventDefault();

        if ($message.val() != ''){
            // Send message to the server
            socket.emit('send message' , {content:$message.val() , nickname:socket.nickname});

            // Clear the text textarea
            $message.val('');
        }
    });

    // When receiving a message from the server, append it to the chat div
    socket.on('new message' , function(usermessage){
        var $msg = $('<p class="chatMessage">');
        var $msgNickname = $('<b>');
        var $msgContent = $('<text>');
        $msgNickname.append(usermessage.nickname + ':  ');
        $msgContent.text(usermessage.content);
        $msg.append($msgNickname);
        $msg.append($msgContent);

        $chat.append($msg);

        // Auto scroll to the bottom of the chat
        $("#chat").prop({ scrollTop: $("#chat").prop("scrollHeight") });
    });

    // Update current users
    socket.on('update current users' , function(nicknames){
        var nicknamesList = '<b>Connected Users:</b>';
        for (i=0 ; i<nicknames.length ; i++){
            if( i != 0 ){
                nicknamesList += "&nbsp&nbsp&nbsp&nbsp&nbsp,";
            }
            nicknamesList += "&nbsp&nbsp&nbsp&nbsp&nbsp<i>" + nicknames[i] + "</i>";
        }
        $connectedUsers.html(nicknamesList);
    });

    // System message ; display it
    socket.on('system message' , function(message){
        $chat.append('<p class="systemMessage" ><i>' + message + '</i></p>');

        // Auto scroll to the bottom of the chat
        $("#chat").prop({ scrollTop: $("#chat").prop("scrollHeight") });
    });
});
