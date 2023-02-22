import { fragmentShader } from "./shader/fragment-shader";
import { vertexShader } from "./shader/vertex-shader";

export class CanvasEngine {
  private _vertices?: number[];
  private _textureCoordinates?: number[];
  private _canvas?: HTMLCanvasElement;
  private _gl?: WebGL2RenderingContext | null;

  private _program?: WebGLProgram | null;
  private _buffer?: WebGLBuffer | null;
  private _texBuffer?: WebGLBuffer | null;
  private _texture?: WebGLTexture | null;

  constructor() {}

  initialize(width: number, height: number) {
    this._vertices = this.prepareRectVec2(-1.0, -1.0, 1.0, 1.0);
    this._textureCoordinates = this.prepareRectVec2(0.0, 0.0, 1.0, 1.0);

    // get element
    this._canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this._canvas.width = width;
    this._canvas.height = height;

    // get context
    this._gl = this._canvas.getContext("webgl2");
    this._gl!.clearColor(0.0, 0.0, 0.0, 1.0);
    this._gl!.clear(this._gl!.DEPTH_BUFFER_BIT | this._gl!.COLOR_BUFFER_BIT);

    // get program
    const vs = this.getShader(vertexShader, this._gl!.VERTEX_SHADER);
    const fs = this.getShader(fragmentShader, this._gl!.FRAGMENT_SHADER);
    this._program = this._gl!.createProgram();
    if (!this._program || !vs || !fs) return;

    this._gl!.attachShader(this._program, vs);
    this._gl!.attachShader(this._program, fs);
    this._gl!.linkProgram(this._program);
    if (!this._gl!.getProgramParameter(this._program, this._gl!.LINK_STATUS)) {
      console.error(this._gl!.getProgramInfoLog(this._program));
    }
    this._gl!.useProgram(this._program);

    const uImage = this._gl!.getUniformLocation(this._program!, "uImage");
    this._gl!.uniform1i(uImage, 0);

    this._buffer = this.createAndBindBuffer(this._vertices);
    this._texBuffer = this.createAndBindBuffer(this._textureCoordinates);

    this._texture = this._gl!.createTexture();
    this._gl!.bindTexture(this._gl!.TEXTURE_2D, this._texture);
    this._gl!.activeTexture(this._gl!.TEXTURE0 + 0);

    this.linkGPUAndCPU(this._buffer!, "position");
    this.linkGPUAndCPU(this._texBuffer!, "texCoords");

    this._gl!.texParameteri(
      this._gl!.TEXTURE_2D,
      this._gl!.TEXTURE_MIN_FILTER,
      this._gl!.NEAREST
    );
  }

  updateImage(image: HTMLVideoElement) {
    this._gl!.texImage2D(
      this._gl!.TEXTURE_2D,
      0,
      this._gl!.RGBA,
      this._gl!.RGBA,
      this._gl!.UNSIGNED_BYTE,
      image
    );
    this._gl!.drawArrays(this._gl!.TRIANGLES, 0, this._vertices!.length / 2);
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

    this._gl?.shaderSource(shader!, shaderSource);
    this._gl?.compileShader(shader!);
    if (!this._gl?.getShaderParameter(shader!, this._gl?.COMPILE_STATUS)) {
      console.error(this._gl?.getShaderInfoLog(shader!));
    }
    return shader;
  }

  private createAndBindBuffer(data: number[]) {
    const buffer = this._gl!.createBuffer();
    this._gl!.bindBuffer(this._gl!.ARRAY_BUFFER, buffer);
    this._gl!.bufferData(
      this._gl!.ARRAY_BUFFER,
      new Float32Array(data),
      this._gl!.STATIC_DRAW
    );
    this._gl!.bindBuffer(this._gl!.ARRAY_BUFFER, null);
    return buffer;
  }

  private linkGPUAndCPU(buffer: WebGLBuffer, gpuVariable: string) {
    var position = this._gl!.getAttribLocation(this._program!, gpuVariable);
    this._gl!.enableVertexAttribArray(position);
    this._gl!.bindBuffer(this._gl!.ARRAY_BUFFER, buffer);
    this._gl!.vertexAttribPointer(position, 2, this._gl!.FLOAT, false, 0, 0);
    return position;
  }
}
