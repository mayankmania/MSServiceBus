var http = require('http');

var getOptions = {
    host: 'localhost',
    path: '/getCommand',
    port: '9000',
    //This is the only line that is new. `headers` is an object with the headers to request
    headers: { 'raspId': '1' }
};

callback = function (response) {
    var str = ''
    response.on('data', function (chunk) {
        str += chunk;
    });

    response.on('end', function () {
        performOperation(str);
    });
}

processRequest();

function performOperation(str) {
    var operation = JSON.parse(str);

    var data = JSON.stringify({
        'deviceId': operation.deviceId,
        'description': operation.description,
        'status': 'success'
    });

    var postOptions = {
        host: 'localhost',
        path: '/updateProgress',
        method: "POST",
        json: true,
        port: '9000',
        //This is the only line that is new. `headers` is an object with the headers to request
        headers: {
            'Content-Type': 'application/json',
            "Content-Length": Buffer.byteLength(data)
        }
    };

    var req = http.request(postOptions, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
        });
        res.on('end', function () {
            processRequest();
        });
    });
    req.write(data);
    req.end();
}

function processRequest() {
    var req = http.request(getOptions, callback);
    req.end();
}