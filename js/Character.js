/*
  little library that returns a Character class
  passing exports so we can use with server side too ie node.js
  did a lot of testing using the node command line
*/
(function(exports){ 
  "use strict";
  /*
    Charater parent class the cool thing about this class is that it
    sets up the messaging callback system that way any Character class
    or it's subclasses objects can notify each other 
  */
  var Character = function(opts){

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
    this.getId = getId; //function to get the id

    //setting the opts for the Character

    this.name = opts.name || '';
    this.x = opts.x || 0; //default
    this.y = opts.y || 0;
    this.targetOffset = opts.targetOffset || { //target offset
      'x':(16),
      'y':(70-26)
    };
    this.imageOffset = opts.imageOffset || { //img offset
      'x':(0),
      'y':(0-26)
    };
    this.radius = opts.radius || 35; //radius of object detection bubble
    this.sprite = opts.sprite || 'images/char-boy.png';

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
    var p, i, _id = obj.getId(); 

    if (this.listeners.hasOwnProperty(_id)){  //id found
      //this.listeners[type].push({'callback': callback, 'obj': obj});
      if (this.listeners[_id].hasOwnProperty(type)){
        this.listeners[_id][type].push(callback);
      }else{
        this.listeners[_id][type] = [callback]; //no functions yet
      }
    }else{ //no id found so build up a new entry
      this.listeners[_id] = {};
      this.listeners[_id].obj = obj;
      this.listeners[_id][type] = [callback];
    }

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
    //now loop through and create the callback chain
    for (p in this.listeners){
      if (this.listeners.hasOwnProperty(p) && this.listeners[p].hasOwnProperty(type)){

        for (i = this.listeners[p][type].length-1; i > -1; i--){
          this.listeners[p][type][i] = wrapper(this,this.listeners[p][type][i],this.listeners[p].obj,this.listeners[p][type][i+1]);
        }
      }
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

    for (p in this.listeners){
      if (this.listeners.hasOwnProperty(p) && this.listeners[p].hasOwnProperty(type)){
        //invoke the top to start the chain of callbacks
        this.listeners[p][type][0](); 
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

  /*
    Update method moved here because all characters need to do this
    just have to ensure that both ctx and Resources are part of the global
  */
  Character.prototype.render = function(){
    exports.ctx.drawImage(exports.Resources.get(this.sprite), this.x, this.y);
  };

  /*
    exporting the classes for global use
  */
  exports.Character = Character;

})(typeof exports === 'undefined'? this: exports); //end of library