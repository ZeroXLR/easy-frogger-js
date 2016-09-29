'use strict';
/* Resources:
 * This is simply an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 */
(function() {
	var resourceCache = {};
	var loading = [];
	var readyCallbacks = [];

	/* This is the publicly accessible image loading function. It accepts
	 * an array of strings pointing to image files or a string for a single
	 * image. It will then call our private image loading function accordingly.
	 */
	function load(urlOrArr) {
		if (urlOrArr instanceof Array) {
			/* If the developer passed in an array of images
			 * loop through each value and call our image
			 * loader on that image file
			 */
			urlOrArr.forEach(function(url) {
				_load(url);
			});
		} else {
			/* The developer did not pass an array to this function,
			 * assume the value is a string and call our image loader
			 * directly.
			 */
			_load(urlOrArr);
		}
	}

	/* This is our private image loader function, it is
	 * called by the public image loader function.
	 */
	function _load(url) {
		if (resourceCache[url]) {
			/* If this URL has been previously loaded it will exist within
			 * our resourceCache array. Just return that image rather than
			 * re-loading the image.
			 */
			return resourceCache[url];
		} else {
			/* This URL has not been previously loaded and is not present
			 * within our cache; we'll need to load this image.
			 */
			var img = new Image();
			img.onload = function() {
				/* Once our image has properly loaded, add it to our cache
				 * so that we can simply return this image if the developer
				 * attempts to load this file in the future.
				 */
				resourceCache[url] = img;

				/* Once the image is actually loaded and properly cached,
				 * call all of the onReady() callbacks we have defined.
				 */
				if (isReady()) {
					readyCallbacks.forEach(function(func) {
						func();
					});
				}
			};

			/* Set the initial cache value to false, this will change when
			 * the image's onload event handler is called. Finally, point
			 * the image's src attribute to the passed in URL.
			 */
			resourceCache[url] = false;
			img.src = url;
		}
	}

	/* This is used by developers to grab references to images they know
	 * have been previously loaded. If an image is cached, this functions
	 * the same as calling load() on that URL.
	 */
	function get(url) {
		return resourceCache[url];
	}

	/* This function determines if all of the images that have been requested
	 * for loading have in fact been properly loaded.
	 */
	function isReady() {
		var ready = true;
		for (var k in resourceCache) {
			if (resourceCache.hasOwnProperty(k) &&
				!resourceCache[k]) {
				ready = false;
			}
		}
		return ready;
	}

	/* This function will add a function to the callback stack that is called
	 * when all requested images are properly loaded.
	 */
	function onReady(func) {
		readyCallbacks.push(func);
	}

	/* This object defines the publicly accessible functions available to
	 * developers by creating a global Resources object.
	 */
	window.Resources = {
		load: load,
		get: get,
		onReady: onReady,
		isReady: isReady
	};
})();

/* Engine:
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 */
var Engine = (function(global) {
	/* Predefine the variables we'll be using within this scope,
	 * create the canvas element, grab the 2D context for that canvas
	 * set the canvas element's height/width and add it to the DOM.
	 */
	var doc = global.document,
		win = global.window,
		canvas = doc.createElement('canvas'),
		ctx = canvas.getContext('2d'),
		lastTime,
		allimgwidths = 101,
		/* This array holds the relative URL to the image used
		 * for that particular row of the game level.
		 */
		rowImages = [
			'images/water-block.png', // Top row is water
			'images/stone-block.png', // Row 1 of 3 of stone
			'images/stone-block.png', // Row 2 of 3 of stone
			'images/stone-block.png', // Row 3 of 3 of stone
			'images/grass-block.png', // Row 1 of 2 of grass
			'images/grass-block.png' // Row 2 of 2 of grass
		],
		numRows = rowImages.length, // makes the applicaton more robust to change; say, for instance, if we added more rows in the future
		numCols = 5,
		pixelGapPerRow = 83,
		pixelGapPerCol = allimgwidths;

	canvas.width = numCols * allimgwidths;
	canvas.height = numRows * allimgwidths;
	doc.body.appendChild(canvas);

	/* This function serves as the kickoff point for the game loop itself
	 * and handles properly calling the update and render methods.
	 */
	function main() {
		/* Get our time delta information which is required if your game
		 * requires smooth animation. Because everyone's computer processes
		 * instructions at different speeds we need a constant value that
		 * would be the same for everyone (regardless of how fast their
		 * computer is) - hurray time!
		 */
		var now = Date.now(),
			dt = (now - lastTime) / 1000.0;

		/* Call our update/render functions, pass along the time delta to
		 * our update function since it may be used for smooth animation.
		 */
		updateEntities(dt);
		render();
		checkCollisions();

		/* Set our lastTime variable which is used to determine the time delta
		 * for the next time this function is called.
		 */
		lastTime = now;

		/* Use the browser's requestAnimationFrame function to call this
		 * function again as soon as the browser is able to draw another frame.
		 * Note: the function is asynchronous
		 */
		main.stop || win.requestAnimationFrame(main);
	}

	main.stop = false;

	/* This function does some initial setup that should only occur once,
	 * particularly setting the lastTime variable that is required for the
	 * game loop.
	 */
	function init() {
		// reset();
		lastTime = Date.now();
		main();
	}

	/* This function is called by main (our game loop) and itself calls all
	 * of the functions which may need to update entity's data. Based on how
	 * you implement your collision detection (when two entities occupy the
	 * same space, for instance when your character should die), you may find
	 * the need to add an additional function call here. For now, we've left
	 * it commented out - you may or may not want to implement this
	 * functionality this way (you could just implement collision detection
	 * on the entities themselves within your app.js file).
	 */
	// function update(dt) {
	//     updateEntities(dt);
	//     // checkCollisions();
	// }

	function checkCollisions() {
		if (player.reachedWater()) {
			alertWithoutRenderBlocking('YIPPIE! I WIN!! Time for a refreshing swim!');
			main.stop = true;
		} else {
			for (var i = 0; i < allEnemies.length; ++i) {
				if (allEnemies[i].collidesWith(player)) {
					alertWithoutRenderBlocking('WAAAAAH!! Icky bug jumped on me! I must bathe back home!!');
					player.restart();
					break;
				}
			}
		}
	}

	/* Even if all the positional calculations have been done and the canvas
	 * has been redrawn, until the browser's rendering actually triggers, the
	 * new drawing will not be shown as real visible pixels. However, the
	 * rendering cannot trigger because (1) the stack is not empty because the
	 * current main() is still in it and (2) the call
	 * win.requestAnimationFrame(main) has yet to happen). Thus, if alert(...)
	 * were to run then, you could get a situation where the hero/heroine
	 * doesn't SEEM to be colliding with the enemy (as the collision hasn't
	 * been rendered yet) but, you get a message saying that a collision has
	 * occurred. To solve this issue, simply send alert(...) into the callback
	 * queue managed by the event loop. This works because The callback queue
	 * has lower priority than the render queue.
	 */
	function alertWithoutRenderBlocking(message) {
		global.setTimeout(function() {
			global.alert(message);
		}, 0);
	}

	/* This is called by the update function and loops through all of the
	 * objects within your allEnemies array as defined in app.js and calls
	 * their update() methods. It will then call the update function for your
	 * player object. These update methods should focus purely on updating
	 * the data/properties related to the object. Do your drawing in your
	 * render methods.
	 */
	function updateEntities(dt) {
		allEnemies.forEach(function(enemy) {
			enemy.update(dt);
		});
		//player.update();
	}

	/* This function initially draws the "game level", it will then call
	 * the renderEntities function. Remember, this function is called every
	 * game tick (or loop of the game engine) because that's how games work -
	 * they are flipbooks creating the illusion of animation but in reality
	 * they are just drawing the entire screen over and over.
	 */
	function render() {
		var row, col;

		/* Loop through the number of rows and columns we've defined above
		 * and, using the rowImages array, draw the correct image for that
		 * portion of the "grid"
		 */
		for (row = 0; row < numRows; row++) {
			for (col = 0; col < numCols; col++) {
				/* The drawImage function of the canvas' context element
				 * requires 3 parameters: the image to draw, the x coordinate
				 * to start drawing and the y coordinate to start drawing.
				 * We're using our Resources helpers to refer to our images
				 * so that we get the benefits of caching these images, since
				 * we're using them over and over.
				 */
				ctx.drawImage(Resources.get(rowImages[row]), col * pixelGapPerCol, row * pixelGapPerRow);
			}
		}

		renderEntities();
	}

	/* This function is called by the render function and is called on each game
	 * tick. Its purpose is to then call the render functions you have defined
	 * on your enemy and player entities within app.js
	 */
	function renderEntities() {
		/* Loop through all of the objects within the allEnemies array and call
		 * the render function you have defined.
		 */
		allEnemies.forEach(function(enemy) {
			enemy.render();
		});

		player.render();
	}

	/* This function does nothing but it could have been a good place to
	 * handle game reset states - maybe a new game menu or a game over screen
	 * those sorts of things. It's only called once by the init() method.
	 */
	// function reset() {
	//     // noop
	// }

	/* Go ahead and load all of the images we know we're going to need to
	 * draw our game level. Then set init as the callback method, so that when
	 * all of these images are properly loaded our game will start.
	 */
	var characters = [
		'images/char-boy.png',
		'images/char-cat-girl.png',
		'images/char-horn-girl.png',
		'images/char-pink-girl.png',
		'images/char-princess-girl.png'
	];
	Resources.load([
		'images/stone-block.png',
		'images/water-block.png',
		'images/grass-block.png',
		'images/enemy-bug.png'
	].concat(characters));
	Resources.onReady(init);

	// Make certain values available
	return {
		ctx: ctx,
		characters: characters,
		allimgwidths: allimgwidths,
		numRows: numRows,
		numCols: numCols,
		pixelGapPerRow: pixelGapPerRow,
		pixelGapPerCol: pixelGapPerCol,
		canvaswidth: ctx.canvas.width,
		canvasheight: ctx.canvas.height,
	};
})(this);

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
	var canvaswidth = Engine.canvaswidth,
		pixelGapPerRow = Engine.pixelGapPerRow,
		min_speed = canvaswidth / 2;
	var range_speed = canvaswidth;

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
		}).forEach(function(element) {
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