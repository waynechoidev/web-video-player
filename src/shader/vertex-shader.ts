export const vertexShader = `#version 300 es
precision mediump float;
in vec2 position;
in vec2 texCoords;
out vec2 textureCoords;
void main () {
    gl_Position = vec4(position.x, position.y * -1.0, 0.0, 1.0);
    textureCoords = texCoords;
}
`;
