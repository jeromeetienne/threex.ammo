"use strict";

var THREEx = THREEx || {}

THREEx.AmmoWorld = function(){
        this._ammoControls = []

        this._clock = new THREE.Clock();
        this.maxSteps = 100
        this.collisionEnabled = false
        
        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
        var broadphase = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );

        // gravity
        this.physicsWorld.setGravity( new Ammo.btVector3( 0, -9.81, 0 ) );
}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

THREEx.AmmoWorld.prototype.update = function(){
        var deltaTime = this._clock.getDelta();

        if( this.collisionEnabled === true ){
                this._updateCollisions()
        }

        // compute physics
        this.physicsWorld.stepSimulation( deltaTime, this.maxSteps );

        // update all ammoControls
        var btTransform = new Ammo.btTransform();
        for(var i = 0; i < this._ammoControls.length; i++){
                var ammoControls = this._ammoControls[ i ];

                var motionState = ammoControls.physicsBody.getMotionState();
                console.assert( motionState )
                motionState.getWorldTransform( btTransform );

                var position = btTransform.getOrigin();
                ammoControls.object3d.position.set( position.x(), position.y(), position.z() );

                var quaternion = btTransform.getRotation();
                ammoControls.object3d.quaternion.set( quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w() );                        
        }
}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

THREEx.AmmoWorld.prototype.add = function(ammoControls){
        console.assert(ammoControls instanceof THREEx.AmmoControls)

        this.physicsWorld.addRigidBody( ammoControls.physicsBody );
        
        this._ammoControls.push(ammoControls)
}

THREEx.AmmoWorld.prototype.remove = function(ammoControls){
        console.assert(ammoControls instanceof THREEx.AmmoControls)        

        if( this.contains(ammoControls) === false )     return

        this.physicsWorld.removeRigidBody( ammoControls.physicsWorld )

        // retmove it from _ammoControls
        this._ammoControls.splice(this._ammoControls.indexOf(ammoControls), 1);
}

THREEx.AmmoWorld.prototype.contains = function(ammoControls){
        return this._ammoControls.indexOf(ammoControls) !== -1 ? true : False
}


////////////////////////////////////////////////////////////////////////////////
//          Handled collision
////////////////////////////////////////////////////////////////////////////////

/**
 * - based on http://stackoverflow.com/questions/31991267/bullet-physicsammo-js-in-asm-js-how-to-get-collision-impact-force
 */
THREEx.AmmoWorld.prototype._updateCollisions = function(){
        console.assert( this.collisionEnabled === true )
        var _this = this

        // loop thru all manifolds
        var dispatcher = this.physicsWorld.getDispatcher()
        var nManifolds = dispatcher.getNumManifolds()
        for(var i = 0; i < nManifolds; i++){
                // get this manifold
                var manifold = dispatcher.getManifoldByIndexInternal(i);
                // get the number of contacts
                var nContact = manifold.getNumContacts();
                if (nContact === 0) continue
                // go thru all contacts
                for(var j = 0; j < nContact; j++){
                        var btContactPoint = manifold.getContactPoint(j);
                        // get THREEx.AmmoControls
                        var ammoControls0 = getAmmoControls(manifold.getBody0())
                        var ammoControls1 = getAmmoControls(manifold.getBody1())
                        // dispatchEvent
                        ammoControls0.dispatchEvent( { type: 'colliding', otherAmmoControls: ammoControls1, btContactPoint: btContactPoint } );
                        ammoControls1.dispatchEvent( { type: 'colliding', otherAmmoControls: ammoControls0, btContactPoint: btContactPoint } );
                }
        }
        return
        
        function getAmmoControls(body){
                var object3dId = body.getUserIndex()
                var ammoControls = _this._ammoControls.find(function(ammoControls){
                        return ammoControls.object3d.id === object3dId ? true : false
                })
                console.assert(ammoControls instanceof THREEx.AmmoControls === true)
                return ammoControls
        }        
}

THREEx.AmmoWorld.prototype.setGravity = function(x,y,z){
        this.physicsWorld.setGravity( new Ammo.btVector3( x, y, z ) );        
}
