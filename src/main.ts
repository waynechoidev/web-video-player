import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";

// constant.ts
const FRAME = 30;
const STEP = 5;

let ffmpeg: FFmpeg | null = null;

const transcode = async (e: Event) => {
  if (ffmpeg === null) {
    ffmpeg = createFFmpeg({ log: true });
  }
  const message = document.getElementById("message")!;
  const element = e.currentTarget as HTMLInputElement;
  const file = element.files![0];
  const { name } = file;

  const duration = await getDuration(file);

  message.innerHTML = "Loading ffmpeg-core.js";
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
  ffmpeg.FS("writeFile", name, await fetchFile(file));
  message.innerHTML = "Start transcoding";
  await ffmpeg.run(
    "-i",
    name,
    "-t",
    STEP.toString(),
    "-r",
    FRAME.toString(),
    "-f",
    "image2",
    "frames%d.png"
  );
  message.innerHTML = "Start Getting Audio";
  await ffmpeg.run("-i", name, "-vn", "-acodec", "copy", "audio.aac");
  message.innerHTML = "Complete transcoding";

  const data = ffmpeg.FS("readFile", "frames20.png");
  const frames: (Uint8Array | null)[] = new Array().fill(null);
  for (let i = 0; i < 10 * 30; i++) {
    frames.push(ffmpeg.FS("readFile", `frames${i + 1}.png`));
  }

  console.log(frames);
  const soundData = ffmpeg.FS("readFile", "audio.aac");

  const img = document.getElementById("output-img") as HTMLImageElement;
  img.src = URL.createObjectURL(new Blob([data.buffer]));

  const audioPlayer = document.getElementById(
    "audio-player"
  ) as HTMLAudioElement;
  audioPlayer.src = URL.createObjectURL(new Blob([soundData.buffer]));
  audioPlayer.currentTime = 0;
  audioPlayer.play();
};
const elm = document.getElementById("uploader");
elm!.addEventListener("change", transcode);

async function getDuration(file: File) {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.src = URL.createObjectURL(file);

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };
  });
}
