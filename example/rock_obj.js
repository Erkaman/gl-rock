/**
 * Created by eric on 22/05/16.
 */

var randomArray = require('random-array');


function RockObj() {

    this.seed = 100;
    this.meshNoiseScale = {val: 2.0};
    this.meshNoiseStrength = {val: 0.2};
    this.scrapeCount = {val: 7};
    this.scrapeMinDist = {val: 0.8};
    this.scrapeStrength = {val: 0.2};
    this.scrapeRadius = {val: 0.3};
    this.aColor = [0.43, 0.32, 0.2];
    this.bColor = [0.50, 0.40, 0.30];
    this.cColor = [0.60, 0.45, 0.37];
    this.dColor = [0.71, 0.66, 0.59];

    this.colorNoiseStrength = {val: 1.0};
    this.cracksNoiseStrength = {val: 0.3};
    this.scale = [1.0, 1.0, 1.0];

}


MESH_NOISE_SCALE_MIN = 0.5;
MESH_NOISE_SCALE_MAX = 5.0;
MESH_NOISE_SCALE_VARY = 0.1;

NOISE_STRENGTH_MIN = 0.0;
NOISE_STRENGTH_MAX = 1.0;
NOISE_STRENGTH_VARY = 0.1;


MESH_NOISE_STRENGTH_MIN = 0.0;
MESH_NOISE_STRENGTH_MAX = 0.5;
MESH_NOISE_STRENGTH_VARY = 0.1;


SCRAPE_COUNT_MIN = 0;
SCRAPE_COUNT_MAX = 15;
SCRAPE_COUNT_VARY = 2;

SCRAPE_MIN_DIST_MIN = 0.1;
SCRAPE_MIN_DIST_MAX = 1.0;
SCRAPE_MIN_DIST_VARY = 0.1;

SCRAPE_STRENGTH_MIN = 0.1;
SCRAPE_STRENGTH_MAX = 0.6;
SCRAPE_STRENGTH_VARY = 0.1;

SCRAPE_RADIUS_MIN = 0.1;
SCRAPE_RADIUS_MAX = 0.5;
SCRAPE_RADIUS_VARY = 0.1;

SCALE_MIN = +1.0;
SCALE_MAX = +2.0;

COLOR_VARY = 0.1;


RockObj.prototype.randomizeNoise = function () {

    this.colorNoiseStrength.val = randomArray(NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX).oned(1)[0];
    this.cracksNoiseStrength.val = randomArray(NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX).oned(1)[0];
}


function varyParameter(param, variance, min, max) {

    param.val += randomArray(-variance, +variance).oned(1)[0];
    if (param.val > max) param.val = max;
    if (param.val < min) param.val = min;

}


RockObj.prototype.randomizeMesh = function () {

    this.meshNoiseScale.val = randomArray(MESH_NOISE_SCALE_MIN, MESH_NOISE_SCALE_MAX).oned(1)[0];
    this.meshNoiseStrength.val = randomArray(MESH_NOISE_STRENGTH_MIN, MESH_NOISE_STRENGTH_MAX).oned(1)[0];

    this.scrapeCount.val = Math.floor(randomArray(SCRAPE_COUNT_MIN, SCRAPE_COUNT_MAX).oned(1)[0]);
    this.scrapeMinDist.val = randomArray(SCRAPE_MIN_DIST_MIN, SCRAPE_MIN_DIST_MAX).oned(1)[0];

    this.scrapeStrength.val = randomArray(SCRAPE_STRENGTH_MIN, SCRAPE_STRENGTH_MAX).oned(1)[0];

    this.scrapeRadius.val = randomArray(SCRAPE_RADIUS_MIN, SCRAPE_RADIUS_MAX).oned(1)[0];

    this.scale = randomArray(SCALE_MIN, SCALE_MAX).oned(3);
}


RockObj.prototype.varyMesh = function () {


    varyParameter(this.meshNoiseScale,
        MESH_NOISE_SCALE_VARY, MESH_NOISE_SCALE_MIN, MESH_NOISE_SCALE_MAX);

    varyParameter(this.meshNoiseStrength,
        MESH_NOISE_STRENGTH_VARY, MESH_NOISE_STRENGTH_MIN, MESH_NOISE_STRENGTH_MAX);


    varyParameter(this.scrapeCount, SCRAPE_COUNT_VARY, SCRAPE_COUNT_MIN, SCRAPE_COUNT_MAX);

    varyParameter(this.scrapeMinDist, SCRAPE_MIN_DIST_VARY, SCRAPE_MIN_DIST_MIN, SCRAPE_MIN_DIST_MAX);
    varyParameter(this.scrapeStrength, SCRAPE_STRENGTH_VARY, SCRAPE_STRENGTH_MIN, SCRAPE_STRENGTH_MAX);

    varyParameter(this.scrapeRadius, SCRAPE_RADIUS_VARY, SCRAPE_RADIUS_MIN, SCRAPE_RADIUS_MAX);


    //
    // vary scale.

    var scale = this.scale;

    var VARY = 0.3;

    scale[0] += randomArray(-VARY, +VARY).oned(1)[0];
    if (scale[0] > MESH_NOISE_SCALE_MAX) scale[0] = MESH_NOISE_SCALE_MAX;
    if (scale[0] < MESH_NOISE_SCALE_MIN) scale[0] = MESH_NOISE_SCALE_MIN;


    scale[1] += randomArray(-VARY, +VARY).oned(1)[0];
    if (scale[1] > MESH_NOISE_SCALE_MAX) scale[1] = MESH_NOISE_SCALE_MAX;
    if (scale[1] < MESH_NOISE_SCALE_MIN) scale[1] = MESH_NOISE_SCALE_MIN;


    scale[2] += randomArray(-VARY, +VARY).oned(1)[0];
    if (scale[2] > MESH_NOISE_SCALE_MAX) scale[2] = MESH_NOISE_SCALE_MAX;
    if (scale[2] < MESH_NOISE_SCALE_MIN) scale[2] = MESH_NOISE_SCALE_MIN;
}


RockObj.prototype.varyNoise = function () {

    varyParameter(this.colorNoiseStrength,
        NOISE_STRENGTH_VARY, NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX);
    varyParameter(this.cracksNoiseStrength,
        NOISE_STRENGTH_VARY, NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX);
}

RockObj.prototype.randomizeColor = function () {
    this.aColor = randomArray(0, 1).oned(3);
    this.bColor = randomArray(0, 1).oned(3);
    this.cColor = randomArray(0, 1).oned(3);
    this.dColor = randomArray(0, 1).oned(3);
}

function varyColorHelper(color) {

    var VARY = COLOR_VARY;

    color[0] += randomArray(-VARY, +VARY).oned(1)[0];
    if (color[0] > 1.0) color[0] = 1.0;
    if (color[0] < 0.0) color[0] = 0.0;


    color[1] += randomArray(-VARY, +VARY).oned(1)[0];
    if (color[1] > 1.0) color[1] = 1.0;
    if (color[1] < 0.0) color[1] = 0.0;


    color[2] += randomArray(-VARY, +VARY).oned(1)[0];
    if (color[2] > 1.0) color[2] = 1.0;
    if (color[2] < 0.0) color[2] = 0.0;
}

RockObj.prototype.varyColor = function () {
    varyColorHelper(this.aColor);
    varyColorHelper(this.bColor);
    varyColorHelper(this.cColor);
    varyColorHelper(this.dColor);
}


module.exports = RockObj;