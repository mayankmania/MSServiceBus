var express = require('express');
var bodyParser = require('body-parser');
var app = new express();
var events = require('events');
var eventEmitter = new events.EventEmitter();

startUp();

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
        index: "index.htm"
    };

    app.use('/', express.static('public', options));
}

//Configure http request handler
function setUpHttpHandler() {
    
    app.use('/getDevices', function (req, res) {
            var devices = {"status":"hello"};
        // Bind the connection event with the listner2 function
        eventEmitter.on('connection', function(){
            res.json(devices);
        });
    });
    
    app.use('/publishEvent', function (req, res) {
       eventEmitter.emit('connection');
       eventEmitter.removeAllListeners('connection');
        res.json({"status":"triggered"});
    });
}

//Set appliance state
function setApplianceState(pinNo, setState, response) {
    var gpio = new gpioInstance(gpioPath);
    gpio.write(pinNo, setState);
    var jsonResult = { "status": setState, "deviceId": pinNo };
    response.json(jsonResult);
}