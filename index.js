var express = require('express');
var bodyParser = require('body-parser');
var app = new express();
var events = require('events');
var eventEmitter = new events.EventEmitter();
var sb = require("mssb");

var raspId = 1;
startUp();
var myQueue = [];

//Listen for all the request
var server = app.listen(app.get('port'), function () {
    var port = server.address().port;
    console.log('Server running on port ' + port);
});

//Register all the startup related stuffs in this function
function startUp() {
    configureExternalModule();
    setUpHttpHandler();
    app.set('port', 9000);
}

//Configure external modules here
function configureExternalModule() {
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    var options = {
        index: "index.html"
    };

    app.use('/', express.static('public', options));
}

//Configure http request handler
function setUpHttpHandler() {

    app.use('/getCommand', function (req, res) {
        var queue = findElement(raspId);
        if (queue.operation.length <= 0) {
            sb.subscribe(raspId, function () {
                res.json(queue.operation[0]);
            });
        }
        else {
            res.json(queue.operation[0]);
        }
    });

    app.post('/updateProgress', function (req, res) {
        var deviceId = req.body.deviceId;
        var status = req.body.status;
        var operation = raspId + req.body.deviceId + req.body.description;
        console.log("Client : " + operation);
        var queue = findElement(raspId);
        queue.operation.shift();
        sb.publish(operation);
        res.json({ 'status': 'success' });
    });

    app.post('/performOperation', function (req, res) {
        var data = req.body;
        var deviceId = data.deviceId;
        var queue = findElement(raspId);
        if (queue.operation.length == 0) {
            queue.operation.push({ description: "post", deviceId: deviceId });
            sb.publish(raspId);
        }
        else if (!isDuplicateOperation(raspId, deviceId, "post")) {
            queue.operation.push({ description: "post", deviceId: deviceId });
        }

        var operation = raspId + req.body.deviceId + req.body.description;
        console.log("Server : " + operation);
        sb.subscribe(operation, function () {
            res.json({ 'status': 'success' });
        });
    });

    app.use('/getDevices', function (req, res) {
        var queue = findElement(raspId);
        if (queue.operation.length == 0) {
            queue.operation.push({ description: "get", deviceId: 0 });
            sb.publish(raspId);
        }
        else {
            if (!isDuplicateOperation(raspId, 0, "get")) {
                queue.operation.push({ description: "get", deviceId: 0 });
            }
        }
        sb.subscribe(raspId + "0" + "get", function () {
            res.json({ 'status': 'success' });
        });
    });

    function findElement(raspId) {
        for (var i = 0; i < myQueue.length; i++) {
            if (myQueue.raspId == raspId) {
                return myQueue[i];
            }
        }
        myQueue.push({ raspId: raspId, operation: [] });
        return myQueue[0];
    }

    function isDuplicateOperation(raspId, deviceId, description) {
        var rasp = findElement(raspId);
        var operations = rasp.operation;
        for (var i = 0; i < operations.length; i++) {
            if (operations[i].deviceId == deviceId && operations[i].description == description) {
                return true;
            }
        }
        return false;
    }
}