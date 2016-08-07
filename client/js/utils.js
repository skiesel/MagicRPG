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