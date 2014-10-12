(function(window) {
	'use strict';

	var win = jQuery(window);

	/**
	 *	Used to scroll to specific coods/elements in the page.
	 *	@param {object} params - Params influencing class behaviors
	 */
	function ScrollManager(params)
	{
		this.tweenedObject = {x:0, y:0};

		// Parameters
		this.params = jQuery.extend(
		{
			speed			: 0.75			// {number} Movement speed when manuall scroll
			,decalX			: 0				// {number|selector|function} Decal on the horizontal axis added to each scroll to
			,decalY			: 0				// {number|selector|function} Decal on the vertical axis added to each scroll to
		}, params);
	};

	var p = ScrollManager.prototype;

	/**
	 *	Scroll to a specific location
	 */
	p.to = function(x, y, speed)
	{
		speed = typeof speed != "undefined" ? speed : this.params.speed;

		TweenMax.killTweensOf(this.tweenedObject);
		updateTweenObjectPosition.call(this);

		var endX = x + calculateDecal(this.params.decalX, "h");
		var endY = y + calculateDecal(this.params.decalY, "v");

		if(endX > window.scrollMaxX)
			endX = window.scrollMaxX;

		if(endY > window.scrollMaxY)
			endY = window.scrollMaxY;

		TweenMax.to(this.tweenedObject, speed, {
			x: endX,
			y: endY,
			ease: Quint.easeInOut,
			onUpdate: jQuery.proxy(onTweenUpdateHandler, this)
		});
	};
	
	/**
	 *	Scroll to a specific DOM element
	 */
	p.toElem = function(elem, speed)
	{
		var o = jQuery(elem).offset();
		this.to(o.left, o.top, speed);
	};

	/**
	 *	Go to top
	 **/
	p.top = function()
	{
		this.to(0,0);
	};

	/**
	 *	Reset scroll position (go to top)
	 **/
	p.reset = function()
	{
		window.scrollTo(0, 0);
		updateTweenObjectPosition.call(this);
	};

	/**
	 *	Move of the specified amount from current position
	 **/
	p.translate = function(x, y, speed)
	{
		updateTweenObjectPosition.call(this);
		this.to(this.tweenedObject.x + x, this.tweenedObject.y + y, speed);
	};

	/**
	 *	Recalculate the current window position
	 **/
	function updateTweenObjectPosition()
	{
		this.tweenedObject = {x: win.scrollLeft(), y: win.scrollTop()};
	};

	/**
	 *	Return a number from different input
	 *	@param {number|function} input - The input given
	 */
	function calculateDecal(input, axis)
	{
		var out = 0;

		switch(typeof input)
		{
			case "number" :
				out = input;
			break;

			case "string" :
				var e = jQuery(input);

				if(e.length)
				{
					switch(axis)
					{
						case "h" :
							out = -e.width();
						break;

						default :
						case "v" :
							out = -e.height();
						break;
					}
				}
			break;

			case "object" :
				out = input();
			break;
		}

		return out;
	};

	/**
	 *	Triggered when the update event of the movement tween is triggered
	 */
	function onTweenUpdateHandler()
	{
		window.scrollTo(this.tweenedObject.x, this.tweenedObject.y);
	};

	window.MyoScrollManager = new ScrollManager();

})(window);