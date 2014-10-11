(function(window)
{
	/**
	 *	Represents a single myo armband device
	 */
	function Myo(id)
	{
		this.id = id;
		this.status = null;
		this.arm = null;
		this.direction = null;
		this.accelerometer = {};
		this.gyroscope = {};
		this.orientation = {};
		this.pose = null;
	};

	var p = Myo.prototype;

	/**
	 *	Set the myo status (paired | connected | arm_lost)
	 */
	p.setStatus = function(status)
	{
		this.status = status;
	};

	/**
	 *	Set the myo arm data
	 */
	p.setArm = function(data)
	{
		this.arm = data.arm;
		this.direction = data.x_direction;
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