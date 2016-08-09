function fitAndMaintainAspectRatio(width, height, widthBound, heightBound) {
	var newWidth = width;
	var newHeight = height;

	if(newWidth > widthBound){
		var ratio = widthBound / newWidth;
		newWidth = widthBound;
		newHeight = height * ratio;
	}

	if(newHeight > heightBound){
		var ratio = heightBound / newHeight;
		newWidth = newWidth * ratio;
		newHeight = heightBound;
	}

	return {
		width : newWidth,
		height : newHeight,
	};
}

class Meter {
	constructor(x, y, width, height, percentFilled, foregroundcolor, backgroundcolor) {
		this.group = game.add.group();
		this.graphics = this.group.add(new Phaser.Graphics(game, 0, 0));
		this.backgroundrectangle = new Phaser.Rectangle(x, y, width, height);
		this.rectangle = new Phaser.Rectangle(x, y, width * percentFilled, height);
		this.max = width;
		this.foregroundcolor = foregroundcolor;
		this.backgroundcolor = backgroundcolor
	}

	getGroup() { return this.group; }

	setPercentFilled(percent) { this.rectangle.width = this.max * percent; }

	draw() {
		this.drawRectangle(this.backgroundrectangle, this.backgroundcolor);
		this.drawRectangle(this.rectangle, this.foregroundcolor);
	}

	drawRectangle(rectangle, color) {
		this.graphics.beginFill(color);
		this.graphics.drawShape(rectangle);
		this.graphics.endFill();
	}
}