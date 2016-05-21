
precision mediump float;
attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vNormal;
varying vec3 vPosition;

uniform mat4 uProjection;
uniform mat4 uView;

void main() {

    vNormal = aNormal;
    vPosition = aPosition;
    gl_Position = uProjection * uView * vec4(aPosition, 1.0);
}
