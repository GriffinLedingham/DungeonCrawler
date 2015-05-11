var TestMob = function(x, y)
{
  this.directions = ['north', 'south', 'east', 'west'];
  this.facing = this.directions[~~(Math.random() * this.directions.length)];

  this.x = x;
  this.y = y;
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

exports.newMob = function(x, y)
{
  return new TestMob(x, y);
};
