/* global __dirname */
var express = require('express'),
    app = express();
    
app.set('port', 8080);

// static
app.use(express.static(__dirname));

// not found
app.use(function (req, webRes) {	
    webRes.status(404).send('Page not found');
});

// start server
app.listen(8080);
console.log('Server listen on 8080');