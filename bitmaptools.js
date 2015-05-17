module.exports = {
	setGame:function(game){
		this.game = game;
	},
	
	drawPolygonOn:function(bmd, polygon, strokeHex, fillHex, rads, addPolygon){
		if(typeof addPolygon == 'undefined'){
			addPolygon = false;
		}
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
		if(fillHex != 'clear'){
			bmd.ctx.fill();
		}
		if(strokeHex != 'clear'){
			bmd.ctx.stroke();
		}
		bmd.ctx.closePath();
		if(addPolygon){
			bmd.polygons.push(polygon);
		}
		return bmd;
	},
	
	drawIsoTriangle:function(x, y, width, height, strokeHex, fillHex, rads, addPolygon){
		var polygon = this.makeIsoTrianglePolygon(x, y, width, height);
		polygon = this.rotatePolygon(polygon, rads);
		return this.drawPolygonOn(this.makeBmd(polygon), polygon, strokeHex, fillHex, 0, addPolygon);
	},
	
	drawRect:function(x, y, width, height, strokeHex, fillHex, rads, addPolygon){
		var polygon = this.makeRect(x,y,width,height);
		polygon = this.rotatePolygon(polygon, rads);
		return this.drawPolygonOn(this.makeBmd(polygon), polygon, strokeHex, fillHex, 0, addPolygon);
	},
	
	drawIsoTriangleOn:function(bmd, x, y, width, height, strokeHex, fillHex, rads, addPolygon){
		var polygon = this.makeIsoTrianglePolygon(x, y, width, height);
		polygon = this.rotatePolygon(polygon, rads);
		return this.drawPolygonOn(bmd, polygon, strokeHex, fillHex, 0, addPolygon);
	},
	
	drawRectOn:function(bmd, x, y, width, height, strokeHex, fillHex, rads, addPolygon){
		var polygon = this.makeRect(x,y,width,height);
		polygon = this.rotatePolygon(polygon, rads);
		return this.drawPolygonOn(bmd, polygon, strokeHex, fillHex, 0, addPolygon);
	},
		
	makeIsoTrianglePolygon:function(x, y, width, height){
		return new Phaser.Polygon([x,y,width + x, height / 2 + y, x, height + y]);
	},
	
	makeRect:function(x,y,width,height){
		return new Phaser.Polygon([x,y,x,height,width,height,width,y]);
	},
	
	makeBmd:function(polygon){
		var rect = this.getPolygonRect(polygon);
		var bmd = this.game.make.bitmapData(rect.width, rect.height);
		bmd.polygons = [];
		return bmd;
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
		
		return new Phaser.Rectangle(x0, y0, x1-x0, y1-y0);[x0, y0, x1-x0, y1-y0];
	},
	
	rotatePolygon:function(polygon, rads){
		if(rads == 0){
			return polygon;
		}
		var points = polygon.toNumberArray();
		var rect = this.getPolygonRect(polygon);
		var x0 = points[0], y0 = points[1];
		
		for(var i = 0;i<points.length;i+=2){
			var theta = this.game.math.angleBetween(rect.centerX, rect.centerY, points[i], points[i+1]);
			var distance = this.game.math.distance(points[i], points[i+1], rect.centerX, rect.centerY);
			theta += rads;
			points[i] = this.game.math.roundTo(Math.cos(theta) * distance, -2) + rect.centerX;
			points[i+1] = this.game.math.roundTo(Math.sin(theta) * distance, -2) + rect.centerY;
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