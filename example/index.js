/* global requestAnimationFrame */

var bunny = require('bunny');
var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var Geometry = require('gl-geometry');
var glShader = require('gl-shader');
var createNormals = require('normals');
var glslify = require('glslify')
var createOrbitCamera = require('orbit-camera');
var shell = require("gl-now")();
var createGui = require("pnp-gui");
var cameraPosFromViewMatrix = require('gl-camera-pos-from-view-matrix');
var boundingBox = require('vertices-bounding-box');
var transform = require('geo-3d-transform-mat4');
var randomArray = require('random-array');
var createSphere = require('primitive-icosphere');
var createGradientPalette = require('glsl-gradient-palette').createGradientPalette;
var PaletteDrawer = require('glsl-gradient-palette').PaletteDrawer;
var scrape = require('./scrape.js');


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

var simplePaletteTexture;
var paletteDrawer;

function createSphere2(opt) {


    var radius = opt.radius || 1.0;
    var stacks = opt.stacks || 32;
    var slices = opt.slices || 32;

    var positions = [];
    var cells = [];
    var normals = [];
    var uvs = [];

    // keeps track of the index of the next vertex that we create.
    var index = 0;


    /*
     First of all, we create all the faces that are NOT adjacent to the
     bottom(0,-R,0) and top(0,+R,0) vertices of the sphere.

     (it's easier this way, because for the bottom and top vertices, we need to add triangle faces.
     But for the faces between, we need to add quad faces. )
     */

    // loop through the stacks.
    for (var i = 1; i < stacks; ++i){

        var u  = i / stacks;
        var phi = u * Math.PI;


        var stackBaseIndex = cells.length/2;

        // loop through the slices.
        for (var j = 0; j < slices; ++j){

            var v = j / slices;
            var theta = v * (Math.PI * 2);



            var R = radius
            // use spherical coordinates to calculate the positions.
            var x = Math.cos (theta) * Math.sin (phi);
            var y = Math.cos (phi);
            var z =Math.sin (theta) * Math.sin (phi);

            positions.push([R*x,R*y,R*z]);
            normals.push([x,y,z]);
            uvs.push([u,v]);

            if((i +1) != stacks ) { // for the last stack, we don't need to add faces.

                var i1, i2, i3, i4;

                if((j+1)==slices) {
                    // for the last vertex in the slice, we need to wrap around to create the face.
                    i1 = index;
                    i2 = stackBaseIndex;
                    i3 = index  + slices;
                    i4 = stackBaseIndex  + slices;

                } else {
                    // use the indices from the current slice, and indices from the next slice, to create the face.
                    i1 = index;
                    i2 = index + 1;
                    i3 = index  + slices;
                    i4 = index  + slices + 1;

                }

                // add quad face
                cells.push([i1, i2, i3]);
                cells.push([i4, i3, i2]);
            }

            index++;
        }
    }

    /*
     Next, we finish the sphere by adding the faces that are adjacent to the top and bottom vertices.
     */

    var topIndex = index++;
    positions.push([0.0,radius,0.0]);
    normals.push([0,1,0]);
    uvs.push([0,0]);


    var bottomIndex = index++;
    positions.push([0, -radius, 0 ]);
    normals.push([0,-1,0]);
    uvs.push([1,0]);


    for (var i = 0; i < slices; ++i) {

        var i1 = topIndex;
        var i2 = (i+0);
        var i3 = (i+1) % slices;
        cells.push([i3, i2, i1]);

        var i1 = bottomIndex;
        var i2 = (bottomIndex-1) - slices +  (i+0);
        var i3 = (bottomIndex-1) - slices + ((i+1)%slices);
        cells.push([i1, i2, i3]);
    }

    return {positions: positions, cells: cells, normals:normals, uvs:uvs};
}



shell.on("gl-init", function () {
    var gl = shell.gl

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK)

    var simple =  [
        [0.0, [0.43, 0.32, 0.2]],



        [0.25, [0.50, 0.40, 0.30]],


        [0.5, [0.60, 0.45, 0.37]],


        [1.0, [0.71, 0.66, 0.59]],


    ];
/*

 // # A2 85 66
 // vec3(0.63, 0.52, 0.4)

 // # B5 AA 98
 // vec3(0.71, 0.66, 0.59)
 */
    simplePaletteTexture = createGradientPalette(gl,simple);
    paletteDrawer = new PaletteDrawer(gl, [400, 40], [880, 100] );

  //  console.log("wat", paletteDrawer);

   // console.log("wat", createPaletteDrawer);




    gui = new createGui(gl);
    gui.windowSizes = [160, 180];


    var sphere =
        createSphere2({stacks:20, slices:20})

        //createSphere(1, { subdivisions: 2})


    var positions = sphere.positions;
    var cells = sphere.cells;
    var normals = sphere.normals;

    var obj = scrape.getNeighbours(positions, cells);
    var adjacentVertices = obj.adjacentVertices;
    var adjacentFaces = obj.adjacentFaces;


    scrape.scrape(100, positions, cells, normals, adjacentVertices, adjacentFaces, 0.1);
   // normals = createNormals.vertexNormals(cells, positions);



    sphereGeo = Geometry(gl)
        .attr('aPosition', positions)
        .attr('aNormal',
            //normals.vertexNormals(sphere.cells, sphere.positions)
            normals
        )
     //   .attr("aAngles", sphere.angles, {size: 2} )
        .faces(cells);

    demo1Shader = glShader(gl, glslify("./rock_vert.glsl"), glslify("./rock_frag.glsl"));

    camera.rotate([0,0], [0,0] );

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
    demo1Shader.uniforms.uPalette = simplePaletteTexture.bind();



    /*
        bunnyGeo.bind(demo1Shader);
        bunnyGeo.draw();
    */
    sphereGeo.bind(demo1Shader);
    sphereGeo.draw();


    paletteDrawer.draw(simplePaletteTexture, canvas.width, canvas.height);


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