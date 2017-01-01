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
