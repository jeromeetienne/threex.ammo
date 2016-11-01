"use strict";

var THREEx = THREEx || {}

THREEx.AmmoVehicle = function(ammoWorld, pos, quat){
	var _this = this
	this.actions = {
		'acceleration' : false,
		'braking' : false,
		'left' : false,
		'right': false,
	}
	this.object3d = new THREE.Group
	
	
	// - Global variables -
	var DISABLE_DEACTIVATION = 4;
	var TRANSFORM_AUX = new Ammo.btTransform();
	var ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);

	// Graphics variables
        var materialInteractive = new THREE.MeshPhongMaterial()


	// Vehicle contants
	var chassisWidth = 1.8;
	var chassisHeight = .6;
	var chassisLength = 4;
	var massVehicle = 800;

	var wheelAxisPositionBack = -1.4;
	var wheelHalfTrackBack = 1;
	var wheelAxisHeightBack = .3;
	var wheelRadiusBack = .6;
	var wheelWidthBack = .3;

	var wheelAxisPositionFront = 1.4;
	var wheelHalfTrackFront = 1;
	var wheelAxisHeightFront = .3;
	var wheelRadiusFront = .35;
	var wheelWidthFront = .2;

	var friction = 1000;
	var suspensionStiffness = 20.0;
	var suspensionDamping = 2.3;
	var suspensionCompression = 4.4;
	var suspensionRestLength = 0.6;
	var rollInfluence = 0.2;

	var steeringIncrement = .04;
	var steeringClamp = .5;
	var maxEngineForce = 2000;
	var maxBreakingForce = 100;

	// Chassis
	var geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
	var transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	var motionState = new Ammo.btDefaultMotionState(transform);
	var localInertia = new Ammo.btVector3(0, 0, 0);
	geometry.calculateLocalInertia(massVehicle, localInertia);
	var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia));
	body.setActivationState(DISABLE_DEACTIVATION);
	ammoWorld.physicsWorld.addRigidBody(body);
	var chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);

	// Raycast Vehicle
	var engineForce = 0;
	var vehicleSteering = 0;
	var breakingForce = 0;
	var tuning = new Ammo.btVehicleTuning();
	var rayCaster = new Ammo.btDefaultVehicleRaycaster(ammoWorld.physicsWorld);
	var vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
	this.vehicle = vehicle
	vehicle.setCoordinateSystem(0, 1, 2);
	ammoWorld.physicsWorld.addAction(vehicle);

	// Wheels
	var FRONT_LEFT = 0;
	var FRONT_RIGHT = 1;
	var BACK_LEFT = 2;
	var BACK_RIGHT = 3;
	var wheelMeshes = [];
	var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
	var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

	addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisPositionFront), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
	addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisPositionFront), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
	addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
	addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);
        
	onRenderFcts.push(update);

        return

	// Sync keybord actions and physics and graphics
	function update() {

		var speed = vehicle.getCurrentSpeedKmHour();
		breakingForce = 0;
		engineForce = 0;

		if (_this.actions.acceleration) {
			if (speed < -1)
				breakingForce = maxBreakingForce;
			else engineForce = maxEngineForce;
		}
		if (_this.actions.braking) {
			if (speed > 1)
				breakingForce = maxBreakingForce;
			else engineForce = -maxEngineForce / 2;
		}
		if (_this.actions.left) {
			if (vehicleSteering < steeringClamp)
				vehicleSteering += steeringIncrement;
		}
		else {
			if (_this.actions.right) {
				if (vehicleSteering > -steeringClamp)
					vehicleSteering -= steeringIncrement;
			}
			else {
				if (vehicleSteering < -steeringIncrement)
					vehicleSteering += steeringIncrement;
				else {
					if (vehicleSteering > steeringIncrement)
						vehicleSteering -= steeringIncrement;
					else {
						vehicleSteering = 0;
					}
				}
			}
		}

		vehicle.applyEngineForce(engineForce, BACK_LEFT);
		vehicle.applyEngineForce(engineForce, BACK_RIGHT);

		vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
		vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
		vehicle.setBrake(breakingForce, BACK_LEFT);
		vehicle.setBrake(breakingForce, BACK_RIGHT);

		vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
		vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);

		var nWheels = vehicle.getNumWheels();
		for (var i = 0; i < nWheels; i++) {
			vehicle.updateWheelTransform(i, true);
			var transform = vehicle.getWheelTransformWS(i);
			var position = transform.getOrigin();
			var quaternion = transform.getRotation();
			wheelMeshes[i].position.set(position.x(), position.y(), position.z());
			wheelMeshes[i].quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
		}

		var transform = vehicle.getChassisWorldTransform();
		var position = transform.getOrigin();
		var quaternion = transform.getRotation();
		chassisMesh.position.set(position.x(), position.y(), position.z());
		chassisMesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
	}

	function addWheel(isFront, pos, radius, width, index) {
		var wheelInfo = vehicle.addWheel(
				pos,
				wheelDirectionCS0,
				wheelAxleCS,
				suspensionRestLength,
				radius,
				tuning,
				isFront);

		wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
		wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
		wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
                
		wheelInfo.set_m_frictionSlip(friction);
		wheelInfo.set_m_rollInfluence(rollInfluence);

		wheelMeshes[index] = createWheelMesh(radius, width, index);
	}


	function createWheelMesh(radius, width, index) {
		var wheelMesh = new THREE.Group()
		wheelMesh.name = 'wheel_'+index

		_this.object3d.add(wheelMesh)

		return wheelMesh
	}

	function createChassisMesh(width, height, depth) {
		// var shape = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);
		// var mesh = new THREE.Mesh(shape, materialInteractive);
                // mesh.castShadow = true
		// debugger
		var mesh = new THREE.Group()
		mesh.name = 'chassis'
		_this.object3d.add(mesh);
		return mesh;
	}
}
