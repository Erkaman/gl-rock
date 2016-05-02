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

void main() {

    vec3 n = vNormal;
    n = normalize(cross(dFdx(vPosition) ,dFdy(vPosition) ) );

    vec3 l = normalize(uLightDir);
    vec3 v = normalize(uEyePos - vPosition);
    vec3 ambient = uAmbientLight * uDiffuseColor;
    vec3 diffuse = uDiffuseColor * uLightColor * dot(n, l) ;
    vec3 specular = pow(clamp(dot(normalize(l+v),n),0.0,1.0)  , uSpecularPower) * vec3(1.0,1.0,1.0);


   gl_FragColor = vec4(ambient + diffuse /*+ specular*uHasSpecular*/, 1.0);

 //   vec3 add = vec3(1.0, 1.0, 1.0) * isInt( (vAngles.x)/uAngleDiff ) * isInt(  (vAngles.y)/uAngleDiff  ) ;

   gl_FragColor = vec4( n      , 1.0);

   //gl_FragColor = vec4( vNormal      , 1.0);

 //  gl_FragColor = vec4( vPosition      , 1.0);

//gl_FragColor = vec4( vPosition   + add   , 1.0);



//   gl_FragColor = vec4( vec3( dot(n,l) )     , 1.0);



    //gl_FragColor = vec4(n, 1.0);

}