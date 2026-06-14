# Salmotide Ocean Desktop Portfolio

An interactive portfolio website built with **React**, **TypeScript**, and **Vite**.

This project is not just a normal scrolling portfolio. It is designed like a small desktop world where users can open draggable windows, interact with a mini character, and enter a game-like world map.

## Features

* Interactive desktop-style portfolio
* Draggable window system
* Home window as the main welcome screen
* Separate windows for About, Projects, and Contact
* Mini pixel character with movement animation
* Portal system to enter the world scene
* World map scene with camera movement
* Character movement using keyboard controls
* Collision system for blocked areas
* Ocean-themed visual style

## Tech Stack

* React
* TypeScript
* Vite
* CSS Modules
* CSS
* GitHub Pages

## Controls

### Desktop Scene

| Key / Action                  | Function               |
| ----------------------------- | ---------------------- |
| Click dock buttons            | Open portfolio windows |
| Drag window header            | Move window            |
| Click `x`                     | Close window           |
| Move character to portal area | Show enter prompt      |
| Press `E`                     | Enter world            |

### World Scene

| Key               | Function        |
| ----------------- | --------------- |
| `W` / Arrow Up    | Move up         |
| `A` / Arrow Left  | Move left       |
| `S` / Arrow Down  | Move down       |
| `D` / Arrow Right | Move right      |
| `Esc`             | Back to desktop |

## Project Structure

```txt
src/
├─ assets/
│  ├─ hatsu/
│  │  ├─ idle-front.gif
│  │  ├─ idle-back.gif
│  │  ├─ idle-left.gif
│  │  ├─ idle-right.gif
│  │  ├─ run-front.gif
│  │  ├─ run-back.gif
│  │  ├─ run-left.gif
│  │  ├─ run-right.gif
│  │  └─ click.gif
│  └─ world/
│     └─ map.png
│
├─ components/
│  ├─ DesktopWindow.tsx
│  ├─ minihatsu.tsx
│  └─ world/
│     ├─ WorldScene.tsx
│     ├─ WorldHatsu.tsx
│     ├─ WorldScene.module.css
│     ├─ worldConfig.ts
│     └─ worldUtils.ts
│
├─ hooks/
│  └─ useDragWindow.ts
│
├─ App.tsx
├─ App.css
├─ index.css
└─ main.tsx
```

## Installation

Clone the repository:

```bash
git clone https://github.com/salmotide/salmotide.github.io.git
cd salmotide.github.io
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local server shown in the terminal, usually:

```txt
http://localhost:5173/
```

## Build

To build the project:

```bash
npm run build
```

The output will be generated in:

```txt
dist/
```

## Deployment

This project can be deployed to GitHub Pages.

Build first:

```bash
npm run build
```

Then deploy the `dist` output using your GitHub Pages setup.

If this repository is named:

```txt
salmotide.github.io
```

use this in `vite.config.ts`:

```ts
base: "/"
```

If this repository uses another name, for example:

```txt
portfolio
```

use:

```ts
base: "/portfolio/"
```

## Current Development Plan

* [x] Create React + TypeScript project
* [x] Build desktop-style portfolio layout
* [x] Add draggable windows
* [x] Add mini character
* [x] Add world scene
* [x] Add map image background
* [x] Add camera follow system
* [x] Add basic collision system
* [ ] Add multiple openable places
* [ ] Add village interior map
* [ ] Add cave interior map
* [ ] Add project cards inside world locations
* [ ] Add sound effects
* [ ] Improve mobile controls

## Concept

The main idea of this project is to make a portfolio that feels alive.

Instead of only showing information through a normal webpage, this portfolio uses a desktop interface and a small explorable world. The visitor can open windows, move a character, and discover sections of the portfolio through interaction.

## Author

Created by **Salmotide**.

A student, Linux user, and web development learner who enjoys ocean-themed UI, interactive design, and game-like web experiences.

