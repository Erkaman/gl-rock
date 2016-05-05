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

float noise(vec3 s) {
    return snoise3(s) * 0.5 + 0.5;
}


float fbm( vec3 p)
{
	float f = 0.0;
    f += 0.5000*noise( p ); p = p*2.02;
    f += 0.2500*noise( p ); p = p*2.03;
    f += 0.1250*noise( p ); p = p*2.01;
    f += 0.0625*noise( p );
    return f/0.9375;
}

void main() {

    vec3 n = vNormal;
    n = normalize(cross(dFdx(vPosition) ,dFdy(vPosition) ) );


    vec3 s = vPosition;

    float a = fbm(10.0*s );
    float b = fbm(14.0*s + 434343.0 );

// http://imgur.com/hg4lLcd

// # A2 85 66
// vec3(0.63, 0.52, 0.4)


// # B5 AA 98
// vec3(0.71, 0.66, 0.59)


    vec3 perlin =   texture2D(uPalette, vec2( fbm(10.0*s), 0.0) ).xyz;

    //vec3 perlin =  mix( vec3(0.63, 0.52, 0.4), vec3(0.71, 0.66, 0.59) , fbm(10.0*s) );


  //  perlin = vec3(0.73, 0.52, 0.4) * pow( fbm( 10.0*s), 5.0);
    // look up blending operators.

    vec3 diff = uDiffuseColor;
    diff  = perlin;

    vec3 l = normalize(uLightDir);
    vec3 v = normalize(uEyePos - vPosition);
    vec3 ambient = uAmbientLight * diff;
    vec3 diffuse = diff * uLightColor * dot(n, l) ;
    vec3 specular = pow(clamp(dot(normalize(l+v),n),0.0,1.0)  , uSpecularPower) * vec3(1.0,1.0,1.0);

   // gl_FragColor = vec4(ambient + diffuse /*+ specular*uHasSpecular*/, 1.0);


    gl_FragColor = vec4(perlin, 1.0);


}
/*
they're just using a normal blend operation.

http://www.iquilezles.org/www/articles/palettes/palettes.htm

also, they use masking a not. that is, using a texture to lerp. the lerp value t is a texture!

also, look at emboss filter.

how does sea of memes guy do lava?

also, babylon guy?

study planet!
http://www.sea-of-memes.com/downloads.html

http://imgur.com/hg4lLcd


http://www.iquilezles.org/www/articles/palettes/palettes.htm
http://www.saltgames.com/article/trigPalette/
*/