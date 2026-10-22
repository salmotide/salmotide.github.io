const typedRole = document.querySelector("#typed-role");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const roles = ["Front-end developer", "Back-end developer", "Web developer"];

if (typedRole && !prefersReducedMotion.matches) {
  let roleIndex = 0;
  let letterIndex = roles[0].length;
  let deleting = true;

  function typeNext() {
    const currentRole = roles[roleIndex];
    typedRole.textContent = currentRole.slice(0, letterIndex);

    if (deleting) {
      letterIndex -= 1;
      if (letterIndex < 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        letterIndex = 0;
        window.setTimeout(typeNext, 280);
        return;
      }
    } else {
      letterIndex += 1;
      if (letterIndex > roles[roleIndex].length) {
        deleting = true;
        letterIndex = roles[roleIndex].length;
        window.setTimeout(typeNext, 1500);
        return;
      }
    }

    window.setTimeout(typeNext, deleting ? 55 : 95);
  }

  window.setTimeout(typeNext, 1800);
}
