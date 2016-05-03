
precision mediump float;
attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vNormal;
varying vec3 vPosition;

uniform mat4 uProjection;
uniform mat4 uView;
uniform float uAngleDiff;
uniform float uSeed;

#define PI 3.1415

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

float seed;

// return value in range [-1, +1]
float rand(){
    seed=  (fract(sin(dot(vec2(seed, seed) ,vec2(12.9898,78.233))) * 43758.5453) )  * 2.0 - 1.0;
    return seed;
}

float randRange(float low, float high) {
    return low + (rand()*0.5 + 0.5  )  * (high - low);
}

int randRangeInt(float low, float high) {
    return int(floor( randRange( low, high ) ));
}

vec3 randVariance(vec3 base, vec3 variance) {
    return base + variance * vec3(rand(), rand(), rand()  );
}

/*
vec3 calcPos(vec2 angles) {

  float phi = angles.x;
  float theta =angles.y;

  float x = cos (theta) * sin (phi);
  float y = cos (phi);
  float z = sin (theta) * sin (phi);

  return vec3(x,y,z);
}

vec3 getNormal(vec2 angles)
{
  vec2 a = angles;

  float diff = 0.01;

  vec3 va = calcPos( vec2( a.x+diff, a.y) ) - calcPos( vec2(a.x-diff, a.y) );
  vec3 vb = calcPos( vec2(a.x, a.y+diff) ) - calcPos( vec2(a.x, a.y-diff) );

return normalize(vb);
}
*/

// let the n be a normal in a plane, and let r0 be a position in that same plane
// then all vertices on the one side of the plane are projected onto the plane
// the vertices on the other side are left untouched
vec3 cut(vec3 n, vec3 r0, vec3 p) {
    // For an explanation of the math, see http://math.stackexchange.com/a/100766
    n = normalize(n);
    float t = (  dot(n, r0 - p )) / ( dot(n,n) );
    return t * n * step(  0.0, dot(n, p-r0 ) ) ;
}

vec3 cutRandom( vec3 p) {

    // plane normal is a just a unit normal.
    vec3 n = normalize(randVariance(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0)));

    vec3 r0 = randRange( 0.65, 0.80) * n;

    return cut(n, r0, p);
}

void main() {

    seed = uSeed;

    vec3 col = aNormal;
    vec3 p = aPosition;
    vec3 distortN = p;
    vec3 s = p; // seed
    vec3 n = aNormal;


    p += cutRandom( p);
    p += cutRandom( p);
    p += cutRandom(p);
    p += cutRandom(p);
    p += cutRandom(p);
    p += cutRandom(p);
    p += cutRandom(p);
    p += cutRandom(p);
    p += cutRandom(p);
    p += cutRandom(p);


    p.x = p.x * 1.4;

  p +=  0.1 * snoise3(s) * n;

// float a = mix(0.1, 0.8, s.x);

//  p +=  vec3(0.1, 0.1, 0.1) * snoise3(s*2.0) * distortN;

//  p +=  0.1 * snoise3(s*4.0) * distortN;

    vNormal = col;
    vPosition = p;
    gl_Position = uProjection * uView * vec4(p, 1.0);
}