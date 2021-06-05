var game;
var gameOptions = {
    bounceHeight: 300,
    ballGravity: 500,
    ballPosition: 0.2,
    platformSpeed: 650,
    platformDistanceRange: [250, 450],
    platformHeightRange: [-50, 50],
    platformLengthRange: [40, 60],
    localStorageName: "bestballscore3"
}
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor:0x87ceeb,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 750,
            height: 500
        },
        physics: {
            default: "arcade"
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}
class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    preload(){
        this.load.image("ground", "ground.png");
        this.load.image("ball", "balon.png");
        this.load.image("field", 'field.jpg')
    }
    create(){
        this.add.image(370, 250, 'field').setScale(1.3);
        this.platformGroup = this.physics.add.group();
        this.ball = this.physics.add.sprite(game.config.width * gameOptions.ballPosition, game.config.height / 4 * 3 - gameOptions.bounceHeight, "ball");
        this.ball.body.gravity.y = gameOptions.ballGravity;
        this.ball.setBounce(1);
        this.ball.body.checkCollision.down = true;
        this.ball.body.checkCollision.up = false;
        this.ball.body.checkCollision.left = true;
        this.ball.body.checkCollision.right = false;
        this.ball.setSize(30, 50, true)
        let platformX = this.ball.x;
        for(let i = 0; i < 10; i++){
            let platform = this.platformGroup.create(platformX, game.config.height / 4 * 3 + Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]), "ground");
            platform.setOrigin(0.5, 1);
            platform.setImmovable(true);
            platform.displayWidth = Phaser.Math.Between(gameOptions.platformLengthRange[0], gameOptions.platformLengthRange[1]);
            platformX += Phaser.Math.Between(gameOptions.platformDistanceRange[0], gameOptions.platformDistanceRange[1]);
        }
        this.input.on("pointerdown", this.movePlatforms, this);
        this.input.on("pointerup", this.stopPlatforms, this);
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(10, 10, "");
        this.updateScore(this.score);
    }
    updateScore(inc){
        this.score += inc;
        this.scoreText.text = "Score: " + this.score + "\nBest: " + this.topScore;
    }
    movePlatforms(){
        this.platformGroup.setVelocityX(-gameOptions.platformSpeed);
    }
    stopPlatforms(){
        this.platformGroup.setVelocityX(0);
    }
    getRightmostPlatform(){
        let rightmostPlatform = 0;
        this.platformGroup.getChildren().forEach(function(platform){
            rightmostPlatform = Math.max(rightmostPlatform, platform.x);
        });
        return rightmostPlatform;
    }
    update(){
        this.physics.world.collide(this.platformGroup, this.ball);
        this.platformGroup.getChildren().forEach(function(platform){
            if(platform.getBounds().right < 0){
                this.updateScore(1);
                platform.x = this.getRightmostPlatform() + Phaser.Math.Between(gameOptions.platformDistanceRange[0], gameOptions.platformDistanceRange[1]);
                platform.displayWidth = Phaser.Math.Between(gameOptions.platformLengthRange[0], gameOptions.platformLengthRange[1]);
            }
        }, this);
        if(this.ball.y > game.config.height){
            localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));
            this.scene.start("PlayGame");
        }
    }
}
