



//TODO a logger class to help turn on/off commenting
var Logger = function(id){
  if (typeof id != 'undefined' && typeof document != 'undefined'){
    console.log('------------------------------We in the browser');
    this.element = document.getElementById(id);
  }
};
Logger.prototype.log = function(msg){
  if (typeof this.element != 'undefined'){
    this.element.innerHTML = '<code>>'+msg+'</code>';
  }else{
    console.log(msg);
  }
};

var L = new Logger('messages');

/*
  Enemy class that need to avoid
  subclass of Character
*/
var Enemy = function(opts) {
    Character.call(this,opts);
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.x = -200;
    this.y = 1*83-26;
    this.speed = Math.floor((Math.random()*300)+150);
    this.sprite = 'images/enemy-bug.png';
};
Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x+this.speed*dt;
    if (this.x > 600){
        this.x = -200;
        this.y = Math.floor((Math.random()*3)+1)*83-26;
    }
};

/*
  Player class that moves around trying to avoid enemy class
  also a subclass of Character
*/
var Player = function(opts){
  this.col = 2;
  this.row = 5;
  Character.call(this,opts);
  this.locHelper(0,0);

};
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(){
  this.notify('collision');
};

Player.prototype.handleInput = function(key){
    console.log('Key: '+key);
    switch (key){
        case 'left':
            this.locHelper(-1,0); //col,row
            break;
        case 'up':
            this.locHelper(0,-1);
            break;
        case 'right':
            this.locHelper(1,0);
            break;
        case 'down':
            this.locHelper(0,1);
            break;
        default:
            console.log('Player: unknow key press');
    }
};

Player.prototype.locHelper = function(col,row){
    //don't allow to move off of board
    col = (this.col + col < 0 || this.col + col >= 5) ? 0 : col;
    if (this.row + row < 1 ){
        row = 4; //got to the water
        col = 0; //center the player back up
        this.col = 2;
    }
    row = (this.row + row >= 6) ? 0 : row;
    this.col += col;
    this.row += row;

    this.x = this.col * 101;
    this.y = this.row * 83 - 26;
    L.log(this.x);
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [
    new Enemy({'sprite':'images/enemy-bug.png'}),
    new Enemy({'sprite':'images/char-princess-girl.png'}),
    new Enemy({'sprite':'images/char-cat-girl.png'}),
];
var player = new Player({'name':'Crap'});

for (var i = 0; i < allEnemies.length; i++){
  player.on('collision', function(e,next){
    var hit = this.isCollision(e,'circle');
    if(hit){ //reset the player
      L.log('hit');
      this.row = 5;
      this.col = 2;
      this.locHelper(0,0);
    }
  },allEnemies[i]);
}

L.log('hello');


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
