var WorldMapView = (function() {
	var player, map, mapLayer, cursors, worldViewGroup;
	var shaking = { x : -1, y : -1 };

	return {
		preload : function() {
			game.load.spritesheet('dudes', 'assets/dudes.png', 32, 34);
			game.load.tilemap('tilemap', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
			game.load.image('tiles', 'assets/tiles.bmp');
		},

		create : function() {
			worldViewGroup = game.add.group();

			map = game.add.tilemap('tilemap');
			map.addTilesetImage('Tiles', 'tiles');
			map.setCollision([4,6, 31, 32, 33, 34, 35, 36, 37, 38], true);
			mapLayer = map.createLayer(0);
		    mapLayer.resizeWorld();
		    // mapLayer.debug = true;

		    worldViewGroup.add(mapLayer);

			player = game.add.sprite(200, 200, 'dudes');
			
			worldViewGroup.add(player);

			game.physics.enable(player, Phaser.Physics.ARCADE);
			game.camera.follow(player);

			player.body.setSize(10, 10, 10, 12);

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

			game.debug.text("Player at: " + x + ", " + y, 32, 32);

			if(x == 6 && y == 13 && shaking.x != x && shaking.y != y) {
				shaking.x = 6;
				shaking.y = 13;
				game.camera.shake(0.005, 500, false, Phaser.Camera.SHAKE_BOTH, true);
			} else if(x != 6 || y != 13) {
				shaking.x = -1;
				shaking.y = -1;
			}
		},

		show : function() {
			worldViewGroup.visible = true;
			game.camera.follow(player);
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