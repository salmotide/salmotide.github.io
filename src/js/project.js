const projects = [
  {
    image: "src/img/projects/bot.webp",
    title: "Bot Project",
    description: "A WhatsApp bot for creating stickers and downloading music or videos from YouTube, TikTok, and Instagram.",
    github: "https://github.com/salmotide/SalBot",
    demo: "",
  },
  {
    image: "src/img/projects/desktop.webp",
    title: "Desktop Project",
    description: "A collection of the tools and setup I use on Linux.",
    github: "https://github.com/salmotide/linuxsetup",
    demo: "",
  },
  {
    image: "src/img/projects/ocstartpage.webp",
    title: "OC Startpage",
    description: "A personal start page designed to make everyday browsing easier and a little more enjoyable.",
    github: "https://github.com/salmotide/ocean-startpage",
    demo: "https://salmotide.github.io/ocean-startpage/",
  },
];

const projectGrid = document.querySelector("#project-grid");
const projectCarousel = document.querySelector("#project-carousel");
const previousProject = document.querySelector("#project-previous");
const nextProject = document.querySelector("#project-next");
const projectDialog = document.querySelector("#project-dialog");
const projectDialogClose = document.querySelector("#project-dialog-close");
const projectDialogImage = document.querySelector("#project-dialog-image");
const projectDialogTitle = document.querySelector("#project-dialog-title");
const projectDialogDescription = document.querySelector(
  "#project-dialog-description",
);
const projectDialogLinks = document.querySelector("#project-dialog-links");
let activeProjectIndex = 0;
let suppressCardClick = false;

function getRelativeOffset(index) {
  const count = projects.length;
  let offset = index - activeProjectIndex;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

function renderCarousel() {
  const cardWidth = projectGrid.firstElementChild?.getBoundingClientRect().width ?? 280;
  const step = Math.min(projectGrid.clientWidth * 0.49, cardWidth * 0.72, 360);

  [...projectGrid.children].forEach((card, index) => {
    const offset = getRelativeOffset(index);
    const distance = Math.abs(offset);
    const scale = distance === 0 ? 1 : Math.max(0.68, 0.86 - (distance - 1) * 0.12);
    const depth = distance === 0 ? 0 : -75 - (distance - 1) * 75;

    card.style.transform = `translate(-50%, -50%) translateX(${offset * step}px) translateZ(${depth}px) rotateY(${-offset * 12}deg) scale(${scale})`;
    card.style.opacity = distance > 2 ? "0" : String(1 - distance * 0.22);
    card.style.zIndex = String(20 - distance);
    card.style.pointerEvents = distance > 2 ? "none" : "auto";
    card.setAttribute("aria-pressed", String(distance === 0));
    card.dataset.active = String(distance === 0);
  });
}

function moveSelection(amount) {
  if (!projects.length) return;
  activeProjectIndex = (activeProjectIndex + amount + projects.length) % projects.length;
  renderCarousel();
}

function createProjectLink(label, url, className, icon = false) {
  if (!url) return null;

  const link = document.createElement("a");
  link.className = className;
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  if (icon) {
    const image = document.createElement("img");
    image.src = "src/img/icon/git.webp";
    image.alt = "";
    image.width = 22;
    image.height = 22;
    link.append(image, document.createTextNode(label));
    link.setAttribute("aria-label", label);
  } else {
    link.textContent = label;
  }

  return link;
}

function openProject(project) {
  projectDialogImage.src = project.image;
  projectDialogImage.alt = `${project.title} preview`;
  projectDialogTitle.textContent = project.title;
  projectDialogDescription.textContent = project.description;
  projectDialogLinks.replaceChildren();

  const githubLink = createProjectLink(
    "GitHub Repository",
    project.github,
    "project-link project-link--github",
    true,
  );
  const demoLink = createProjectLink(
    "Live Demo",
    project.demo,
    "project-link project-link--demo",
  );

  if (githubLink) projectDialogLinks.append(githubLink);
  if (demoLink) projectDialogLinks.append(demoLink);

  projectDialog.showModal();
  projectDialogClose.focus();
}

projects.forEach((project, index) => {
  const card = document.createElement("button");
  card.className = "project-card";
  card.type = "button";
  card.setAttribute("aria-label", `View ${project.title} details`);
  card.setAttribute("aria-pressed", "false");

  const image = document.createElement("img");
  image.src = project.image;
  image.alt = "";
  image.loading = "lazy";

  const caption = document.createElement("span");
  caption.className = "project-card__caption";

  const title = document.createElement("span");
  title.className = "project-card__title";
  title.textContent = project.title;

  caption.append(title);
  card.append(image, caption);
  card.addEventListener("click", () => {
    if (suppressCardClick) return;
    if (index !== activeProjectIndex) {
      activeProjectIndex = index;
      renderCarousel();
      return;
    }
    openProject(project);
  });
  projectGrid.append(card);
});

renderCarousel();

previousProject.addEventListener("click", () => moveSelection(-1));
nextProject.addEventListener("click", () => moveSelection(1));

projectCarousel.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveSelection(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    moveSelection(1);
  }
});

projectCarousel.addEventListener("wheel", (event) => {
  if (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
  event.preventDefault();
  moveSelection(event.deltaX > 0 || event.deltaY > 0 ? 1 : -1);
}, { passive: false });

let pointerStartX = null;
projectCarousel.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  pointerStartX = event.clientX;
});

projectCarousel.addEventListener("pointerup", (event) => {
  if (pointerStartX === null) return;
  const difference = event.clientX - pointerStartX;
  pointerStartX = null;
  if (Math.abs(difference) < 55) return;

  suppressCardClick = true;
  moveSelection(difference < 0 ? 1 : -1);
  window.setTimeout(() => { suppressCardClick = false; }, 350);
});

projectCarousel.addEventListener("pointercancel", () => { pointerStartX = null; });
window.addEventListener("resize", renderCarousel, { passive: true });

projectDialogClose.addEventListener("click", () => projectDialog.close());

projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});
