/* global requestAnimationFrame */

var bunny = require('bunny');
var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var Geometry = require('gl-geometry');
var glShader = require('gl-shader');
var normals = require('normals');
var glslify = require('glslify')
var createOrbitCamera = require('orbit-camera');
var shell = require("gl-now")();
var createGui = require("pnp-gui");
var cameraPosFromViewMatrix = require('gl-camera-pos-from-view-matrix');
var boundingBox = require('vertices-bounding-box');
var transform = require('geo-3d-transform-mat4');
var randomArray = require('random-array');
var createSphere = require('primitive-icosphere');

var demo1Shader, bunnyGeo, sphereGeo;

var camera = createOrbitCamera([0, -2.0, 0], [0, 0, 0], [0, 1, 0]);

var mouseLeftDownPrev = false;

const RENDER_BUNNY = 0;

/*
 Variables that can be modified through the GUI.
 */

var bg = [0.6, 0.7, 1.0]; // clear color.

var demo1DiffuseColor = [0.42, 0.34, 0.0];
var demo1AmbientLight = [0.77, 0.72, 0.59];
var demo1LightColor = [0.40, 0.47, 0.0];
var demo1SunDir = [-0.69, 1.33, 0.57];
var demo1SpecularPower = {val: 12.45};
var demo1HasSpecular = {val: true};

var seed = 100;

var tesselation = 10;

/*
function createSphere() {
    var positions = [];
    var cells = [];
    var normals = [];
    var angles = [];

    var N = tesselation;

    var stacks= N;
    var slices= N;

    // loop through stacks.
    for (var i = 0; i <= stacks; ++i){

        var phi = (i* Math.PI) / stacks;

        // loop through the slices.
        for (var j = 0; j <= slices; ++j){

            var theta = (j*Math.PI * 2) / slices;

            // use  spherical coordinates to calculate the positions.
            var x = Math.cos (theta) * Math.sin (phi);
            var y = Math.cos (phi);
            var z = Math.sin (theta) * Math.sin (phi);

            positions.push([x,y,z]);
            normals.push([x,y,z]);
            angles.push([phi, theta]);

        }
    }

    // Calc The Index Positions
    for (var i = 0; i < slices * stacks + slices; ++i){
        cells.push ( [  (i), (i + slices + 1), (i + slices)  ]) ;
        cells.push( [ i + slices + 1 ,  i, i + 1 ] );
    }

    return {positions: positions, cells: cells, normals:normals, angles:angles};
}
*/
shell.on("gl-init", function () {
    var gl = shell.gl

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK)


    gui = new createGui(gl);
    gui.windowSizes = [160, 180];

    bunnyGeo = Geometry(gl)
        .attr('aPosition', bunny.positions)
        .attr('aNormal', normals.vertexNormals(bunny.cells, bunny.positions))
        .faces(bunny.cells);

    var sphere = createSphere(1, { subdivisions: 2})

    sphereGeo = Geometry(gl)
        .attr('aPosition', sphere.positions)
        .attr('aNormal',
            //normals.vertexNormals(sphere.cells, sphere.positions)
            sphere.normals
        )
     //   .attr("aAngles", sphere.angles, {size: 2} )
        .faces(sphere.cells);

    demo1Shader = glShader(gl, glslify("./rock_vert.glsl"), glslify("./rock_frag.glsl"));

});

function demo1Randomize() {
    demo1DiffuseColor = randomArray(0, 1).oned(3);
    demo1AmbientLight = randomArray(0, 1).oned(3);
    demo1LightColor = randomArray(0, 1).oned(3);
    demo1SunDir = randomArray(-2, +2).oned(3);
    demo1SpecularPower.val = Math.round(randomArray(0, 40).oned(1)[0]);
}

function newSeed() {
    seed = Math.round(randomArray(0, 1000).oned(1)[0]);
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

    demo1Shader.bind();

    demo1Shader.uniforms.uView = view;
    demo1Shader.uniforms.uProjection = projection;
    demo1Shader.uniforms.uDiffuseColor = demo1DiffuseColor;
    demo1Shader.uniforms.uAmbientLight = demo1AmbientLight;
    demo1Shader.uniforms.uLightColor = demo1LightColor;
    demo1Shader.uniforms.uLightDir = demo1SunDir;
    demo1Shader.uniforms.uEyePos = cameraPosFromViewMatrix(scratchVec, view);
    demo1Shader.uniforms.uSpecularPower = demo1SpecularPower.val;
    demo1Shader.uniforms.uHasSpecular = demo1HasSpecular.val ? 1.0 : 0.0;
    demo1Shader.uniforms.uAngleDiff = (Math.PI * 2) / tesselation;
    demo1Shader.uniforms.uSeed = seed;


    /*
        bunnyGeo.bind(demo1Shader);
        bunnyGeo.draw();
    */
    sphereGeo.bind(demo1Shader);
    sphereGeo.draw();


    var pressed = shell.wasDown("mouse-left");
    var io = {
        mouseLeftDownCur: pressed,
        mouseLeftDownPrev: mouseLeftDownPrev,

        mousePositionCur: shell.mouse,
        mousePositionPrev: shell.prevMouse
    };
    mouseLeftDownPrev = pressed;


    gui.begin(io, "Window");

    if (gui.button("New Seed")) {
        newSeed();
    }

    gui.end(gl, canvas.width, canvas.height);

});

shell.on("tick", function () {

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