
var THREEx = THREEx || {}

THREEx.AmmoVehicleControls = function(object3d){
	this.object3d = object3d
	
	this.offsetCamera = new THREE.Vector3(0,2,-6).setLength(10)
	this.lookatCamera = new THREE.Vector3(0,0,+4)
	
	this.tweenOffset = 0.1
	this.tweenLookAt = 0.1
	
	this._currentOffset = null
	this._currentLookat = null

}

THREEx.AmmoVehicleControls.prototype.update = function(ammoVehicle){
	var object3dVehicle = ammoVehicle.object3d.getObjectByName('chassis')	

	var offsetCamera = this.offsetCamera.clone()
	object3dVehicle.localToWorld(offsetCamera)
	
	if( this._currentOffset === null ){
		this._currentOffset = offsetCamera.clone()
	}else{
		this._currentOffset.multiplyScalar(1-this.tweenOffset)
			.add(offsetCamera.clone().multiplyScalar(this.tweenOffset))
	}

	this.object3d.position.copy(this._currentOffset)


	var lookatCamera = this.lookatCamera.clone()
	object3dVehicle.localToWorld(lookatCamera)
	if( this._currentLookat === null ){
		this._currentLookat = lookatCamera.clone()
	}else{
		this._currentLookat.multiplyScalar(1-this.tweenLookAt)
			.add(lookatCamera.clone().multiplyScalar(this.tweenLookAt))
	}

	this.object3d.lookAt(this._currentLookat)
}
