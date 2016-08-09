// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = Enemy.initial_x;
    this.y = Enemy.default_y; // default y where each enemy is created just below the water row
    this.speed = Math.random() * Enemy.range_speed + Enemy.min_speed;
};

// A couple of constants (i.e. static variables in Java lingo) associated with the Enemy class
Enemy.initial_x = 0;
Enemy.default_y = gridvals.pixelGapPerRow / 2;
Enemy.min_speed = gridvals.pixelGapPerCol;
Enemy.range_speed = ctx.canvas.width - Enemy.min_speed;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = (this.x + dt * this.speed) % ctx.canvas.width;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.y_limit = gridvals.allimgwidths / 2;
Enemy.x_limit = (gridvals.allimgwidths / 3) * 2;

Enemy.prototype.collidesWith = function(entity) {
    return entity.x <= (this.x + Enemy.x_limit) && (this.x - Enemy.x_limit) <= entity.x && entity.y <= (this.y + Enemy.y_limit) && (this.y - Enemy.y_limit) <= entity.y;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = characters[Math.floor(Math.random() * characters.length)]; // randomly select a character on each instantiation
    this.x = Player.initial_x; // initial_x = middle_column_index * 101 = 2 * 101
    this.y = Player.initial_y; // initial_y = last_row_index * 83 = 5 * 83
};

// A couple of constants (i.e. static variables in Java lingo) associated with the Player class
Player.initial_x = Math.floor(gridvals.numCols / 2) * gridvals.pixelGapPerCol;
Player.initial_y = (gridvals.numRows - 1) * gridvals.pixelGapPerRow;
Player.stride_x = gridvals.pixelGapPerRow / 2;
Player.stride_y = gridvals.pixelGapPerCol / 2;
Player.max_x = ctx.canvas.width - gridvals.allimgwidths; // can't go more east than this
Player.max_y = Player.initial_y; // can't go more south than this
// Player.prototype.update = function() {
//
// };
Player.prototype.reachedWater = function() {
    return this.y === 0;
}

Player.prototype.render = Enemy.prototype.render;

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
