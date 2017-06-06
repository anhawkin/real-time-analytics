/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow.
 *
 * For more information
 */

var request = require('request'); // "Request" library
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

var client_id = ''; // Your client id
var client_secret = ''; // Your secret
var analyticsData = '';
var port = process.env.PORT || 3000;
// your application requests authorization
var authOptions = {
  url: 'https://api.omniture.com/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};
function omniture() {
  request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {
    // use the access token to access the Analytics API
    var token = body.access_token;
    var options = {
      url: 'https://api3.omniture.com/admin/1.4/rest/?method=Report.Run',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: 
        {
  "reportDescription":{
    "reportSuiteID":"ajhbc",
    "dateFrom":"15 minutes ago",
    "dateTo":"now",
    "metrics":[
      {
        "id":"instances"
      }
    ],
    "elements":[
      {
        "id":"product",
        "everythingElse":false,
        "top":15
      }
    ],
    "source":"realtime"
  }
},
      json: true
    };
    request.post(options, function(error, response, body) {
      console.log(body);
      analyticsData = body.report;
      
    });
  }
});
}
setInterval(omniture, 15000);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/start', function (req, res, next) {
  res.send({"analyticsData":analyticsData});
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port)
});