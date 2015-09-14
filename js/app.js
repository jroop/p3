/*
  For the parent class see Character.js
*/

//TODO a logger class to help turn on/off commenting
var Logger = function(id){
  this.element = document.getElementById(id);
};
Logger.prototype.log = function(msg){ 
  this.element.innerHTML = '<code>>'+msg+'</code>';
};

/*
  Enemy class that need to avoid
  inherits from Character class
*/
var Enemy = function(opts) {
    Character.call(this,opts);
    this.x = -200; //start enemy off of screen
    this.y = 1*83-26;
    //randomly set speed
    this.speed = Math.floor((Math.random()*100)+10);
    this.sprite = opts.sprite || 'images/dot-red.png';
};
Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x+this.speed*dt;
    if (this.x > 600){
        this.x = -200;
        this.y = Math.floor((Math.random()*3)+1)*83-26; //set new row
    }
};

/*
  Player class that moves around trying to avoid enemy class
  inherits form Character class
*/
var Player = function(opts){
  Character.call(this,opts);
  this.col = opts.col || 2; //the x value on the grid
  this.row = opts.row || 5; //the y value on the grid
  this.locHelper(0,0); //set initial position
  //use dots to help with collision detection debugging
  this.sprite = opts.sprite || 'images/dot-blue.png';
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
    L.log(this.x + ' ' + this.y);
};

/*
  Class for display of lives
  inherits Character class but will override some methods
*/
var Life = function(opts){
  this.opts = opts || {}; //incase we didn't pass anything to the object on new
  Character.call(this,opts);
  this.sprite = opts.sprite || 'images/Heart.png';
  this.scale = opts.scale || 0.25;
  this.lives = opts.lives || 3;
};
Life.prototype = Object.create(Character.prototype);
Life.prototype.constructor = Life;
//restart the lives count
Life.prototype.init = function(){
  this.imgObj = Resources.get(this.sprite); //set up reusable img
  this.lives = this.opts.lives;
};
Life.prototype.render = function(){ //draw the lives or hearts
  for (var i = 0; i < this.lives; i++){
    ctx.drawImage(this.imgObj, this.x+i*this.imgObj.width*this.scale, this.y, this.imgObj.width*this.scale, this.imgObj.height*this.scale);
  }
  if (this.lives == 0){
    this.notify('dead');
  }
};




// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player


/*
  Create the objects
*/

var L = new Logger('messages'); //pass in the element to write to

var life = new Life({
  'x': 10,
  'y': 540,
  'lives': 6
});

var allEnemies = [
    new Enemy({'sprite':'images/enemy-bug.png'}),
    new Enemy({'sprite':'images/char-princess-girl.png'}),
    new Enemy({'sprite':'images/char-cat-girl.png'}),
];

var player = new Player({
  'name':'Player',
  'sprite': 'images/char-boy.png'
});

/*
  Now link the objects together through callbacks of on and notify
  this is where the game behavior is linked together
  done this way so we can add and remove behaviors easily without
  disturbing base objects
*/

//when player notifies on collission tell all enemies to do something
for (var i = 0; i < allEnemies.length; i++){
  player.on('collision', function(e,next){
    var hit = this.isCollision(e,'circle');
    if (hit){ 
      L.log('hit');
      player.notify('hit');
    }
  },allEnemies[i]); //pass in the enemy to the collision register
}

//when player notifies a hit remove a life
player.on('hit', function(obj,next){
  obj.lives -= 1; //minus a life
  if (next){
    next();
  }
},life); //life 

//when player notifies a hit make the player reset itself
player.on('hit', function(obj,next){
  obj.row = 5; 
  obj.col = 2;
  this.locHelper(0,0);
  if (next){
    next();
  }
},player); //self 

life.on('dead', function(obj, next){
  obj.init();
},life);


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
