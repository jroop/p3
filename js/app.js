/*
  For the parent class see Character.js
*/

//TODO a logger class to help turn on/off commenting
var Logger = function(id){
  this.element = document.getElementById(id);
};
Logger.prototype.log = function(msg){ 
  this.element.innerHTML = '<code>'+msg+'</code>';
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

    if (!this.paused){
      this.x = this.x + this.speed*dt;
      if (this.x > 600){
          this.x = -200;
          this.y = Math.floor((Math.random()*3)+1)*83-26; //set new row
      }
    }
};

/*
  Gem class that need to catch
  inherits from Character class
*/
var Gem = function(opts) {
    Character.call(this,opts);
    this.x = -200; //start enemy off of screen
    this.y = 1*83-26;
    //randomly set speed
    this.speed = Math.floor((Math.random()*100)+90);
    this.sprite = opts.sprite || 'images/dot-blue.png';
};
Gem.prototype = Object.create(Character.prototype);
Gem.prototype.constructor = Gem;
Gem.prototype.update = function(dt) {

    if (!this.paused){
      this.x = this.x + this.speed*dt;
      if (this.x > 600){
          this.x = -200;
          this.y = Math.floor((Math.random()*3)+1)*83-26; //set new row
      }
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
  this.x = this.col * 101;
  this.y = this.row * 83 - 26;
};
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function(){
  this.notify('check_collision'); //tell all listeners to check for collision
};

Player.prototype.handleInput = function(key){
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
        case 'enter':
            if (!this.paused){
              this.paused = true;
            }else{
              this.paused = false;
            }
            this.notify('paused');
            break;
        default:
            console.log('Player: unknow key press');
    }
};

Player.prototype.locHelper = function(col,row){
    //don't allow to move off of board

    if (!this.paused){
      col = (this.col + col < 0 || this.col + col >= 5) ? 0 : col;
      if (this.row + row < 1 ){
          row = 4; //got to the water
          col = 0; //center the player back up
          this.col = 2;
          this.notify('goal'); //tell all the listeners that this player got to goal
      }
      row = (this.row + row >= 6) ? 0 : row;
      this.col += col;
      this.row += row;

      this.x = this.col * 101;
      this.y = this.row * 83 - 26;
    }
};

/*
  Class to keep track of the overall gamestate
  inherits Character class so we can utilize on and notify
*/
var GameState = function(opts){
  this.opts = opts || {}; //incase we didn't pass anything to the object on new
  Character.call(this,opts);
  this.time = opts.time || 30.0; //30 seconds for gameplay
  this.sprite = opts.sprite || 'images/Heart.png';
  this.score = opts.score || 0;
  this.scale = opts.scale || 0.25; //scaling factor to resize the hearts
  this.lives = opts.lives || 3;

  //save the states 
  this.opts.time = this.time; 
  this.opts.score = this.score;
  this.opts.lives = this.lives;
  this.high_score = 0; //keep this persistent until a browser refresh
};
GameState.prototype = Object.create(Character.prototype);
GameState.prototype.constructor = GameState;
GameState.prototype.init = function(){ //reset parameters 
  this.imgObj = Resources.get(this.sprite); //set up reusable img
  this.lives = this.opts.lives;
  this.time = this.opts.time;
  this.score = this.opts.score;
};
GameState.prototype.update = function(dt){
  //notify of gameover
  if (!this.paused){
    this.time -= dt;
    if (this.lives == 0 || this.time <= 0.0){
      if (this.score > this.high_score){
        this.high_score = this.score;
      }
      this.notify('gameover'); //tell all listeners that gameover
    }
  }
};
GameState.prototype.render = function(){ //draw the score board

  //lives portion
  for (var i = 0; i < this.lives; i++){
  ctx.drawImage(this.imgObj, 10+i*this.imgObj.width*this.scale, 540, this.imgObj.width*this.scale, this.imgObj.height*this.scale);
  }

  //score portion
  ctx.save(); //save the contex so we do not cascade any effects
  ctx.fillStyle = '#900';
  ctx.font = 'bold 20px Sans';
  ctx.textAlign = 'end';
  ctx.fillText(this.time.toFixed(1), 500, 570);
  ctx.restore(); //restore

  //timer portion
  ctx.save(); //save the contex so we do not cascade any effects
  ctx.fillStyle = '#ffcc80';
  ctx.font = 'bold 28px Sans';
  ctx.textAlign = 'end';
  ctx.fillText(this.score, 500, 80);
  ctx.restore(); //restore

  if (this.paused){
    ctx.save(); //save the contex so we do not cascade any effects
    ctx.lineWidth = 4;
    ctx.fillStyle = '#ffcc80';
    ctx.strokeStyle = '#995c00';
    ctx.font = 'bold 35px Sans';
    ctx.textAlign = 'center';
    ctx.strokeText('Enter to Start', ctx.canvas.width/2, ctx.canvas.height/2-40);
    ctx.fillText('Enter to Start', ctx.canvas.width/2, ctx.canvas.height/2-40);
    
    ctx.restore(); //restore
  }

};




// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player


/*
  Create the objects
*/

var logger = new Logger('messages'); //pass in the element to write to

var gamestate = new GameState({
  'time': 10.0,
  'lives': 3 //set the number of lives you want to use
});

var allEnemies = [
  new Enemy({'sprite':'images/enemy-bug.png', 'scale': 1.0, 'points': -100}),
  new Enemy({'sprite':'images/enemy-bug.png', 'scale': 1.0, 'points': -100}),
  new Enemy({'sprite':'images/enemy-bug.png', 'scale': 1.0, 'points': -100}),
  new Enemy({'sprite':'images/enemy-bug.png', 'scale': 1.0, 'points': -100}),
  new Gem({'sprite':'images/gem-blue.png', 'scale': 1.0, 'points': 10}),
  new Gem({'sprite':'images/gem-green.png', 'scale': 1.0, 'points': 20}),
  new Gem({'sprite':'images/gem-orange.png', 'scale': 1.0, 'points': 30})
];

var player = new Player({
  'name':'Player',
  'sprite': 'images/char-boy.png',
  'scale': 1.0,
  'points': 20 //points for reaching goal
});

/*
  Now link the objects together through callbacks of on and notify
  this is where the game behavior is linked together
  done this way so we can add and remove behaviors easily without
  disturbing base objects
*/

//when player notifies on collission tell all enemies to do something
for (var i = 0; i < allEnemies.length; i++){
  player.on('check_collision', function(obj,next){
    var hit = this.isCollision(obj,'circle');
    if (hit){
      this.score += obj.points; //do points transfer
      if (obj instanceof Gem){
        obj.x = 600;
        this.notify('gem');
      }else{
        this.notify('hit');
      }
    }
  }, allEnemies[i]);

  //so player state is propagated
  player.on('paused', function(obj, next){
    obj.paused = this.paused;
  }, allEnemies[i]);
}

//when player notifies a hit remove a life
player.on('hit', function(obj,next){
  this.row = 5; 
  this.col = 2;
  this.locHelper(0,0);
  obj.lives -= 1; //minus a life
  obj.score = this.score;

  if (next) next(); //shorthand if statement since only one statement
}, gamestate);

//update the score when player captures a gem
player.on('gem', function(obj, next){
  obj.score = this.score;
  if (next) next();
}, gamestate);


//when player reaches water update the score
player.on('goal', function(obj,next){
  this.score += this.points; //reached the goal
  obj.score = this.score; //set the score board same as player points
  if (next) next();
}, gamestate);

//on game over reset the player points
gamestate.on('gameover', function(obj, next){
  obj.score = 0;
  obj.row = 5; 
  obj.col = 2;
  obj.locHelper(0,0);
  obj.paused = true;
  obj.notify('paused');
  if (next) next();
}, player);

//when run out of lives restart myself
gamestate.on('gameover', function(obj, next){
  logger.log('High Score: ' + obj.high_score);
  obj.init(); //call last
  //save the high score
  //obj.init();
  //call gameover function
  //call init game function
  if (next) next();
}, gamestate);

//keep track of keys for enter
player.on('paused', function(obj, next){
  obj.paused = this.paused;
  if (next) next();
}, gamestate);








logger.log('High Score: ');


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
