var cameraPosFromViewMatrix = require('gl-camera-pos-from-view-matrix');
var createGradientPalette = require('glsl-gradient-palette').createGradientPalette;
var scrape = require('./scrape.js');
var vec3 = require('gl-vec3');
var createNormals = require('normals');
var Geometry = require('gl-geometry');
var seedRandom = require('seed-random');
var createSphere = require('./sphere.js');
var tooloud = require ('tooloud');

function Rock(gl, obj) {

    var simple = [
        [0.0, [0.43, 0.32, 0.2]],
        [0.25, [0.50, 0.40, 0.30]],
        [0.5, [0.60, 0.45, 0.37]],
        [1.0, [0.71, 0.66, 0.59]],
    ];

    this.seed = obj.seed;
    this.noiseScale = obj.noiseScale;
    this.noiseStrength= obj.noiseStrength;
    this.scrapeCount= obj.scrapeCount;
    this.scrapeMinDist= obj.scrapeMinDist;
    this.scrapeStrength= obj.scrapeStrength;
    this.scrapeRadius= obj.scrapeRadius;


    this.Random = seedRandom(this.seed);

    this.simplePaletteTexture = createGradientPalette(gl, simple);

    var sphere = createSphere({stacks: 20, slices: 20})

    var positions = sphere.positions;
    var cells = sphere.cells;
    var normals = sphere.normals;

    var obj = scrape.getNeighbours(positions, cells);
    var adjacentVertices = obj.adjacentVertices;
    var adjacentFaces = obj.adjacentFaces;

    // generate positions at which to scrape.
    var scrapeIndices = [];

    for (var i = 0; i < this.scrapeCount; ++i) {

        var attempts = 0;

        while (true) {

            var randIndex = Math.floor(positions.length * this.Random());
            var p = positions[randIndex];

            var tooClose = false;
            // check that it is not too close to the other vertices.
            for (var j = 0; j < scrapeIndices.length; ++j) {

                var q = positions[scrapeIndices[j]];

                if (vec3.distance(p, q) <this.scrapeMinDist) {
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
            adjacentVertices, adjacentFaces, this.scrapeStrength, this.scrapeRadius);
        normals = createNormals.vertexNormals(cells, positions);
    }

    for (var i = 0; i < positions.length; ++i) {
        var p = positions[i];


        var noise =
            this.noiseStrength*tooloud.Perlin.noise(
                this.noiseScale*p[0],
                this.noiseScale*p[1],
                this.noiseScale*p[2] );


        positions[i][0] += noise;
        positions[i][1] += noise;
        positions[i][2] += noise;
    }

    normals = createNormals.vertexNormals(cells, positions);


        sphereGeo = Geometry(gl)
        .attr('aPosition', positions)
        .attr('aNormal',
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
    shader.uniforms.uSeed = this.seed;
    shader.uniforms.uPalette = this.simplePaletteTexture.bind();

    sphereGeo.bind(shader);
    sphereGeo.draw();
}

module.exports = Rock;
