var TileSize = 32;

var TestMob = function(x, y, room, dungeon)
{
  this.room = room;
  this.dungeon = dungeon;

  this.directions = ['north', 'south', 'east', 'west'];
  this.facing = this.directions[~~(Math.random() * this.directions.length)];

  this.x = x * TileSize;
  this.y = y * TileSize;
};

TestMob.prototype.update = function(delta)
{
  switch (this.facing)
  {
    case 'south':
      this.y++;
      break;
    case 'north':
      this.y--;
      break;
    case 'east':
      this.x++;
      break;
    case 'west':
      this.x--;
      break;
  }
};

exports.newMob = function(x, y, room, dungeon)
{
  return new TestMob(x, y, dungeon);
};
