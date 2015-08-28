

/*
  little library that returns a Character class
  passing exports so we can use with server side too ie node.js
  did a lot of testing hust using the node command line
*/
(function(exports){ 
  "use strict";
  var window = exports;
  console.log(exports);

  //TODO a logger class to help turn on/off commenting
  var Logger = function(id){
    console.log(exports);
    if (typeof id != 'undefined' && typeof exports.document != 'undefined'){
      console.log('------------------------------We in the browser');
      this.element = window.document.getElementById(id);
    }
  };
  Logger.prototype.log = function(msg){
    if (typeof this.element != 'undefined'){
      this.element.innerHTML = '<code>>'+msg+'</code>';
    }else{
      console.log(msg);
    }
  };

  /*
    Charater parent class the cool thing about this class is that it
    sets up the messaging callback system that way any Character class
    or it's subclasses objects can notify each other 
  */
  var Character = function(name){

    /*
      little id generator so we can keep track of objects
      and no one can modify the internal id using a closure 
      to encapsulate 
    */
    var getId = (function(){
      var i, _id = '', len = 10;
      for (i = 0; i < len; i++){ 
        _id += Math.round(Math.random()*(9));
      }
      return function(){ 
        return _id;
      };
    })();

    //these numbers will work for all the non-tile items or characters
    //_id++;
    //this._id = Math.random();
    this.getId = getId;
    this.name = name;
    this.x = 0; //default
    this.y = 0;
    this.tgto = { //target offset
      'x':(16),
      'y':(70-26)
    };
    this.imgo = { //img offset
      'x':(0),
      'y':(0-26)
    };
    this.radius = 35; //radius of object detection bubble
    //store the registered objects they can be any kind of object too
    //Store objects for general stuff
    this.listeners = {}; //array of Characters and their 'on' actions baseclass types
  };
  /*
    This function is really cool and uses callbacks
    this was a generic way to have all Characters register
    other objects so that they could 'notify' them of some sort of 
    action and invoke the provided callback. NOTE you only need to 
    provide the 'obj' parameter if you are using this in your callback
    function, that way I could keep it generic.
  */
  Character.prototype.on = function(type, callback, obj){ 
    var _id = obj.getId(); 

    if (this.listeners.hasOwnProperty(_id)){  //id found
      "id found".log();
      //this.listeners[type].push({'callback': callback, 'obj': obj});
      if (this.listeners[_id].hasOwnProperty(type)){
        "has hasOwnProperty".log();
        this.listeners[_id][type].push(callback);
      }else{
        "not has hasOwnProperty".log();
        this.listeners[_id][type] = [callback]; //no functions yet
      }
    }else{ //no id found so build up a new entry
      "no id found".log();
      this.listeners[_id] = {};
      this.listeners[_id].obj = obj;
      this.listeners[_id][type] = [callback];
    }
  };
  /*
    This function is also cool and basically is the mirror of the 
    'on' function. This is where we invoke the callbacks and use 'call'
    so that if we want to use 'this' we can it is a form of callback 
    chaining so it decouples the class a bit more for flexiblilty
  */
  Character.prototype.notify = function(type){ //notify object of this message
    var p, i; 
    /*
      https://lennybacon.com/post/2011/10/03/chainingasynchronousjavascriptcalls
      Good example to guide a wrapper function, the example was a bit simpler 
      as it did not have any parameters but I was able to use the loop
      structure and wrapper structure.
    */
    var wrapper = function(me,func, callback, obj){
      return function(){
        func.call(me,callback,obj);
      };
    };

    for (p in this.listeners){
      if (this.listeners.hasOwnProperty(p) && this.listeners[p].hasOwnProperty(type)){

        for (i = this.listeners[p][type].length-1; i > -1; i--){
          this.listeners[p][type][i] = wrapper(this,this.listeners[p][type][i],this.listeners[p].obj,this.listeners[p][type][i+1]);
        }
        this.listeners[p][type][0](); //invoke the top to start the chain reaction
      }
    }
  };
  /*
    Simple circle collision detection
    TODO work this function into the mix
  */
  Character.prototype.isCollision = function(obj,type){
    var dx, dy, dist, collided = false;
    /*
      swith on alg type 
      this way we can add more collision algorithms in the future
    */
    switch(type){ //if type is undefined go to default

      case 'circle': // jshint ignore:line
      default: //circle
        dx = this.x - obj.x;
        dy = this.y - obj.y;
        dist = Math.sqrt(dx*dx + dy*dy);
        //check if collision
        if (dist < this.radius + obj.radius){
          collided = true;
        }
        break;
    }
    return collided;
  };

  exports.Character = Character;
  exports.Logger = Logger;

})(typeof exports === 'undefined'? this: exports);


var L = new Logger('messages');

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.x = -200;
    this.y = 1*83-26;
    this.speed = Math.floor((Math.random()*300)+150);
    this.sprite = 'images/enemy-bug.png';
};

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

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};




// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(){
    this.x = 0;
    this.col = 2;

    this.y = 0;
    this.row = 5;

    this.sprite = 'images/char-boy.png'; //TODO: make this selectable
    this.locHelper(0,0);

};

//Player prototypes
Player.prototype.update = function(){

};


Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/*
    Logic in moving the player

*/
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
/*
    Make positioning easier 
    x = col
    y = row
*/
Player.prototype.locHelper = function(col,row){
    //don't allow to move off of board
    col = (this.col + col < 0 || this.col + col >= 5) ? 0 : col;
    if (this.row + row < 1 ){
        row = 4; //got to the water
        col = 0; //center the player back up
        this.col = 2;
    }
    row = (this.row + row >= 6) ? 0 : row;
    console.log('drow: ' + row + ' dcol: ' + col);

    this.col += col;
    this.row += row;
    console.log('row: ' + this.row + ' col: ' + this.col);

    this.x = this.col * 101;
    this.y = this.row * 83 - 26;
    L.log(this.x);
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [
    new Enemy(),
    new Enemy(),
    new Enemy(),
];
var player = new Player();

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
