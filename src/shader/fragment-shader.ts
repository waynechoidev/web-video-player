export const fragmentShader = `#version 300 es
precision mediump float;
in vec2 textureCoords;
uniform sampler2D uImage;
uniform float activeIndex, uKernel[9], kernelWeight;
out vec4 color;
uniform bool isKernel;
vec4 applyKernel () {
    ivec2 dims = textureSize(uImage, 0);
    vec2 pixelJumpFactor = 1.0/vec2(dims);
    vec4 values =
    texture(uImage, textureCoords + pixelJumpFactor * vec2(-1, -1)) * uKernel[0] +
    texture(uImage, textureCoords + pixelJumpFactor * vec2(0, -1)) * uKernel[1] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(1, -1)) * uKernel[2] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(-1,  0)) * uKernel[3] +
    texture(uImage, textureCoords + pixelJumpFactor * vec2(0,  0)) * uKernel[4] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(1,  0)) * uKernel[5] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(-1,  1)) * uKernel[6] + 
    texture(uImage, textureCoords + pixelJumpFactor * vec2(0,  1)) * uKernel[7] + 
    texture(uImage, textureCoords  + pixelJumpFactor * vec2(1,  1)) * uKernel[8];
    
    vec4 updatedPixels = vec4(vec3((values/kernelWeight).rgb), 1.0);
    return updatedPixels;
}
void main() {
    vec4 tex = texture(uImage, textureCoords);
    if (isKernel) {
        tex = applyKernel();
    }
    color = tex;
}
`;
