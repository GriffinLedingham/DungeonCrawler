var TestMob = function(x, y)
{
  this.directions = ['north', 'south', 'east', 'west'];
  this.facing = this.directions[~~(Math.random() * this.directions.length)];

  this.x = x;
  this.y = y;
};

exports.newMob = function(x, y)
{
  return new TestMob(x, y);
};
