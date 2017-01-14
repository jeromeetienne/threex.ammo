"use strict";

var THREEx = THREEx || {}

THREEx.AmmoControls = function(object3d, options){
        options = options || {}
        this.object3d = object3d
        
        ////////////////////////////////////////////////////////////////////////////////
        //          Compute shape from geometry
        ////////////////////////////////////////////////////////////////////////////////

        if( options.shape !== undefined ){
                var shape = options.shape
        }else{
                var shape = THREEx.AmmoControls.guessShapeFromObject3d(object3d)
        }

        if( options.mass !== undefined ){
                var mass = options.mass
        }else{
                var mass = THREEx.AmmoControls.guessMassFromObject3d(object3d)
        }
        
        var margin = 0.05;
        shape.setMargin( margin );

        if( mass !== 0 ){
                var localInertia = new Ammo.btVector3( 0, 10, 0 );
                shape.calculateLocalInertia( mass, localInertia );                
        }

        var btTransform = new Ammo.btTransform();
        btTransform.setIdentity();
        var position = this.object3d.position;
        btTransform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z ) );
        var quaternion = this.object3d.quaternion;
        btTransform.setRotation( new Ammo.btQuaternion( quaternion.x, quaternion.y, quaternion.z, quaternion.w ) );
        var motionState = new Ammo.btDefaultMotionState( btTransform );
        
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
        var body = new Ammo.btRigidBody( rbInfo );
// console.log('body', body)

        body.setUserIndex(this.object3d.id)
        this.object3d.userData.ammoControls = this
        
        this.body = body

        this.physicsBody = this.body // Deprecated
}

Object.assign( THREEx.AmmoControls.prototype, THREE.EventDispatcher.prototype )

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

THREEx.AmmoControls.guessMassFromObject3d = function(object3d){
        var guessedGeometry = THREEx.AmmoControls._guessGeometryFromObject3d(object3d)
        var p = guessedGeometry.parameters
        var s = object3d.scale

        if( guessedGeometry.type === 'BoxGeometry' ){
                var mass = p.width * s.x
                                * p.height * s.y
                                * p.depth * s.z                 
        }else if( guessedGeometry.type === 'SphereGeometry' ){
                var mass = 4/3 *Math.PI * Math.pow(p.radius * s.x ,3)                        
        }else if( guessedGeometry.type === 'CylinderGeometry' ){
                // from http://jwilson.coe.uga.edu/emt725/Frustum/Frustum.cone.html
                var mass = Math.PI*p.height/3 * (p.radiusBottom*p.radiusBottom * s.x*s.x
                        + p.radiusBottom*p.radiusTop * s.y*s.y
                        + p.radiusTop*p.radiusTop * s.x*s.x)
        }else{
                // console.assert('unknown geometry type', object3d.geometry)
                var box3 = new THREE.Box3().setFromObject(object3d)
                var size = box3.getSize()
                var mass = size.x*s.x * size.y*s.y * size.z*s.z
        }        
        return mass
}

THREEx.AmmoControls.guessShapeFromObject3d = function(object3d){
        var guessedGeometry = THREEx.AmmoControls._guessGeometryFromObject3d(object3d)
        var p = guessedGeometry.parameters
        var s = object3d.scale

        if( guessedGeometry.type === 'BoxGeometry' ){
                var btVector3 = new Ammo.btVector3()
                btVector3.setX(p.width /2 * s.x)
                btVector3.setY(p.height/2 * s.y)
                btVector3.setZ(p.depth /2 * s.z)
                var shape = new Ammo.btBoxShape( btVector3 );
        }else if( guessedGeometry.type === 'SphereGeometry' ){
                var radius = p.radius * s.x
                var shape = new Ammo.btSphereShape( radius );                
        }else if( guessedGeometry.type === 'CylinderGeometry' ){
                var size = new Ammo.btVector3( p.radiusTop* s.x,
                                p.height * 0.5 * s.y,
                                p.radiusBottom * s.x)
                var shape = new Ammo.btCylinderShape( size );
        }else{
                // console.assert('unknown geometry type', object3d.geometry)
                var box3 = new THREE.Box3().setFromObject(object3d)
                var size = box3.getSize()
                var btVector3 = new Ammo.btVector3()
                btVector3.setX(size.x/2 * s.x)
                btVector3.setY(size.y/2 * s.y)
                btVector3.setZ(size.z/2 * s.z)
                var shape = new Ammo.btBoxShape( btVector3 );
        }
        return shape
}

THREEx.AmmoControls._guessGeometryFromObject3d = function(object3d){
        var parameters = null
        var type = 'unknown'

        if( object3d.geometry instanceof THREE.BoxGeometry || object3d.geometry instanceof THREE.SphereGeometry || object3d.geometry instanceof THREE.CylinderGeometry ){
                parameters = object3d.geometry.parameters
                type = object3d.geometry.type
        }
        // TODO this is a kludge to support basic shape in a-frame - ugly but harmless
        if( object3d.children.length === 1 && object3d.children[0].geometry.type === 'BufferGeometry' ){
                parameters = object3d.children[0].geometry.metadata.parameters
                type = object3d.children[0].geometry.metadata.type
        }


        return {
                parameters : parameters,
                type : type
        }
        
}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

THREEx.AmmoControls.prototype.setFriction = function(value){
        this.body.setFriction( value );
}
THREEx.AmmoControls.prototype.setRestitution = function(value){
        this.body.setRestitution( value );
}

THREEx.AmmoControls.prototype.setAngularVelocity = function(x,y,z){
        var btVector3 = new Ammo.btVector3( x, y, z )

        this.body.setAngularVelocity( btVector3 );

        this.body.activate()
        // this.body.setActivationState(th.DISABLE_DEACTIVATION);
}

THREEx.AmmoControls.prototype.setLinearVelocity = function(x,y,z){
        var btVector3 = new Ammo.btVector3( x, y, z )
        this.body.setLinearVelocity( btVector3 );

        this.body.activate()
        // this.body.setActivationState(th.DISABLE_DEACTIVATION);
}
