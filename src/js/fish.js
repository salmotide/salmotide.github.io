const mascot = document.querySelector("#oceanMascot");
const fish = document.querySelector("#pixelFish");
const sprite = document.querySelector("#fishSprite");
const bubble = document.querySelector("#fishBubble");
const closeButton = document.querySelector("#bubbleClose");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const state = {
  x: window.innerWidth * 0.65,
  y: window.innerHeight * 0.55,
  vx: 0,
  vy: 0,
  mouseX: null,
  mouseY: null,
  facing: 1,
  lastTime: 0,
  frame: 0
};

const SIZE = { width: 88, height: 64 };
const EDGE = 12;
const FOLLOW_DISTANCE = 180;
const ESCAPE_DISTANCE = 115;
const FOLLOW_SPEED = 1.1;
const ESCAPE_SPEED = 2.8;
const SMOOTHING = 0.045;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Track mouse movement, not scrolling.
window.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;

  state.mouseX = event.clientX;
  state.mouseY = event.clientY;
}, { passive: true });

window.addEventListener("resize", () => {
  state.x = clamp(
    state.x,
    EDGE,
    Math.max(EDGE, innerWidth - SIZE.width - EDGE)
  );

  state.y = clamp(
    state.y,
    EDGE,
    Math.max(EDGE, innerHeight - SIZE.height - EDGE)
  );
}, { passive: true });

function animate(time) {
  if (document.hidden) {
    state.frame = 0;
    return;
  }

  // Keep movement consistent across frame rates.
  const dt = state.lastTime
    ? Math.min((time - state.lastTime) / 16.67, 2)
    : 1;

  state.lastTime = time;

  if (!reducedMotion.matches) {
    const cx = state.x + SIZE.width / 2;
    const cy = state.y + SIZE.height / 2;

    let desiredVX = Math.sin(time * 0.0005) * 0.5;
    let desiredVY = Math.cos(time * 0.0007) * 0.35;

    if (state.mouseX !== null) {
      const dx = state.mouseX - cx;
      const dy = state.mouseY - cy;
      const distance = Math.hypot(dx, dy) || 1;

      if (distance < ESCAPE_DISTANCE) {
        // Too close: swim away from the cursor.
        desiredVX = -(dx / distance) * ESCAPE_SPEED;
        desiredVY = -(dy / distance) * ESCAPE_SPEED;
      } else if (distance > FOLLOW_DISTANCE) {
        // Far away: gently approach the cursor.
        desiredVX = (dx / distance) * FOLLOW_SPEED;
        desiredVY = (dy / distance) * FOLLOW_SPEED;
      } else {
        // Comfortable distance: drift naturally.
        desiredVX = Math.sin(time * 0.001) * 0.65;
        desiredVY = Math.cos(time * 0.0012) * 0.45;
      }
    }

    // Smooth acceleration instead of instant direction changes.
    state.vx += (desiredVX - state.vx) * SMOOTHING * dt;
    state.vy += (desiredVY - state.vy) * SMOOTHING * dt;

    state.x += state.vx * dt;
    state.y += state.vy * dt;

    // Keep the fish inside the viewport.
    const maxX = Math.max(
      EDGE,
      innerWidth - SIZE.width - EDGE
    );

    const maxY = Math.max(
      EDGE,
      innerHeight - SIZE.height - EDGE
    );

    if (state.x < EDGE || state.x > maxX) {
      state.x = clamp(state.x, EDGE, maxX);
      state.vx *= -0.5;
    }

    if (state.y < EDGE || state.y > maxY) {
      state.y = clamp(state.y, EDGE, maxY);
      state.vy *= -0.5;
    }

    // Face the direction of horizontal movement.
    if (Math.abs(state.vx) > 0.08) {
      state.facing = state.vx > 0 ? 1 : -1;
    }

    sprite.style.transform =
      `scaleX(${state.facing})`;
  }

  mascot.style.transform =
    `translate3d(${state.x}px, ${state.y}px, 0)`;

  state.frame = requestAnimationFrame(animate);
}

function startAnimation() {
  if (!state.frame && !document.hidden) {
    state.lastTime = 0;
    state.frame = requestAnimationFrame(animate);
  }
}

function stopAnimation() {
  if (state.frame) {
    cancelAnimationFrame(state.frame);
    state.frame = 0;
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAnimation();
  } else {
    startAnimation();
  }
});

// Click or keyboard activation toggles the message.
fish.addEventListener("click", () => {
  const willOpen = bubble.hidden;

  bubble.hidden = !willOpen;
  fish.setAttribute("aria-expanded", String(willOpen));
});

closeButton.addEventListener("click", () => {
  bubble.hidden = true;
  fish.setAttribute("aria-expanded", "false");
});

startAnimation();