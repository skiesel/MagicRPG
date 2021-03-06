var WorldMapView = (function() {
	var player, map, mapLayer, cursors, worldViewGroup;
	var shaking = { x : -1, y : -1 };
	var justShook = 0;

	return {
		preload : function() {
			game.load.spritesheet('dudes', 'assets/dudes.png', 32, 34);
			game.load.tilemap('tilemap', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
			game.load.image('tiles', 'assets/maptileset.png');
		},

		create : function() {
			worldViewGroup = game.add.group();

			map = game.add.tilemap('tilemap');
			map.addTilesetImage('Tiles', 'tiles');
			//The tile array is indexed from 1!!! I don't know why :-(
			map.setCollision([1,2,3,4,5,13,14,
							  17,19,,20,21,29,30,
							  33,34,35,36,43,44,45,46,47,48,
							  59,61,62,64,
							  73,74,75,76,77,78,79,80,
							  89,90], true);
			mapLayer = map.createLayer(0);
		    mapLayer.resizeWorld();
		    // mapLayer.debug = true;

		    worldViewGroup.add(mapLayer);

			player = game.add.sprite(200, 200, 'dudes');
			
			worldViewGroup.add(player);

			game.physics.enable(player, Phaser.Physics.ARCADE);
			game.camera.follow(player);

			player.body.setSize(20, 21, 7, 7);

			player.body.collideWorldBounds = true;
		    player.animations.add('down', [0, 1, 2], 10, true);
		    player.animations.add('left', [12, 13, 14], 10, true);
		    player.animations.add('right', [24, 25, 26], 10, true);
		    player.animations.add('up', [36, 37, 38], 10, true);
		    player.frame = 1;

		    cursors = game.input.keyboard.createCursorKeys();

			var inventoryText = game.add.text(0, 0, "Inventory", { font: "20px Arial", fill: "#FFFFFF"});
			inventoryText.fixedToCamera = true;
		    inventoryText.cameraOffset.setTo(game.world.left, game.world.bottom - inventoryText.height);
		    inventoryText.inputEnabled = true;
			inventoryText.events.onInputDown.add(inventoryClicked, this);

			worldViewGroup.add(inventoryText);
		},

		update : function() {
			handlePlayerMovement();
			var x = mapLayer.getTileX(player.body.x);
			var y = mapLayer.getTileY(player.body.y);

			//There is some weird lag/interplay between switching views
			//and getting the correct tile location of the player... wait
			//a few iterations before shaking again
			if(justShook > 0) {
				justShook++;
			}

			if(x == 6 && y == 13 && shaking.x != x && shaking.y != y) {
				shaking.x = 6;
				shaking.y = 13;
				game.camera.shake(0.005, 500, false, Phaser.Camera.SHAKE_BOTH, true);
				game.camera.onShakeComplete.add(function() {
					var x = mapLayer.getTileX(player.body.x);
					var y = mapLayer.getTileY(player.body.y);
					if(shaking.x == x && shaking.y == y) {
						viewSwitch("BattleView");
						justShook = 1;
					}
				});
			} else if((justShook == 0 || justShook > 5) && (x != 6 || y != 13)){
				shaking.x = -1;
				shaking.y = -1;
				justShook = 0;
			}
		},

		show : function() {
			game.camera.follow(player);
			game.camera.update();
			worldViewGroup.visible = true;
		},

		hide : function() {
			worldViewGroup.visible = false;
			player.body.velocity.set(0);

			game.camera.unfollow();
			game.camera.setPosition(0,0);
			game.camera.update();
		},
	}

	function handlePlayerMovement() {
		game.physics.arcade.collide(player, mapLayer);
		player.body.velocity.set(0);

		if (game.input.pointer1.isDown) {
			var dx = player.body.x - (game.input.x + mapLayer.x);
			var dy = player.body.y - (game.input.y + mapLayer.y);

			if(Math.abs(dx) > Math.abs(dy)) {
				if(dx > 0) {
					//  Move to the left
					player.body.velocity.x = -150;
					player.animations.play('left');
				} else {
					//  Move to the right
					player.body.velocity.x = 150;
					player.animations.play('right');
				}
			} else {
				if(dy > 0) {
					//  Move to the down
			        player.body.velocity.y = -150;
			        player.animations.play('up');
				} else {
					//  Move to the up
					player.body.velocity.y = 150;
			        player.animations.play('down');
				}
			}
		} else {
		    if (cursors.left.isDown) {
		        player.body.velocity.x = -150;
		        player.animations.play('left');
		    } else if (cursors.right.isDown) {
		        player.body.velocity.x = 150;
		        player.animations.play('right');
		    } else if (cursors.up.isDown) {
		        player.body.velocity.y = -150;
		        player.animations.play('up');
			} else if (cursors.down.isDown) {
		        player.body.velocity.y = 150;
		        player.animations.play('down');
		    } else {
		        player.animations.stop();
		    }
		}
	}

	function inventoryClicked(item) {
		viewSwitch("InventoryView");
	}

})();