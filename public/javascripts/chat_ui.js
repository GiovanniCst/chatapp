/*jslint node: true */
"use strict";

// Sanitize users' messages
function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
    return $('<div></<div>').html('<i>' + message + '</i>');
}

// Processa l'input dell'utente
function processUserInput(chatApp, socket) {
    var message = $('#send-message').val();
    var systemMessage;
    // Se l'input dell'utente comincia con /, è un comando
    if (message.charAt(0) === '/') {
        systemMessage = chatApp.processCommand(message);
        if (systemMessage) {
            $('#messages').append(divEscapedContentElement(systemMessage));
        } else {
            //Broadcast il messaggio a tutti gli utenti
            chatApp.sendMessage($('#room').text(), message);
            $('#messages').append(divEscapedContentElement(message));
            $('#messages').scrollTop($('#messages').prop('scrollHeight'));
        }
        $('#send-message').val('');
    }
}


// Logica da eseguire nel momento in cui la pagina è totalmente caricata

var socket = io.connect();

$(document).ready(function () {
    var chatApp = new Chat(socket);

    // Visualizza il risultato di un tentativo di cambio nick
    socket.on('nameResult', function (result) {
        var message;
        if (result.success) {
            message = 'Ti sei ribattezzato ' + result.name + '.';
        } else {
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });

    //Mostra il risultato di un cambio stanza
    socket.on('joinResult', function (result) {
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });

    //Mostra i messaggi ricevuti
    socket.on('message', function (message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });

    //Mostra l'elenco delle stanze disponibili
    socket.on('rooms', function (rooms) {
        $('#room-list').empty();

        for (var room in rooms) {
            room = room.substring(1, room.length);
            if (room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }
        //Consenti di cliccare sul nome di una stanza per joinare
        $('#room-list div').click(function() {
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });
    //Richiedi l'elenco delle stanze disponibili ad intervalli regolari
    setInterval(function() {
        socket.emit('rooms');
    }, 1000);

    $('#send-message').focus();

    //invia il form per inviare il messaggio

    $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
        return false;
    });
});
