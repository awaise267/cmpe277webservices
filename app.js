var express = require('express'),
    routes = require('./routes'),
    index = require('./routes/index'),
    http = require('http'),
    path = require('path');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(app.router);

// app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.post('/login-user', index.login_user);
app.post('/login-owner', index.login_owner);
app.post('/create-user', index.create_user);
app.post('/create-owner', index.create_owner);
app.post('/garage', index.get_garage_locations);
app.post('/add-garage', index.add_garage);
app.post('/generate-pin', index.generate_pin);
app.post('/pin-entered', index.pin_entered);
app.post('/exit-garage', index.exit_garage);
app.post('/poll-update', index.poll_update);
app.post('/user-history', index.get_user_history);
app.post('/owner-garage', index.owner_garages);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});