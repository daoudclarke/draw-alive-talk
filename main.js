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

function create ()
{
    var sky = this.add.image(0, 0, 'sky').setScale(1.6).setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, sky.displayWidth, sky.displayHeight);

    // Audio
    
    // recorder = new MicRecorder({
    //   bitRate: 128
    // });

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
	
	// newFrame();
    });
    
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);

    let ourGame = this;


    let uploadName = null; 

    function addNextFile() {
	console.log("Adding file " + uploadName);
	let uploadedSprite = this.add.sprite(100, 100, uploadName);
	uploadedSprite.setScale(0.5);
	uploadedSprite.setInteractive();
	this.input.setDraggable(uploadedSprite);
    }

    ourGame.load.on('filecomplete', addNextFile, ourGame);
    
    document.querySelector('input[type="file"]').addEventListener('change', function() {
	if (this.files && this.files[0]) {
	    console.log("Got files", this.files)
            imgUrl = URL.createObjectURL(this.files[0]); // set src to blob url
	    uploadName = Math.random().toString(36).substring(2, 15);
	    console.log("Uploaded", uploadName);
	    ourGame.load.image(uploadName, imgUrl);
	    ourGame.load.start();
	}
    });

}

function update ()
{
}



var isRecording = false;
var recording = null;
var recorder;
async function record() {
    recordButtonClasses = document.getElementById("record-button").classList;
    if (!isRecording) {
	recordButtonClasses.remove('fa-circle');
	recordButtonClasses.add('fa-pause');
	
	console.log("Starting recording");
	isRecording = true;
	
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
	    stream.getTracks()[0].stop();
	    stream.getTracks()[1].stop();
	    console.log("Stopped");
	    const blob = new Blob(chunks, { 'type' : 'video/mpeg-4' });
	    chunks = [];
	    url = URL.createObjectURL(blob, { type: 'video/mp4' });
	    window.open(url);
	}
	
    } else {
	recordButtonClasses.remove('fa-pause');
	recordButtonClasses.add('fa-circle');
	isRecording = false;
	recorder.stop();
    }
}
