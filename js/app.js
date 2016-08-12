'use strict';

// Parent class of both the Enemy and Player classes
var Entity = (function() {
	// A couple of private constants (private static variables in Java lingo) and functions of Entity
	var x_collision_limit = (Engine.allimgwidths / 3) * 2,
		y_collision_limit = Engine.allimgwidths / 2,
		ctx = Engine.ctx;

	// x0 and y0 must be instance specific; if it were private static like the variables above, they would change everytime a new Enemy() or a new Player() is made
	function Entity(sprite, x, y) {
		this.sprite = sprite;
		this.x = this.x0 = x;
		this.y = this.y0 = y;
	}

	// Makes sure that the child class has a properly structured prototype
	Entity.passOwnPrototypeTo = function(Child) {
		Child.prototype = Object.create(Entity.prototype);
		Child.prototype.constructor = Child;
	};

	Entity.prototype.render = function() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	};

	Entity.prototype.restart = function() {
		this.x = this.x0;
		this.y = this.y0;
	}

	Entity.prototype.collidesWith = function(entity) {
		return entity.x <= (this.x + x_collision_limit) && (this.x - x_collision_limit) <= entity.x && entity.y <= (this.y + y_collision_limit) && (this.y - y_collision_limit) <= entity.y;
	};

	return Entity;
})();

// Enemies our player must avoid
var Enemy = (function() {
	// A couple of private constants (i.e. private static variables in Java lingo) associated with the Enemy class
	var min_speed = Engine.pixelGapPerCol,
		pixelGapPerRow = Engine.pixelGapPerRow,
		canvaswidth = Engine.canvaswidth;
	var range_speed = canvaswidth - min_speed;

	function Enemy() {
		// call the parent constructor under this particular context
		Entity.call(this, 'images/enemy-bug.png', 0, pixelGapPerRow / 2);
		this.speed = Math.random() * range_speed + min_speed;
	}

	Entity.passOwnPrototypeTo(Enemy);

	// Update the enemy's position, required method for game
	// Parameter: dt, a time delta between ticks
	Enemy.prototype.update = function(dt) {
		// You should multiply any movement by the dt parameter
		// which will ensure the game runs at the same speed for
		// all computers.
		this.x = (this.x + dt * this.speed) % canvaswidth;
	};

	return Enemy;
})();

var Player = (function() {
	// A couple of private constants (i.e. private static variables in Java lingo) associated with the Player class
	var characters = Engine.characters,
		numCols = Engine.numCols,
		pixelGapPerCol = Engine.pixelGapPerCol;
	var stride_x = Engine.pixelGapPerRow / 2,
		stride_y = pixelGapPerCol / 2,
		max_x = Engine.canvaswidth - Engine.allimgwidths; // can't go more east than this
	var max_y = (Engine.numRows - 1) * Engine.pixelGapPerRow; // can't go more south than this

	function Player() {
		Entity.call(
			this,
			characters[Math.floor(Math.random() * characters.length)], // randomly select a character on each instantiation
			Math.floor(numCols / 2) * pixelGapPerCol, // initial_x = middle_column_index * 101 = 2 * 101
			max_y // initial_y = last_row_index * 83 = 5 * 83
		);
	}

	Entity.passOwnPrototypeTo(Player);

	Player.prototype.reachedWater = function() {
		return this.y === 0;
	};

	Player.prototype.handleInput = function(key) {
		var newpos;
		switch (key) {
			case 'left':
				this.x = (newpos = this.x - stride_x) > 0 ? newpos : 0;
				break;
			case 'up':
				this.y = (newpos = this.y - stride_y) > 0 ? newpos : 0;
				break;
			case 'right':
				this.x = (newpos = this.x + stride_x) < max_x ? newpos : max_x;
				break;
			case 'down':
				this.y = (newpos = this.y + stride_y) < max_y ? newpos : max_y;
				break;
		}
	};

	return Player;
})();

// A factory to create enemies
function enemyFactory(number) {
	if (number > 6) number = 6; // or else the enemies will just overlap which is pretty much the same as having a single enemy
	var enemies = [],
		enemy;
	// From 6 possible locations randomly choose 'number' locations WITHOUT replacement
	(function(array) {
		var currentIndex = array.length,
			temporaryValue,
			randomIndex,
			finalarray = [], // array to store only as many elements as needed
		// While finalarray does not contain as many elements as required...
			count;

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
// Player.handleInput() method.
document.addEventListener('keydown', function(e) {
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.handleInput(allowedKeys[e.keyCode]);
});
