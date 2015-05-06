var http = require('http');
var express = require('express');
var Dungeon = require('./dungeon');
var app = express();
var path    = require('path');
app.use(express.static(path.join(__dirname, 'client')));
app.configure(function(){
  app.use(express.bodyParser());
});
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(process.env.PORT);
io.set('log level', 0);

var players = [];

var typeCount = 2;
var map_size = 50;

Dungeon.generate(map_size);
var map = Dungeon.getMap();
var rooms = Dungeon.getRooms();
var stats = Dungeon.getStats();
Dungeon.print();

io.sockets.on('connection', function (socket) {
    console.log('joined');
    socket.uuid = null;
    socket.playerType = null;
    socket.nick = socket.uuid;

    socket.on('chat_msg',function(msg){
      if(msg.indexOf('/nick') > -1)
      {
        socket.nick = msg.split('/nick ')[1];
      }
      else
      {
        io.sockets.emit('chat_msg', {msg:msg, uuid:socket.nick});
      }
    });

    socket.on('new_player',function(player_data){
      if(typeCount % 2 === 0)
      {
        socket.playerType = 'sheep';
      }
      else
      {
        socket.playerType = 'wolf';
      }

      typeCount++;

      socket.uuid = player_data.uuid;

      players.push({uuid:player_data.uuid, type:socket.playerType});

      socket.emit('join_game', {size: map_size,map:map, rooms:rooms, stats:stats, player_type: socket.playerType});

      socket.emit('sync_players',players);

      player_data.type = socket.playerType;
      socket.broadcast.emit('player_join', player_data);
    });

    socket.on('move_player',function(player_data){
      socket.broadcast.emit('player_move', player_data );

    });

    socket.on('free_all',function(){
      socket.broadcast.emit('free');
    });

    socket.on('disconnect',function(){
      socket.broadcast.emit('disconnected', socket.uuid);
      for(var i in players){
            if(players[i].uuid==socket.uuid){
                players.splice(i,1);
                break;
                }
        }
    });
});