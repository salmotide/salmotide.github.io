(() => {
  const sections = ["#about", "#project", "#contact"];
  const revealTargets = sections.flatMap((section) => {
    const sectionTargets = document.querySelectorAll(
      `${section} .eyebrow, ${section} h2, ${section} > div > p, ${section} .about-group, ${section} .project-carousel, ${section} .project-hint, ${section} .contact-links, ${section} .contact-social, ${section} .project-card`,
    );
    return [...sectionTargets];
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scroll-reveal--visible");
        } else {
          entry.target.classList.remove("scroll-reveal--visible");
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
  );

  revealTargets.forEach((target, index) => {
    target.classList.add("scroll-reveal");
    target.style.setProperty("--reveal-delay", `${(index % 6) * 65}ms`);
    observer.observe(target);
  });
})();
