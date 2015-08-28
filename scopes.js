
(function(){
  /*
    Closures
  */
  "use strict";
  var o = {
    'name': 'Bob'
  };

  o.out = function(){
    console.log(this);
  };
  o.out();


  //my own extend for all opjects
  //TODO: test and make sure it works for arrays and objects of object
  Object.prototype.extend = function(obj, base){
    for(var p in base){
      obj[p] = base[p];
    }
    return obj;

  };

   String.prototype.log = function(level){
    console.log(this);
  };

  'Using the log method on String.prototype'.log();
  /*
    this keyword
    think 'dot left at time of invocation (called)'
  */

  var a = {}, b = {}, c = {'name':'c'};
  var f = function(one, two){
    console.log(this,one,two);
  };

  //if use strict this = undefined, else it is global window or env
  f(a,b);
  //change the this
  c.f = f;
  c.f(a, b); //this is obj c

  f.call(c, a, b); //this is now bind to obj c

  /*
    Prototype chaining
  */
  //extend copy over only at assignment

  //object create object has real-time link to base
  var z = Object.create(c);
  console.log(z.name); // name c
  c.name = 'joe';
  console.log(z.name); // name joe
})();


(function(){
  "use strict";
  /*
    Decorators
  */
  var carLike = function(obj, loc) {
    obj.loc = loc;
    obj.move = function(){ obj.loc++; };
    return obj;
  };

  var joe = carLike({},0);
  var meg = carLike({},3);
  joe.move(); //this refers to when invoked

})();


(function(){
  "use strict";
  '---- Functional classes ----'.log();
  /*
    Functional Classes
  */
  /*
    ok but makes a new function for each object
  */
  var car = function(loc) {
    var obj = {loc:loc};
    obj.move = function(){ obj.loc++; }; //not efficient as function is created each time
    return obj;
  };

  //better gets the function out of the object but then have a list of names
  var car2 = function(loc) {
    var obj = {loc:loc};
    obj.move = move;
    return obj;
  };
  var move = function(){ this.loc++; }; //only one copy of function

  //better
  var car3 = function(loc) {
    var obj = {loc:loc};
    extend(obj, car3.methods);
    return obj;
  };
  car3.methods = {
    move: function(){
      this.loc++;
      console.log(this);
    }
  };
  var j = car3(2);
  j.move();

})();


(function(){
  "use strict";
  /*
    Prototype classes and objects
  */
  console.log('---- prototype functional classes and objects -----');
  var car = function(loc) {
    //var obj = Object.create(Car3.methods);
    var obj = Object.create(car.prototype);
    obj.loc = loc;
    return obj;
  };
  car.prototype.move = function(){ this.loc++; console.log(this); };
  var j = car(2);
  j.move();
  console.log(car.prototype.constructor.toString());
  console.log(j.constructor);
  console.log(j instanceof car); //true

  //inheritance
  var cop = function(loc){
    var obj = car(loc);
    return obj;
  };
  cop.prototype.siren = function(){ 'called cop!'.log();};
  //cop.prototype.constructor = cop;
  var c = cop(2);
  c.move();
  //c.siren(); //doesn't work

})();


(function(){
  "use strict";
  /*
    Functional inheritance
  */
  '---- functional inheritance -----'.log();
  var truck = function(loc){

    var obj = {loc:loc};
    /*obj.move = function(){
      this.loc++;
      console.log(this.loc);
    };*/
    obj.move = move;
    return obj;
  };
  var move = function(loc){
    this.loc++;
    console.log(this.loc);
  };

  var pickUp = function(loc){
    var obj = truck(loc);
    return obj;
  };
  var amy = pickUp(1);
  amy.move();

})();



(function(){
  "use strict";
  /*
  Psuedoclassical inheritance
  */
  '---- Psuedoclassical inheritance'.log();
  var Car = function(loc){
    this.loc = loc;
  };
  Car.prototype.move = function(){
      this.loc++;
  };

  var Van = function(loc){
      Car.call(this, loc);
  };
  //order important!!
  Van.prototype = Object.create(Car.prototype); //Do not use new Car();
  Van.prototype.constructor = Van;
  Van.prototype.grab = function(){ console.log('grab');};

  var zed = new Car(3);
  zed.move();

  var amy = new Van(9);
  console.log(amy.loc);
  amy.move();
  amy.grab();

})();

/*
  little library that returns a Character class
  passing exports so we can use with server side too ie node.js
  did a lot of testing hust using the node command line
*/
(function(exports){ 
  "use strict";

  //TODO a logger class to help turn on/off commenting
  var Logger = function(level, element){
    if (typeof element != 'undefined' && typeof exports.document != 'undefined'){
      console.log('------------------------------We in the browser');
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

})(typeof exports === 'undefined'? this.Character={}: exports);

(function(exports){
  "use strict";
  /*
    Enemy subclass of Character
  */
  var Character = exports.Character;

  console.log(exports.Character);

  var Enemy = function(name){
    Character.call(this,name); //call the parent constructor
  };
  Enemy.prototype = Object.create(Character.prototype);
  Enemy.prototype.constructor = Character;
  Enemy.prototype.kill = function(){ ('Enemy: '+this.name+' is killing').log(); };
  
  /*
    Player subclass of Character
  */
  var Player = function(name){
    Character.call(this,name); //call the parent constructor
  };
  Player.prototype = Object.create(Character.prototype);
  Player.prototype.constructor = Character;
  Player.prototype.kill = function(){ ('Player: '+this.name+' is NOT killing').log(); };


  var l = new exports.Logger('CRIT', new Enemy('Joe'));
  var e = new Enemy('Enemy Joe');
  var e2 = new Enemy('Enemy Bill');
  var p = new Player('Player Bob');

  var c = [
    e,
    p
  ];

  var i;
  for (i = 0; i < c.length; i++){
    c[i].kill();
    ("instanceof Character: "+(c[i] instanceof Character)).log();
    ("instanceof Enemy: "+(c[i] instanceof Enemy)).log();
    ("instanceof Player: "+(c[i] instanceof Player)).log();
  }

  //try registering
  p.x = 100;
  e.x = 90;

  console.log(e.getId());

  p.on('collision', function(e,next){
    console.log("First callback "+e.name+' vs '+this.name);
    if(next) next(p);
  },e);

  p.on('collision', function(e,next){
    console.log('Second callback '+e.name+' vs '+this.name);
    if(next) next(e);
  },e);

  p.on('collision', function(e,next){
    var hit = p.isCollision(e,'circle');
    console.log("Checking collision: "+p.name+ " vs "+ e.name + ' = '+hit);
    if(next && hit){ //check to see if collision if not break chain
      next(e);
    }
  },e);

  p.on('collision', function(e,next){
    console.log('Third callback '+e.name+' '+this.name);
    if(next) next(e);
  }, e);
 
  
  "------------Start callbacks---------".log();
   p.notify('collision');
   //p.notify('collision');
   //console.log(p);


})(typeof exports === 'undefined'? this.Children={}: exports);