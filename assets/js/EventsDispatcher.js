(function(window) {
	'use strict';

	/**
	 *	Events dispatcher
	 */
	function EventsDispatcher()
	{
		this._eventsListeners = {};
	};

	var p = EventsDispatcher.prototype;

	/**
	 * Add the specified event listener.
	 */
	p.on = function(evt, func)
	{
		if(!this._eventsListeners[evt])
			this._eventsListeners[evt] = [];

		this._eventsListeners[evt].push(func);

		if(evt != 'BIND_EVENT')
			this.emit('BIND_EVENT', evt);

		return this;
	};

	/**
	 * Remove the specified event listener.
	 */
	p.off = function(evt, func)
	{
		var f;
		var a = [];

		for(var i in this._eventsListeners[evt])
		{
			f = this._eventsListeners[evt][i];
			
			if(f != func)
				a.push(f);
		}

		this._eventsListeners[evt] = a;

		return this;
	};

	/**
	 * Emit the specified event.
	 */
	p.emit = function(evt)
	{
		if(this._eventsListeners[evt])
		{
			var args = [], i = 0;

			for(i in arguments)
			{
				if(i > 0)
					args.push(arguments[i]);
			}

			for(i in this._eventsListeners[evt])
			{
				this._eventsListeners[evt][i].apply(this, args);
			}
		}

		return this;
	};

	window.MyoEventsDispatcher = EventsDispatcher;

})(window);