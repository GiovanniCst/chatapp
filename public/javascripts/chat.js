/*jslint node: true */
"use strict";


// Crea oggetto Chat che processerà i comandi della chat,
// i messaggi e le richieste di cambio nome utente e stanza
var Chat = function (socket) {
    this.socket = socket;
};


// HelpFunct - invia messaggio
Chat.prototype.sendMessage = function (room, text) {
    var message = {
        room : room,
        text : text
    };
    this.socket.emit('message', message);
};

// HelpFunct - cambio stanza
Chat.prototype.changeRoom = function (room) {
    this.socket.emit('join', {
        newRoom : room
    });
};

// HelpFunct - gestisci i comandi utente
Chat.prototype.processCommand = function (command) {
    var words = command.split(' ');
    // Parsa i comandi dalla prima parola
    var commands = words[0]
                            .substring(1, words[0].length)
                            .toLowerCase();
    var message = false;

    switch (command) {
    case 'join':
        words.shift();
        var room = words.join(' ');
        this.changeRoom(room);
        break;

    case 'nick':
        words.shift();
        var name = words.join(' ');
        this.socket.emit('nameAttempt', name);
        break;

    default:
        message = 'Comando non implementato, quindi non riconosciuto. I comandi disponibili sono "join" per cambio stanza e "nick" per cambio nick';
        break;
    }

    return message;
};
