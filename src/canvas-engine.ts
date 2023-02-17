import { fragmentShader } from "./shader/fragment-shader";
import { vertexShader } from "./shader/vertex-shader";

export class CanvasEngine {
  private _vertices: number[];
  private _textureCoordinates: number[];
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext | null;

  private _program?: WebGLProgram | null;
  private _buffer?: WebGLBuffer | null;
  private _texBuffer?: WebGLBuffer | null;
  private _texture?: WebGLTexture | null;

  constructor() {
    this._vertices = this.prepareRectVec2(-1.0, -1.0, 1.0, 1.0);
    this._textureCoordinates = this.prepareRectVec2(0.0, 0.0, 1.0, 1.0);

    // get element
    this._canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this._canvas.width = window.innerWidth * 0.8;
    this._canvas.height = window.innerHeight * 0.6;

    // get context
    this._gl = this._canvas.getContext("webgl2");
    if (!this._gl) return;
    this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this._gl.clear(this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT);

    // get program
    const vs = this.getShader(vertexShader, this._gl.VERTEX_SHADER);
    const fs = this.getShader(fragmentShader, this._gl.FRAGMENT_SHADER);
    this._program = this._gl.createProgram();
    if (!this._program || !vs || !fs) return;

    this._gl.attachShader(this._program, vs);
    this._gl.attachShader(this._program, fs);
    this._gl.linkProgram(this._program);
    if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
      console.error(this._gl.getProgramInfoLog(this._program));
    }
  }

  updateImage(src: string) {
    if (!this._gl || !this._program) return;

    const image = new Image();
    image.src = src;
    image.onload = () => {
      this._buffer = this.createAndBindBuffer(this.getAspectRatio(image)!);
      this._texBuffer = this.createAndBindBuffer(this._textureCoordinates);

      this.createAndBindTexture(image);
      this.render();
    };
    this._gl.useProgram(this._program);
    const uImage = this._gl.getUniformLocation(this._program, "uImage");
    this._gl.uniform1i(uImage, 0);
  }

  // Private
  private prepareRectVec2(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) {
    return [
      startX,
      startY,
      endX,
      startY,
      startX,
      endY,
      startX,
      endY,
      endX,
      endY,
      endX,
      startY,
    ];
  }

  private getShader(shaderSource: string, shaderType: number) {
    const shader = this._gl?.createShader(shaderType);
    if (!shader) return;

    this._gl?.shaderSource(shader, shaderSource);
    this._gl?.compileShader(shader);
    if (!this._gl?.getShaderParameter(shader, this._gl?.COMPILE_STATUS)) {
      console.error(this._gl?.getShaderInfoLog(shader));
    }
    return shader;
  }

  private createAndBindTexture(image: HTMLImageElement) {
    if (!this._gl) return;
    this._texture = this._gl.createTexture();
    this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
    this._gl.texImage2D(
      this._gl.TEXTURE_2D,
      0,
      this._gl.RGBA,
      this._gl.RGBA,
      this._gl.UNSIGNED_BYTE,
      image
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_MIN_FILTER,
      this._gl.NEAREST
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_MAG_FILTER,
      this._gl.NEAREST
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_WRAP_S,
      this._gl.CLAMP_TO_EDGE
    );
    this._gl.texParameteri(
      this._gl.TEXTURE_2D,
      this._gl.TEXTURE_WRAP_T,
      this._gl.CLAMP_TO_EDGE
    );
    this._gl.bindTexture(this._gl.TEXTURE_2D, null);
  }

  private createAndBindBuffer(data: number[]) {
    if (!this._gl) return;
    const buffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
    this._gl.bufferData(
      this._gl.ARRAY_BUFFER,
      new Float32Array(data),
      this._gl.STATIC_DRAW
    );
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    return buffer;
  }

  private linkGPUAndCPU(buffer: WebGLBuffer, gpuVariable: string) {
    if (!this._gl || !this._program) return;
    var position = this._gl.getAttribLocation(this._program, gpuVariable);
    this._gl.enableVertexAttribArray(position);
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
    this._gl.vertexAttribPointer(position, 2, this._gl.FLOAT, false, 0, 0);
    return position;
  }

  private getAspectRatio(image: HTMLImageElement) {
    if (!this._gl) return;
    var cols = image.width;
    var rows = image.height;
    var imageAR = cols / rows;
    var canvasAR = this._gl.canvas.width / this._gl.canvas.height;
    var startX, startY, renderableW, renderableH;
    if (imageAR < canvasAR) {
      renderableH = this._gl.canvas.height;
      renderableW = cols * (renderableH / rows);
      startX = (this._gl.canvas.width - renderableW) / 2;
      startY = 0;
    } else if (imageAR > canvasAR) {
      renderableW = this._gl.canvas.width;
      renderableH = rows * (renderableW / cols);
      startX = 0;
      startY = (this._gl.canvas.height - renderableH) / 2;
    } else {
      startX = 0;
      startY = 0;
      renderableW = this._gl.canvas.width;
      renderableH = this._gl.canvas.height;
    }
    return this.prepareRectVec2(
      -1.0 + (startX / this._canvas.width) * 2,
      -1.0 + (startY / this._canvas.height) * 2,
      -1.0 + ((startX + renderableW) / this._canvas.width) * 2,
      -1.0 + ((startY + renderableH) / this._canvas.height) * 2
    );
  }

  private render() {
    if (!this._gl || !this._buffer || !this._texBuffer || !this._texture)
      return;
    this.linkGPUAndCPU(this._buffer, "position");
    this.linkGPUAndCPU(this._texBuffer, "texCoords");
    this._gl.activeTexture(this._gl.TEXTURE0 + 0);
    this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
    this._gl.drawArrays(this._gl.TRIANGLES, 0, this._vertices.length / 2);
  }
}
