let gameScene = new Phaser.Scene("Game");

gameScene.init = function () {
  // player parameters
  this.playerSpeed = 3;
  this.jumpSpeed = 100;

  // enemy parameters
  this.enemyMinSpeed = 100;
  this.enemyMaxSpeed = 100;
  this.enemyMinY = 200;
  this.enemyMaxY = 400;

  // other parameters
  this.isTerminating = false;
};

gameScene.preload = function () {
  // load images
  this.load.image("background", "./assets/background.png");
  this.load.image("player", "./assets/player.png");
  this.load.image("dragon", "./assets/dragon.png");
  this.load.image("treasure", "./assets/treasure.png");
};

// executed once, after assets were loaded
gameScene.create = function () {
  let bg = this.add.sprite(0, 0, "background");

  // change origin to the top-left of the sprite
  bg.setOrigin(0, 0);

  // create the player
  this.player = this.add.sprite(
    40,
    this.sys.game.config.height / 1.2,
    "player"
  );

  // we are reducing the width and height by 50%
  this.player.setScale(0.5);

  // goal
  this.treasure = this.add.sprite(
    this.sys.game.config.width - 10,
    this.sys.game.config.height / 1.5,
    "treasure"
  );
  this.treasure.setScale(0.6);

  // group of enemies
  this.enemies = this.add.group({
    key: "dragon",
    repeat: 5,
    setXY: {
      x: 220,
      y: 300,
      stepX: 120,
      stepY: 30,
    },
  });

  // scale enemies
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.5, -0.5);

  // set speeds
  Phaser.Actions.Call(
    this.enemies.getChildren(),
    function (enemy) {
      enemy.speed = Math.random() * 4 + 1;
    },
    this
  );

  // player is alive
  this.isPlayerAlive = true;

  // reset camera effects
  this.cameras.main.resetFX();
};

// executed on every frame (60 times per second)
gameScene.update = function () {
  // only if the player is alive
  if (!this.isPlayerAlive) {
    return;
  }

  // check for active input
  if (this.input.activePointer.isDown) {
    // player walks
    this.player.x += this.playerSpeed;
  }

  // treasure collision
  if (
    Phaser.Geom.Intersects.RectangleToRectangle(
      this.player.getBounds(),
      this.treasure.getBounds()
    ) &&
    this.add.text(400, 250, "YOU WIN", {
      fontSize: "48px",
      fill: "#000",
    }) &&
    this.add.text(180, 300, "The Game in 3 seconds", {
      fontSize: "48px",
      fill: "#000",
    }) &&
    this.time.delayedCall(
      3000,
      function () {
        this.scene.restart();
      },
      [],
      this
    )
  ) {
    this.confetti = this.add.particles("confetti").createEmitter({
      x: 550,
      y: 250,
      speed: 200,
      scale: { start: 0.7, end: 0 },
      blendMode: "ADD",
    });
  }

  // get enemies
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++) {
    // move enemies
    enemies[i].y += enemies[i].speed;

    // reverse movement if reached the edges
    let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY;
    let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY;

    if (conditionUp || conditionDown) {
      enemies[i].speed *= -1;
    }

    // enemy collision
    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.player.getBounds(),
        enemies[i].getBounds()
      )
    ) {
      this.gameOver();
      break;
    }
  }
};

// end the game
gameScene.gameOver = function () {
  this.isPlayerAlive = false;

  this.add.text(400, 250, "GAME OVER", {
    fontSize: "48px",
    fill: "#000",
  });

  this.add.text(180, 300, "Restarting in 3 seconds", {
    fontSize: "48px",
    fill: "#000",
  });

  this.time.delayedCall(
    3000,
    function () {
      this.scene.restart();
    },
    [],
    this
  );

  this.cameras.main.shake(500);
};

// start the Phaser game
let config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 500,
  scene: gameScene,
};

let game = new Phaser.Game(config);

game.backgroundColor = "#3498db";

game.physics.startSystem(Phaser.Physics.ARCADE);
