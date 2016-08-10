'use strict';

// Parent class of both the Enemy and Player classes
var Entity = function(sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};

// A couple of constant (static in Java lingo) variables and functions of Entity
Entity.x_collision_limit = (gridvals.allimgwidths / 3) * 2;
Entity.y_collision_limit = gridvals.allimgwidths / 2;
// Makes sure that the child class has a properly structured prototype
Entity.passOwnPrototypeTo = function(Child) {
    Child.prototype = Object.create(Entity.prototype);
    Child.prototype.constructor = Child;
};

Entity.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Entity.prototype.collidesWith = function(entity) {
    return entity.x <= (this.x + Entity.x_collision_limit) && (this.x - Entity.x_collision_limit) <= entity.x && entity.y <= (this.y + Entity.y_collision_limit) && (this.y - Entity.y_collision_limit) <= entity.y;
};

// Enemies our player must avoid
var Enemy = function() {
    // call the parent constructor under this particular context
    Entity.call(this, 'images/enemy-bug.png', Enemy.initial_x, Enemy.default_y);
    this.speed = Math.random() * Enemy.range_speed + Enemy.min_speed;
};

// A couple of constants (i.e. static variables in Java lingo) associated with the Enemy class
Enemy.initial_x = 0;
Enemy.default_y = gridvals.pixelGapPerRow / 2;
Enemy.min_speed = gridvals.pixelGapPerCol;
Enemy.range_speed = ctx.canvas.width - Enemy.min_speed;

Entity.passOwnPrototypeTo(Enemy);

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = (this.x + dt * this.speed) % ctx.canvas.width;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    Entity.call(
        this,
        characters[Math.floor(Math.random() * characters.length)], // randomly select a character on each instantiation
        Player.initial_x, // initial_x = middle_column_index * 101 = 2 * 101
        Player.initial_y // initial_y = last_row_index * 83 = 5 * 83
    );
};

// A couple of constants (i.e. static variables in Java lingo) associated with the Player class
Player.initial_x = Math.floor(gridvals.numCols / 2) * gridvals.pixelGapPerCol;
Player.initial_y = (gridvals.numRows - 1) * gridvals.pixelGapPerRow;
Player.stride_x = gridvals.pixelGapPerRow / 2;
Player.stride_y = gridvals.pixelGapPerCol / 2;
Player.max_x = ctx.canvas.width - gridvals.allimgwidths; // can't go more east than this
Player.max_y = Player.initial_y; // can't go more south than this

Entity.passOwnPrototypeTo(Player);

Player.prototype.reachedWater = function() {
    return this.y === 0;
};

Player.prototype.handleInput = function(key) {
    var newpos;
    switch (key) {
        case 'left':
            this.x = (newpos = this.x - Player.stride_x) > 0 ? newpos : 0;
            break;
        case 'up':
            this.y = (newpos = this.y - Player.stride_y) > 0 ? newpos : 0;
            break;
        case 'right':
            this.x = (newpos = this.x + Player.stride_x) < Player.max_x ? newpos : Player.max_x;
            break;
        case 'down':
            this.y = (newpos = this.y + Player.stride_y) < Player.max_y ? newpos : Player.max_y;
            break;
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
function enemyFactory(number) {
    if (number > 6) number = 6; // or else the enemies will just overlap which is pretty much the same as having a single enemy
    var enemies = [],
        enemy;
    // From 6 possible locations randomly choose 'number' locations WITHOUT replacement
    (function(array) {
        var currentIndex = array.length,
            temporaryValue,
            randomIndex,
            finalarray = []; // array to store only as many elements as needed
        // While finalarray does not contain as many elements as required...
        for (var count = 0; count < number; ++count) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            --currentIndex;
            finalarray.push(array[randomIndex]);

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return finalarray;
    })([1, 2, 3, 4, 5, 6]).sort(function(a, b) { // sorting makes sure that the enemies are added according to perpective i.e. further enemies seem to be behind closer ones
                              return a - b;
                          })
                          .forEach(function(element) {
                              enemy = new Enemy();
                              enemy.y *= element;
                              enemies.push(enemy);
                          });
    return enemies;
}
var allEnemies = enemyFactory(4);
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
