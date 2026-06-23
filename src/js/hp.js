const hpui = `
<div id="hp-mobile">
  <div class="header">
    <h1>Desktop Only first still progress for ui HandPhone</h1>
  </div>
</div>
`;

function initHpMobile() {
  const existing = document.getElementById("hp-mobile");
  const isMobile = window.matchMedia("(max-width: 800px)").matches;

  if (isMobile) {
    if (!existing) {
      document.body.insertAdjacentHTML("afterbegin", hpui);
    }
  } else if (existing) {
    existing.remove();
  }
}

initHpMobile();
window.addEventListener("resize", initHpMobile);