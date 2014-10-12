(function(window) {
	'use strict';

	var WS_PORT = 10138;
	var WS_HOST = '127.0.0.1';
	var WS_ADRESS = 'ws://'+WS_HOST+':'+WS_PORT+'/myo/';
	var API_VERSION = 1;

	// heritence
	MyoJS.prototype = new MyoEventsDispatcher;
	MyoJS.prototype.constructor = MyoJS;
	MyoJS.prototype.parent = MyoEventsDispatcher.prototype;

	/**
	 *	The main class of this app acting as a myo devices controller
	 *	@fires NEW_DEVICE When a device is ready to be used
	 */
	function MyoJS()
	{
		this.devices = [];
		this.plugins = {};

		this.on('BIND_EVENT', onBindEvent.bind(this));
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

		return this;
	};

	/**
	 *	Return all myo armband devices instances
	 */
	p.getDevices = function()
	{
		return this.devices;
	};

	/**
	 *	Register a plugin into the myo-js api
	 *	@name {string} Name of the plugin
	 *	@constructor {constructor} A constructor to be instancied
	 */
	p.registerPlugin = function(name, constructor)
	{
		this.plugins[name] = {constructor: constructor, instance: null};
		return this;
	};

	/**
	 *	Initialize a previously registered plugin
	 *	@name {string} Name of the plugin
	 *	[arg1, arg2, arg3...] All other params are passed to the plugin's constructor
	 */
	p.initPlugin = function(name)
	{
		if(typeof this.plugins[name] != 'undefined')
		{
			var a = Array.prototype.slice.call(arguments, 1);

			this.plugins[name].instance = new this.plugins[name].constructor(a);
			
			// console.log('PLUGIN "'+name+'" INITIALIZED.', a);
		}
		else
		{
			console.warn('PLUGIN "'+name+'" DOSEN\'T EXIST.');
		}

		return this;
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
				this.emit('NEW_DEVICE', this.devices[id]);
			}

			switch(data[0])
			{
				case 'event' :
					switch(data[1].type)
					{
						case 'paired' :
							this.devices[id].setStatus(data[1].type);
						break;
						
						case 'connected' :
							this.devices[id].setStatus(data[1].type);
						break;

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

	/**
	 *	Triggered when a new event listener is added
	 */
	function onBindEvent(name)
	{
		switch(name)
		{
			case 'NEW_DEVICE' :
				for(var i in this.devices)
				{
					this.emit('NEW_DEVICE', this.devices[i]);
				}
			break;
		}
	}

	window.MyoJS = new MyoJS();

})(window);