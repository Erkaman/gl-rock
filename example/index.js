/* global requestAnimationFrame */

var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var glShader = require('gl-shader');
var glslify = require('glslify')
var createOrbitCamera = require('orbit-camera');
var shell = require("gl-now")();
var createGui = require("pnp-gui");
var randomArray = require('random-array');
var PaletteDrawer = require('glsl-gradient-palette').PaletteDrawer;
var randomItem = require('random-item');

var createRock = require('./rock.js');

var demo1Shader, bunnyGeo, sphereGeo;

var camera = createOrbitCamera([0, -2.0, 0], [0, 0, 0], [0, 1, 0]);

var mouseLeftDownPrev = false;

var rock;

var bg = [0.6, 0.7, 1.0]; // clear color.

var simplePaletteTexture;
var paletteDrawer;

/*
 Variables that can be modified through the GUI.
 */

var seed = 100;
var noiseScale = {val: 2.0};
var noiseStrength = {val: 0.2};
var scrapeCount = {val: 7};
var scrapeMinDist = {val:0.8};
var scrapeStrength = {val:0.2};
var scrapeRadius = {val:0.3};

var editMode = {val: 0};
var showTexture = {val: true};


var aColor = [0.43, 0.32, 0.2];
var bColor = [0.50, 0.40, 0.30];
var cColor = [0.60, 0.45, 0.37];
var dColor = [0.71, 0.66, 0.59];

var colorNoiseStrength = {val: 1.0};
var cracksNoiseStrength = {val: 0.3};



function newRock(gl) {
    rock = new createRock(gl, {
        seed:seed,
        noiseScale : noiseScale.val,
        noiseStrength : noiseStrength.val,
        scrapeCount: scrapeCount.val,
        scrapeMinDist: scrapeMinDist.val,
        scrapeStrength: scrapeStrength.val,
        scrapeRadius: scrapeRadius.val,
        aColor: aColor,
        bColor: bColor,
        cColor: cColor,
        dColor: dColor,

        colorNoiseStrength : colorNoiseStrength.val,
        cracksNoiseStrength: cracksNoiseStrength.val


});

}


shell.on("gl-init", function () {
    var gl = shell.gl

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK)

    paletteDrawer = new PaletteDrawer(gl, [030, 540], [380, 600] );

    gui = new createGui(gl);
    gui.windowSizes = [260, 380];

    newRock(gl);

    demo1Shader = glShader(gl, glslify("./rock_vert.glsl"), glslify("./rock_frag.glsl"));

    camera.rotate([0,0], [0,0] );
});

function newSeed() {
    seed = Math.round(randomArray(0, 1000000).oned(1)[0]);
}

shell.on("gl-render", function (t) {
    var gl = shell.gl
    var canvas = shell.canvas;

    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var model = mat4.create();
    var projection = mat4.create();
    var scratchMat = mat4.create();
    var view = camera.view(scratchMat);
    var scratchVec = vec3.create();

    mat4.perspective(projection, Math.PI / 2, canvas.width / canvas.height, 0.1, 10000.0);

    paletteDrawer.draw(rock.getPaletteTexture(),canvas.width, canvas.height);

    demo1Shader.bind();


    rock.draw(demo1Shader, view, projection, showTexture.val);
    
    var pressed = shell.wasDown("mouse-left");
    var io = {
        mouseLeftDownCur: pressed,
        mouseLeftDownPrev: mouseLeftDownPrev,

        mousePositionCur: shell.mouse,
        mousePositionPrev: shell.prevMouse
    };
    mouseLeftDownPrev = pressed;

    gui.begin(io, "Editor");

    gui.textLine("Edit Mode")

    gui.radioButton("Mesh", editMode, 0);
    gui.sameLine();
    gui.radioButton("Texture", editMode, 1);

    gui.separator();

    if(editMode.val == 0) {
        gui.textLine("Mesh");

        gui.sliderFloat("Noise Scale", noiseScale, 0.5, 5.0);
        gui.sliderFloat("Noise Strength", noiseStrength, 0.0, 1.0);

        gui.sliderInt("Scrape Count", scrapeCount, 0, 15);
        gui.sliderFloat("scrapeMinDist", scrapeMinDist, 0.1, 1.0);

        gui.sliderFloat("scrapeStrength", scrapeStrength, 0.1, 1.0);
        gui.sliderFloat("scrapeRadius", scrapeRadius, 0.1, 1.0);

    } else {
        gui.textLine("Texture");

        gui.checkbox("Show Texture",showTexture );

        gui.separator();

        gui.textLine("Noise Palette");


        gui.draggerRgb("aColor", aColor);
        gui.draggerRgb("bColor", bColor);
        gui.draggerRgb("cColor", cColor);
        gui.draggerRgb("dColor", dColor);

        gui.separator();

        gui.textLine("Noise");

        gui.sliderFloat("Color Strength", colorNoiseStrength, 0.0, 1.0);
        gui.sliderFloat("Cracks Strength", cracksNoiseStrength, 0.0, 1.0);
    }


    gui.separator();


    if (gui.button("New Seed")) {
        newSeed();
        newRock(gl);
    }
    gui.textLine("Seed: " + seed);

    if (gui.button("New Rock")) {
        newRock(gl);
    }

    gui.end(gl, canvas.width, canvas.height);
});

var pDownPrev = false;

shell.on("tick", function () {
    var gl = shell.gl


    var pressed = shell.wasDown("P");

    if(pressed && !pDownPrev) {

        newRock(gl);
        console.log("PP")
    }
    pDownPrev = pressed;


    // if interacting with the GUI, do not let the mouse control the camera.
    if (gui.hasMouseFocus())
        return;
    

    if (shell.wasDown("mouse-left")) {
        var speed = 1.3;
        camera.rotate([(shell.mouseX / shell.width - 0.5) * speed, (shell.mouseY / shell.height - 0.5) * speed],
            [(shell.prevMouseX / shell.width - 0.5) * speed, (shell.prevMouseY / shell.height - 0.5) * speed])
    }
    if (shell.scroll[1]) {
        camera.zoom(shell.scroll[1] * 0.01);
    }
});