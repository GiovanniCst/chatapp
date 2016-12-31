/*jslint node: true */
"use strict";

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

// Helper function - 404 risorsa non trovata

function send404(response) {
    response.writeHead(404, {'Content-Type': 'text-plain'});
    response.write('Error 404: resource not found. ');
    response.end();
}

// Helper function - Trasmette il contenuto di una file

function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

// Helper function - Cache dei file statici

function seveStatic(response, cache, absPath) {
    // Il file è già in memoria?
    if (cache[absPath]) {
        // Servi il file dalla memoria
        sendFile(response, absPath, cache[absPath]);
    } else {
        // Controlla se il file esiste
        fs.exists(absPath, function (exists) {
            if (exists) {
                // Leggi il file dal disco
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        // Servi il file che hai letto dal disco
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                // Risorsa non trovata
                send404(response);
            }
        });
    }
}

















