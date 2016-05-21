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

float ridge2( vec3 p, int n, float persistence) {

    float v = 0.0;
    float total = 0.0;
    float amplitude = 1.0;

    for(int i = 0 ; i < 10; ++i) {
        if(i >= n) { break; }

        float signal = (1.0 - abs(  snoise3(p) )  );
      /*  signal *= signal;
        signal *= signal;
*/
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

//vec3 diff = vec3(0.8, 0.6, 0.4);


vec3 diff;

vec3 s = vPosition;

//tex =  vec3(fbm( p,  8, 0.2));



     float t= fbm(vec3(10.0)*s, 8, 0.8);
     diff =   texture2D(uPalette, vec2(t , 0.0) ).xyz;



     float t1 = ridge2(vec3(1.0)*s, 8, 0.8);
     float t2 = ridge2(vec3(1.0)*(s+vec3(4343.3)), 8, 0.8);

//     diff =  vec3(t);
   diff += 0.3*t1;
   diff -= 0.3*t2;


gl_FragColor =  lighting(diff);

 // gl_FragColor = vec4(diff, 1.0);

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

/*

/*
  g = perlin(x,y,z) * 20
    grain = g - int(g)
    */


    /*
    marble
    */
   // float f = 30.0; perlin= vec3( abs(sin(f*( t )) ) );


// marble:
//= sin(f*(x+a*turb(x,y,z)))



/*
     vec3 n = vNormal;
     n = normalize(cross(dFdx(vPosition) ,dFdy(vPosition) ) );
     vec3 temp;

     vec3 s = vPosition;

 // http://imgur.com/hg4lLcd
 // # A2 85 66
 // vec3(0.63, 0.52, 0.4)

 // # B5 AA 98
 // vec3(0.71, 0.66, 0.59)

     float t= fbm(vec3(10.0)*s, 8, 0.8);
     vec3 stoneColor =   texture2D(uPalette, vec2(t , 0.0) ).xyz;





     vec3 p = vec3(10.0)*s;
     t= fbm(p + 2.0*fbm(s * 3.0, 8, 0.6)  , 8, 0.2);

     // crack pattern.
     if(t > 0.5 && t < 0.55) {
          temp = vec3(1.0, 1.0, 1.0);
     } else {
          temp = vec3(0.0, 0.0, 0.0);
     }

     t= fbm(10.0*(s + vec3(10.0) ), 1, 0.1);

     // crack pattern.
     if(t > 0.01 && t < 0.60) {
          temp = vec3(0.0, 0.0, 0.0);
     }
     vec3 cracksMask = temp;



     t= fbm(vec3(10.0)*s, 8, 1.0);
     vec3 cracksColor = mix(vec3(1.0, 0.0, 0.0), vec3(0.0), t);

   // vec3 perlin = mix(stoneColor, cracksColor, cracksMask);

 vec3 perlin = vec3(1.0, 0.0, 0.0);



   vec2 F = worley3D(vPosition*10.0, 1.0, false);
   float F1 = F.x;
   float F2 = F.y;


   //perlin = vec3(F2-F1);

   //  perlin = vec3(t);


     //vec3 perlin =  mix( vec3(0.63, 0.52, 0.4), vec3(0.71, 0.66, 0.59) , fbm(10.0*s) );
 */

   //  perlin = vec3(0.73, 0.52, 0.4) * pow( fbm( 10.0*s), 5.0);
     // look up blending operators.
