/*jslint node: true */
"use strict";

// Initialize few variables
var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

// HelpFunction - Assegna il nome utente

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    // Genera un nuovo guest name
    var name =  'Ospite_' + guestNumber;
    // Associa al nuovo nome l' ID della connessione
    nickNames[socket.id] = name;
    // Comunica all'utente il suo nome
    socket.emit('nameResult', {
        success : true,
        name : name
    });

    // Inserisci nella lista namesUsed il nuovo nome generato in maniera tale che non sia
    // più utilizzato

    namesUsed.push(name);
    // Incrementa la variabile guestNumber per generare un nuovo nome in futuro
    return guestNumber + 1;

}

// HelpFunction - Join room

function joinRoom(socket, room) {
    // Fai joinare all' utente la stanza
    socket.join(room);
    // Collega la stanza al socket corrente dell' utente
    currentRoom[socket.id] = room;
    // Informa l'utente che ha joinato la stanza
    socket.emit('joinResult',  {room : room});
    // Informa gli altri utenti che l'utente ha joinato
    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + ' has joined ' + room + '.'
    });

    // Determina quali altri utenti sono nella medesima stanza
    var usersInRoom = io.sockets.clients(room);
    // Se esistono utenti, fornisci un sommario
    if (usersInRoom.length > 1) {
        var usersInRoomSummary = 'Users currently in ' + room + ': ';
        for (var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            if (userSocketId != socket.id) {
                if (index > 0) {
                    //Aggiungi l'utente all' elenco del sommario
                    usersInRoomSummary += ', ';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }
        usersInRoomSummary += '.';
        // Comunica il sommario
        socket.emit('message', {text: usersInRoomSummary})
    }
}


// HelpFunction - Gestisi richieste di cambio nome

function HandleNameChangeAttempts(socket, nickNames, namesUsed) {
    // Listener per eventi di tipo nameAttempt
    socket.on('nameAttempt', function(name) {
        // Non consentire nomi che cominciano con "Ospite"
        if (name.indexOf('Ospite') == 0 ) {
            socket.emit('nameResult', {
                success : false,
                message : 'I nick non possono comuniciare con la parola "Ospite".'
            });
        } else {
            // Se il nick non è già utilizzato, assegnalo
            if (namesUsed.indexOf(name) == -1) {
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                // Elimina il nome precedentemente usato
                delete namesUsed[previousNameIndex];
                socket.emit('nameResult', {
                    success : true,
                    name : name
                });
                //Informa tutti quelli della stessa stanza del cambio nome
                socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                    text: previousName + 'is currently known as ' + name + '.'
                });
            } else {
                socket.emit('nameResult', {
                    success: false,
                    message: 'Questo nome è già in uso, riprova'
                });
            }
        }
    });
}

// HelpFunction - Gestione del messaggio dell'utente

function handleMessageBroadcasting(socket) {
    socket.on('message', function (message) {
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        });
    });
}

// HelpFunction - Join/Crea una stanza

function handleRoomJoining(socket) {
    socket.on('join', function(room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    });
}

// HelpFunction - Sconnessione dell'utente

function handleClientDisconnection(socket) {
    socket.on('disconnect', function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}

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
        socket.on('rooms', function () {
            socket.emit('rooms', io.sockets.manager.rooms);
        });

        // Definisce una clean-up logic per quando un utente si disconnette
        handleClientDisconnection(socket, nickNames, namesUsed);

    });
};



