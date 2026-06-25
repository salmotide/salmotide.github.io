const images = [
  "src/img/projects/ocstartpage.webp",
  "src/img/projects/bot.webp",
  "src/img/projects/desktop.webp",
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

const interval = setInterval(changeImage, 4000);

function stopSlider() {
  clearInterval(interval);

  currentImg.style.animation = "none";
  nextImg.style.animation = "none";

  currentImg.classList.remove("zoom");
  nextImg.classList.remove("show");
}