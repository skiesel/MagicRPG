var itemSprites;

var InventoryView = (function() {
	var inventoryGroup;
	var inventoryCells;
	var inventoryData = [];
	
	var descriptionText;
	var buttonLabelText = ["Use", "Drop"]

	return {
		preload : function() {
			game.load.image('crystal', 'assets/crystal.png');
			game.load.image('mana-potion', 'assets/mana-potion.png');
			game.load.image('hp-potion', 'assets/hp-potion.png');
		},

		create : function() {
			inventoryGroup = game.add.group();
			var inventoryGrid = game.add.group();
			itemSprites = game.add.group();
			var spriteCounts = game.add.group();

			var padding = 5;
			var totalWidth = game.world.camera.view.width - padding * 2;

			var rectWidth = totalWidth / 7.5;

			var roundedRectangles = [];
			inventoryCells = Array(16);

			for(var i = 0; i < 4; i++) {
				for(var j = 0; j < 4; j++) {
					var rectGraphics = inventoryGrid.add(new Phaser.Graphics(game, 0, 0));
					var x = padding + i * rectWidth + i;
					var y = padding + j * rectWidth + j;

					rectGraphics.type = "inventoryItem";
					rectGraphics.shape = new Phaser.RoundedRectangle(x, y, rectWidth, rectWidth, 10);
					rectGraphics.countLabel = game.add.text(0, 0, "", { font: "14px Arial", fill: "#444"});
					rectGraphics.itemSlotId = i + j * 4;
					roundedRectangles.push(rectGraphics);
					inventoryCells[rectGraphics.itemSlotId] = rectGraphics;
					spriteCounts.add(rectGraphics.countLabel);

					if(j == 0) {
						var item = "";
						var description = "";
						if(i == 0) { item = "crystal"; description = "Crystal Description"; }
						else if(i == 1) { item = "mana-potion"; description = "Mana Potion Description"; }
						else if(i == 2) { item = "hp-potion"; description = "HP Potion Description"; }

						if(item !== "") {


							inventoryData.push({
								item : item,
								description : description,
								quantity : i + 1,
							});
						}
					}
				}
			}

			var newRectWidth = rectWidth * 3;
			var startX = totalWidth - newRectWidth;
			for(var i = 0; i < buttonLabelText.length; i++) {
				var rectGraphics = inventoryGrid.add(new Phaser.Graphics(game, 0, 0));
				var y = padding + i * rectWidth + i + 1;
				rectGraphics.type = "actionButton";
				rectGraphics.shape = new Phaser.RoundedRectangle(startX, y, newRectWidth, rectWidth, 10);
				roundedRectangles.push(rectGraphics);

				var buttonLabel = game.add.text(0, 0, buttonLabelText[i], { font: "16px Arial", fill: "#000000"});
				buttonLabel.x = startX + newRectWidth / 2 - buttonLabel.width / 2;
				buttonLabel.y = y + rectWidth / 2 - buttonLabel.height / 2;
				inventoryGrid.add(buttonLabel);
			}

			newRectWidth = totalWidth / 4.2;
			var spacing = (totalWidth - newRectWidth * 4) / 3;
			for(var i = 0; i < 4; i++) {
				var rectGraphics = inventoryGrid.add(new Phaser.Graphics(game, 0, 0));
				rectGraphics.type = "creature";
				rectGraphics.shape = new Phaser.RoundedRectangle(padding + newRectWidth * i + spacing * i, rectWidth * 5, newRectWidth, newRectWidth, 20);
				roundedRectangles.push(rectGraphics);
			}

			for(var i = 0; i < roundedRectangles.length; i++) {
				roundedRectangles[i].inputEnabled = true;
				roundedRectangles[i].events.onInputOver.add(mouseOver, this);
				roundedRectangles[i].events.onInputOut.add(mouseOff, this);
				roundedRectangles[i].events.onInputDown.add(mouseClick, this);
				drawRoundedRect(roundedRectangles[i], 0xFFFFCC);
				inventoryGrid.add(roundedRectangles[i]);
			}

			worldViewText = game.add.text(0, 0, "World View", { font: "20px Arial", fill: "#FFFFFF"});
		    worldViewText.position.x = game.world.left;
		    worldViewText.position.y = game.world.bottom - worldViewText.height;
		    worldViewText.inputEnabled = true;
			worldViewText.events.onInputDown.add(worldViewClicked, this);
			inventoryGroup.add(worldViewText);


			descriptionText = game.add.text(0, 0, "", { font: "12px Arial", fill: "#FFFFFF"});
			descriptionText.position.x = game.world.left + padding;
			descriptionText.position.y = rectWidth * 4.5;

			inventoryGroup.add(descriptionText);
			inventoryGroup.add(inventoryGrid);
			inventoryGroup.add(itemSprites);
			inventoryGroup.add(spriteCounts);

			displayInventoryArray();
		},

		update : function() {
		
		},

		show : function() {
			inventoryGroup.visible = true;
			game.world.camera.view.x = 0;
			game.world.camera.view.y = 0;
		},

		hide : function() {
			inventoryGroup.visible = false;
		},
	}

	function worldViewClicked(item) {
		viewSwitch("WorldView");
	}

	function updateInventoryQuantity(button, quantity) {
		if(quantity === 0) {
			button.countLabel.setText("");
		} else {
			button.countLabel.setText("x" + quantity);
			button.countLabel.x = button.shape.x + button.shape.width - button.countLabel.width;
			button.countLabel.y = button.shape.y + button.shape.height - button.countLabel.height;
		}
	}

	function drawRoundedRect(shape, color) {
		shape.beginFill(color);
		shape.drawShape(shape.shape);
		shape.endFill();
	}

	var activeItem = null;

	function mouseOver(item) {
		if(activeItem == null) {
			drawRoundedRect(item, 0xFFFF22);
			if(item.itemSlotId != undefined && item.itemSlotId < inventoryData.length) {
				descriptionText.setText(inventoryData[item.itemSlotId].description);
			}
		}
	}

	function mouseOff(item) {
		if(activeItem == null) {
			drawRoundedRect(item, 0xFFFFCC);
			descriptionText.setText("");
		}
	}

	function mouseClick(item) {
		if(item.type == "inventoryItem") {
			if(activeItem != null) {
				var lastItem = activeItem;
				activeItem = null;
				if(lastItem != item) {	
					mouseOff(lastItem);
				} else {
					mouseOver(lastItem);
					return null;
				}
			}

			if(item.itemSlotId >= inventoryData.length) {
				return;
			}
			activeItem = item;
			drawRoundedRect(item, 0xFFFFFF);
			if(item.itemSlotId != undefined && item.itemSlotId < inventoryData.length) {
				descriptionText.setText(inventoryData[item.itemSlotId].description);
			}
		} else if(item.type == "actionButton") {
			if(activeItem != null) {
				inventoryData[activeItem.itemSlotId].quantity--;
				updateInventoryQuantity(activeItem, inventoryData[activeItem.itemSlotId].quantity);
				if(inventoryData[activeItem.itemSlotId].quantity <= 0) {
					var id = activeItem.itemSlotId;
					activeItem = null;
					mouseOff(inventoryCells[id]);
					cleanupInventoryArray(id);
				}
			}
		}
	}

	function cleanupInventoryArray(index) {
		inventoryCells[inventoryData.length-1].countLabel.setText("");

		itemSprites.removeAll();

		var newInventory = [];
		newInventory = newInventory.concat(inventoryData.slice(0, index));
		if(index < inventoryData.length) {
			newInventory = newInventory.concat(inventoryData.slice(index+1, inventoryData.length));
		}
		inventoryData = newInventory;
		displayInventoryArray();
	}

	function displayInventoryArray() {
		for(var i = 0; i < inventoryCells.length; i++) {
			drawRoundedRect(inventoryCells[i], 0xFFFFCC);
			if(i < inventoryData.length) {
				var itemImage = game.add.image(inventoryCells[i].shape.x, inventoryCells[i].shape.y, inventoryData[i].item);
				var newDims = fitAndMaintainAspectRatio(itemImage.width, itemImage.height, inventoryCells[i].shape.width, inventoryCells[i].shape.height);
				itemImage.scale.setTo(newDims.width / itemImage.width, newDims.height / itemImage.height);
				updateInventoryQuantity(inventoryCells[i], inventoryData[i].quantity);
				itemSprites.add(itemImage);
			}
		}
	}
})();