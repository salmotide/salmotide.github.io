document.querySelectorAll("#home > .cursor, #about > .cursor, #project > .cursor").forEach((canvas) => {
  if (typeof fluidSimulation === "function") {
    fluidSimulation(canvas, {
      autoCursor: false,
      initialSplat: canvas.matches("#home > .cursor"),
    });
  }
});
