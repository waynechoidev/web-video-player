export const fragmentShader = `#version 300 es
precision mediump float;
in vec2 textureCoords;
uniform sampler2D uImage;
out vec4 color;

void main() {
    vec4 tex = texture(uImage, textureCoords);
    color = tex;
}
`;
