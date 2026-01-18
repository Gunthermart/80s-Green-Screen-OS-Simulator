# Drone Simulator Project Guide

## Project Overview
This project is a 3D drone simulator game built with Three.js where players control a drone to destroy tanks and avoid obstacles. The game features:

- 3D wireframe graphics with glowing effects
- Mobile and desktop controls
- Physics-based movement and explosions
- Multi-language support

## File Structure
- `index.html` - Main entry point containing all game code (HTML, CSS, JavaScript)
- `drone.png` - Favicon and icon for the application

## Rendering Technology
The game uses Three.js for 3D rendering with a wireframe aesthetic:
- WebGL rendering with perspective camera
- Dynamic lighting effects
- Physics-based animations
- Particle effects for explosions

## Game Mechanics
- **Objective:** Destroy yellow tanks by dropping bombs
- **Controls:** 
  - Desktop: Arrow keys for altitude/rotation, mouse for direction, spacebar/right-click for bombs
  - Mobile: Left joystick for altitude/rotation, right joystick for direction, red button for bombs
- **Obstacles:** Buildings, zeppelin
- **Game Over:** Triggered when drone crashes into buildings, tanks, or the zeppelin

## Visual Design
The game uses a modern wireframe aesthetic with:
- Glowing wireframe models using emissive materials
- Green-themed UI elements with teal accents
- Customized grid-based terrain
- Dynamic lighting and particle effects for explosions

## Common Development Tasks

### Modifying the Drone
The drone model is created in the `createDroneMesh()` function. To modify its appearance, adjust:
- Materials (color, wireframe, emissive properties)
- Geometry components (propellers, body, camera pod)
- Scale and proportions

### Adding Game Elements
New game elements (buildings, tanks, decorations) can be added in the `setupScene()` function:
- Buildings use various geometries (boxes, cylinders, cones)
- Tanks are created with the `createTankMesh()` function
- Decorative elements are added in `addDecorativeElements()`

### Modifying Game Physics
Drone movement physics are controlled in the animate function:
- `droneState` object contains velocity and damping properties
- Collision detection using THREE.Box3 bounding boxes
- Gravity and momentum simulation

### Enhancing Visual Effects
The game uses several visual effects that can be modified:
- Explosion effects in `createExplosion()` function
- Bomb trails in `createFallingBomb()`
- Zeppelin crash effects in `handleZeppelinCrash()`