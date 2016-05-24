var cameraPosFromViewMatrix = require('gl-camera-pos-from-view-matrix');
var vec3 = require('gl-vec3');
var createNormals = require('normals');
var Geometry = require('gl-geometry');
var seedRandom = require('seed-random');
var tooloud = require ('tooloud');
var mat4 = require('gl-mat4');

var createSphere = require('./sphere.js');
var scrape = require('./scrape.js');

var adjacentVertices = null;
var adjacentFaces = null;

function Rock(rockObj) {
    var rock = {};

    rock.seed = rockObj.seed;
    rock.noiseScale = rockObj.meshNoiseScale.val;
    rock.noiseStrength= rockObj.meshNoiseStrength.val;
    rock.scrapeCount= rockObj.scrapeCount.val;
    rock.scrapeMinDist= rockObj.scrapeMinDist.val;
    rock.scrapeStrength= rockObj.scrapeStrength.val;
    rock.scrapeRadius= rockObj.scrapeRadius.val;
    rock.aColor= rockObj.aColor;
    rock.bColor= rockObj.bColor;
    rock.cColor= rockObj.cColor;

//    console.log("radius: ", rock.scrapeStrength);

    rock.scale= rockObj.scale;

    rock.colorNoiseStrength = rockObj.colorNoiseStrength;
    rock.cracksNoiseStrength = rockObj.cracksNoiseStrength;


    var simple = [
        [0.0, [0,0,0] ],
        [0.25,rock.aColor],
        [0.5, rock.bColor],
        [1.0, rock.cColor],
    ];



    var rand = seedRandom(rock.seed);

    var sphere = createSphere({stacks: 20, slices: 20})

    var positions = sphere.positions;
    var cells = sphere.cells;
    var normals = sphere.normals;

    if(!adjacentVertices) {
        // OPTIMIZATION: we are always using the same sphere as base for the rock,
        // so we only need to compute the adjacent positions once.
        var rockObj = scrape.getNeighbours(positions, cells);
        var adjacentVertices = rockObj.adjacentVertices;
    }

    // generate positions at which to scrape.
    var scrapeIndices = [];

    for (var i = 0; i < rock.scrapeCount; ++i) {

        var attempts = 0;

        while (true) {

            var randIndex = Math.floor(positions.length * rand());
            var p = positions[randIndex];

            var tooClose = false;
            // check that it is not too close to the other vertices.
            for (var j = 0; j < scrapeIndices.length; ++j) {

                var q = positions[scrapeIndices[j]];

                if (vec3.distance(p, q) <rock.scrapeMinDist) {
                    tooClose = true;
                    break;
                }
            }
            ++attempts;

            // if we have done too many attempts, we let it pass regardless.
            if (tooClose && attempts < 100)
                continue
            else {
                scrapeIndices.push(randIndex);
                break;
            }
        }


    }

    for (var i = 0; i < scrapeIndices.length; ++i) {
        scrape.scrape(
            scrapeIndices[i], positions, cells, normals,
            adjacentVertices, rock.scrapeStrength, rock.scrapeRadius);

    }

    for (var i = 0; i < positions.length; ++i) {
        var p = positions[i];


        var noise =
            rock.noiseStrength*tooloud.Perlin.noise(
                rock.noiseScale*p[0],
                rock.noiseScale*p[1],
                rock.noiseScale*p[2] );


        positions[i][0] += noise;
        positions[i][1] += noise;
        positions[i][2] += noise;


        positions[i][0] *= rock.scale[0];
        positions[i][1] *= rock.scale[1];
        positions[i][2] *= rock.scale[2];
    }

    // of course, we must recompute the normals.
    var normals = createNormals.vertexNormals(cells, positions);


    rock.positions = positions;
    rock.normals = normals;
    rock.cells = cells;
    
    return rock;

}

var demo1DiffuseColor = [0.40, 0.40, 0.40];
var demo1AmbientLight = [0.60, 0.60, 0.60];
var demo1LightColor = [0.40, 0.40, 0.4];
var demo1SunDir = [-0.69, 1.33, 0.57];
var demo1SpecularPower = {val: 12.45};
var demo1HasSpecular = {val: true};

function buildRockMesh (gl, rock) {

    rock.rockGeo = Geometry(gl)
        .attr('aPosition', rock.positions)
        .attr('aNormal',
            rock.normals
        )
        .faces(rock.cells);
}

function isRockMeshBuilt(rock) {
    return "rockGeo" in rock;
}


 function drawRock(shader, view, projection, showTexture, translation, rock) {
    var scratchVec = vec3.create();

    var model = mat4.create();
    mat4.translate(model, model, translation);

    shader.uniforms.uView = view;
    shader.uniforms.uProjection = projection;
    shader.uniforms.uModel = model;

    shader.uniforms.uDiffuseColor = demo1DiffuseColor;
    shader.uniforms.uAmbientLight = demo1AmbientLight;
    shader.uniforms.uLightColor = demo1LightColor;
    shader.uniforms.uLightDir = demo1SunDir;
    shader.uniforms.uEyePos = cameraPosFromViewMatrix(scratchVec, view);
    shader.uniforms.uSpecularPower = demo1SpecularPower.val;
    shader.uniforms.uHasSpecular = demo1HasSpecular.val ? 1.0 : 0.0;
    shader.uniforms.uSeed = rock.seed;

    shader.uniforms.uAColor = rock.aColor;
    shader.uniforms.uBColor = rock.bColor;
    shader.uniforms.uCColor = rock.cColor;

    shader.uniforms.uColorNoiseStrength = rock.colorNoiseStrength.val;
    shader.uniforms.uCracksNoiseStrength = rock.cracksNoiseStrength.val;




    shader.uniforms.uShowTexture = showTexture;


    rock.rockGeo.bind(shader);
    rock.rockGeo.draw();
     rock.rockGeo.unbind();

 }

module.exports.createRock = Rock;
module.exports.buildRockMesh = buildRockMesh;
module.exports.drawRock = drawRock;
module.exports.isRockMeshBuilt = isRockMeshBuilt;



