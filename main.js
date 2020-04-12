class BrushStroke extends Phaser.GameObjects.Graphics {

    constructor (scene)
    {
        super(scene);

	this.settings = {color: 0xffffff, width: 20, fillColor: 0xffffff, fillAlpha: 0.5, vibration: 2};
	this.strokes = [];
	this.stroke = null;
	this.rect = null;
    }

    addPoint(x, y)
    {
	this.stroke.points.push(new Phaser.Geom.Point(x, y));
	this.updateRectForPoint(x, y, this.stroke.width);
    }

    updateRectForPoint(x, y, width)
    {
	if (this.rect === null) {
	    this.rect = new Phaser.Geom.Rectangle(x - width/2, y - width/2, width, width);
	} else {
	    this.rect.left = Math.min(this.rect.left, x - width/2);
	    this.rect.right = Math.max(this.rect.right, x + width/2);
	    this.rect.top = Math.min(this.rect.top, y - width/2);
	    this.rect.bottom = Math.max(this.rect.bottom, y + width/2);
	}
    }

    updateRectForStroke(stroke)
    {
	for (var j=0; j < stroke.points.length; ++j) {
	    var point = stroke.points[j];
	    this.updateRectForPoint(point.x, point.y, stroke.width);
	}
    }
    
    resetRect()
    {
	this.rect = null;
	for (var i=0; i< this.strokes.length; ++i) {
	    var stroke = this.strokes[i];
	    this.updateRectForStroke(stroke);
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
	this.settings.fillColor = color;
    }

    setFillAlpha(alpha) {
	this.settings.fillAlpha = alpha;
    }

    setStrokeWidth(width) {
	this.settings.width = width;
    }

    setVibration(vibration) {
	this.settings.vibration = vibration;
    }
    
    startNewStroke()
    {
	this.stroke = {points: []};
	Object.assign(this.stroke, this.settings);
	this.strokes.push(this.stroke);
    }

    uRemoveLastStroke()
    {
	var last = this.strokes.pop();
	this.stroke = null;
	this.resetRect();
	return () => this.uAddStroke(last);
    }

    uAddStroke(stroke)
    {
	this.strokes.push(stroke);
	this.updateRectForStroke(stroke);
	return () => this.uRemoveLastStroke();
    }
    
    update()
    {
	this.clear();
	this.setDepth(100000);
	for (var j=0; j<this.strokes.length; ++j) {
	    var stroke = this.strokes[j];
	    
	    var oldPoint = null;
	    var newPoint;

	    var newPoints = randomizePoints(stroke.points, stroke.vibration);
	    
	    if (newPoints.length > 2) {
		this.fillStyle(stroke.fillColor, stroke.fillAlpha);
		this.fillPoints(newPoints, true, true);
	    }

	    if (stroke.width > 0) {
		this.lineStyle(stroke.width, stroke.color);
		this.fillStyle(stroke.color, 1.0);

		for (var i=0; i<newPoints.length; ++i) {
		    newPoint = newPoints[i];
		    if (oldPoint !== null) {
			this.lineBetween(oldPoint.x, oldPoint.y, newPoint.x, newPoint.y);
			this.fillCircle(oldPoint.x, oldPoint.y, stroke.width/2);
		    }
		    // console.log("New point", newPoint);
		    oldPoint = newPoint;
		}

		if (newPoint != null) {
		    this.fillCircle(newPoint.x, newPoint.y, stroke.width/2);
                }
	    }
	}
    }
}


function randomizePoints(points, vibration) {
    let newPoints = [];
    for (var i=0; i<points.length; ++i) {
	newPoint = {x: points[i].x + randomInt(vibration), y: points[i].y + randomInt(vibration)}
	newPoints.push(newPoint);
    }
    return newPoints;
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


class Undoer {

    constructor() {
	this.undoList = [];
	this.redoList = [];
    }

    push(action) {
	this.undoList.push(action);
    }

    undo() {
	if (this.undoList.length > 0) {
	    var action = this.undoList.pop();
	    var redoAction = action();
	    this.redoList.push(redoAction);
	}
    }

    redo() {
	if (this.redoList.length > 0) {
	    var action = this.redoList.pop();
	    var undoAction = action();
	    this.undoList.push(undoAction);
	}
    }
}

var undoer = new Undoer();


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
        create: create
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
    	graphics.setColor(Phaser.Display.Color.ValueToColor(colorPicker.value).color);
    });

    strokeWidthRange = document.getElementById('stroke-width');
    strokeWidthRange.addEventListener('change', function() {
	console.log("Stroke width", strokeWidthRange.value);
    	graphics.setStrokeWidth(strokeWidthRange.value);
    });
    
    vibrationPicker = document.getElementById('vibration-picker');
    vibrationPicker.addEventListener('change', function() {
	console.log("Vibration", vibrationPicker.value);
    	graphics.setVibration(vibrationPicker.value);
    });

    fillColorPicker = document.getElementById('fill-color-picker');
    fillColorPicker.addEventListener('change', function() {
    	graphics.setFillColor(Phaser.Display.Color.ValueToColor(fillColorPicker.value).color);
    });

    fillAlphaPicker = document.getElementById('fill-alpha-picker');
    fillAlphaPicker.addEventListener('change', function() {
	console.log("Fill alpha", fillAlphaPicker.value);
    	graphics.setFillAlpha(fillAlphaPicker.value);
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

	if (isDrawing) {
	    undoer.push(() => graphics.uRemoveLastStroke());
	}
    }, this);
}


function randomInt(amount) {
    return (Math.random() - 0.5) * amount; 
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
    document.getElementById('draw-options-button').hidden = !isDrawing;
    if (isDrawing) {
	document.getElementById('draw-button').classList.add('using');
	graphics = ourGame.add.brushstroke();
        graphics.setInteractive(graphics.getRect(), function(hitArea, x, y, gameObject) {
	    if (isDrawing) {
		return false;
	    }
	    // console.log("Hit", hitArea, x, y, gameObject);
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


window.addEventListener('load', (event) => {
    mediaStreamMissing = (typeof MediaStream === 'undefined');
    mediaRecordMissing = (typeof MediaRecorder === 'undefined');
    userMediaMissing = (typeof navigator.mediaDevices.getUserMedia === 'undefined');
    if (mediaStreamMissing || mediaRecordMissing || userMediaMissing) {
	window.alert("Your browser doesn't support recording on this app (it needs MediaStream and MediaRecorder). Please try the latest Firefox or Chrome browser.");
    }
});

function undo() {
    undoer.undo();
}

function redo() {
    undoer.redo();
}
