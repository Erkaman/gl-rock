

var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var glShader = require('gl-shader');
var glslify = require('glslify');
var createOrbitCamera = require('orbit-camera');
var shell = require("gl-now")();
var randomItem = require('random-item');
var createMovableCamera = require('gl-movable-camera');
var createPlane = require('primitive-plane');
var createNormals = require('normals');
var Geometry = require('gl-geometry');
var arrayShuffle = require('array-shuffle');
var geoTransform = require('geo-3d-transform-mat4');
var WorkerJs = require('workerjs');
var Work = require('webworkify');

var RockObj = require('./rock_obj.js');



var createRock = require('./rock.js').createRock;
var buildRockMesh = require('./rock.js').buildRockMesh;
var drawRock = require('./rock.js').drawRock;

var randomArray = require('random-array');


var rockShader, planeShader, bunnyGeo, sphereGeo;

var rock;

var bg = [0.6, 0.7, 1.0]; // clear color.

var editMode = {val: 0};
var showTexture = {val: true};

// number of rocks will be ROCK_N
/*
var ROCK_W = 10;
var ROCK_H = 10;
*/
var ROCK_W = 20;
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
    gl.disable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    rocks = [];

    var rockObj;
    var count = 5;

    var objCount = 0;


    var worker = Work(require('./worker.js'));


    worker.addEventListener('message', function (msg) {

        console.log("main got message ", msg.data);

        //++objCount;

        var rock = msg.data;
      //  rock.buildMesh(gl);

        buildRockMesh(gl, rock);
        rocks.push(rock);

        worker.postMessage("work!");

        if(rocks.length > ROCK_W*ROCK_H) {
            worker.terminate();
            console.log("done working");
        }
    });

    worker.postMessage("work!");
    console.log("DONE: ", objCount);





    /*
    for(var i = 0; i < ROCK_W; ++i) {
        //rocks[i] = []
        for (var j = 0; j < ROCK_H; ++j) {

            if(count > 4) {

                rockObj = new RockObj();
                rockObj.varyStrength = 1.5;

                rockObj.varyArray(rockObj.scale, 0, 0.4, SCALE_MIN, SCALE_MAX);
                rockObj.varyArray(rockObj.scale, 1, 0.4, SCALE_MIN, SCALE_MAX);
                rockObj.varyArray(rockObj.scale, 2, 0.4, SCALE_MIN, SCALE_MAX);

                count = 0;
            }

            // always use an unique seed.
            rockObj.seed = Math.round(randomArray(0, 1000000).oned(1)[0]);

            rockObj.varyNoise();rockObj.varyColor(); rockObj.varyMesh();
            
            var rock = createRock(rockObj );
            buildRockMesh(gl, rock);

            rocks[j*ROCK_W + i] = rock;
            ++count;

            rockObj.varyStrength = 1.0;
        }
    }
    */


    rocks = arrayShuffle(rocks);

    planeGeo = createPlane(1, 1);

    var model = mat4.create();
    mat4.rotateX(model, model, Math.PI / 2);
    mat4.translate(model, model, [0, 0.0, 0.9]);
    mat4.scale(model, model, [1000, 1000, 1]);
    planeGeo.positions = geoTransform(planeGeo.positions, model);

    planeGeo = Geometry(gl)
        .attr('aPosition', planeGeo.positions)
        .attr('aNormal', createNormals.vertexNormals(planeGeo.cells, planeGeo.positions))
        .faces(planeGeo.cells);


    rockShader = glShader(gl, glslify("./rock_vert.glsl"), glslify("./rock_frag.glsl"));
    planeShader = glShader(gl, glslify("./plane_vert.glsl"), glslify("./plane_frag.glsl"));

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

    rockShader.bind();

    for(var i = 0; i < /*ROCK_W*ROCK_H*/ rocks.length; ++i) {


        var w = Math.floor(i / ROCK_H);
        var h = Math.floor(i % ROCK_H);

        var translation = [(w) * ROCK_SPACING, 0.0, (h - ROCK_H / 2.0) * ROCK_SPACING];
        
        var rock = rocks[w * ROCK_H +h];
        drawRock(rockShader, view, projection, showTexture.val, translation, rock);


    }

  /*  planeShader.bind();

    planeShader.uniforms.uView = view;
    planeShader.uniforms.uProjection = projection;

    planeGeo.bind(planeShader);
    planeGeo.draw();
*/


});

var freeCamera = false;

shell.on("tick", function () {
    var gl = shell.gl


    if(!freeCamera) {

        // if not free camera, make the camera traverse a set path.

        //camera.position[0] += 0.1;

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