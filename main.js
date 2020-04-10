class BrushStroke extends Phaser.GameObjects.Graphics {

    constructor (scene)
    {
        super(scene);

	this.settings = {color: 0xffffff, width: 20, fillColor: 0xffffff, fillAlpha: 0.5};
	this.strokes = [];
	this.stroke = null;
	this.rect = null;
    }

    addPoint(x, y)
    {
	this.stroke.points.push(new Phaser.Geom.Point(x, y));
	if (this.rect === null) {
	    this.rect = new Phaser.Geom.Rectangle(x - this.stroke.width/2, y - this.stroke.width/2, this.stroke.width, this.stroke.width);
	} else {
	    this.rect.left = Math.min(this.rect.left, x - this.stroke.width/2);
	    this.rect.right = Math.max(this.rect.right, x + this.stroke.width/2);
	    this.rect.top = Math.min(this.rect.top, y - this.stroke.width/2);
	    this.rect.bottom = Math.max(this.rect.bottom, y + this.stroke.width/2);
	}
    }

    getRect()
    {
	if (this.rect === null) {
	    return new Phaser.Geom.Rectangle(0, 0, 0, 0);
	}
	return this.rect;
    }
    
    setColor(color)
    {
	console.log('set color', color);
	this.settings.color = color;
    }

    setFillColor(color) {
	this.stroke.fillColor = color;
    }

    setFillAlpha(alpha) {
	this.stroke.fillAlpha = alpha;
    }
    
    startNewStroke()
    {
	this.stroke = {points: []}
	Object.assign(this.stroke, this.settings);
	this.strokes.push(this.stroke);
    }
    
    update()
    {
	this.clear();
	this.setDepth(100000);
	for (var j=0; j<this.strokes.length; ++j) {
	    var stroke = this.strokes[j];
	    
	    var oldPoint = null;
	    var newPoint;

	    if (stroke.points.length > 2) {
		this.fillStyle(stroke.fillColor, stroke.fillAlpha);
		this.fillPoints(stroke.points, true, true);
	    }

	    this.lineStyle(stroke.width, stroke.color);
	    this.fillStyle(stroke.color, 1.0);

	    for (var i=0; i<stroke.points.length; ++i) {
		newPoint = {x: stroke.points[i].x + randomInt(), y: stroke.points[i].y + randomInt()}
		if (oldPoint !== null) {
		    this.lineBetween(oldPoint.x, oldPoint.y, newPoint.x, newPoint.y);
		    this.fillCircle(oldPoint.x, oldPoint.y, 10);
		}
		// console.log("New point", newPoint);
		oldPoint = newPoint;
	    }

	    if (newPoint != null) {
		this.fillCircle(newPoint.x, newPoint.y, 10);
	    }
	}
    }
}

class BrushStrokePlugin extends Phaser.Plugins.BasePlugin {

    constructor (pluginManager)
    {
        super(pluginManager);

        //  Register our new Game Object type
        pluginManager.registerGameObject('brushstroke', this.createBrushStroke);
    }

    createBrushStroke(color)
    {
        return this.displayList.add(new BrushStroke(this.scene));
    }

}

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
    },
    plugins: {
        global: [
            { key: 'BrushStrokePlugin', plugin: BrushStrokePlugin, start: true }
        ]
    },
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
var color = '#2ECC40';
var isDrawing = false;
var ourGame;

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

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
	
    	// newFrame();
    });
    
    this.cameras.main.setBounds(0, 0, sky.displayWidth, sky.displayHeight);

    ourGame = this;


    let uploadName = null; 

    function addNextFile() {
	console.log("Adding file " + uploadName);
	if (uploadName.startsWith('sprite')) {
	    let uploadedSprite = ourGame.add.sprite(100, 100, uploadName);
	    uploadedSprite.setScale(0.5);
	    uploadedSprite.setInteractive();
	    spriteDepth += 1;
	    uploadedSprite.setDepth(spriteDepth);
	    ourGame.input.setDraggable(uploadedSprite);
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

    colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('change', function() {
	color = colorPicker.value;
    });


    // Graphics
    let pointerDown = false;
    points = [[100, 200], [300, 400]];

    var group = this.add.group({runChildUpdate: true});
    // group.setInteractive();
    // this.input.setDraggable(group);
    
    // graphics.strokeCircle(600, 400, 64);

    this.input.on('pointermove', function (pointer) {
    	if (pointerDown && isDrawing) {
    	    // console.log(pointer.x, pointer.y);
    	    graphics.addPoint(pointer.x, pointer.y);
    	    // points.push({x: pointer.x, y: pointer.y});
    	}
    });

    this.input.on('pointerdown', function (pointer) {
	if (isDrawing) {
            console.log('down');
    	    console.log('color', color);
    	    graphics.setColor(Phaser.Display.Color.ValueToColor(color).color);
    	    graphics.startNewStroke();
    	    group.add(graphics);
    	    graphics.addPoint(pointer.x, pointer.y);
	}

    	pointerDown = true;
    	// points.push({x: pointer.x, y: pointer.y});
    }, this);

    this.input.on('pointerup', function (pointer) {
        // console.log('up', points);

    	pointerDown = false;
    }, this);
}

function update ()
{
    // graphics.update();
    // graphics.clear();
    // graphics.setDepth(100000);
    // graphics.lineStyle(20, 0x2ECC40);
    // graphics.fillStyle(0x2ECC40);
    
    // // graphics.strokeRect(50, 50, 100, 40);


    // // graphics.setDepth(100000);
    // // graphics.lineStyle(20, 0x2ECC40);

    // var oldPoint = null;
    // var newPoint;
    // for (var i=0; i<points.length; ++i) {
    // 	newPoint = {x: points[i].x + randomInt(), y: points[i].y + randomInt()}
    // 	if (oldPoint !== null) {
    // 	    graphics.lineBetween(oldPoint.x, oldPoint.y, newPoint.x, newPoint.y);
    // 	    graphics.fillCircle(oldPoint.x, oldPoint.y, 10);
    // 	}
	
    // 	oldPoint = newPoint;
    // }

    // graphics.fillCircle(newPoint.x, newPoint.y, 10);
    
    // // graphics.strokePoints(newPoints);
}


function randomInt() {
    return (Math.random() - 0.5) * 2; 
}



var recording = null;
var recorder = null;
async function record() {
    recordButtonClasses = document.getElementById("record-button-content").classList;
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

function closeDrawOptions() {
    document.getElementById('draw-options').hidden = true;
}

function openDrawOptions() {
    document.getElementById('draw-options').hidden = false;
}

function toggleDraw() {
    isDrawing = !isDrawing;
    console.log("Toggle", isDrawing);
    if (isDrawing) {
	document.getElementById('draw-button').classList.add('using');
	graphics = ourGame.add.brushstroke();
        graphics.setInteractive(graphics.getRect(), function(hitArea, x, y, gameObject) {
	    if (isDrawing) {
		return false;
	    }
	    console.log("Hit", hitArea, x, y, gameObject);
	    if (gameObject.rect === null) {
		return false;
	    }
	    return x >= gameObject.rect.left && x <= gameObject.rect.right && y > gameObject.rect.top && y <= gameObject.rect.bottom;
	});
        ourGame.input.setDraggable(graphics);
	
    } else {
	document.getElementById('draw-button').classList.remove('using');
    }
}


// window.addEventListener('load', (event) => {
//     mediaStreamMissing = (typeof MediaStream === 'undefined');
//     mediaRecordMissing = (typeof MediaRecorder === 'undefined');
//     if (mediaStreamMissing || mediaRecordMissing) {
// 	Window.alert("Your browser doesn't support recording on this app (it needs MediaStream and MediaRecorder). Please try the latest Firefox or Chrome browser.");
//     }
// });
