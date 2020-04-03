var config = {
    type: Phaser.CANVAS,
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
    },
    scale: {
	mode: Phaser.Scale.FIT,
	autoCenter: Phaser.Scale.CENTER_BOTH,
	// width: DEFAULT_WIDTH,
	// height: DEFAULT_HEIGHT
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

// var recorder;

// var frames = [];
// var timestamps = [];

var spriteDepth = 1000;


var points;
var graphics;

function create ()
{
    var sky = this.add.image(0, 0, 'sky').setScale(1.6).setOrigin(0, 0);
    sky.setDepth(1);
    // this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight);

    // Audio
    
    // recorder = new MicRecorder({
    //   bitRate: 128
    // });

    let crocodile = this.add.sprite(100, 100, 'crocodile-open');
    let supergranny = this.add.sprite(100, 100, 'supergranny-closed');

    let sprites = [crocodile, supergranny];
    for (let i=0; i<sprites.length; ++i) {
	spriteDepth += 1;
        let s = sprites[i];
        s.setScale(0.5);
        s.setInteractive();
        this.input.setDraggable(s);
	s.setDepth(spriteDepth);
    }

    // this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
    //     gameObject.x = dragX;
    //     gameObject.y = dragY;
	
    // 	// newFrame();
    // });
    
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);

    let ourGame = this;


    let uploadName = null; 

    function addNextFile() {
	console.log("Adding file " + uploadName);
	if (uploadName.startsWith('sprite')) {
	    let uploadedSprite = ourGame.add.sprite(100, 100, uploadName);
	    uploadedSprite.setScale(0.5);
	    uploadedSprite.setInteractive();
	    spriteDepth += 1;
	    uploadedSprite.setDepth(spriteDepth);
	    // ourGame.input.setDraggable(uploadedSprite);
	} else if (uploadName.startsWith('background')) {
	    var background = ourGame.add.image(0, 0, uploadName).setScale(1.6).setOrigin(0, 0);
	    background.setDepth(1);
	} else {
	    console.log("Unknown name type:", uploadName);
	}
    }

    function uploadImage(prefix, input) {
	console.log("Upload image", input);
	if (input.files && input.files[0]) {
	    console.log("Got files", input.files)
            imgUrl = URL.createObjectURL(input.files[0]); // set src to blob url
	    uploadName = prefix + Math.random().toString(36).substring(2, 15);
	    console.log("Uploaded", uploadName);
	    ourGame.load.image(uploadName, imgUrl);
	    ourGame.load.start();
	}
    }

    
    ourGame.load.on('filecomplete', addNextFile, ourGame);
    
    document.querySelector('#new-sprite-input').addEventListener('change', function() {
	uploadImage('sprite-', this);
    });


    document.querySelector('#background-input').addEventListener('change', function() {
	uploadImage('background-', this);
    });

    // Graphics
    let pointerDown = false;
    points = [[100, 200], [300, 400]];
    
    graphics = this.add.graphics();

    // graphics.strokeCircle(600, 400, 64);

    this.input.on('pointermove', function (pointer) {
	if (pointerDown) {
	    // console.log(pointer.x, pointer.y);
	    points.push({x: pointer.x, y: pointer.y});
	}
    });

    this.input.on('pointerdown', function (pointer) {
        console.log('down');

	pointerDown = true;
	points.push({x: pointer.x, y: pointer.y});
    }, this);

    this.input.on('pointerup', function (pointer) {
        console.log('up', points);

	pointerDown = false;
    }, this);
}

function update ()
{
    graphics.clear();
    graphics.setDepth(100000);
    graphics.lineStyle(20, 0x2ECC40);
    graphics.fillStyle(0x2ECC40);
    
    // graphics.strokeRect(50, 50, 100, 40);


    // graphics.setDepth(100000);
    // graphics.lineStyle(20, 0x2ECC40);

    var oldPoint = null;
    var newPoint;
    for (var i=0; i<points.length; ++i) {
	newPoint = {x: points[i].x + randomInt(), y: points[i].y + randomInt()}
	if (oldPoint !== null) {
	    graphics.lineBetween(oldPoint.x, oldPoint.y, newPoint.x, newPoint.y);
	    graphics.fillCircle(oldPoint.x, oldPoint.y, 10);
	}
	
	oldPoint = newPoint;
    }

    graphics.fillCircle(newPoint.x, newPoint.y, 10);
    
    // graphics.strokePoints(newPoints);
}


function randomInt() {
    return (Math.random() - 0.5) * 2; 
}



var recording = null;
var recorder = null;
async function record() {
    recordButtonClasses = document.getElementById("record-button").classList;
    if (recorder === null) {
	recordButtonClasses.remove('fa-circle');
	recordButtonClasses.add('fa-pause');
	
	console.log("Starting recording");
	
	let audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
	let canvasStream = game.canvas.captureStream(30);
	let stream = new MediaStream([audioStream.getTracks()[0], canvasStream.getTracks()[0]]);

	recorder = new MediaRecorder(stream);

	chunks = [];
	recorder.ondataavailable = function(e) {
	    chunks.push(e.data);
	    console.log("Pushing chunk " + chunks.length);
	}

	recorder.start();

	recorder.onstop = function(e) {
	    console.log("Stopping");
	    recorder = null;
	    stream.getTracks()[0].stop();
	    stream.getTracks()[1].stop();
	    const blob = new Blob(chunks, { 'type' : 'video/mpeg-4' });
	    chunks = [];
	    saveAs(blob, "draw-alive-recording.mp4");
	}
	
    } else if (recorder.state === 'recording') {
	console.log("Pausing");
	recorder.pause();
	recordButtonClasses.remove('fa-pause');
	recordButtonClasses.add('fa-circle');
    } else if (recorder.state === 'paused') {
	console.log("Resuming");
	recorder.resume();
	recordButtonClasses.remove('fa-circle');
	recordButtonClasses.add('fa-pause');
    }
}

function uploadSprite() {
    document.querySelector('#new-sprite-input').click();
}

function uploadBackground() {
    document.querySelector('#background-input').click();
}

function stop() {
    recorder.stop();
}
