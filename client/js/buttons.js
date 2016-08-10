function fitAndMaintainAspectRatio(width, height, widthBound, heightBound) {
	var newWidth = width;
	var newHeight = height;

	if(newWidth != widthBound){
		var ratio = widthBound / newWidth;
		newWidth = widthBound;
		newHeight = height * ratio;
	}

	if(newHeight != heightBound){
		var ratio = heightBound / newHeight;
		newWidth = newWidth * ratio;
		newHeight = heightBound;
	}

	return {
		width : newWidth,
		height : newHeight,
	};
}

function drawShape(graphics, shape, color) {
	graphics.beginFill(color);
	graphics.drawShape(shape);
	graphics.endFill();
}

class Button {
	constructor(x, y, width, height, text, backgroundColor, hoverColor, clickColor, onMouseOver, onMouseOff, onClick) {
		this.backgroundColor = backgroundColor;
		this.hoverColor = hoverColor;
		this.clickColor = clickColor;

		this.mouseOverCallback = onMouseOver;
		this.mouseOffCallback = onMouseOff;
		this.mouseClickCallback = onClick;

		this.group = game.add.group();
		this.graphics = this.group.add(new Phaser.Graphics(game, 0, 0));

		this.rectangle = new Phaser.RoundedRectangle(x, y, width, height, 10);
		drawShape(this.graphics, this.rectangle, this.backgroundColor);

		this.graphics.inputEnabled = true;
		this.graphics.events.onInputOver.add(this.mouseOver, this);
		this.graphics.events.onInputOut.add(this.mouseOff, this);
		this.graphics.events.onInputDown.add(this.onClick, this);

		this.label = game.add.text(0, 0, text, { font: "16px Arial", fill: "#000000"});
		this.label.x = x + width / 2 - this.label.width / 2;
		this.label.y = y + height / 2 - this.label.height / 2;
		this.group.add(this.label);
	}

	getGroup() {
		return this.group;
	}

	mouseOver() {
		this.graphics.clear();
		drawShape(this.graphics, this.rectangle, this.hoverColor);
		this.mouseOverCallback(this);
	}

	mouseOff() {
		this.graphics.clear();
		drawShape(this.graphics, this.rectangle, this.backgroundColor);
		this.mouseOffCallback(this);
	}

	onClick() {
		this.graphics.clear();
		drawShape(this.graphics, this.rectangle, this.clickColor);
		this.mouseClickCallback(this);
	}
};

class InventoryItemButton extends Button {
	constructor(x, y, width, height, backgroundColor, hoverColor, clickColor, onMouseOver, onMouseOff, onClick, imageId, quantity) {
		super(x, y, width, height, "", backgroundColor, hoverColor, clickColor, onMouseOver, onMouseOff, onClick);
		
		this.imageGroup = game.add.group();
		this.itemGroup = game.add.group();

		if(imageId != undefined) {
			setImage(imageId, x, y);
		}
		this.itemGroup.add(this.imageGroup);

		this.quantity = quantity;
		
		//game.add.text(0, 0, "", { font: "14px Arial", fill: "#444"});
		if(quantity != undefined) {
			this.label.setText("x");
			this.label.x = this.rectangle.x + this.rectangle.width - this.label.width;
			this.label.y = this.rectangle.y + this.rectangle.height - this.label.height;
		}
		this.itemGroup.add(this.label);

		this.group.add(this.itemGroup);

		this.lock = false;
	}

	setQuantity(howMuch) {
		this.label.setText("x"+howMuch);
		this.label.x = this.rectangle.x + this.rectangle.width - this.label.width;
		this.label.y = this.rectangle.y + this.rectangle.height - this.label.height;
	}

	lockColor() {
		this.lock = true;
	}

	unlockColor() {
		this.lock = false;
	}

	mouseOver() {
		if(!this.lock) {
			super.mouseOver();
		}
	}

	mouseOff() {
		if(!this.lock) {
			super.mouseOff();
		}
	}

	show() {
		this.itemGroup.visible = true;
	}

	hide() {
		this.itemGroup.visible = false;	
	}

	setImage(imageId) {
		this.imageGroup.removeAll();
		this.image = game.add.image(this.rectangle.x, this.rectangle.y, imageId);
		var newDims = fitAndMaintainAspectRatio(this.image.width, this.image.height, this.rectangle.width, this.rectangle.height);
		this.image.scale.setTo(newDims.width / this.image.width, newDims.height / this.image.height);
		this.imageGroup.add(this.image);
	}

};

class CreatureButton extends Button {
	constructor(x, y, width, height, backgroundColor, hoverColor, clickColor, onMouseOver, onMouseOff, onClick, spriteId, spriteAnimFrames, nameText) {
		super(x, y, width, height, nameText, backgroundColor, hoverColor, clickColor, onMouseOver, onMouseOff, onClick);

		this.spriteGroup = game.add.group();
		this.group.add(this.spriteGroup);

		if(spriteId != undefined) {
			this.sprite = game.add.sprite(this.rectangle.x, this.rectangle.y, spriteId);
			var newDims = fitAndMaintainAspectRatio(this.sprite.width, this.sprite.height, this.rectangle.width, this.rectangle.height);
			this.sprite.scale.setTo(newDims.width / this.sprite.width, newDims.height / this.sprite.height);
			this.sprite.animations.add('move', spriteAnimFrames, 5, true);
			this.sprite.animations.play('move');
			this.spriteGroup.add(this.sprite);
		}

		this.label.x = this.rectangle.x + this.rectangle.width / 2 - this.label.width / 2;
		this.label.y = this.rectangle.y + this.rectangle.height - this.label.height;

		this.spriteGroup.add(this.label);

	}
}