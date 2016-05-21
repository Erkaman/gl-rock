#extension GL_OES_standard_derivatives : enable

precision mediump float;
varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uDiffuseColor;
uniform vec3 uAmbientLight;
uniform vec3 uLightColor;
uniform vec3 uLightDir;
uniform vec3 uEyePos;
uniform mat4 uView;
uniform float uSpecularPower;
uniform float uHasSpecular;
uniform float uAngleDiff;

uniform sampler2D uPalette;



#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

#pragma glslify: worley3D = require(glsl-worley/worley3D.glsl)
#pragma glslify: worley2x2x2 = require(glsl-worley/worley2x2x2.glsl)
#pragma glslify: worley2D = require(glsl-worley/worley2D.glsl)
#pragma glslify: worley2x2 = require(glsl-worley/worley2x2.glsl)


float noise(vec3 s) {
    return snoise3(s) * 0.5 + 0.5;
}

float fbm( vec3 p, int n, float persistence) {

    float v = 0.0;
    float total = 0.0;
    float amplitude = 1.0;

    for(int i = 0 ; i < 10; ++i) {
        if(i >= n) { break; }

        v += amplitude * noise(p);
        total += amplitude;

        amplitude  *= persistence;
        p *= 2.0; // double freq.

    }

    return v / total;
}

float ridge( vec3 p, int n, float persistence) {

    float v = 0.0;
    float total = 0.0;
    float amplitude = 1.0;

    for(int i = 0 ; i < 10; ++i) {
        if(i >= n) { break; }

        float signal = (1.0 - abs(  snoise3(p) )  );
        signal = pow(signal, 8.0);

        v += amplitude * signal;
        total += amplitude;

        amplitude  *= persistence;
        p *= 2.0; // double freq.

    }
    return v / total;
}

vec4 lighting(vec3 diff) {


     vec3 n = vNormal;


    vec3 l = normalize(uLightDir);
    vec3 v = normalize(uEyePos - vPosition);
    vec3 ambient = uAmbientLight * diff;
    vec3 diffuse = diff * uLightColor * dot(n, l) ;
    vec3 specular = pow(clamp(dot(normalize(l+v),n),0.0,1.0)  , uSpecularPower) * vec3(1.0,1.0,1.0);

    return vec4(ambient + diffuse /*+ specular*uHasSpecular*/, 1.0);
}

void main() {


    vec3 diff;

    vec3 s = vPosition;

    float t= fbm(vec3(10.0)*s, 8, 0.8);
    diff =   texture2D(uPalette, vec2(t , 0.0) ).xyz;


    float t1 = ridge(vec3(1.0)*s, 8, 0.8);
    float t2 = ridge(vec3(1.0)*(s+vec3(4343.3)), 8, 0.8);

    diff += 0.3*t1;
    diff -= 0.3*t2;

    gl_FragColor =  lighting(diff);

    //gl_FragColor = vec4(diff, 1.0);

}
