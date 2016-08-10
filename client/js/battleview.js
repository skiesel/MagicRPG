var meter;

var BattleView = (function() {
	var myCreatureGroup, theirCreatureGroup;
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
					var x = totalWidth - (padding * (2-i) + rectWidth * (2-i));
					var y = totalHeight - (padding * (3-j) + recHeight * (3-j));

					var button = new Button(x, y, rectWidth, recHeight, buttonLabels[j],
												0xFFFFCC, 0xFFFF22, 0xFFFFFF,
												mouseOver, mouseOff, mouseClick);
					button.actionSlotId = j;
					battleGrid.add(button.getGroup());
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

			var myHealthbar = new Meter(padding, totalHeight / 2, barWidth, barHeight, 1, 0xFF0000, 0xFFFFFF);
			myCreatureGroup.add(myHealthbar.getGroup());
			myCreatureGroup.healthbar = myHealthbar;

			var myMPbar = new Meter(padding, totalHeight / 2 + barHeight, barWidth, barHeight, 1, 0x0000FF, 0xFFFFFF);
			myCreatureGroup.add(myMPbar.getGroup());
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

			var theirHealthbar = new Meter(totalWidth - barWidth, totalHeight / 3, barWidth, barHeight, 1, 0xFF0000, 0xFFFFFF);
			theirCreatureGroup.add(theirHealthbar.getGroup());
			theirCreatureGroup.healthbar = theirHealthbar;

			var theirMPbar = new Meter(totalWidth - barWidth, totalHeight / 3 + barHeight, barWidth, barHeight, 1, 0x0000FF, 0xFFFFFF);
			theirCreatureGroup.add(theirMPbar.getGroup());
			theirCreatureGroup.mpbar = theirMPbar;

			theirCreatureGroup.label = game.add.text(totalWidth - barWidth, totalHeight / 3 + 2*barHeight, "Not Your Fairy", { font: "12px Arial", fill: "#FFFFFF"});;
			theirCreatureGroup.add(theirCreatureGroup.label);

			battleGroup.add(battleGrid);
			battleGroup.add(myCreatureGroup);
			battleGroup.add(theirCreatureGroup);

			cursors = game.input.keyboard.createCursorKeys();
		},

		update : function() {
			myCreatureGroup.healthbar.setPercentFilled(0.75);
			myCreatureGroup.healthbar.redraw();

			myCreatureGroup.mpbar.setPercentFilled(0.99);
			myCreatureGroup.mpbar.redraw();

			theirCreatureGroup.healthbar.setPercentFilled(0.25);
			theirCreatureGroup.healthbar.redraw();

			theirCreatureGroup.mpbar.setPercentFilled(0.5);
			theirCreatureGroup.mpbar.redraw();
		},

		show : function() {
			battleGroup.visible = true;
		},

		hide : function() {
			battleGroup.visible = false;
		},
	}

	function mouseOver(item) {
		descriptionLabel.setText(actionDescriptions[item.actionSlotId]);
	}

	function mouseOff(item) {
		descriptionLabel.setText("");
	}

	function mouseClick(item) {
		var action = buttonLabels[item.actionSlotId];
		if(action == "Run") {
			viewSwitch("WorldView");
		}
	}
})();