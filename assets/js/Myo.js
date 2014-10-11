(function(window)
{
	function Myo(id)
	{
		this.id = id;
		this.status = 'not-paired';
		this.arm = null;
		this.direction = null;
		this.accelerometer = {};
		this.gyroscope = {};
		this.orientation = {};
		this.pose = 'rest';
	};

	var p = Myo.prototype;

	/**
	 *	Initialize the myo detection
	 */
	p.init = function()
	{
		
	};

	/**
	 *	Set the myo status (paired | connected)
	 */
	p.setStatus = function(status)
	{
		this.status = status;
	};

	/**
	 *	Set the myo status (paired | connected)
	 */
	p.setArm = function(data)
	{
		this.arm = data.arm;
		this.direction = data.x_direction;
	};

	/**
	 *	Initialize the myo detection
	 */
	p.setOrientation = function(data)
	{
		this.accelerometer 	= data.accelerometer;
		this.gyroscope 		= data.gyroscope;
		this.orientation 	= data.orientation;
	};

	/**
	 *	Initialize the myo detection
	 */
	p.setPose = function(data)
	{
		this.pose = data.pose;
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
	p.vibrate = function(intensity)
	{
		this.sendCommand('vibrate', {type: intensity || 'short'});
	};

	window.Myo = Myo;

})(window);