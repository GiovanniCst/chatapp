/*jslint node: true */
"use strict";

// Initialize few variables
var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function (server) {
    // Starts Socket.io server
    io = socketio.listen(server);
    io.set('log level', 1);
    // Definisce come viene gestita ogni connessione
    io.sockets.on('connection', function (socket) {
        // Assegna un nome utente alla connessione dell'utente
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        // Mette l'utente nella stanza Lobby alla connessione
        joinRoom(socket, 'Lobby');

        // Gestisce i messaggi, i tentativi di cambio nome, e la creazione/cambio di stanze
        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);

        // Fornisce all'utente una lista delle room occupate, se richiesto
        socket.on('rooms', function (){
            socket.emit('rooms', io.sockets.manager.rooms);
        });

        // Definisce una clean-up logic per quando un utente si disconnette
        handleClientDisconnection(socket, nickNames, namesUsed);

    });
};



