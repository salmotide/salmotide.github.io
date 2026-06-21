const images = [
  "src/img/projects/bot.webp",
  "src/img/projects/desktop.webp",
  "src/img/projects/porto.webp",
];

const currentImg = document.querySelector(".curn");
const nextImg = document.querySelector(".next");

let currentIndex = 0;

function getRandomImage() {
  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * images.length);
  } while (randomIndex === currentIndex);

  currentIndex = randomIndex;
  return images[randomIndex];
}

function changeImage() {
  const newImage = getRandomImage();

  // 1. zoom current image first
  currentImg.classList.add("zoom");

  // 2. wait before revealing next image
  setTimeout(() => {
    nextImg.src = newImage;

    nextImg.classList.remove("show");
    void nextImg.offsetWidth;

    nextImg.classList.add("show");

    // 3. after circle transition finishes, update current image
    setTimeout(() => {
      currentImg.src = newImage;

      currentImg.classList.remove("zoom");
      nextImg.classList.remove("show");
    }, 1000);

  }, 600);
}

setInterval(changeImage, 4000);