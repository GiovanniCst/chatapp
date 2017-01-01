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
