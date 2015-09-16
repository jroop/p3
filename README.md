frontend-nanodegree-arcade-game
===============================

###Background
Udacity front-end game that has been enhanced. It sort of resembles a classic frogger game.

Thanks for playing and enjoy!

###Game Play
* Use `enter` key to start game and pause game
* Use keyboard arrows `up`, `down`, `left`, and `right` to move the character

__NOTE__: If running game from a static file then the grayscale coloring during game pause will not work. This is a limitation of the browser as it is considered a security error. It is best to run the game from a server then all problems go away.

###Design
The Character class made use of a system that could register objects with `on` and then call a `notify` to let the objects know that something has happened. Currently, you have to register with an object and also the object can only be registered once per `on` id. 

An example:
```javascript
//when player reaches water update the score
player.on('goal', function(obj,next){
  this.score += this.points; //reached the goal
  obj.score = this.score; //set the score board same as player points
  if (next) next(); //call the next function in line
}, gamestate);
```

You can chain the methods together with different objects
```javascript
player.on('hit', function(obj, next){
  console.log('You got hit 1');
  if (next) next();
}, allEnemies[0]);

player.on('hit', function(obj, next){
  console.log('You got hit 2');
  if (next) next();
}, allEnemies[1]);
```
