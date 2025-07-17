# Retro Hacker Terminal OS

**A multi-window, retro-themed OS simulator inspired by 90s hacker movies and the Amiga demoscene.**  
This project is built with pure HTML, CSS, and JavaScript, using three.js for 3D rendering.

---

## Description

This web application simulates a fictional retro operating system with a green-on-black, CRT screen aesthetic. It features a dynamic, multi-window environment where each window runs a separate, continuous animation. The entire interface is responsive and includes several classic visual effects reminiscent of the golden age of computing.

---

## Features

### Background & Global Effects

- **Starfield Background**: A dynamic, rotating 3D starfield gives the impression of traveling through cyberspace.
- **Wavy 'HACKER' Scroller**: A sinusoidal text scroller at the top of the screen.
- **Crypto Ticker**: A bottom-of-the-screen ticker that simulates real-time cryptocurrency price fluctuations.
- **Draggable Windows**: All windows can be moved around the desktop and re-stacked by clicking on them.
- **Responsive Design**: The layout automatically switches to a single-column view on smaller screens for better usability.

### Interactive Windows

The OS features 8 distinct windows, each with its own unique animation or function:

- `C:\DATA.STREAM`: A vertical text scroller, simulating a data transfer log.
- `A:\SYSTEM.STATUS`: A system monitor that displays simulated, fluctuating values for CPU, memory, network, and temperature.
- `B:\DECRYPT.EXE`: A brute-force decryption simulator that rapidly cycles through random characters before finding a "key".
- `D:\MATRIX.RUN`: A classic digital rain effect, inspired by *The Matrix*.
- `E:\TORUS_KNOT.SYS`: A 3D wireframe model of a rotating Torus Knot, rendered with three.js.
- `F:\RADAR.SCAN`: A radar screen with a rotating sweep and random "blips".
- `G:\INVADERS.EXE`: An auto-playing simulation of the classic arcade game, *Space Invaders*.
- `H:\TECH.DEMO`: A classic demoscene "twister" effect applied to a text string, creating a wavy, distorted animation.

---

## How to Run

Simply open the `index.html` file in any modern web browser.  
All dependencies are loaded from a CDN, so no local server is required.

---

## Technologies Used

- HTML5  
- CSS3 *(with keyframe animations and media queries for responsiveness)*  
- JavaScript (ES6)  
- Three.js for 3D graphics *(Torus Knot)*


