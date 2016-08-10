class Meter {
	constructor(x, y, width, height, percentFilled, foregroundColor, backgroundColor) {
		this.group = game.add.group();
		this.graphics = this.group.add(new Phaser.Graphics(game, 0, 0));
		this.backgroundRectangle = new Phaser.Rectangle(x, y, width, height);
		this.rectangle = new Phaser.Rectangle(x, y, width * percentFilled, height);
		this.max = width;
		this.foregroundColor = foregroundColor;
		this.backgroundColor = backgroundColor;

		this.drawRectangle(this.backgroundRectangle, this.backgroundColor);
		this.drawRectangle(this.rectangle, this.foregroundColor);		
	}

	getGroup() { return this.group; }

	setPercentFilled(percent) { this.rectangle.width = this.max * percent; }

	redraw() {
		this.drawRectangle(this.backgroundRectangle, this.backgroundColor);
		this.drawRectangle(this.rectangle, this.foregroundColor);
	}

	drawRectangle(rectangle, color) {
		drawShape(this.graphics, rectangle, color);
	}
};