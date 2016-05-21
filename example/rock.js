/**
 * Created by eric on 21/05/16.
 */



var cameraPosFromViewMatrix = require('gl-camera-pos-from-view-matrix');
var createGradientPalette = require('glsl-gradient-palette').createGradientPalette;
var scrape = require('./scrape.js');
var vec3 = require('gl-vec3');
var createNormals = require('normals');
var Geometry = require('gl-geometry');

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

function Rock(gl) {
    var simple =  [
        [0.0, [0.43, 0.32, 0.2]],
        [0.25, [0.50, 0.40, 0.30]],
        [0.5, [0.60, 0.45, 0.37]],
        [1.0, [0.71, 0.66, 0.59]],
    ];

    this.simplePaletteTexture = createGradientPalette(gl,simple);
    
    var sphere =  createSphere2({stacks:20, slices:20})
    
    var positions = sphere.positions;
    var cells = sphere.cells;
    var normals = sphere.normals;

    var obj = scrape.getNeighbours(positions, cells);
    var adjacentVertices = obj.adjacentVertices;
    var adjacentFaces = obj.adjacentFaces;



    // generate positions at which to scrape.

    var scrapeIndices = [];

    for(var i = 0; i < 7; ++i) {

        while (true) {

            var randIndex = Math.floor(positions.length * Math.random());
            var p = positions[randIndex];

            var tooClose = false;
            // check that it is not too close to the other vertices.
            for (var j = 0; j < scrapeIndices.length; ++j) {

                var q = positions[scrapeIndices[j]];
                /*
                 console.log("dist", vec3.distance(p, q) );

                 console.log("p", p );
                 console.log("q", q );
                 */
                if (vec3.distance(p, q) < 0.8) {
                    console.log("reject ", q );
                    tooClose = true;
                    break;
                }
            }


            if (tooClose)
                continue
            else {
                console.log("add scrape", randIndex);
                scrapeIndices.push(randIndex);
                break;
            }
        }

    }

    console.log("positions ", positions.length);

    for(var i = 0; i < scrapeIndices.length; ++i) {

        console.log("scrape, " ,i, scrapeIndices[i], positions[scrapeIndices[i]]);
        scrape.scrape(scrapeIndices[i],positions, cells, normals, adjacentVertices, adjacentFaces, 0.2, 0.3);
        normals = createNormals.vertexNormals(cells, positions);
    }

    sphereGeo = Geometry(gl)
        .attr('aPosition', positions)
        .attr('aNormal',
            //normals.vertexNormals(sphere.cells, sphere.positions)
            normals
        )
        .faces(cells);

}

var demo1DiffuseColor = [0.40, 0.40, 0.40];
var demo1AmbientLight = [0.60, 0.60, 0.60];
var demo1LightColor = [0.40, 0.40, 0.4];
var demo1SunDir = [-0.69, 1.33, 0.57];
var demo1SpecularPower = {val: 12.45};
var demo1HasSpecular = {val: true};

var seed = 100;

Rock.prototype.draw = function (shader, view, projection) {
    var scratchVec = vec3.create();

    shader.uniforms.uView = view;
    shader.uniforms.uProjection = projection;
    shader.uniforms.uDiffuseColor = demo1DiffuseColor;
    shader.uniforms.uAmbientLight = demo1AmbientLight;
    shader.uniforms.uLightColor = demo1LightColor;
    shader.uniforms.uLightDir = demo1SunDir;
    shader.uniforms.uEyePos = cameraPosFromViewMatrix(scratchVec, view);
    shader.uniforms.uSpecularPower = demo1SpecularPower.val;
    shader.uniforms.uHasSpecular = demo1HasSpecular.val ? 1.0 : 0.0;
    shader.uniforms.uSeed = seed;
    shader.uniforms.uPalette = this.simplePaletteTexture.bind();



    /*
     bunnyGeo.bind(demo1Shader);
     bunnyGeo.draw();
     */
    sphereGeo.bind(shader);
    sphereGeo.draw();


}

module.exports = Rock;
