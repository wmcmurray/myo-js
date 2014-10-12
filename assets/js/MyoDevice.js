(function(window) {
	'use strict';

	var POSE_EVENTS_EMIT_DELAY = 50;

	// heritence
	MyoDevice.prototype = new MyoEventsDispatcher;
	MyoDevice.prototype.constructor = MyoDevice;
	MyoDevice.prototype.parent = MyoEventsDispatcher.prototype;

	// constants
	MyoDevice.POSE_THUMB_TO_PINKY = 'thumb_to_pinky';
	MyoDevice.POSE_FINGERS_SPREAD = 'fingers_spread';
	MyoDevice.POSE_WAVE_OUT = 'wave_out';
	MyoDevice.POSE_WAVE_IN = 'wave_in';
	MyoDevice.POSE_FIST = 'fist';
	MyoDevice.POSE_REST = 'rest';
	MyoDevice.VIBRATE_SHORT = 'short';
	MyoDevice.VIBRATE_MEDIUM = 'medium';
	MyoDevice.VIBRATE_LONG = 'long';

	/**
	 *	Represents a single Myo armband device
	 *
	 *	@fires STATUS_CHANGED - When the device status changes
	 *	@fires ARM_STATUS_CHANGED - 
	 *	@fires ARM_CHANGED - 
	 *	@fires POSE_CHANGED - When the hand pose change
	 *	@fires POSE_RELEASED - When the hand pose is replaced by an other
	 *	@fires POSE_ADOPTED - When the hand pose is adopted
	 */
	function MyoDevice(id)
	{
		this.id = id;
		this.status = null;
		this.armStatus = null;
		this.arm = null;
		this.direction = null;
		this.accelerometer = {};
		this.gyroscope = {};
		this.orientation = {};
		this.pose = null;

		this.on('BIND_EVENT', onBindEvent.bind(this));

		// this.requestRSSI();
	};

	var p = MyoDevice.prototype;

	/**
	 *	Return true of false is the device is ready to be used
	 *	@return {bool}
	 */
	p.isReady = function()
	{
		return this.status == 'connected' && this.armStatus == 'arm_recognized' ? true : false;
	};

	/**
	 *	Set the Myo status (paired | connected | disconnected)
	 */
	p.setStatus = function(status)
	{
		this.status = status;

		this.emit('STATUS_CHANGED', this.status);
	};

	/**
	 *	Set the Myo arm status (arm_lost | arm_recognized)
	 */
	p.setArmStatus = function(status)
	{
		this.armStatus = status;

		this.emit('ARM_STATUS_CHANGED', this.armStatus);
	};

	/**
	 *	Set the Myo arm data
	 */
	p.setArm = function(data)
	{
		this.arm = data.arm;
		this.direction = data.x_direction;

		this.emit('ARM_CHANGED', this.arm, this.direction);
	};

	/**
	 *	Set device orientation data
	 */
	p.setOrientation = function(data)
	{
		this.accelerometer 	= data.accelerometer;
		this.gyroscope 		= data.gyroscope;
		this.orientation 	= data.orientation;
	};

	/**
	 *	Set hand pose data
	 */
	p.setPose = function(data)
	{
		if(this.poseEventsEmitTimer)
			clearTimeout(this.poseEventsEmitTimer);

		this.poseEventsEmitTimer = setTimeout(function()
		{
			var exPose = this.pose;

			this.pose = data.pose;

			if(exPose != this.pose)
			{
				this.emit('POSE_CHANGED', this.status);
				this.emit('POSE_RELEASED', exPose);
				this.emit('POSE_ADOPTED', this.pose);
			}
			
		}.bind(this), POSE_EVENTS_EMIT_DELAY);
	};

	/**
	 *	Send a command to the websocket
	 *	@command {string} Command name
	 *	@data {object} The data sended with the command
	 */
	p.sendCommand = function(command, data)
	{
		MyoJS.sendCommand(command, this.id, data);
	};

	/**
	 *	Vibrate the device
	 *	@intensity {string} (short | medium | long)
	 */
	p.vibrate = function(intensity, repeat)
	{
		if(typeof intensity == 'undefined')
			intensity = MyoDevice.VIBRATE_SHORT;

		if(typeof repeat == 'undefined')
			repeat = 1;

		for(var i = 0; i < repeat; i++)
		{
			this.sendCommand('vibrate', {type: intensity});
		}
	};

	/**
	 *	Request bluetooth strength
	 */
	p.requestRSSI = function()
	{
		this.sendCommand('request_rssi', {});
	};

	/**
	 *	Triggered when a new event listener is added
	 */
	function onBindEvent(name)
	{
		switch(name)
		{
			case 'STATUS_CHANGED' :
				this.emit('STATUS_CHANGED', this.status);
			break;
		}
	}

	window.MyoDevice = MyoDevice;

})(window);