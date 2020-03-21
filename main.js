var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('crocodile-open', 'img/crocodile-open.png');
    this.load.image('crocodile-closed', 'img/crocodile-open.png');
    this.load.image('supergranny-open', 'img/supergranny-open.png');
    this.load.image('supergranny-closed', 'img/supergranny-open.png');
    // this.load.setBaseURL('');

    this.load.image('sky', 'img/background.png');
    // this.load.image('red', 'http://labs.phaser.io/assets/particles/red.png');
}

var cursors;
var logo;

function create ()
{
    var sky = this.add.image(0, 0, 'sky').setScale(1.6).setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight);

    // logo = this.physics.add.image(400, 100, 'crocodile-open').setScale(0.5);

    let crocodile = this.add.sprite(100, 100, 'crocodile-open');
    let supergranny = this.add.sprite(100, 100, 'supergranny-closed');

    let sprites = [crocodile, supergranny];
    for (let i=0; i<sprites.length; ++i) {
        let s = sprites[i];
        s.setScale(0.5);
        s.setInteractive();
        this.input.setDraggable(s);
    }
    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

        gameObject.x = dragX;
        gameObject.y = dragY;

    });
    // this.physics.setGravity(1.0);

    // logo.setVelocity(0, 200);
    // logo.setBounce(0.0, 0.0);
    // logo.setCollideWorldBounds(true);

    // cursors = this.input.keyboard.createCursorKeys();

    // var keyObj = this.input.keyboard.addKey('RIGHT');  // Get key object
    // keyObj.on('down', function(event) { logo.setVelocity(100, 0); });
    // keyObj.on('up', function(event) { logo.setVelocity(-100, 0); });

    // this.cameras.main.startFollow(logo);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight)
}

function update ()
{
    // // logo.setVelocity(0);
    //
    // if (cursors.left.isDown)
    // {
    //     logo.setVelocityX(-300);
    // }
    // else if (cursors.right.isDown)
    // {
    //     logo.setVelocityX(300);
    // }
    //
    // if (cursors.up.isDown && logo.body.onFloor())
    // {
    //     logo.setVelocityY(-300);
    // }
    // // else if (cursors.down.isDown)
    // // {
    // //     logo.setVelocityY(300);
    // // }
}