"use strict";

var THREEx = THREEx || {}

THREEx.AmmoVehicle = function(ammoWorld, pos, quat){
	var _this = this

	this.object3d = new THREE.Group
	// Vehicle contants
	
	_this.parameters = {}
	var opt = _this.parameters
	opt.chassisWidth = 1.8;
	opt.chassisHeight = .6;
	opt.chassisLength = 4;
	opt.massVehicle = 800;

	opt.wheelAxisPositionBack = -1.8;
	opt.wheelHalfTrackBack = 1.15;
	opt.wheelAxisHeightBack = .3;
	opt.wheelRadiusBack = .45;
	opt.wheelWidthBack = .2;

	opt.wheelAxisPositionFront = 1.55;
	opt.wheelHalfTrackFront = 1.15;
	opt.wheelAxisHeightFront = .3;
	opt.wheelRadiusFront = .45;
	opt.wheelWidthFront = .2;

	opt.friction = 1000;
	opt.suspensionStiffness = 20.0;
	opt.suspensionDamping = 2.3;
	opt.suspensionCompression = 4.4;
	opt.suspensionRestLength = 0.6;
	opt.rollInfluence = 0.2;

	opt.steeringIncrement = .04;
	opt.steeringClamp = .5;
	opt.maxEngineForce = 2000;
	opt.maxBreakingForce = 100;
	
	//////////////////////////////////////////////////////////////////////////////
	//		build THREE.Group
	//////////////////////////////////////////////////////////////////////////////
// TODO should that be outside, built before this constructor
	var chassisMesh = new THREE.Group()
	chassisMesh.name = 'chassis'
	_this.object3d.add(chassisMesh);
	var wheelMeshes = [];
	for(var i = 0; i < 4; i++){
		wheelMeshes[i]= new THREE.Group()
		wheelMeshes[i].name = 'wheel_'+i
		_this.object3d.add(wheelMeshes[i])
	}

	//////////////////////////////////////////////////////////////////////////////
	//		build chassis
	//////////////////////////////////////////////////////////////////////////////
	var geometry = new Ammo.btBoxShape(new Ammo.btVector3(opt.chassisWidth * .5, opt.chassisHeight * .5, opt.chassisLength * .5));
	var transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
	transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
	var motionState = new Ammo.btDefaultMotionState(transform);
	var localInertia = new Ammo.btVector3(0, 0, 0);
	geometry.calculateLocalInertia(opt.massVehicle, localInertia);
	var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(opt.massVehicle, motionState, geometry, localInertia));

	var DISABLE_DEACTIVATION = 4;
	body.setActivationState(DISABLE_DEACTIVATION);
	
	ammoWorld.physicsWorld.addRigidBody(body);

	// Raycast Vehicle
	var tuning = new Ammo.btVehicleTuning();
	var rayCaster = new Ammo.btDefaultVehicleRaycaster(ammoWorld.physicsWorld);
	var vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
	vehicle.setCoordinateSystem(0, 1, 2);
	ammoWorld.physicsWorld.addAction(vehicle);

	this.vehicle = vehicle

	//////////////////////////////////////////////////////////////////////////////
	//		build wheels physics
	//////////////////////////////////////////////////////////////////////////////
	var FRONT_LEFT = 0;
	var FRONT_RIGHT = 1;
	var BACK_LEFT = 2;
	var BACK_RIGHT = 3;
	addWheel(true,  new Ammo.btVector3( opt.wheelHalfTrackFront, opt.wheelAxisHeightFront, opt.wheelAxisPositionFront), opt.wheelRadiusFront, opt.wheelWidthFront, FRONT_LEFT);
	addWheel(true,  new Ammo.btVector3(-opt.wheelHalfTrackFront, opt.wheelAxisHeightFront, opt.wheelAxisPositionFront), opt.wheelRadiusFront, opt.wheelWidthFront, FRONT_RIGHT);
	addWheel(false, new Ammo.btVector3(-opt.wheelHalfTrackBack , opt.wheelAxisHeightBack , opt.wheelAxisPositionBack) , opt.wheelRadiusBack , opt.wheelWidthBack , BACK_LEFT);
	addWheel(false, new Ammo.btVector3( opt.wheelHalfTrackBack , opt.wheelAxisHeightBack , opt.wheelAxisPositionBack) , opt.wheelRadiusBack , opt.wheelWidthBack , BACK_RIGHT);
        
	
	_this.updateGamepad = function(actions) {
		
		var breakingForce = actions.breaking * opt.maxEngineForce
		vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
		vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
		vehicle.setBrake(breakingForce, BACK_LEFT);
		vehicle.setBrake(breakingForce, BACK_RIGHT);

		var engineForce = actions.acceleration * opt.maxEngineForce
		vehicle.applyEngineForce(engineForce, BACK_LEFT);
		vehicle.applyEngineForce(engineForce, BACK_RIGHT);
					
		var vehicleSteering = actions.steering * opt.steeringClamp
		vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
		vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT); 

		updatePhysics()
	}

	// states
	_this.updateKeyboard = (function(){
		var vehicleSteering = 0;
		
		// Sync keybord actions and physics and graphics
		return function(actions) {
			// var actions = {
			// 	'acceleration' : false,	// true if the vehicle is accelerating
			// 	'braking' : false,	// true if the vehicle is breaking
			// 	'left' : false,		// true if the vehicle should go left
			// 	'right': false,		// true if the vehicle should go right
			// }
			
			
			var speed = vehicle.getCurrentSpeedKmHour();
			var breakingForce = 0;
			var engineForce = 0;

			if (actions.acceleration) {
				if (speed < -1)
					breakingForce = opt.maxBreakingForce;
				else engineForce = opt.maxEngineForce;
			}
			if (actions.braking) {
				if (speed > 1)
					breakingForce = opt.maxBreakingForce;
				else engineForce = -opt.maxEngineForce / 2;
			}
			if (actions.left) {
				if (vehicleSteering < opt.steeringClamp)
					vehicleSteering += opt.steeringIncrement;
			}
			else {
				if (actions.right) {
					if (vehicleSteering > -opt.steeringClamp)
						vehicleSteering -= opt.steeringIncrement;
				}
				else {
					if (vehicleSteering < -opt.steeringIncrement)
						vehicleSteering += opt.steeringIncrement;
					else {
						if (vehicleSteering > opt.steeringIncrement)
							vehicleSteering -= opt.steeringIncrement;
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

			updatePhysics()
		}
	})()
	
	function updatePhysics(){
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

	function addWheel(isFront, position, radius, width, index) {
		var wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
		var wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

		var wheelInfo = vehicle.addWheel(
				position,
				wheelDirectionCS0,
				wheelAxleCS,
				opt.suspensionRestLength,
				radius,
				tuning,
				isFront);

		wheelInfo.set_m_suspensionStiffness(opt.suspensionStiffness);
		wheelInfo.set_m_wheelsDampingRelaxation(opt.suspensionDamping);
		wheelInfo.set_m_wheelsDampingCompression(opt.suspensionCompression);
                
		wheelInfo.set_m_frictionSlip(opt.friction);
		wheelInfo.set_m_rollInfluence(opt.rollInfluence);


		// var wheelMesh = new THREE.Group()
		// wheelMesh.name = 'wheel_'+index
		// wheelMeshes[index] = wheelMesh
		// 
		// _this.object3d.add(wheelMesh)
	}
}
