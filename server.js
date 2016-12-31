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
