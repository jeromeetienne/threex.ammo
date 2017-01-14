//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////

AFRAME.registerSystem('ammo-world', {
	schema: {
	},
	init: function () {
                var ammoWorld = new THREEx.AmmoWorld()
		this.ammoWorld = ammoWorld
	},
	tick: function (now, delta) {
                this.ammoWorld.update()
	},
});

AFRAME.registerComponent('ammo-controls', {
        dependencies: ['ammo-world'],
	schema: {
	},
	init: function () {
                
                var ammoControls = new THREEx.AmmoControls(this.el.object3D)
		this.ammoControls = ammoControls

                var ammoWorld = this.el.sceneEl.systems['ammo-world'].ammoWorld
                ammoWorld.add(ammoControls)
	},
});
