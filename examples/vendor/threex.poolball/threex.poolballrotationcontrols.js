var THREEx	= THREEx	|| {}

/**
 * Control ball rotation base on velocity. 
 * Thus you get to worry only about translation.
 * It assumes the ball doesnt slides and moves on a plane surface
 */
THREEx.PoolBallRotationControls	= function(object3d){

	this.object3d	= object3d
	object3d.matrixAutoUpdate = false;
	object3d.updateMatrix();

	var prevPosition	= new THREE.Vector3()
	prevPosition.copy(object3d.position)

	this.update	= function(delta){
		// compute velocity
		var position	= object3d.position
		var velocity	= position.clone().sub(prevPosition)
		prevPosition.copy(position)

		// update matrix
		object3d.updateMatrix();

		// solution to get rolling marble from |3d| on freenode
		var translation	= new THREE.Vector3(position.x,position.y,position.z)
		var matrix	= new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z);
		// TODO make it radius independant
		// c = circumference
		// (velocity/(2*PI*radius)) * Math.PI*2
		var radius	= object3d.geometry.radius * object3d.scale.x
		matrix.multiply(  new THREE.Matrix4().makeRotationZ(-velocity.x*(Math.PI*radius)));
		matrix.multiply(  new THREE.Matrix4().makeRotationX( velocity.z*(Math.PI*radius)));
		matrix.multiply(
			new THREE.Matrix4().makeTranslation(-translation.x, -translation.y, -translation.z)
		);
		matrix.multiply(object3d.matrix)
		object3d.matrix.copy(matrix);

		// put back the rotation
		object3d.rotation.setFromRotationMatrix( object3d.matrix, object3d.rotation.order );

		// update matrixWorld
		object3d.updateMatrixWorld(true);		
	}
}