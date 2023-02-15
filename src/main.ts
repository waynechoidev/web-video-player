import { VideoLoader } from "./VideoLoader";

const videoLoader = new VideoLoader();

const transcode = async (e: Event) => {
  const element = e.currentTarget as HTMLInputElement;
  const file = element.files![0];
  await videoLoader.loadFile(file);
  await videoLoader.extractFrame(1);

  const img = document.getElementById("output-img") as HTMLImageElement;
  img.src = URL.createObjectURL(new Blob([videoLoader.getFrame(140)!.buffer]));

  const audioPlayer = document.getElementById(
    "audio-player"
  ) as HTMLAudioElement;
  audioPlayer.src = URL.createObjectURL(
    new Blob([(await videoLoader.getAudio()).buffer])
  );
  audioPlayer.currentTime = 0;
  audioPlayer.play();
};
const elm = document.getElementById("uploader");
elm!.addEventListener("change", transcode);
