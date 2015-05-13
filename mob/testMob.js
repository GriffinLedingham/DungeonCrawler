var TileSize = 128;

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
      this.y+=20;
      break;
    case 'north':
      this.y-=20;
      break;
    case 'east':
      this.x+=20;
      break;
    case 'west':
      this.x-=20;
      break;
  }

  // If a mob bumps into a wall, change it's direction to a random new one
  if (this.dungeon.getMap()[~~((this.x + (this.facing == 'east' ? 128 : this.facing == 'west' ? 0 : 64)) / TileSize)][~~((this.y + (this.facing == 'south' ? 176 : this.facing == 'north' ? 0 : 44)) / TileSize)] == 0)
  {
    switch (this.facing)
    {
      case 'south':
        this.y-=20;
        break;
      case 'north':
        this.y+=20;
        break;
      case 'east':
        this.x-=20;
        break;
      case 'west':
        this.x+=20;
        break;
    }

    this.facing = this.directions[~~(Math.random() * this.directions.length)];
  }
};

exports.newMob = function(x, y, room, dungeon)
{
  return new TestMob(x, y, room, dungeon);
};
