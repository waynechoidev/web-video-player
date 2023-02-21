import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";

export class VideoLoader {
  private _frame: number;
  private _step: number;

  private _ffmpeg: FFmpeg;
  private _file?: File;
  private _name: string = "";
  private _totalDuration: number = 0;
  private _frames?: (Uint8Array | null)[];

  constructor(frame: number, step: number) {
    this._frame = frame;
    this._step = step;
    this._ffmpeg = createFFmpeg({ log: true });
  }

  async loadFile(file: File) {
    this._file = file;
    this._name = this._file.name;

    this._totalDuration = await this.getDuration();
    this._frames = new Array(this._frame * this._totalDuration).fill(null);

    if (!this._ffmpeg.isLoaded()) {
      await this._ffmpeg.load();
    }

    this._ffmpeg.FS("writeFile", this._name, await fetchFile(this._file));
    // this._ffmpeg.FS("writeFile", `_${this._name}`, await fetchFile(this._file));
    // this._ffmpeg.run("-i", `_${this._name}`, "-vf", "scale=144:-2", this._name);

    await this.extractFrame(0);
  }

  async extractFrame(index: number) {
    if (!this._frames) return;

    const start = index * this._step;
    const duration =
      this._totalDuration - start < this._step
        ? this._totalDuration - start
        : this._step;
    const startNumber = start * this._frame;

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
      this._frame.toString(), // frame rate
      "-f",
      "image2", // file format
      "frames%d.png" // file name pattern
    );
    for (let i = startNumber; i < startNumber + this._frame * this._step; i++) {
      this._frames[i] = this._ffmpeg.FS("readFile", `frames${i}.png`);
    }
  }

  getFrame(index: number) {
    return this._frames![index];
  }

  getCount() {
    return this._totalDuration / this._step - 1;
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
