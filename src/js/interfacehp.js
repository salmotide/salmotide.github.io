const contactProfiles = [
  { name: "Gmail", value: "mailto:salomowijaya28@gmail.com", type: "email", mark: "@" },
  { name: "GitHub", value: "https://github.com/salmotide", type: "url", icon: "src/img/icon/git.webp" },
  { name: "YouTube", value: "https://www.youtube.com/@salmotide", type: "url", icon: "src/img/icon/yt.webp" },
  { name: "Instagram", value: "https://www.instagram.com/salmotide/", type: "url", icon: "src/img/icon/ig.webp" },
  { name: "TikTok", value: "https://www.tiktok.com/@salmotide", type: "url", icon: "src/img/icon/tt.webp" },
];

const contactLinks = document.querySelector("#contact-links");

contactProfiles.forEach((profile) => {
  const isConfigured = Boolean(profile.value);
  const item = document.createElement(isConfigured ? "a" : "span");
  item.className = `contact-social${isConfigured ? "" : " contact-social--inactive"}`;

  if (isConfigured) {
    item.href = profile.type === "email" ? `mailto:${profile.value}` : profile.value;
    if (profile.type === "url") {
      item.target = "_blank";
      item.rel = "noopener noreferrer";
    }
  } else {
    item.setAttribute("aria-disabled", "true");
    item.title = `Add your ${profile.name} address in src/js/interfacehp.js`;
  }

  const icon = document.createElement("span");
  icon.className = "contact-social__icon";

  if (profile.icon) {
    const image = document.createElement("img");
    image.src = profile.icon;
    image.alt = "";
    icon.append(image);
  } else {
    icon.textContent = profile.mark;
  }

  const label = document.createElement("span");
  label.textContent = profile.name;
  item.append(icon, label);
  contactLinks.append(item);
});

const sectionObserver = new IntersectionObserver((entries) => {
  const visibleSections = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

  if (!visibleSections.length) return;
  const currentId = visibleSections[0].target.id;

  document.querySelectorAll(".side-nav a[href^='#']").forEach((link) => {
    const isCurrent = link.hash === `#${currentId}`;
    link.classList.toggle("is-current", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}, { threshold: [0.25, 0.5, 0.75] });

document.querySelectorAll("main > section[id]").forEach((section) => {
  sectionObserver.observe(section);
});
