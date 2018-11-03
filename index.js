const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const firebase = require('firebase');
var admin = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json');

var config = {
  apiKey: "AIzaSyBEYeZd6esV4hhO91CBl8u-N2JGjGPz1x0",
  authDomain: "gigs-socket.firebaseapp.com",
  databaseURL: "https://gigs-socket.firebaseio.com",
  projectId: "gigs-socket",
  storageBucket: "gigs-socket.appspot.com",
  messagingSenderId: "518335240648"
};
firebase.initializeApp(config);

var database = firebase.database();
var ref = database.ref('new:message'/'new:member');
//ref.push(data);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gigs-socket.firebaseio.com"
});
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, function(){
  console.log('listening on port ' + port);
  
  io.on('connection', function (socket) {
    console.log("USER CONNECTED...");
    ref.once("value", function(snapshot){
      message_test = Object.values(snapshot.val());
      for(i=0; i<message_test.length; i++){
        io.emit('new:message', message_test[i]);
        console.log(message_test[i]);
      };
    });

    // handle new messages
    socket.on('new:message', function (msgObject) {
      io.emit('new:message', msgObject);
      data = msgObject;
      //console.log(data);
      ref.push(data);
    });

    // handle new members
    socket.on('new:member', function (name) {
        console.log(name);
      io.emit('new:member', name);
    });
  });
});
