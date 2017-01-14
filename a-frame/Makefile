.PHONY: build

build:
	cat ../vendor/ammo.js ../threex*.js ./*.js > build/aframe-ammo.js 

minify: build
	uglifyjs build/aframe-ammo.js > build/aframe-ammo.min.js
