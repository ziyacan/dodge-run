let gameScene = new Phaser.Scene("Game");

// some parameters for our scene
gameScene.init = function () {
  // player parameters
  this.playerSpeed = 3;
  this.jumpSpeed = -12;

  // enemy parameters
  this.enemyMinSpeed = 2;
  this.enemyMaxSpeed = 4.5;
  this.enemyMinY = 80;
  this.enemyMaxY = 280;

  // other parameters
  this.isTerminating = false;
};

gameScene.create = function () {
  // game title text
  let gameTitle = this.add.text(80, 80, "Jumping Ball Game", {
    font: "40px Arial",
    fill: "#ffffff",
  });

  // start button text
  let startButton = this.add.text(250, 250, "Start", {
    font: "25px Arial",
    fill: "#ffffff",
  });

  // set interactivity
  startButton.setInteractive();

  // listen for events
  startButton.on(
    "pointerdown",
    function () {
      // start game
      this.scene.start("PlayGame");
    },
    this
  );
};

// load asset files for our game
gameScene.preload = function () {
  // load images
  this.load.image("background", "./assets/background.png");
  this.load.image("player", "./assets/player.png");
  this.load.image("dragon", "./assets/dragon.png");
  this.load.image("treasure", "./assets/treasure.png");
};

// executed once, after assets were loaded
gameScene.create = function () {
  // create bg sprite
  let bg = this.add.sprite(0, 0, "background");

  // change origin to the top-left of the sprite
  bg.setOrigin(0, 0);

  // create the player
  this.player = this.add.sprite(40, this.sys.game.config.height / 2, "player");

  // we are reducing the width and height by 50%
  this.player.setScale(0.5);

  // goal
  this.treasure = this.add.sprite(
    this.sys.game.config.width - 80,
    this.sys.game.config.height / 2,
    "treasure"
  );
  this.treasure.setScale(0.6);

  // group of enemies
  this.enemies = this.add.group({
    key: "dragon",
    repeat: 5,
    setXY: {
      x: 110,
      y: 100,
      stepX: 120,
      stepY: 20,
    },
  });

  // scale enemies
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.5, -0.5);

  // set speeds
  Phaser.Actions.Call(
    this.enemies.getChildren(),
    function (enemy) {
      enemy.speed = Math.random() * 2 + 1;
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
    )
  ) {
    this.gameOver();
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
  // flag to set player is dead
  this.isPlayerAlive = false;

  // shake the camera
  this.cameras.main.shake(500);

  // fade camera
  this.time.delayedCall(
    250,
    function () {
      this.cameras.main.fade(250);
    },
    [],
    this
  );

  // restart game
  this.time.delayedCall(
    500,
    function () {
      this.scene.restart();
    },
    [],
    this
  );
};

// start the Phaser game
let config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 500,
  scene: gameScene,
};

let game = new Phaser.Game(config);

// set background color
game.backgroundColor = "#3498db";

// set the physics system
game.physics.startSystem(Phaser.Physics.ARCADE);

// display game title
let gameTitle = game.add.text(80, 80, "Jumping Ball Game", {
  font: "50px Arial",
  fill: "#ffffff",
});
let startButton = game.add.button(
  game.world.centerX - 95,
  200,
  "button",
  actionOnClick,
  this,
  2,
  1,
  0
);

// when the player clicks on the button, we start the 'play' state
function actionOnClick() {
  game.state.start("play");
}
