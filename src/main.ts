import { CanvasEngine } from "./canvas-engine";
import { finishLoad, startLoad } from "./ui-control";
import { VideoLoader } from "./video-loader";

const FRAME = 20;
const STEP = 20;

const elm = document.getElementById("uploader");
const audioPlayer = document.getElementById("audio-player") as HTMLAudioElement;
const playButton = document.getElementById("play");
// const img = document.getElementById("output-img") as HTMLImageElement;

const videoLoader = new VideoLoader(FRAME, STEP);
const canvasEngine = new CanvasEngine();
let start: number | null;

elm?.addEventListener("change", async (e: Event) => {
  startLoad();
  const element = e.currentTarget as HTMLInputElement;
  const file = element.files![0];
  await videoLoader.loadFile(file);
  audioPlayer.src = URL.createObjectURL(
    new Blob([(await videoLoader.getAudio()).buffer])
  );
  const imgSrc = URL.createObjectURL(
    new Blob([videoLoader.getFrame(0)!.buffer])
  );
  canvasEngine.updateImage(imgSrc);
  finishLoad();
});

const step = (timestamp: number) => {
  if (!start) {
    start = timestamp;
  }
  const elapsed = timestamp - start;
  const time = Math.round((elapsed * FRAME) / 1000);
  console.log(time);
  const imgSrc = URL.createObjectURL(
    new Blob([videoLoader.getFrame(time)!.buffer])
  );
  canvasEngine.updateImage(imgSrc);
  window.requestAnimationFrame(step);
};

playButton?.addEventListener("click", () => {
  start = null;
  audioPlayer.play();
  window.requestAnimationFrame(step);
});

//   audioPlayer.currentTime = 0;

// get program
// requestAnimationFrame(() => {});
