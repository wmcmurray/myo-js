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
	 *	The main class of this app acting as a Myo devices controller
	 *
	 *	@fires NEW_DEVICE - When a device is ready to be used (args: deviceInstance)
	 *	@fires PLUGIN_INIT - When a plugin is instanciated (args: pluginName, pluginInstance)
	 *	@fires READY - When initialization of the class and all plugins is over
	 *	@fires SOCKET_MESSAGE - When the socket receive a message (args: rawSocketMessageString)
	 *	@fires SOCKET_EVENT - 
	 *	@fires SOCKET_OPENED - 
	 *	@fires SOCKET_CLOSED - 
	 */
	function MyoJS()
	{
		this.enabled = false;
		this.devices = [];
		this.plugins = {};

		this.on('BIND_EVENT', onBindEvent.bind(this));
	};

	var p = MyoJS.prototype;

	/**
	 *	Initialize the Myo API
	 */
	p.init = function()
	{
		if(("WebSocket" in window))
		{
			this.socket = new WebSocket(WS_ADRESS + API_VERSION);
			this.socket.onmessage = onMessageHandler.bind(this);
			this.socket.onopen = onOpenHandler.bind(this);
			this.socket.onclose = onCloseHandler.bind(this);

			// init plugins
			this.initPlugins();
		}
		else
		{
			console.error('You need a browser that supports websocket to use your Myo on the web.');
		}

		this.emit('READY');

		return this;
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
	 *	Return the specified plugin instance
	 *	@name {string} Name of the plugin
	 *	@return {object} The instanciated plugin
	 */
	p.getPlugin = function(name)
	{
		return typeof this.plugins[name] != 'undefined' && typeof this.plugins[name].instance != 'undefined' ? this.plugins[name].instance : null;
	};

	/**
	 *	Initialize all plugins
	 */
	p.initPlugins = function()
	{
		for(var i in this.plugins)
		{
			this.initPlugin(i);
		}
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

			if(this.plugins[name].instance === null)
			{
				this.plugins[name].instance = new this.plugins[name].constructor(a);
				this.emit('PLUGIN_INIT', name, this.plugins[name].instance);
			}
			else
			{
				console.warn('MyoJS : plugin "'+name+'" already initialized.');
			}
		}
		else
		{
			console.warn('MyoJS : plugin "'+name+'" dosen\'t exist.');
		}

		return this;
	};

	/**
	 *	Return all Myo armband devices instances
	 */
	p.getDevices = function()
	{
		return this.devices;
	};

	/**
	 *	Send a command to the websocket
	 *	@command {string} Command name
	 *	@id {string} The Myo device ID
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
		this.emit('SOCKET_MESSAGE', message);

		if(message.data)
		{
			var data = JSON.parse(message.data);
			var id = data[1].myo;

			if(typeof this.devices[id] == 'undefined')
			{
				this.devices[id] = new window.MyoDevice(id);
				this.emit('NEW_DEVICE', this.devices[id]);
			}

			switch(data[0])
			{
				case 'event' :

					this.emit('SOCKET_EVENT', data[1]);

					switch(data[1].type)
					{
						case 'paired' :
							this.devices[id].setPairStatus(data[1].type);
						break;

						case 'unpaired' :
							this.devices[id].setPairStatus(data[1].type);
						break;
						
						case 'connected' :
							this.devices[id].setConnectionStatus(data[1].type);
						break;
						
						case 'disconnected' :
							this.devices[id].setConnectionStatus(data[1].type);
						break;

						case 'arm_lost' :
							this.devices[id].setArmStatus(data[1].type);
						break;

						case 'arm_recognized' :
							this.devices[id].setArmStatus(data[1].type);
							this.devices[id].setArm(data[1]);
						break;

						case 'orientation' :
							this.devices[id].setOrientation(data[1]);
						break;

						case 'pose' :
							this.devices[id].setPose(data[1]);
						break;

						case 'rssi' :
							this.devices[id].setRSSI(data[1].rssi);
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
	 *	Triggered when the socket is opened
	 */
	function onOpenHandler(evt)
	{
		this.enabled = true;
		this.emit('SOCKET_OPENED', evt);
	}

	/**
	 *	Triggered when an error occur
	 */
	function onCloseHandler(evt)
	{
		this.enabled = false;
		this.emit('SOCKET_CLOSED', evt); // evt.code, evt.reason
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

	// constants
	window.MyoJS.COLOR_BLUE = '#00bdde';
	window.MyoJS.COLOR_DARK = '#141d28';
	window.MyoJS.COLOR_LIGHT = '#3d3d3d';

})(window);