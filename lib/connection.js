// Generated by CoffeeScript 1.6.2
var Connection, http;

http = require("http");

/*
Connection: HTTP REST requests for HBase
========================================

The connection object handles HTTP requests. You shouldn't 
have to call it directly because HBase requests are transparently 
made by the client objects.

Note, at this point, the HTTP client only communicate to 
HBase with the JSON format. Some valid requests requests return 
an empty body which of course not a valid JSON. In such cases, 
no error is thrown by the response handler but the returned value 
is null.

Creating a new connection
-------------------------

The most common way of initializing a new connection object 
is through the client object. When a new client is constructed, 
it create and hold a connection object.

```javascript
var client = hbase({ options });
assert.ok(client.connection instanceof hbase.Connection);
```

You can also manually contruct a new instance as follow:

```javascript
var connection = new hbase.Connection( client );
```
*/


Connection = function(client) {
  return this.client = client;
};

Connection.prototype.makeRequest = function(method, command, data, callback) {
  var options, req, self;

  self = this;
  options = {
    port: this.client.options.port,
    host: this.client.options.host,
    method: method,
    path: command,
    headers: {
      "content-type": "application/json",
      Accept: "application/json"
    }
  };
  req = http.request(options, function(res) {
    var body;

    body = "";
    res.on("data", function(chunk) {
      return body += chunk;
    });
    res.on("end", function() {
      var e, error;

      error = null;
      try {
        body = self.handleJson(res, body);
      } catch (_error) {
        e = _error;
        body = null;
        error = e;
      }
      return callback(error, body, res);
    });
    return res.on("close", function() {
      var e;

      e = new Error("Connectino closed");
      return callback(e, null);
    });
  });
  req.on("error", function(err) {
    return callback(err);
  });
  if (data && data !== "") {
    data = (typeof data === "string" ? data : JSON.stringify(data));
    req.write(data, "utf8");
  }
  return req.end();
};

/*
HTTP Get requests
-----------------

```javascript
myConnection.get(command, callback, [status]);
```

Execute an HTTP Get request. The callback contains 3 arguments: the error object if any, the decoded response body and the Node `http.ClientResponse` object.

```javascript
(new Connection({}))
.get('http://localhost:8080/', function(error, data, response){
  if(error){
    process.exit(1);
  }
  console.log('Status code: ' + response.statusCode);
  console.log('Number of tables: ' + tables.length);
});
```
*/


Connection.prototype.get = function(command, callback) {
  return this.makeRequest("GET", command, "", callback);
};

Connection.prototype.put = function(command, data, callback) {
  return this.makeRequest("PUT", command, data, callback);
};

Connection.prototype.post = function(command, data, callback) {
  return this.makeRequest("POST", command, data, callback);
};

Connection.prototype["delete"] = function(command, callback) {
  return this.makeRequest("DELETE", command, "", callback);
};

Connection.prototype.handleJson = function(response, body) {
  var e;

  switch (response.statusCode) {
    case 201:
    case 200:
      if (body) {
        return JSON.parse(body);
      } else {
        return null;
      }
    default:
      e = new Error(response.statusCode + ": " + this.codes[response.statusCode]);
      e.code = response.statusCode;
      e.body = body;
      throw e;
  }
};

Connection.prototype.codes = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing (WebDAV)",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status (WebDAV)",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  306: "Switch Proxy",
  307: "Temporary Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Request Entity Too Large",
  414: "Request-URI Too Long",
  415: "Unsupported Media Type",
  416: "Requested Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  422: "Unprocessable Entity (WebDAV)",
  423: "Locked (WebDAV)",
  424: "Failed Dependency (WebDAV)",
  425: "Unordered Collection",
  426: "Upgrade Required",
  449: "Retry With",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage (WebDAV)",
  509: "Bandwidth Limit Exceeded (Apache bw/limited extension)",
  510: "Not Extended"
};

module.exports = Connection;