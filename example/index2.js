

var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var glShader = require('gl-shader');
var glslify = require('glslify')
var createOrbitCamera = require('orbit-camera');
var shell = require("gl-now")();
var randomArray = require('random-array');
var randomItem = require('random-item');
var RockObj = require('./rock_obj.js');
var createMovableCamera = require('gl-movable-camera');
var createPlane = require('primitive-plane');
var createNormals = require('normals');
var Geometry = require('gl-geometry');
var createRock = require('./rock.js');
var arrayShuffle = require('array-shuffle');

var demo1Shader, bunnyGeo, sphereGeo;

var rock;

var bg = [0.6, 0.7, 1.0]; // clear color.

var editMode = {val: 0};
var showTexture = {val: true};

// number of rocks will be ROCK_N
var ROCK_W = 10;
var ROCK_H = 10;

var ROCK_SPACING = 4;

var rocks;

var camera = createMovableCamera({
    position: vec3.fromValues(-2.0, 6.0, 0.0),
    viewDir: vec3.fromValues(1.0, -0.3, 0)
});

var planeGeo;

shell.on("gl-init", function () {
    var gl = shell.gl

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    rocks = [];

    var rockObj;
    var count = 5;

    for(var i = 0; i < ROCK_W; ++i) {
        //rocks[i] = []
        for (var j = 0; j < ROCK_H; ++j) {

            if(count > 4) {

                rockObj = new RockObj();
                rockObj.varyStrength = 2.0;

                rockObj.varyArray(rockObj.scale, 0, 0.4, SCALE_MIN, SCALE_MAX);
                rockObj.varyArray(rockObj.scale, 1, 0.4, SCALE_MIN, SCALE_MAX);
                rockObj.varyArray(rockObj.scale, 2, 0.4, SCALE_MIN, SCALE_MAX);

                count = 0;
            }

            // always use an unique seed.
            rockObj.seed = Math.round(randomArray(0, 1000000).oned(1)[0]);

            rockObj.varyNoise();rockObj.varyColor(); rockObj.varyMesh();

            rocks[i*ROCK_W + j] = new createRock(gl, rockObj );
            ++count;

            rockObj.varyStrength = 1.0;

        }
    }

    rocks = arrayShuffle(rocks);

    planeGeo = createPlane(1, 1);

    planeGeo = Geometry(gl)
        .attr('aPosition', planeGeo.positions)
        .attr('aNormal', createNormals.vertexNormals(planeGeo.cells, planeGeo.positions))
        .faces(planeGeo.cells)


    demo1Shader = glShader(gl, glslify("./rock_vert.glsl"), glslify("./rock_frag.glsl"));
});

shell.on("gl-render", function (t) {
    var gl = shell.gl
    var canvas = shell.canvas;

    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var model = mat4.create();
    var projection = mat4.create();
    var scratchMat = mat4.create();
    var view = camera.view();
    var scratchVec = vec3.create();

    mat4.perspective(projection, Math.PI / 2, canvas.width / canvas.height, 0.1, 10000.0);

    demo1Shader.bind();

    for(var i = 0; i < ROCK_W; ++i) {
        for (var j = 0; j < ROCK_H; ++j) {

            var translation = [(i)*ROCK_SPACING, 0.0, (j-ROCK_H/2.0)*ROCK_SPACING];

            rocks[i*ROCK_W + j].draw(demo1Shader, view, projection, showTexture.val, translation);
        }
    }

});

var freeCamera = true;

shell.on("tick", function () {
    var gl = shell.gl


    if(!freeCamera) {

        // if not free camera, make the camera traverse a set path.

        camera.position[2] += cameraDirection;

        // flip direction if reached edge.
        if(camera.position[2] < -10) {
            cameraDirection *= -1;
        }
        if(camera.position[2] > 260) {
            cameraDirection *= -1;
        }

        camera.position[1] = 5 + 3*Math.sin(totalTime * 0.1);

    } else {
        // if free camera, listen to keyboard and mouse input.

        if (shell.wasDown("mouse-left")) {

            camera.turn(-(shell.mouseX - shell.prevMouseX), +(shell.mouseY - shell.prevMouseY));
        }

        if (shell.wasDown("W")) {
            camera.walk(true);
        } else if (shell.wasDown("S")) {
            camera.walk(false);
        }

        if (shell.wasDown("A")) {
            camera.stride(true);
        } else if (shell.wasDown("D")) {
            camera.stride(false);
        }

        if (shell.wasDown("O")) {
            camera.fly(true);
        } else if (shell.wasDown("L")) {
            camera.fly(false);
        }

        if (shell.wasDown("M")) {
            camera.velocity = 0.3;
        } else {
            camera.velocity = 0.05;
        }

    }

    if (shell.wasDown("mouse-left")) {
        // press left mouse button to free the camera.
        freeCamera = true
    }
});