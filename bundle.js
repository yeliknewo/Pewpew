(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
window.onload = function(){
	var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload:preload, create:create, update:update, render:render});
	console.log("Remember to use Phaser.min.js instead of Phaser.js on release");
	
	var bmt = require('./bitmaptools.js');
	
	var player, enemies, stars, spawnEnemyTimer, bmds, keys, playerCollisionGroup, enemyCollisionGroup, restartText;

	function preload(){	
		bmt.setGame(game);
	
		game.stage.backgroundColor = '#111111';
		
		bmds = {
			redTriangle: bmt.drawIsoTriangle(0, 0, 40, 30, '#ffffff', '#ff0000', 0, true),
			blueTriangle: bmt.drawIsoTriangle(0, 0, 40, 30, '#ffffff', '#0000ff', 0, true),
			star: bmt.drawRect(0, 0, 4, 4, 'clear', '#F5F5DC', 0, true)
		};
	}

	function create(){
		game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.setImpactEvents(true);
		
		playerCollisionGroup = game.physics.p2.createCollisionGroup();
		enemyCollisionGroup = game.physics.p2.createCollisionGroup();
		
		keys = {space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)};
		
		player = game.add.sprite(game.width / 2, game.height, bmds.redTriangle);
		player.isDying = false;
		
		game.physics.p2.enableBody(player);
		player.body.clearShapes();
		player.body.addPolygon({}, bmds.redTriangle.polygons[0].toNumberArray());
		player.body.fixedRotation = true;
		player.body.setCollisionGroup(playerCollisionGroup);
		player.body.collides([enemyCollisionGroup], playerDeath);
		
		enemies = game.add.group(game.world, 'enemies', false, true, Phaser.Physics.P2JS);
		
		stars = game.add.group(game.world, 'stars', false, true, Phaser.Physics.P2JS);
		var starCount = 10;
		var starMod = game.height / starCount;
		for(var i = 0;i<starCount;i++){
			var star = game.make.sprite(game.rnd.between(0, game.width), starMod * i + game.rnd.between(0, starMod), bmds.star);
			stars.add(star);
			star.body.velocity.y = game.rnd.between(1, 100);
			star.body.collideWorldBounds = false;
			star.events.onKilled.add(spawnStar);
		}
		
		restartText = {style: {font: '65px Arial', fill:'#FFFFFF', align:'center'}};
		restartText = game.make.text(0, game.height / 4, "Error", restartText.style);
		
		restartText.z = 0;
		player.z = 1;
		enemies.z = 2;
		stars.z = 3;
		
		game.world.sort('z', Phaser.Group.SORT_DESCENDING);
		
		startGame();
	}

	function update(){
		if(player.alive){
			playerToMouse();
		}
		enemies.forEachAlive(function(enemy){
			if(enemy.y > game.height + enemy.height / 2){
				enemy.kill();
			}
		});
		stars.forEachAlive(function(star){
			if(star.y > game.height + star.height / 2){
				star.kill();
			}
		});
	}
	
	function spawnStar(){
		var star = stars.getFirstDead();
		if(!star){
			stars.add(makeStar);
			star = stars.getFirstDead();
		}
		star.revive();
		star.body.reset(game.rnd.between(0, game.width), -star.height);
		star.body.velocity.y = game.rnd.between(1, 100);
	}
	
	function render(){

	}
	
	function startGame(){
		player.revive();
		spawnEnemyTimer = game.time.events.loop(3000, spawnEnemy);
		player.body.collideWorldBounds = false;
		player.scale = new Phaser.Point(1,1);
		player.angle = -90;
		spawnEnemy();
		keys.space.onDown.removeAll();
		player.score = 0;
		game.world.remove(restartText);
	}
	
	function playerDeath(enemyBody, myShape, theirShape, dataArray){
		if(!player.alive){
			return;
		}
		player.alive = false;
		player.body.collideWorldBounds = true;
		game.time.events.remove(spawnEnemyTimer);
		tweenToBackExit(player);
		enemies.forEachAlive(tweenToBackExit);
		player.isDying = true;
	}
	
	function tweenToBackExit(ship){
		var t = game.add.tween(ship).to({angle:-ship.angle}, 1500);
		t.onComplete.add(endGame);
		t.start();
		game.add.tween(ship.scale).to({x:0,y:0}, 1500).start();
	}
	
	function endGame(){
		player.kill();
		enemies.forEachAlive(function(enemy){
			enemy.events.onKilled.removeAll();
			enemy.kill();
		});
		keys.space.onDown.add(startGame);
		restartText.setText("The game is over.\n You have scored " + player.score + " points!\n Press space to restart");
		game.world.add(restartText);
		player.isDying = false;
	}
	
	function spawnEnemy(){
		player.score++;
		if(player.isDying){
			return;
		}
		var enemy = enemies.getFirstDead();
		if(!enemy){
			enemies.add(makeEnemy());
			enemy = enemies.getFirstDead();
		}
		enemy.scale = new Phaser.Point(1,1);
		enemy.events.onKilled.add(spawnEnemy);
		enemy.angle = 90;
		enemy.body.reset(game.rnd.between(enemy.width / 2, game.width - enemy.width / 2), -enemy.height / 2);
		enemy.body.velocity.y = game.rnd.between(50, 250);
		enemy.revive();
	}

	function makeEnemy(){
		var enemy = game.make.sprite(0,0, bmds.blueTriangle);
		enemy.kill();
		game.physics.p2.enableBody(enemy);
		enemy.body.damping = 0;
		enemy.body.clearShapes();
		enemy.body.addPolygon({}, bmds.blueTriangle.polygons[0].toNumberArray());
		enemy.body.fixedRotation = true;
		enemy.body.collideWorldBounds = false;
		enemy.body.setCollisionGroup(enemyCollisionGroup);
		enemy.body.collides([playerCollisionGroup]);
		return enemy;
	}
	
	function playerToMouse(){
		player.body.reset(
		game.math.min(game.width - player.width / 2, game.math.max(player.width / 2, game.input.activePointer.position.x)), 
		game.math.min(game.height - player.height / 2, game.math.max(player.height / 2, game.input.activePointer.position.y))
		);
	}
}
},{"./bitmaptools.js":1}]},{},[2]);
