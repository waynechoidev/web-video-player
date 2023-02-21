export const sanitizeSeconds = (num: number) => {
  const minutes = Math.round(num / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.round(num % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};
