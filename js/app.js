// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = 0;
    this.y = 41.5; // default y where each enemy is created just below the water row
    this.speed = Math.random() * 404 + 202;
};

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

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = characters[Math.floor(Math.random() * characters.length)]; // randomly select a character on each instantiation
    this.x = 202; // initial_x = middle_column_index * 101 = 2 * 101
    this.y = 415; // initial_y = last_row_index * 83 = 5 * 83
};

// Player.prototype.update = function() {
//
// };

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(key) {
    switch (key) {
        case 'left':
            this.x = Math.max(this.x - 50.5, 0);
            break;
        case 'up':
            this.y = Math.max(this.y - 50.5, 0);
            break;
        case 'right':
            this.x = Math.min(this.x + 50.5, 404);
            break;
        case 'down':
            this.y = Math.min(this.y + 50.5, 415);
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
    (function(array) {
        var currentIndex = array.length,
            temporaryValue,
            randomIndex,
            finalarray = [],
            count = 0;
        // While there remain elements to shuffle...
        while (count < number) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            --currentIndex;
            finalarray.push(array[randomIndex]);
            ++count;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return finalarray;
    })([1, 2, 3, 4, 5, 6]).sort(function(a, b) { // sorting makes sure that the enemies are added according to perpective i.e. further enemies seem 'behind' closer ones
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
