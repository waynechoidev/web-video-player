const player = document.getElementById("player");
const spinner = document.getElementById("spinner");

export const startLoad = () => {
  player!.hidden = true;
  spinner!.hidden = false;
};

export const finishLoad = () => {
  player!.hidden = false;
  spinner!.hidden = true;
};
