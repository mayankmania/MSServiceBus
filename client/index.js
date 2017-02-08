var http = require('http');

var host = "rpiservice.azurewebsites.net"

var getOptions = {
    host: host,
    path: '/getCommand',
    //port: '9000',
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

    var deviceDetails = [];

    switch (operation.description) {
        case "get":
            deviceDetails = getRegisteredDevices();
            break;
        case "post":
            deviceDetails.push(getDeviceDetails(operation.deviceId));
            break;
        default:
            break;
    }

    var data = JSON.stringify({
        'deviceId': operation.deviceId,
        'description': operation.description,
        'deviceDetails': deviceDetails,
        'status': 'success'
    });

    var postOptions = {
        host: host,
        path: '/updateProgress',
        method: "POST",
        json: true,
        //  port: '9000',
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
            console.log("POST");
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

function getDeviceDetails(deviceId) {
    var deviceDetails = getRegisteredDevices();
    for (var index = 0; index < deviceDetails.length; index++) {
        if (deviceDetails[index].deviceId == deviceId) {
            deviceDetails[index].status = true;
            return deviceDetails[index];
        }
    }
    return false;
}

function getRegisteredDevices() {
    var devices = [
        {
            deviceId: 15, status: false, device: "fan"
        },
        {
            deviceId: 16, status: false, device: "bulb"
        },
        {
            deviceId: 18, status: false, device: "washer"
        },
        {
            deviceId: 19, status: false, device: "tv"
        }
    ];
    return devices;
}
