
precision mediump float;
attribute vec3 aPosition;
attribute vec3 aNormal;
//attribute vec2 aAngles;

varying vec3 vNormal;
varying vec3 vPosition;
//varying vec2 vAngles;

uniform mat4 uProjection;
uniform mat4 uView;
uniform float uAngleDiff;

#define PI 3.1415

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

float uSeed = 42.0;

float rand(float seed){
    return fract(sin(dot(vec2(seed, seed) ,vec2(12.9898,78.233))) * 43758.5453);
}

float randRange(float seed, float low, float high) {
    return low + rand(seed) * (high - low);
}

vec3 randVariance(vec3 base, vec3 variance, float seed) {
    return base + variance * vec3(rand(seed*32.32), rand(seed*2.35622), rand(seed*32441.3432)  );
}

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
  //float eps = uAngleDiff-5;
  //vec3 p = vec3(texCoord.x, 0.0, texCoord.y);

  // approximate the derivatives by the method of finite differences.

/*
  if(a.x <= 0.0) {
    return vec3(0.0, 0.0, 0.0);
  }
*/

  float diff = 0.01;

  vec3 va = calcPos( vec2( a.x+diff, a.y) ) - calcPos( vec2(a.x-diff, a.y) );
  vec3 vb = calcPos( vec2(a.x, a.y+diff) ) - calcPos( vec2(a.x, a.y-diff) );


//  return normalize(cross(normalize(vb), normalize(va) ));
return normalize(vb);
}

vec3 cut(vec3 n, vec3 r0, vec3 p) {
  // http://math.stackexchange.com/a/100766

  n = normalize(n);
  float t = (  dot(n, r0 - p )) / ( dot(n,n) );
   return t * n * step(  0.0, dot(n, p-r0 ) ) ;
}

vec3 cutRandom(float seed, vec3 p) {

  vec3 n = normalize(randVariance(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), seed*0.32));


 //vec3 r0 = randVariance(n, vec3(0.3*n.x, 0.3*n.y, 0.3*n.z), seed*54772.3432);
 vec3 r0 = randRange(seed*54772.3432, 0.80, 0.95) * n;

 //vec3 r0 = vec3(0.8, 0.0, 0.0);

  return cut(n, r0, p);

}

void main() {

  vec3 col = aNormal;


  vec3 p = aPosition;
  vec3 distortN = p;
  vec3 s = p; // seed

  // make it oval-shaped.


 //  p += cut( normalize(vec3(0.0, 1.2, 0.6)), vec3(0.0, 0.8, 0.0), p );

  // p += cut( normalize(vec3(0.7, 0.0, 0.0)), vec3(0.8, 0.0, 0.0), p );

   p += cutRandom(uSeed, p);
   p += cutRandom(uSeed*0.3, p);
   p += cutRandom(uSeed*2332.3, p);
   p += cutRandom(uSeed*220.309, p);


   //p += cut( vec3(1.0, 0.0, 0.0), vec3(0.8, 0.0, 0.0), p );


/*

   p += cut( vec3(0.0, 0.0, 1.0), vec3(0.0, 0.0, 0.9), p );

   p += cut( vec3(0.0, 0.6, 0.1), vec3(0.0, 0.8, 0.8), p );
*/


  // p += cut( vec3(-0.2, -1.0, 0.2), vec3(0.2, 1.0, 0.2), p );


    p.x = p.x * 1.4;


/*
  if(  ==1.0  ) {


   // project.

   // col = vec3(1.0, 0.0, 0.0);
  } else {
   // col = vec3(0.0, 0.0, 0.0);
  }*/


  // point projection into plane.
  // just requires r0 and n

  // formula of plane is dot(n, r-r0). we use this to cut off.
    // whether it is negative or positive.

 // p +=  0.3 * snoise3(s) * n;

// float a = mix(0.1, 0.8, s.x);

//  p +=  vec3(0.1, 0.1, 0.1) * snoise3(s*2.0) * distortN;

//  p +=  0.1 * snoise3(s*4.0) * distortN;

  //p = calcPos(aAngles);

//  vec2 angles = vec2( atan(p.y / p.x), acos( p.z ) );

  vNormal = col;
//  vNormal = getNormal(angles);
//  vNormal = vec3(angles, 0.0);
//  vAngles = aAngles;

  vPosition = p;
  
  gl_Position = uProjection * uView * vec4(p, 1.0);
}
/*
but before thst, we whould also strongly consider
musgrave noise!
*/