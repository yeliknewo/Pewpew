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