import { CanvasEngine } from "./canvas-engine";
import { finishLoad, startLoad } from "./ui-control";
import { VideoLoader } from "./video-loader";

const elm = document.getElementById("uploader");
const audioPlayer = document.getElementById("audio-player") as HTMLAudioElement;
const playButton = document.getElementById("play");
// const img = document.getElementById("output-img") as HTMLImageElement;

const videoLoader = new VideoLoader();
const canvasEngine = new CanvasEngine();
let time = 0;

elm?.addEventListener("change", async (e: Event) => {
  startLoad();
  const element = e.currentTarget as HTMLInputElement;
  const file = element.files![0];
  await videoLoader.loadFile(file);
  audioPlayer.src = URL.createObjectURL(
    new Blob([(await videoLoader.getAudio()).buffer])
  );
  const imgSrc = URL.createObjectURL(
    new Blob([videoLoader.getFrame(50)!.buffer])
  );
  canvasEngine.updateImage(imgSrc);
  finishLoad();
});

const step = () => {
  const imgSrc = URL.createObjectURL(
    new Blob([videoLoader.getFrame(time)!.buffer])
  );
  canvasEngine.updateImage(imgSrc);
  time++;
  window.requestAnimationFrame(step);
};

playButton?.addEventListener("click", () => {
  audioPlayer.play();
  window.requestAnimationFrame(step);
});

//   audioPlayer.currentTime = 0;

// get program
// requestAnimationFrame(() => {});
