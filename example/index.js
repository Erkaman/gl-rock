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

var editMode = {val: 0};
var showTexture = {val: true};


var rockObj;

rockObj = {
    seed:100,
    meshNoiseScale : {val: 2.0},
    meshNoiseStrength : {val: 0.2},
    scrapeCount: {val: 7},
    scrapeMinDist: {val:0.8},
    scrapeStrength: {val:0.2},
    scrapeRadius: {val:0.3},
    aColor: [0.43, 0.32, 0.2],
    bColor: [0.50, 0.40, 0.30],
    cColor: [0.60, 0.45, 0.37],
    dColor: [0.71, 0.66, 0.59],

    colorNoiseStrength : {val: 1.0},
    cracksNoiseStrength: {val: 0.3},
    scale:  [1.0, 1.0, 1.0]
};

function newRock(gl) {

    rock = new createRock(gl, rockObj );

}


shell.on("gl-init", function () {
    var gl = shell.gl

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK)

    paletteDrawer = new PaletteDrawer(gl, [030, 540], [380, 600] );

    gui = new createGui(gl);
    gui.windowSizes = [300, 380];

    newRock(gl);

    demo1Shader = glShader(gl, glslify("./rock_vert.glsl"), glslify("./rock_frag.glsl"));

    camera.rotate([0,0], [0,0] );
});

function newSeed() {
    rockObj.seed = Math.round(randomArray(0, 1000000).oned(1)[0]);
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

    const MESH_NOISE_SCALE_MIN = 0.5;
    const MESH_NOISE_SCALE_MAX = 5.0;

    const NOISE_STRENGTH_MIN = 0.0;
    const NOISE_STRENGTH_MAX = 1.0;


    const SCRAPE_COUNT_MIN = 0;
    const SCRAPE_COUNT_MAX = 15;

    const SCRAPE_MIN_DIST_MIN = 0.1;
    const SCRAPE_MIN_DIST_MAX = 1.0;

    const SCRAPE_STRENGTH_MIN = 0.1;
    const SCRAPE_STRENGTH_MAX = 1.0;

    const SCRAPE_RADIUS_MIN = 0.1;
    const SCRAPE_RADIUS_MAX = 1.0;

    const SCALE_MIN = +0.0;
    const SCALE_MAX = +2.0;

    if(editMode.val == 0) {
        gui.textLine("Mesh");

        gui.sliderFloat("Noise Scale",
            rockObj.meshNoiseScale, MESH_NOISE_SCALE_MIN, MESH_NOISE_SCALE_MAX);
        gui.sliderFloat("Noise Strength", rockObj.meshNoiseStrength, NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX);

        gui.sliderInt("Scrape Count", rockObj.scrapeCount, SCRAPE_COUNT_MIN, SCRAPE_COUNT_MAX);
        gui.sliderFloat("scrapeMinDist", rockObj.scrapeMinDist, SCRAPE_MIN_DIST_MIN, SCRAPE_MIN_DIST_MAX);

        gui.sliderFloat("scrapeStrength",
            rockObj.scrapeStrength, SCRAPE_STRENGTH_MIN, SCRAPE_STRENGTH_MAX);
        gui.sliderFloat("scrapeRadius", rockObj.scrapeRadius, SCRAPE_RADIUS_MIN, SCRAPE_RADIUS_MAX);

        gui.draggerFloat3("Scale", rockObj.scale, [SCALE_MIN, SCALE_MAX], ["X:", "Y:", "Z:"]);

    } else {
        gui.textLine("Texture");

        gui.checkbox("Show Texture",showTexture );

        gui.separator();

        gui.textLine("Noise Palette");
        
        gui.draggerRgb("aColor", rockObj.aColor);
        gui.draggerRgb("bColor", rockObj.bColor);
        gui.draggerRgb("cColor", rockObj.cColor);
        gui.draggerRgb("dColor", rockObj.dColor);

        gui.separator();

        gui.textLine("Noise");

        gui.sliderFloat("Color Strength",
            rockObj.colorNoiseStrength, NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX);
        gui.sliderFloat("Cracks Strength",
            rockObj.cracksNoiseStrength, NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX);
    }

    gui.separator();


    if (gui.button("New Seed")) {
        newSeed();
        newRock(gl);
    }
    gui.textLine("Seed: " + rockObj.seed);

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