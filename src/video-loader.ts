import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";

export class VideoLoader {
  private readonly FRAME: number = 30;
  private readonly STEP: number = 5;

  private _ffmpeg: FFmpeg;
  private _file?: File;
  private _name: string = "";
  private _totalDuration: number = 0;
  private _frames?: (Uint8Array | null)[];

  constructor() {
    this._ffmpeg = createFFmpeg({ log: true });
  }

  async loadFile(file: File) {
    this._file = file;
    this._name = this._file.name;

    this._totalDuration = await this.getDuration();
    this._frames = new Array(this.FRAME * this._totalDuration).fill(null);

    if (!this._ffmpeg.isLoaded()) {
      await this._ffmpeg.load();
    }

    await this.extractFrame(0);
  }

  async extractFrame(index: number) {
    if (!this._frames) return;

    const start = index * this.STEP;
    const duration =
      this._totalDuration - start < this.STEP
        ? this._totalDuration - start
        : this.STEP;
    const startNumber = start * this.FRAME;

    this._ffmpeg.FS("writeFile", this._name, await fetchFile(this._file));

    await this._ffmpeg.run(
      "-i",
      this._name, // path
      "-ss",
      start.toString(), // start time
      "-t",
      duration.toString(), // duration
      "-start_number",
      startNumber.toString(), // start number
      "-r",
      this.FRAME.toString(), // frame rate
      "-f",
      "image2", // file format
      "frames%d.png" // file name pattern
    );
    for (let i = startNumber; i < startNumber + this.FRAME * this.STEP; i++) {
      this._frames[i] = this._ffmpeg.FS("readFile", `frames${i}.png`);
    }
  }

  getFrame(index: number) {
    if (!this._frames) return;
    return this._frames[index];
  }

  async getAudio() {
    await this._ffmpeg.run(
      "-i",
      this._name,
      "-vn",
      "-acodec",
      "copy",
      "audio.aac"
    );
    return this._ffmpeg.FS("readFile", "audio.aac");
  }

  private async getDuration(): Promise<number> {
    if (!this._file) return 0;

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(this._file);

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };
    });
  }
}
