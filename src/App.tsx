import { useState } from "react";
import "./App.css";

import MiniHatsu from "./components/minihatsu";
import DesktopWindow from "./components/DesktopWindow";
import WorldScene from "./components/world/WorldScene";
import useDragWindow from "./hooks/useDragWindow";

type WindowId = "about" | "projects" | "contact";

const windowContent = {
  about: {
    title: "About Me",
    label: "Student ~ Builder ~ Explorer",
    heading: "I like making things feel alive.",
    body: "I am learning web development, Linux customization, and interactive UI. This portfolio is not just a page. It is my small digital world.",
    position: { x: 600, y: 140 },
  },
  projects: {
    title: "Projects",
    label: "Things I build",
    heading: "My Projects",
    body: "Ocean Startpage, Todo CLI, Portfolio Desktop, and this interactive world system. More projects will be added here later.",
    position: { x: 680, y: 220 },
  },
  contact: {
    title: "Contact",
    label: "Find me here",
    heading: "Let's Connect",
    body: "You can add your GitHub, email, Instagram, or other links here later.",
    position: { x: 760, y: 300 },
  },
};

function App() {
  const [scene, setScene] = useState<"desktop" | "world">("desktop");
  const [openWindows, setOpenWindows] = useState<WindowId[]>([]);
  const [closingWindows, setClosingWindows] = useState<WindowId[]>([]);
  const welcomeWindow = useDragWindow({ x: 110, y: 110 });

  if (scene === "world") {
    return <WorldScene onExit={() => setScene("desktop")} />;
  }

  const openWindow = (windowId: WindowId) => {
    setClosingWindows((current) => current.filter((id) => id !== windowId));
    setOpenWindows((current) => {
      if (current.includes(windowId)) return current;
      return [...current, windowId];
    });
  };

  const closeWindow = (windowId: WindowId) => {
    setClosingWindows((current) => {
      if (current.includes(windowId)) return current;
      return [...current, windowId];
    });
  };

  const removeWindow = (windowId: WindowId) => {
    setOpenWindows((current) => current.filter((id) => id !== windowId));
    setClosingWindows((current) => current.filter((id) => id !== windowId));
  };

  return (
    <main className="desktop">
      <nav className="dock">
        <button type="button">Home</button>
        <button type="button" onClick={() => openWindow("about")}>
          About
        </button>
        <button type="button" onClick={() => openWindow("projects")}>
          Projects
        </button>
        <button type="button" onClick={() => openWindow("contact")}>
          Contact
        </button>
      </nav>

      <DesktopWindow
        title="Welcome"
        initialPosition={{ x: 110, y: 110 }}
        canClose={false}
        dragState={welcomeWindow}
      >
        <p className="label">Web Developer ~ Linux User ~ Ocean UI Builder</p>
        <h1>Hi, I&apos;m Salmotide</h1>
        <p>
          I build clean, ocean-themed web projects with interactive UI and
          playful ideas.
        </p>
      </DesktopWindow>

      {openWindows.map((windowId) => {
        const content = windowContent[windowId];
        const isClosing = closingWindows.includes(windowId);

        return (
          <DesktopWindow
            key={windowId}
            title={content.title}
            initialPosition={content.position}
            onClose={() => closeWindow(windowId)}
            isClosing={isClosing}
            onCloseAnimationEnd={() => removeWindow(windowId)}
          >
            <p className="label">{content.label}</p>
            <h1>{content.heading}</h1>
            <p>{content.body}</p>
          </DesktopWindow>
        );
      })}

      <MiniHatsu
        windowRef={welcomeWindow.windowRef}
        windowPosition={welcomeWindow.windowPosition}
        setWindowPosition={welcomeWindow.setWindowPosition}
        onEnterWorld={() => setScene("world")}
      />
    </main>
  );
}

export default App;
