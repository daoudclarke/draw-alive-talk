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
    
    // this.physics.setGravity(1.0);

    // logo.setVelocity(0, 200);
    // logo.setBounce(0.0, 0.0);
    // logo.setCollideWorldBounds(true);

    // cursors = this.input.keyboard.createCursorKeys();

    // var keyObj = this.input.keyboard.addKey('RIGHT');  // Get key object
    // keyObj.on('down', function(event) { logo.setVelocity(100, 0); });
    // keyObj.on('up', function(event) { logo.setVelocity(-100, 0); });

    // this.cameras.main.startFollow(logo);
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);

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


// function newFrame() {
//     var dt = game.canvas.toDataURL('image/png');
//     frames.push(dt);
//     timestamps.push(new Date());
//     console.log("Stored frames " + frames.length);
// }

// async function convert() {
//     // Worker
//     const { createWorker } = FFmpeg;
//     const worker = createWorker({
//         corePath: '/node_modules/@ffmpeg/core/ffmpeg-core.js',
//         progress: (p) => console.log(p),
//       });
//     await worker.load();
//     console.log("Loaded worker");
    
//     await worker.write("audio.mp3", recording);

//     text = "";
//     console.log("Timestamps", timestamps);
//     for (var i=0; i<frames.length; ++i) {
// 	const num = `00${i}`.slice(-3);
// 	await worker.write(`tmp.${num}.png`, frames[i]);
	
// 	duration = (timestamps[i + 1] - timestamps[i])/1000;
// 	text += `file tmp.${num}.png\n`;
// 	text += 'duration ' + duration + '\n';

//     	console.log("Wrote " + num + " " + duration);
//     }

//     console.log("Text file\n" + text);

//     await worker.writeText("durations.txt", text);
    
//     console.log("Start transcoding");
//     await worker.run('-framerate 30 -f concat -i durations.txt -i audio.mp3 out.mp4', { output: 'out.mp4' });
//     console.log("Finished transcoding");
//     const { data } = await worker.read('out.mp4');
//     // await worker.remove('audio.ogg');
//     // for (let i = 0; i < 60; i += 1) {
//     //     const num = `00${i}`.slice(-3);
//     //     await worker.remove(`tmp.${num}.png`);
//     // }

//     const video = document.getElementById('output-video');
//     video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
// }


var isRecording = false;
var recording = null;
var recorder;
async function record() {
    if (!isRecording) {
	console.log("Starting recording");
	isRecording = true;
	
	let audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
	let canvasStream = game.canvas.captureStream(30);
	let stream = new MediaStream([audioStream.getTracks()[0], canvasStream.getTracks()[0]]);

	// const video = document.getElementById('output-video');
	// video.srcObject = stream;

	recorder = new MediaRecorder(stream);

	chunks = [];
	recorder.ondataavailable = function(e) {
	    chunks.push(e.data);
	    console.log("Pushing chunk " + chunks.length);
	}

	recorder.start();

	recorder.onstop = function(e) {
	    console.log("Stopped");
	    const blob = new Blob(chunks, { 'type' : 'video/mpeg-4' });
	    chunks = [];
	    const video = document.getElementById('output-video');
	    video.src = URL.createObjectURL(blob, { type: 'video/mp4' });
	}
	
    } else {
	isRecording = false;
	recorder.stop();
	// timestamps.push(new Date());
	// recorder.stop().getMp3().then(([buffer, blob]) => {
        //     console.log("Got Mp3", buffer, blob);
	//     recording = blob;
	//     convert();
	//     // worker.write("audio.mp3", blob).then(() => {
	//     // 	console.log("Write audio mp3");
	//     // 	convert();
	//     // });
	// });

    }
}

// function progress(p) {
//     console.log(p);
//     if (p.ratio == 1) {
// 	load();
//     }
// }

// function load() {
//     const { data } = worker.read('out.mp4');
//     const video = document.getElementById('output-video');
//     video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
// }
