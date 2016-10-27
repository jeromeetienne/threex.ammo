var THREEx	= THREEx	|| {}

THREEx.PoolBallGameSound	= function(object3d, gameSounds){
	var utterance	= null;

	var url	= THREEx.PoolBallGameSound.baseUrl+'sounds/roll.mp3'
	// TODO handle caching later
	// var url	= 'sounds/kick.wav'
	var sound	= gameSounds.createSound().load(url, function(sound){
		// TODO expose this.utterance when loaded
		utterance	= sound.play({
			loop	: true,
			volume	: 0.5,
			follow	: object3d,
		})
	})

	var prevPosition	= object3d.position.clone()
	this.update	= function(delta){
		if( !utterance )	return
		var velocity	= object3d.position.clone().sub(prevPosition)
		var speed	= velocity.length()
		// TODO add this.minPlaybackRate, this.maxPlaybackRate, this.playbackSpeedRatio
		speed		= Math.min(speed, 0.05)

		var playbackRate= utterance.sourceNode.playbackRate
		playbackRate.value	= 0.1+speed * 60;

		prevPosition.copy( object3d.position )
	}
}

THREEx.PoolBallGameSound.baseUrl	= '../'