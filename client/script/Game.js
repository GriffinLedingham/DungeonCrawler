winW = window.innerWidth;
winH = window.innerHeight;

var game = new Phaser.Game(winW, winH, Phaser.AUTO, 'sheep-tag', { preload: preload, create: create, update: update, render:render });

function preload() {
    game.load.image('tiles', 'assets/tiles_4_betterGrass.png');
    game.load.image('player', 'assets/player.png');
    game.load.image('wolf', 'assets/wolf.png');
    game.load.image('beacon', 'assets/beacon.png');
}

var tileLength = 32;
var map;
var line;
var layer;
var layer2;
var hitLayer;
var cursors;
var tileHits = [];
var plotting = false;
var p;
var height;
var width;
var finder;
var lastClick = null;
var moveArray = [];
var moveIndex = 0;
var masterGrid;
var uuid;
var players = {};
var socket;
var playerType;
var authed = false;
var trapped = false;
var tileSpriteMap = [];

var beacon;

var map_data = {};

function create() {
    // socket = io.connect('http://localhost:3000');
    socket = io.connect('http://dungeoncrawler.herokuapp.com');
    uuid = guid();
    socket.emit('new_player', {uuid:uuid});

    socket.on('join_game',function(data){
        startGame(data);
    });

    //5 min start to finish chat client
    socket.on('chat_msg',function(data){
        var msg = data.msg;
        var uid = data.uuid;
        $('#messages').append('<div style="color:white;">'+uid + ': ' + msg+'</div>');
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    });

    $('#chat_in').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            socket.emit('chat_msg', $('#chat_in').val());
            $('#chat_in').val('');
        }
    });

    socket.on('player_join',function(player_data){
        players[player_data.uuid] = game.add.sprite(23,32, 'player');
        players[player_data.uuid].playerType = player_data.type;
        game.physics.enable(players[player_data.uuid],  Phaser.Physics.ARCADE);
        players[player_data.uuid].anchor.setTo(0.5, 1);
    });

    socket.on('player_move',function(player_data){
        if(typeof players[player_data.uuid] !== 'undefined')
        {
            players[player_data.uuid].x = player_data.x;
            players[player_data.uuid].y = player_data.y;
            players[player_data.uuid].body.velocity.x = player_data.velX;
            players[player_data.uuid].body.velocity.y = player_data.velY;
        }
    });

    socket.on('sync_players',function(list){
        for(var i = 0;i<list.length;i++)
        {
            if(list[i].uuid !== uuid)
            {
                players[list[i].uuid] = game.add.sprite(23,32, 'player');
                players[list[i].uuid].playerType = list[i].type;
                game.physics.enable(players[list[i].uuid],  Phaser.Physics.ARCADE);
                players[list[i].uuid].anchor.setTo(0.5, 1);

            }
        }
    });

    socket.on('disconnected',function(id){
        players[id].destroy();
    });

    socket.on('free',function(){
        console.log('FREE');
        console.log(trapped);
        if(trapped === true){
            var random = Math.floor(Math.random() * (spawns.length-1 - 0 + 1)) + 0;

            var spawn = spawns[random];
                p.x = spawn.x*32;
                p.y = spawn.y*32;

                console.log('TRAPPED SET FALSE');
                trapped = false;
        }
    });

}

function startGame(data_obj){
    var type = data_obj['player_type'];

    line = new Phaser.Line();

    map = game.add.tilemap();
    map.addTilesetImage('tiles');

    layer = map.create('layer',data_obj.size,data_obj.size,32,32);
    layer.resizeWorld();

    map.setCollision([
            tileLibrary.blank,
            tileLibrary.wallface,tileLibrary.wallface_e,tileLibrary.wallface_w, tileLibrary.wallface_cntr,
            tileLibrary.walltop,tileLibrary.walltop_e,tileLibrary.walltop_w, tileLibrary.walltop_cntr]);

    map_data = {map:data_obj.map, rooms:data_obj.rooms, stats: data_obj.stats};

    tileSpriteMap = tileMapTranslate(map_data.map);
    for (var i=0; i<data_obj.size; i++) {
        for(var j=0; j<data_obj.size; j++) {
            map.putTile(tileSpriteMap[i][j], i, j, layer);
        }
    }

    height = data_obj.size;
    width = data_obj.size;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    playerType = type;

    p = game.add.sprite(map_data.rooms[0].center.x*32, map_data.rooms[0].center.y*32, 'player');

    game.physics.enable(p, Phaser.Physics.ARCADE);
    p.body.collideWorldBounds = true;
    p.anchor.setTo(0.5, 1);

    cursors = game.input.keyboard.createCursorKeys();
    game.input.onDown.add(clickTile, this);
    game.camera.follow(p);

    finder = new PF.AStarFinder(
    {allowDiagonal: true}
    );
    masterGrid = new PF.Grid(width,height);

    console.log(map_data.map);
    console.log(masterGrid);
    for(var i in map_data.map)
    {
        for(var j in map_data.map[i])
        {
            if(map_data.map[j][i] == 0)
            {
                masterGrid.nodes[i][j].walkable = false;
            }
        }
    }

    authed = true;
}

function update() {
    if(!authed)
    {
        return;
    }



    for(var i in players)
    {
        game.physics.arcade.collide(p,players[i], function(you, them){
            //player physics collision block
        });

        if(Phaser.Rectangle.intersects(p.body, players[i].body))
        {
            //player intersect physics object
        }
    }

    var player_data = {x:p.world.x, y:p.world.y, uuid: uuid, velX: p.body.velocity.x, velY: p.body.velocity.y};
    socket.emit('move_player', player_data);

    if(moveArray.length !== 0)
    {
        if(p.world.x > (moveArray[moveIndex][0]*tileLength) && p.world.x < (moveArray[moveIndex][0]*tileLength)+(tileLength) &&
                p.world.y > (moveArray[moveIndex][1]*tileLength) && p.world.y < (moveArray[moveIndex][1]*tileLength)+(tileLength))
        {
            moveIndex++;
            if(moveIndex === moveArray.length)
            {
                moveArray = [];
                moveIndex = 0;
                p.body.velocity.x = 0;
                p.body.velocity.y = 0;
            }
            else
            {
                movePlayer();
            }
        }
    }
}

function movePlayer()
{
    if(typeof moveArray[moveIndex] !== 'undefined')
    {
        var player = {};
        player.x = p.world.x;
        player.y = p.world.y;

        var path_point = {};
        path_point.x = moveArray[moveIndex][0]*tileLength + tileLength/2;
        path_point.y = moveArray[moveIndex][1]*tileLength + tileLength/2;

        //Get Direction
        var dir = {};
        dir.x = path_point.x - player.x;
        dir.y = path_point.y - player.y;

        //Normalize
        var dir_length =  Math.sqrt(Math.pow(dir.x,2) + Math.pow(dir.y,2));
        var dir_normalized = {};
        dir_normalized.x = dir.x / dir_length;
        dir_normalized.y = dir.y / dir_length;

        player.velx = dir_normalized.x * 200;
        player.vely = dir_normalized.y * 200;

        p.body.velocity.x = player.velx;
        p.body.velocity.y = player.vely;
    }
}

function render() {

}

function clickTile(pointer) {
    if (tileHits.length > 0)
    {
        for (var i = 0; i < tileHits.length; i++)
        {
            tileHits[i].debug = false;
        }
        layer.dirty = true;
    }
    line.start.set(pointer.worldX, pointer.worldY);
    plotting = true;
    console.log(raycast(pointer));
}

function raycast(pointer) {
    line.end.set(pointer.worldX, pointer.worldY);
    tileHits = layer.getRayCastTiles(line, 4, false, false);
    if (tileHits.length > 0)
    {
        //  Just so we can visually see the tiles
        for (var i = 0; i < tileHits.length; i++)
        {
            //tileHits[i].debug = true;
        }
        layer.dirty = true;
    }
    plotting = false;

    if(masterGrid.nodes[tileHits[0].y][tileHits[0].x].walkable === true)
    {
        p.body.velocity.x = 0;
        p.body.velocity.y = 0;
    }

    var grid = this.masterGrid.clone();

    var path = finder.findPath(Math.floor(p.world.x/32),Math.floor(p.world.y/32), tileHits[0].x,tileHits[0].y, grid);

    if(masterGrid.nodes[tileHits[0].y][tileHits[0].x].walkable === true)
    {
        moveIndex = 0;
        moveArray = path;
        movePlayer();
    }

    return tileHits[0];
}

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();
