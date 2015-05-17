module.exports = {
	setGame:function(game){
		this.game = game;
	},
	
	drawPolygonOn:function(bmd, polygon, strokeHex, fillHex, rads){
		polygon = this.rotatePolygon(polygon, rads);
		var points = polygon.toNumberArray();
		bmd.ctx.fillStyle = fillHex;
		bmd.ctx.strokeStyle = strokeHex;
		bmd.ctx.beginPath();
		bmd.ctx.moveTo(points[0], points[1]);
		for(var i = 2;i<points.length;i+=2){
			bmd.ctx.lineTo(points[i], points[i+1]);
		}
		bmd.ctx.lineTo(points[0], points[1]);
		bmd.ctx.fill();
		bmd.ctx.stroke();
		bmd.ctx.closePath();
		bmd.polygon = polygon;
		return bmd;
	},
	
	drawIsoTriangle:function(x, y, width, height, strokeHex, fillHex, rads){
		var polygon = this.makeIsoTrianglePolygon(x, y, width, height);
		polygon = this.rotatePolygon(polygon, rads);
		var rect = this.getPolygonRect(polygon);
		return this.drawPolygonOn(this.game.add.bitmapData(rect[0] + rect[2], rect[1] + rect[3]), polygon, strokeHex, fillHex, 0);
	},
	
	drawIsoTriangleOn:function(bmd, x, y, width, height, strokeHex, fillHex, rads){
		var polygon = this.makeIsoTrianglePolygon(x, y, width, height);
		polygon = this.rotatePolygon(polygon, rads);
		return this.drawPolygonOn(bmd, polygon, strokeHex, fillHex, 0);
	},
	
	makeIsoTrianglePolygon:function(x, y, width, height){
		return new Phaser.Polygon([x,y,width + x, height / 2 + y, x, height + y]);
	},
	
	getPolygonRect:function(polygon){
		var points = polygon.toNumberArray();
		
		var x0 = x1 = points[0];
		for(var x = 0;x<points.length;x+=2){
			x0 = this.game.math.min(x0, points[x]);
			x1 = this.game.math.max(x1, points[x]);
		}	
		
		var y0 = y1 = points[1];
		for(var y = 1;y<points.length;y+=2){
			y0 = this.game.math.min(y0, points[y]);
			y1 = this.game.math.max(y1, points[y]);
		}
		
		return [x0, y0, x1-x0, y1-y0];
	},
	
	rotatePolygon:function(polygon, rads){
		if(rads == 0){
			return polygon;
		}
		var points = polygon.toNumberArray();
		var rect = this.getPolygonRect(polygon);
		var center = [rect[2] / 2 + rect[0], rect[3] / 2 + rect[1]];
		var x0 = points[0], y0 = points[1];
		
		for(var i = 0;i<points.length;i+=2){
			var theta = this.game.math.angleBetween(center[0], center[1], points[i], points[i+1]);
			var distance = this.game.math.distance(points[i], points[i+1], center[0], center[1]);
			theta += rads;
			points[i] = this.game.math.roundTo(Math.cos(theta) * distance, -2) + center[0];
			points[i+1] = this.game.math.roundTo(Math.sin(theta) * distance, -2) + center[1];
			x0 = this.game.math.min(x0, points[i]);
			y0 = this.game.math.min(y0, points[i+1]);
		}
		
		for(i = 0;i<points.length;i+=2){
			points[i] -= x0;
			points[i+1] -= y0;
		}
		
		return new Phaser.Polygon(points);
	}
}