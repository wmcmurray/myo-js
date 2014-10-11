(function(window)
{
	var WS_PORT = 10138;
	var WS_HOST = '127.0.0.1';
	var WS_ADRESS = 'ws://'+WS_HOST+':'+WS_PORT+'/myo/';
	var API_VERSION = 1;

	/**
	 *	The main class of this app acting as a myo devices controller
	 */
	function MyoJS()
	{
		this.devices = [];
	};

	var p = MyoJS.prototype;

	/**
	 *	Initialize the myo detection
	 */
	p.init = function()
	{
		if(("WebSocket" in window))
		{
			this.socket = new WebSocket(WS_ADRESS + API_VERSION);
			this.socket.onmessage = onMessageHandler.bind(this);
		}
		else
		{
			console.error('You need a browser that supports websocket to use your Myo on the web.');
		}
	};

	/**
	 *	Return all myo armband devices instances
	 */
	p.getDevices = function()
	{
		return this.devices;
	};

	/**
	 *	Send a command to the websocket
	 *	@command {string} Command name
	 *	@id {string} The myo device ID
	 *	@data {object} Data sended with the command
	 */
	p.sendCommand = function(command, id, data)
	{
		var datas = {command: command, myo: id};

		if(typeof data != 'undefined')
		{
			for(var i in data)
			{
				datas[i] = data[i];
			}
		}

		this.socket.send(JSON.stringify(['command', datas]));
	};

	/**
	 *	Handle messages received by websocket
	 */
	function onMessageHandler(message)
	{
		if(message.data)
		{
			var data = JSON.parse(message.data);
			var id = data[1].myo;

			if(typeof this.devices[id] == 'undefined')
			{
				this.devices[id] = new window.Myo(id);
			}

			switch(data[0])
			{
				case 'event' :
					switch(data[1].type)
					{
						case 'paired' :
						case 'connected' :
						case 'arm_lost' :
							this.devices[id].setStatus(data[1].type);
						break;

						case 'arm_recognized' :
							this.devices[id].setArm(data[1]);
						break;

						case 'orientation' :
							this.devices[id].setOrientation(data[1]);
						break;

						case 'pose' :
							this.devices[id].setPose(data[1]);
						break;

						default :
							console.warn('UNSUPPORTED EVENT:', data[1].type, data[1]);
						break;
					}
				break;

				default :
					console.warn('UNSUPPORTED DATA:', data[0], data[1]);
				break;
			}
		}
	}

	window.MyoJS = new MyoJS();

})(window);