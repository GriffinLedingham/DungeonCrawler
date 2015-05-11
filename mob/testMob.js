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

  // If a mob bumps into a wall, change it's direction to a random new one
  if (this.dungeon.getMap()[~~((this.x + (this.facing == 'east' ? 32 : this.facing == 'west' ? 0 : 16)) / TileSize)][~~((this.y + (this.facing == 'south' ? 44 : this.facing == 'north' ? 0 : 22)) / TileSize)] == 0)
  {
    switch (this.facing)
    {
      case 'south':
        this.y--;
        break;
      case 'north':
        this.y++;
        break;
      case 'east':
        this.x--;
        break;
      case 'west':
        this.x++;
        break;
    }

    this.facing = this.directions[~~(Math.random() * this.directions.length)];
  }
};

exports.newMob = function(x, y, room, dungeon)
{
  return new TestMob(x, y, room, dungeon);
};
