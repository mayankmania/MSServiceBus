var http = require('http');

var getOptions = {
    host: 'localhost',
    path: '/getCommand',
    port: '9000',
    //This is the only line that is new. `headers` is an object with the headers to request
    headers: { 'custom': 'Custom Header Demo works' }
};

var postOptions = {
    host: 'localhost',
    path: '/updateProgress',
    port: '9000',
    //This is the only line that is new. `headers` is an object with the headers to request
    headers: {
        'Content-Type': 'application/json'
    }
};

callback = function (response) {
    var str = ''
    response.on('data', function (chunk) {
        str += chunk;
    });

    response.on('end', function () {
        console.log(str);
        var req = http.request(getOptions, callback);
        doSomeWork();
        req.end();
    });

}

function doSomeWork() {
    var post_req = http.request(postOptions, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    
    var post_data = {
        'deviceId': '0',
        'operation': 'get',
        'status': 'success'
    };

    // post the data
    post_req.write(post_data);
    post_req.end();
}

ProcessRequest();

function ProcessRequest() {
    var req = http.request(getOptions, callback);
    req.end();
}