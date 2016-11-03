"use strict";

var THREEx = THREEx || {}

THREEx.AmmoTerrain = function( terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight, terrain3dWidth, terrain3dDepth){
	var _this = this
	
	var heightData = generateHeightRocket( terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight );
	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
        var geometry = new THREE.PlaneBufferGeometry( terrain3dWidth, terrain3dDepth, terrainWidth - 1, terrainDepth - 1 );
        geometry.rotateX( -Math.PI / 2 );
        var vertices = geometry.attributes.position.array;        
        for ( var i = 0; i < vertices.length; i++ ) {
                // j + 1 because it is the y component that we modify
                vertices[ i*3 + 1 ] = heightData[ i ];                        
        }
        geometry.computeVertexNormals();
        var material = new THREE.MeshLambertMaterial({
		map: new THREE.TextureLoader().load("textures/grid.png", function onLoad(texture){
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(terrain3dWidth,terrain3dDepth)
			texture.anisotropy = renderer.getMaxAnisotropy()
		}),
		side : THREE.DoubleSide
	});        
        // var material = new THREE.MeshPhongMaterial( { color: 0xC7C7C7 } );
        var meshGround = new THREE.Mesh( geometry, material );
        meshGround.receiveShadow = true;

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
        var groundShape = createTerrainShape( heightData );
        var groundTransform = new Ammo.btTransform();
        groundTransform.setIdentity();
        // Shifts the terrain, since bullet re-centers it on its bounding box.
        groundTransform.setOrigin( new Ammo.btVector3( 0, ( terrainMaxHeight + terrainMinHeight ) / 2, 0 ) );
        var groundMass = 0;
        var groundLocalInertia = new Ammo.btVector3( 0, 0, 0 );
        var groundMotionState = new Ammo.btDefaultMotionState( groundTransform );
        var groundBody = new Ammo.btRigidBody( new Ammo.btRigidBodyConstructionInfo( groundMass, groundMotionState, groundShape, groundLocalInertia ) );
        // ammoWorld.physicsWorld.addRigidBody( groundBody );


	_this.object3d = meshGround
	_this.body = groundBody

	// THREEx.AmmoControls.call( this, meshGround, {
	// 	shape: groundShape,
	// 	mass: 0,
	// });
	return
	
	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
        function createTerrainShape(heightData) {
                
                // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
                var heightScale = 1;
                
                // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
                var upAxis = 1;
                
                // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
                var hdt = "PHY_FLOAT";
                
                // Set this to your needs (inverts the triangles)
                var flipQuadEdges = false;
                
                // Creates height data buffer in Ammo heap
                var ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth);
                
                // Copy the javascript height data array to the Ammo one.
                var p = 0;
                var p2 = 0;
                for ( var j = 0; j < terrainDepth; j++ ) {
                        for ( var i = 0; i < terrainWidth; i++ ) {
                                
                                // write 32-bit float data to memory
                                Ammo.HEAPF32[ ammoHeightData + p2 >> 2 ] = heightData[ p ];
                                
                                p++;
                                
                                // 4 bytes/float
                                p2 += 4;
                        }
                }
                
                // Creates the heightfield physics shape
                var heightFieldShape = new Ammo.btHeightfieldTerrainShape(
                        terrainWidth,
                        terrainDepth,
                        ammoHeightData,
                        heightScale,
                        terrainMinHeight,
                        terrainMaxHeight,
                        upAxis,
                        hdt,
                        flipQuadEdges
                );
                
                // Set horizontal scale
                var scaleX = terrain3dWidth / ( terrainWidth - 1 );
                var scaleZ = terrain3dDepth / ( terrainDepth - 1 );
                heightFieldShape.setLocalScaling( new Ammo.btVector3( scaleX, 1, scaleZ ) );
                
                heightFieldShape.setMargin( 0.05 );
                
                return heightFieldShape;
                
        }
	
	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
        function generateHeightSinus( width, depth, minHeight, maxHeight ) {
                var data = new Float32Array(width * depth);
                
                var heightRange = maxHeight - minHeight;
                var halfWidth = width / 2;
                var halfDepth = depth / 2;
                var phaseMult = 12;
                
                for (var index = 0, z = 0; z < depth; z++ ) {
                        for ( var x = 0; x < width; x++ ) {
                                var radius = Math.sqrt(
                                        Math.pow( ( x - halfWidth ) / halfWidth, 2.0 ) +
                                        Math.pow( ( z - halfDepth ) / halfDepth, 2.0 )
                                );
                                
                                var height = ( Math.sin( radius * phaseMult ) + 1 ) * 0.5 * heightRange + minHeight;
                                data[ index++ ] = height;
                        }
                }
                return data;
        }	
        function generateHeightFlat( width, depth, minHeight, maxHeight ) {
                var data = new Float32Array(width * depth);
                
                for(var index = 0, z = 0; z < depth; z++ ) {
                        for ( var x = 0; x < width; x++ ) {
				var height = minHeight
				
                                data[ index++ ] = height;
                        }
                }
                return data;
        }		
        function generateHeightRocket( width, depth, minHeight, maxHeight ) {
                var data = new Float32Array(width * depth);
		var radiusX = 24*2
		var radiusZ = 24*2
		var radiusY = radiusX/4
		
                for(var index = 0, z = 0; z < depth; z++ ) {
                        for ( var x = 0; x < width; x++ ) {
				var height = minHeight
				
				if( x > width-radiusX ){
					var delta = x - (width-radiusX)
					var angle = Math.acos(delta/radiusX)
					height = Math.max(height, minHeight - Math.sin(angle)*radiusY + radiusY)
				}
				if( x < radiusX ){
					var delta = radiusX - x
					var angle = Math.acos(delta/radiusX)
					height = Math.max(height, minHeight - Math.sin(angle)*radiusY + radiusY)
				}
				if( z > depth-radiusZ ){
					var delta = z - (depth-radiusZ)
					var angle = Math.acos(delta/radiusZ)
					height = Math.max(height, minHeight - Math.sin(angle)*radiusY + radiusY)
				}
				if( z < radiusZ ){
					var delta = radiusZ - z
					var angle = Math.acos(delta/radiusZ)
					height = Math.max(height, minHeight - Math.sin(angle)*radiusY + radiusY)
				}
				
                                data[ index++ ] = height;
                        }
                }
                return data;
        }		

}

THREEx.AmmoTerrain.prototype = Object.create( THREEx.AmmoControls.prototype );
THREEx.AmmoTerrain.prototype.constructor = THREEx.AmmoControls;
