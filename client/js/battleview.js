	var myCreatureGroup, theirCreatureGroup;

var BattleView = (function() {
	var battleGroup;
	var battleGrid;
	var cursors;

	var buttonLabels = ["Item", "Move", "Run"];
	var actionDescriptions = ["Select an item from your inventory to use.", "Select an action to execute.", "Try to run away."];
	var descriptionLabel;

	var hpChange = -1;
	var mpChange = -2;

	return {
		preload : function() {
			game.load.spritesheet('fairy', 'assets/fairy.png', 32, 32);
		},

		create : function() {
			battleGroup = game.add.group();
			battleGrid = game.add.group();

			var padding = 5;
			var totalWidth = game.world.camera.view.width - padding * 2;
			var totalHeight = game.world.camera.view.height - padding * 2;

			var rectWidth = totalWidth / 4;
			var recHeight = totalHeight / 8;

			for(var i = 0; i < 1; i++) {
				for(var j = 0; j < 3; j++) {
					var rectGraphics = battleGrid.add(new Phaser.Graphics(game, 0, 0));

					var x = totalWidth - (padding * (2-i) + rectWidth * (2-i));
					var y = totalHeight - (padding * (3-j) + recHeight * (3-j));
					rectGraphics.actionSlotId = j;
					rectGraphics.shape = new Phaser.RoundedRectangle(x, y, rectWidth, recHeight, 10);
					rectGraphics.inputEnabled = true;
					rectGraphics.events.onInputOver.add(mouseOver, this);
					rectGraphics.events.onInputOut.add(mouseOff, this);
					rectGraphics.events.onInputDown.add(mouseClick, this);
					drawRoundedRect(rectGraphics, 0xFFFFCC);

					var buttonLabel = game.add.text(0, 0, buttonLabels[j], { font: "16px Arial", fill: "#000000"});
					buttonLabel.x = x + rectWidth / 2 - buttonLabel.width / 2;
					buttonLabel.y = y + recHeight / 2 - buttonLabel.height / 2;
					battleGrid.add(buttonLabel);
				}
			}

			descriptionLabel = game.add.text(0, 0, "", { font: "12px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: rectWidth + padding});
			descriptionLabel.x = totalWidth - (padding + rectWidth);
			descriptionLabel.y = totalHeight - (padding * 3 + recHeight * 2);
			battleGrid.add(descriptionLabel);

			myCreatureGroup = game.add.group();

			var myCreature = game.add.sprite(0, 0, 'fairy');
			myCreature.scale.setTo(4, 4);
			myCreature.animations.add('fly', [12, 13, 14, 15], 5, true);
			myCreature.animations.play('fly');
			myCreature.position.x = padding;
			myCreature.position.y = totalHeight - myCreature.height;
			myCreatureGroup.add(myCreature);
			myCreatureGroup.creature = myCreature;

			var barWidth = totalWidth / 2;
			var barHeight = totalHeight / 30;

			var myHealthbar = myCreatureGroup.add(new Phaser.Graphics(game, 0, 0));
			myHealthbar.shape = new Phaser.Rectangle(padding, totalHeight / 2, barWidth, barHeight, 5);
			myHealthbar.min = 0;
			myHealthbar.max = barWidth;
			myHealthbar.color = 0xFF0000;
			drawRoundedRect(myHealthbar, myHealthbar.color);
			myCreatureGroup.healthbar = myHealthbar;

			var myMPbar = myCreatureGroup.add(new Phaser.Graphics(game, 0, 0));
			myMPbar.shape = new Phaser.Rectangle(padding, totalHeight / 2 + barHeight, barWidth, barHeight, 5);
			myMPbar.min = 0;
			myMPbar.max = barWidth;
			myMPbar.color = 0x0000FF;
			drawRoundedRect(myMPbar, myMPbar.color);
			myCreatureGroup.mpbar = myMPbar;

			myCreatureGroup.label = game.add.text(padding, totalHeight / 2 + 2*barHeight, "Your Fairy", { font: "12px Arial", fill: "#FFFFFF"});;
			myCreatureGroup.add(myCreatureGroup.label);

			theirCreatureGroup = game.add.group();

			var theirCreature = game.add.sprite(0, 0, 'fairy');
			theirCreature.scale.setTo(4, 4);
			theirCreature.animations.add('fly', [0, 1, 2, 3], 5, true);
			theirCreature.animations.play('fly');
			theirCreature.position.x = totalWidth - theirCreature.width;
			theirCreature.position.y = padding;
			theirCreatureGroup.add(theirCreature);
			theirCreatureGroup.creature = theirCreature;

			var theirHealthbar = theirCreatureGroup.add(new Phaser.Graphics(game, 0, 0));
			theirHealthbar.shape = new Phaser.Rectangle(totalWidth - barWidth, totalHeight / 3, barWidth, barHeight, 5);
			theirHealthbar.min = 0;
			theirHealthbar.max = barWidth;
			theirHealthbar.color = 0xFF0000;
			drawRoundedRect(theirHealthbar, theirHealthbar.color);
			theirCreatureGroup.healthbar = theirHealthbar;

			var theirMPbar = theirCreatureGroup.add(new Phaser.Graphics(game, 0, 0));
			theirMPbar.shape = new Phaser.Rectangle(totalWidth - barWidth, totalHeight / 3 + barHeight, barWidth, barHeight, 5);
			theirMPbar.min = 0;
			theirMPbar.max = barWidth;
			theirMPbar.color = 0x0000FF;
			drawRoundedRect(theirMPbar, theirMPbar.color);
			theirCreatureGroup.mpbar = theirMPbar;

			theirCreatureGroup.label = game.add.text(totalWidth - barWidth, totalHeight / 3 + 2*barHeight, "Not Your Fairy", { font: "12px Arial", fill: "#FFFFFF"});;
			theirCreatureGroup.add(theirCreatureGroup.label);


			battleGroup.add(battleGrid);
			battleGroup.add(myCreatureGroup);
			battleGroup.add(theirCreatureGroup);

			cursors = game.input.keyboard.createCursorKeys();
		},

		update : function() {
			myCreatureGroup.healthbar.clear();
			myCreatureGroup.healthbar.shape.width += hpChange;
			if(myCreatureGroup.healthbar.shape.width >= myCreatureGroup.healthbar.max) {
				myCreatureGroup.healthbar.shape.width = myCreatureGroup.healthbar.max;
				hpChange *= -1;
			} else if(myCreatureGroup.healthbar.shape.width <= myCreatureGroup.healthbar.min) {
				myCreatureGroup.healthbar.shape.width = myCreatureGroup.healthbar.min;
				hpChange *= -1;
			}
        	drawRoundedRect(myCreatureGroup.healthbar, myCreatureGroup.healthbar.color);

        	myCreatureGroup.mpbar.clear();
			myCreatureGroup.mpbar.shape.width += mpChange;
			if(myCreatureGroup.mpbar.shape.width > myCreatureGroup.mpbar.max) {
				myCreatureGroup.mpbar.shape.width = myCreatureGroup.mpbar.max;
				mpChange *= -1;
			} else if(myCreatureGroup.mpbar.shape.width < myCreatureGroup.mpbar.min) {
				myCreatureGroup.mpbar.shape.width = myCreatureGroup.mpbar.min;
				mpChange *= -1;
			}
        	drawRoundedRect(myCreatureGroup.mpbar, myCreatureGroup.mpbar.color);

			theirCreatureGroup.healthbar.clear();
			theirCreatureGroup.healthbar.shape.width += hpChange;
			if(theirCreatureGroup.healthbar.shape.width >= theirCreatureGroup.healthbar.max) {
				theirCreatureGroup.healthbar.shape.width = theirCreatureGroup.healthbar.max;
				hpChange *= -1;
			} else if(theirCreatureGroup.healthbar.shape.width <= theirCreatureGroup.healthbar.min) {
				theirCreatureGroup.healthbar.shape.width = theirCreatureGroup.healthbar.min;
				hpChange *= -1;
			}
        	drawRoundedRect(theirCreatureGroup.healthbar, theirCreatureGroup.healthbar.color);

        	theirCreatureGroup.mpbar.clear();
			theirCreatureGroup.mpbar.shape.width += mpChange;
			if(theirCreatureGroup.mpbar.shape.width > theirCreatureGroup.mpbar.max) {
				theirCreatureGroup.mpbar.shape.width = theirCreatureGroup.mpbar.max;
				mpChange *= -1;
			} else if(theirCreatureGroup.mpbar.shape.width < theirCreatureGroup.mpbar.min) {
				theirCreatureGroup.mpbar.shape.width = theirCreatureGroup.mpbar.min;
				mpChange *= -1;
			}
        	drawRoundedRect(theirCreatureGroup.mpbar, theirCreatureGroup.mpbar.color);
		},

		show : function() {
			battleGroup.visible = true;
		},

		hide : function() {
			battleGroup.visible = false;
		},
	}

	function drawRoundedRect(shape, color) {
		shape.beginFill(color);
		shape.drawShape(shape.shape);
		shape.endFill();
	}

	function mouseOver(item) {
		drawRoundedRect(item, 0xFFFF22);
		descriptionLabel.setText(actionDescriptions[item.actionSlotId]);
	}

	function mouseOff(item) {
		drawRoundedRect(item, 0xFFFFCC);
		descriptionLabel.setText("");
	}

	function mouseClick(item) {
		var action = buttonLabels[item.actionSlotId];
		if(action == "Run") {
			viewSwitch("WorldView");
		}
	}
})();