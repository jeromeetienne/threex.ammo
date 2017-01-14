.PHONY: build

build:
	cat ../examples/vendor/three.js/examples/js/libs/ammo.js ../threex*.js ./*.js > build/aframe-ammo.js 

minify: build
	uglifyjs build/aframe-ammo.js > build/aframe-ammo.min.js
