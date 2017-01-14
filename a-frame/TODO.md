- fix issue with initial rotation/position/scale

- DONE put ammo.js as /vendor/ammo.js
  - this is a dependancy which should not live in three.js
- DONE add the stepSimulation in ammoworld
- DONE fix issue with shape scaling
  - aframe always include a group first, it confuse when picking the geometry
- DONE maybe issue with buffergeometry too
  - yes, boost the parse to include buffergeometry parameters
  - do a geometry identifier, which provide "SphereGeometry" + parameters
