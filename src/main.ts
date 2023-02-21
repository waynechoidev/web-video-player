import { CanvasEngine } from "./canvas-engine";
import { finishLoad, startLoad } from "./ui-control";
import { sanitizeSeconds } from "./utils";
import { VideoLoader } from "./video-loader";

const FRAME = 20;
const STEP = 5;

const elm = document.getElementById("uploader");
const audioPlayer = document.getElementById("audio-player") as HTMLAudioElement;
const playButton = document.getElementById("play");
const stopButton = document.getElementById("stop");
const playTime = document.getElementById("play-time");
playTime!.innerHTML = "00:00 / 00:00";

const videoLoader = new VideoLoader(FRAME, STEP);
const canvasEngine = new CanvasEngine();
let startTimeStamp: number | null;
let startFrame = 0;
let index = 0;
let requestId: number | null;

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
  playTime!.innerHTML = `00:00 / ${videoLoader.getTotalDuration()}`;
  extractFrames(1, videoLoader.getCount());
});

const step = (timestamp: number) => {
  if (!startTimeStamp) {
    startTimeStamp = timestamp;
  }
  const elapsed = timestamp - startTimeStamp;
  index = startFrame + Math.round((elapsed * FRAME) / 1000);
  playTime!.innerHTML = `${sanitizeSeconds(
    index / FRAME
  )} / ${videoLoader.getTotalDuration()}`;

  const frame = videoLoader.getFrame(index);
  if (frame) {
    const imgSrc = URL.createObjectURL(new Blob([frame!.buffer]));
    canvasEngine.updateImage(imgSrc);
  } else {
    return stop();
  }

  requestId = requestAnimationFrame(step);
};

playButton?.addEventListener("click", () => {
  startTimeStamp = null;
  audioPlayer.currentTime = startFrame / FRAME;
  audioPlayer.play();
  requestId = requestAnimationFrame(step);
});

stopButton?.addEventListener("click", () => {
  stop();
});

function stop() {
  cancelAnimationFrame(requestId!);
  audioPlayer.pause();
  startFrame = index;
  console.log("stop");
}

async function extractFrames(start: number, end: number) {
  if (start > end) return;

  await videoLoader.extractFrame(start);
  await extractFrames(start + 1, end);
}
