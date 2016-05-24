/**
 * Created by eric on 22/05/16.
 */

var randomArray = require('random-array');

/*
RockObj contains all the parameters that are used when generating a rock.
 */

function RockObj() {

    this.seed = 100;
    this.meshNoiseScale = {val: 2.0};
    this.meshNoiseStrength = {val: 0.2};
    this.scrapeCount = {val: 7};
    this.scrapeMinDist = {val: 0.8};
    this.scrapeStrength = {val: 0.2};
    this.scrapeRadius = {val: 0.3};
    this.aColor = [0.50, 0.40, 0.30];
    this.bColor = [0.60, 0.45, 0.37];
    this.cColor = [0.71, 0.66, 0.59];

    this.colorNoiseStrength = {val: 1.0};
    this.cracksNoiseStrength = {val: 0.3};
    this.scale = [1.0, 1.0, 1.0];
    
    this.varyStrength = 1.0;
}


MESH_NOISE_SCALE_MIN = 0.5;
MESH_NOISE_SCALE_MAX = 5.0;
MESH_NOISE_SCALE_VARY = 0.05;

NOISE_STRENGTH_MIN = 0.0;
NOISE_STRENGTH_MAX = 1.0;
NOISE_STRENGTH_VARY = 0.05;


MESH_NOISE_STRENGTH_MIN = 0.0;
MESH_NOISE_STRENGTH_MAX = 0.5;
MESH_NOISE_STRENGTH_VARY = 0.05;


SCRAPE_COUNT_MIN = 0;
SCRAPE_COUNT_MAX = 15;
SCRAPE_COUNT_VARY = 2;

SCRAPE_MIN_DIST_MIN = 0.1;
SCRAPE_MIN_DIST_MAX = 1.0;
SCRAPE_MIN_DIST_VARY = 0.05;

SCRAPE_STRENGTH_MIN = 0.1;
SCRAPE_STRENGTH_MAX = 0.6;
SCRAPE_STRENGTH_VARY = 0.05;

SCRAPE_RADIUS_MIN = 0.1;
SCRAPE_RADIUS_MAX = 0.5;
SCRAPE_RADIUS_VARY = 0.05;

SCALE_MIN = +1.0;
SCALE_MAX = +2.0;
SCALE_VARY = +0.1;

COLOR_VARY = 0.04;

RockObj.prototype.randomizeNoise = function () {
    this.colorNoiseStrength.val = randomArray(NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX).oned(1)[0];
    this.cracksNoiseStrength.val = randomArray(NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX).oned(1)[0];
}

RockObj.prototype.varyParameter = function varyParameter(param, variance, min, max) {
    param.val += randomArray(-variance*this.varyStrength , +variance*this.varyStrength ).oned(1)[0];
    if (param.val > max) param.val = max;
    if (param.val < min) param.val = min;

}

RockObj.prototype.varyArray = function (arr, i, variance, min, max) {
    arr[i] += randomArray(-variance*this.varyStrength , +variance*this.varyStrength ).oned(1)[0];
    if (arr[i] > max) arr[i] = max;
    if (arr[i] < min) arr[i] = min;
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

    this.varyParameter(this.meshNoiseScale,
        MESH_NOISE_SCALE_VARY, MESH_NOISE_SCALE_MIN, MESH_NOISE_SCALE_MAX);
    this.varyParameter(this.meshNoiseStrength,
        MESH_NOISE_STRENGTH_VARY, MESH_NOISE_STRENGTH_MIN, MESH_NOISE_STRENGTH_MAX);

    this.varyParameter(this.scrapeCount, SCRAPE_COUNT_VARY, SCRAPE_COUNT_MIN, SCRAPE_COUNT_MAX);

    this.varyParameter(this.scrapeMinDist, SCRAPE_MIN_DIST_VARY, SCRAPE_MIN_DIST_MIN, SCRAPE_MIN_DIST_MAX);
    this.varyParameter(this.scrapeStrength, SCRAPE_STRENGTH_VARY, SCRAPE_STRENGTH_MIN, SCRAPE_STRENGTH_MAX);

    this.varyParameter(this.scrapeRadius, SCRAPE_RADIUS_VARY, SCRAPE_RADIUS_MIN, SCRAPE_RADIUS_MAX);


    var scale = this.scale;
    this.varyArray(scale, 0, SCALE_VARY, SCALE_MIN, SCALE_MAX);
    this.varyArray(scale, 1, SCALE_VARY, SCALE_MIN, SCALE_MAX);
    this.varyArray(scale, 2, SCALE_VARY, SCALE_MIN, SCALE_MAX);
};


RockObj.prototype.varyNoise = function () {
    this.varyParameter(this.colorNoiseStrength,
        NOISE_STRENGTH_VARY, NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX);
    this.varyParameter(this.cracksNoiseStrength,
        NOISE_STRENGTH_VARY, NOISE_STRENGTH_MIN, NOISE_STRENGTH_MAX);
}

RockObj.prototype.randomizeColor = function () {
    this.aColor = randomArray(0, 1).oned(3);
    this.bColor = randomArray(0, 1).oned(3);
    this.cColor = randomArray(0, 1).oned(3);
}

RockObj.prototype.varyColorHelper = function (color) {
    this.varyArray(color, 0, COLOR_VARY, 0.0, 1.0);
    this.varyArray(color, 1, COLOR_VARY, 0.0, 1.0);
    this.varyArray(color, 2, COLOR_VARY, 0.0, 1.0);
}

RockObj.prototype.varyColor = function () {
    this.varyColorHelper(this.aColor);
    this.varyColorHelper(this.bColor);
    this.varyColorHelper(this.cColor);
}


module.exports = RockObj;