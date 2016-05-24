var cameraPosFromViewMatrix = require('gl-camera-pos-from-view-matrix');
var vec3 = require('gl-vec3');
var createNormals = require('normals');
var Geometry = require('gl-geometry');
var seedRandom = require('seed-random');
var tooloud = require('tooloud');
var mat4 = require('gl-mat4');

var createSphere = require('./sphere.js');
var scrape = require('./scrape.js');

var adjacentVertices = null;

/*
Rock Mesh generation code.
 */
function Rock(rockObj) {
    var rock = {};

    rock.seed = rockObj.seed;
    rock.noiseScale = rockObj.meshNoiseScale.val;
    rock.noiseStrength = rockObj.meshNoiseStrength.val;
    rock.scrapeCount = rockObj.scrapeCount.val;
    rock.scrapeMinDist = rockObj.scrapeMinDist.val;
    rock.scrapeStrength = rockObj.scrapeStrength.val;
    rock.scrapeRadius = rockObj.scrapeRadius.val;
    rock.aColor = rockObj.aColor;
    rock.bColor = rockObj.bColor;
    rock.cColor = rockObj.cColor;
    rock.scale = rockObj.scale;
    rock.colorNoiseStrength = rockObj.colorNoiseStrength;
    rock.cracksNoiseStrength = rockObj.cracksNoiseStrength;
    
    var rand = seedRandom(rock.seed);

    var sphere = createSphere({stacks: 20, slices: 20});

    var positions = sphere.positions;
    var cells = sphere.cells;
    var normals = sphere.normals;

    if (!adjacentVertices) {
        // OPTIMIZATION: we are always using the same sphere as base for the rock,
        // so we only need to compute the adjacent positions once.
        var rockObj = scrape.getNeighbours(positions, cells);
        var adjacentVertices = rockObj.adjacentVertices;
    }

    /*
     randomly generate positions at which to scrape.
      */
    var scrapeIndices = [];

    for (var i = 0; i < rock.scrapeCount; ++i) {

        var attempts = 0;

        // find random position which is not too close to the other positions.
        while (true) {

            var randIndex = Math.floor(positions.length * rand());
            var p = positions[randIndex];

            var tooClose = false;
            // check that it is not too close to the other vertices.
            for (var j = 0; j < scrapeIndices.length; ++j) {

                var q = positions[scrapeIndices[j]];

                if (vec3.distance(p, q) < rock.scrapeMinDist) {
                    tooClose = true;
                    break;
                }
            }
            ++attempts;

            // if we have done too many attempts, we let it pass regardless.
            // otherwise, we risk an endless loop. 
            if (tooClose && attempts < 100)
                continue
            else {
                scrapeIndices.push(randIndex);
                break;
            }
        }
    }

    // now we scrape at all the selected positions.
    for (var i = 0; i < scrapeIndices.length; ++i) {
        scrape.scrape(
            scrapeIndices[i], positions, cells, normals,
            adjacentVertices, rock.scrapeStrength, rock.scrapeRadius);
    }

    /*
    Finally, we apply a Perlin noise to slighty distort the mesh,
     and then we scale the mesh.
     */
    for (var i = 0; i < positions.length; ++i) {
        var p = positions[i];

        var noise =
            rock.noiseStrength * tooloud.Perlin.noise(
                rock.noiseScale * p[0],
                rock.noiseScale * p[1],
                rock.noiseScale * p[2]);
        
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


/*
Build mesh and upload to OpenGL.
 */
function buildRockMesh(gl, rock) {

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


/*
Render rock.
 */
function drawRock(shader, view, projection, showTexture, translation, rock) {

    var diffuseColor = [0.40, 0.40, 0.40];
    var ambientLight = [0.60, 0.60, 0.60];
    var lightColor = [0.40, 0.40, 0.4];
    var sunDir = [-0.69, 1.33, 0.57];
    var specularPower = {val: 12.45};
    var hasSpecular = {val: true};


    var scratchVec = vec3.create();

    var model = mat4.create();
    mat4.translate(model, model, translation);

    shader.uniforms.uView = view;
    shader.uniforms.uProjection = projection;
    shader.uniforms.uModel = model;

    shader.uniforms.uDiffuseColor = diffuseColor;
    shader.uniforms.uAmbientLight = ambientLight;
    shader.uniforms.uLightColor = lightColor;
    shader.uniforms.uLightDir = sunDir;
    shader.uniforms.uEyePos = cameraPosFromViewMatrix(scratchVec, view);
    shader.uniforms.uSpecularPower = specularPower.val;
    shader.uniforms.uHasSpecular = hasSpecular.val ? 1.0 : 0.0;
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



