document.querySelectorAll("#home > .cursor, #about > .cursor, #project > .cursor").forEach((canvas) => {
  if (typeof fluidSimulation === "function") {
    fluidSimulation(canvas);
  }
});
