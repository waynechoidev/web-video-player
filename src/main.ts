import { CanvasEngine } from "./canvas-engine";

const elm = document.getElementById("uploader") as HTMLInputElement;
const video = document.createElement("video");
// const audioPlayer = document.getElementById("audio-player") as HTMLAudioElement;
const playButton = document.getElementById("play") as HTMLButtonElement;
playButton!.disabled = true;
const stopButton = document.getElementById("stop") as HTMLButtonElement;
stopButton!.disabled = true;
const playTime = document.getElementById("play-time");
playTime!.innerHTML = "00:00 / 00:00";

// const videoLoader = new VideoLoader(FRAME, STEP);
const canvasEngine = new CanvasEngine();

elm?.addEventListener("change", () => {
  // startLoad()
  const file = elm.files![0];
  if (file) {
    const url = URL.createObjectURL(file);
    video.src = url;
    video.preload = "metadata";
    video.load();
    video.addEventListener("loadedmetadata", () => {
      const video_ratio = video.videoWidth / video.videoHeight;
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.5;
      const max_ratio = maxWidth / maxHeight;

      let width: number;
      let height: number;

      if (video_ratio > max_ratio) {
        width = maxWidth;
        height = maxWidth / video_ratio;
      } else {
        height = maxHeight;
        width = maxHeight * video_ratio;
      }

      canvasEngine.initialize(width, height);
    });
  }
  video.crossOrigin = "anonymous";
  video.autoplay = true;
  stopButton!.disabled = false;
  step();
});

function step() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvasEngine.updateImage(video);
  }

  requestAnimationFrame(step);
}

playButton?.addEventListener("click", () => {
  video.play();
  playButton!.disabled = true;
  stopButton!.disabled = false;
});

stopButton?.addEventListener("click", () => {
  video.pause();
  playButton!.disabled = false;
  stopButton!.disabled = true;
});

function updateTime() {
  const curTime = video.currentTime;
  const totalTime = video.duration;
  const curTimeString = formatTime(curTime);
  const totalTimeString = formatTime(totalTime);
  playTime!.innerHTML = `${curTimeString} / ${totalTimeString}`;
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutesString}:${secondsString}`;
}

video.addEventListener("timeupdate", updateTime);
