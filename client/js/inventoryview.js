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

			game.load.spritesheet('fairy', 'assets/fairy.png', 32, 32);
		},

		create : function() {
			inventoryGroup = game.add.group();
			var inventoryGrid = game.add.group();
			itemSprites = game.add.group();
			var spriteCounts = game.add.group();

			var padding = 5;
			var totalWidth = game.world.camera.view.width - padding * 2;

			var rectWidth = totalWidth / 7.5;

			inventoryCells = Array(16);

			for(var i = 0; i < 4; i++) {
				for(var j = 0; j < 4; j++) {
					var x = padding * (i+1) + rectWidth * i;
					var y = padding * (j+1) + rectWidth * j;

					var button = new InventoryItemButton(x, y, rectWidth, rectWidth,
															0xFFFFCC, 0xFFFF22, 0xFFFFFF,
															inventoryMouseOver, inventoryMouseOff, inventoryMouseClick);
					button.itemSlotId = i + j * 4;
					inventoryCells[button.itemSlotId] = button;
					inventoryGroup.add(button.getGroup());

					if(j == 0) {
						var item = "";
						var description = "";
						if(i == 0) {item = "crystal"; description = "Crystal Description... it's a really really really really really really really really long description!"; }
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
			var startX = totalWidth - newRectWidth + padding;
			for(var i = 0; i < buttonLabelText.length; i++) {
				var y = padding * (i+1) + rectWidth * i;
				var button = new Button(startX, y, newRectWidth, rectWidth, buttonLabelText[i],
											0xFFFFCC, 0xFFFF22, 0xFFFFFF,
											function(){}, function(){}, actionMouseClick);
				button.type = "actionButton";
				inventoryGrid.add(button.getGroup());
			}

			descriptionText = game.add.text(0, 0, "", { font: "12px Arial", fill: "#FFFFFF", wordWrap: true, wordWrapWidth: newRectWidth});
			descriptionText.position.x = startX;
			descriptionText.position.y = padding * 3 + rectWidth * 2;
			inventoryGroup.add(descriptionText);


			newRectWidth = totalWidth / 4.2;
			var spacing = (totalWidth - newRectWidth * 4) / 3;
			for(var i = 0; i < 4; i++) {
				var button = i < 2 ? new CreatureButton(padding + newRectWidth * i + spacing * i, rectWidth * 5, newRectWidth, newRectWidth,
					0xFFFFCC, 0xFFFF22, 0xFFFFFF,
					function(){}, function(){}, creatureMouseClick, "fairy", [0,1,2,3], "fairy " + (i + 1)) :
				new CreatureButton(padding + newRectWidth * i + spacing * i, rectWidth * 5, newRectWidth, newRectWidth,
					0xFFFFCC, 0xFFFF22, 0xFFFFFF,
					function(){}, function(){}, creatureMouseClick);

				inventoryGroup.add(button.getGroup());
			}

			worldViewText = game.add.text(0, 0, "World View", { font: "20px Arial", fill: "#FFFFFF"});
		    worldViewText.position.x = game.world.left;
		    worldViewText.position.y = game.world.bottom - worldViewText.height;
		    worldViewText.inputEnabled = true;
			worldViewText.events.onInputDown.add(worldViewClicked, this);
			inventoryGroup.add(worldViewText);

			inventoryGroup.add(inventoryGrid);
			inventoryGroup.add(itemSprites);
			inventoryGroup.add(spriteCounts);

			displayInventoryArray();
		},

		update : function() {

		},

		show : function() {
			inventoryGroup.visible = true;
		},

		hide : function() {
			inventoryGroup.visible = false;
		},
	}

	function worldViewClicked(item) {
		viewSwitch("WorldView");
	}

	var activeItem = null;

	function inventoryMouseOver(item) {
		if(activeItem == null) {
			if(item.itemSlotId != undefined && item.itemSlotId < inventoryData.length) {
				descriptionText.setText(inventoryData[item.itemSlotId].description);
			}
		}
	}

	function inventoryMouseOff(item) {
		if(activeItem == null) {
			descriptionText.setText("");
		}
	}

	function inventoryMouseClick(item) {
		if(activeItem != null) {
			var lastItem = activeItem;
			activeItem = null;
			lastItem.unlockColor();
			if(lastItem != item) {	
				lastItem.mouseOff();
				inventoryMouseOff(lastItem);
			} else {
				lastItem.mouseOver();
				inventoryMouseOver(lastItem);
				return null;
			}
		}

		if(item.itemSlotId >= inventoryData.length) {
			return;
		}
		activeItem = item;
		activeItem.lockColor();
		descriptionText.setText(inventoryData[item.itemSlotId].description);
	}

	function actionMouseClick(item) {
		if(activeItem != null) {
			inventoryData[activeItem.itemSlotId].quantity--;
			if(inventoryData[activeItem.itemSlotId].quantity <= 0) {
				var id = activeItem.itemSlotId;
				activeItem.unlockColor();
				activeItem.mouseOff();
				descriptionText.setText("");
				activeItem = null;
				item.mouseOff();
				cleanupInventoryArray(id);
			} else {
				activeItem.setQuantity(inventoryData[activeItem.itemSlotId].quantity);
			}
		}
	}

	function creatureMouseClick(item) {

	}

	function cleanupInventoryArray(index) {
		inventoryCells[inventoryData.length-1].hide();

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
			if(i < inventoryData.length) {
				inventoryCells[i].setImage(inventoryData[i].item);
				inventoryCells[i].setQuantity(inventoryData[i].quantity);
			}
		}
	}
})();