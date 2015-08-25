// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
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
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var player = new Player();



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
