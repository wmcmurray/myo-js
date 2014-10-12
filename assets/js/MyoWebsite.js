(function(window) {
	'use strict';

	var win = jQuery(window);
	var INDICATOR_SIZE = 75;
	var INDICATOR_DECAL = 10;

	/**
	 *	This class pack a lot of functionnality that enable a user to navigate
	 *	inside a website using his myo armband.
	 *	@args {array} Arguments passed to the pluginInit method of MyoJS
	 */
	function MyoWebsite(args)
	{
		// properties
		this.device = null;
		this.enabled = true;
		this.focusLock = false;

		// events listeners
		MyoJS.on('NEW_DEVICE', onNewDeviceHandler.bind(this));
		win.on('focus', onWindowFocusHandler.bind(this));
		win.on('blur', onWindowBlurHandler.bind(this));

		// initialization
		this.initIndicator();
	};

	var p = MyoWebsite.prototype;

	/**
	 *	Initialize the little indicator displayed inside the DOM
	 */
	p.initIndicator = function()
	{
		this.indicator = jQuery('<div class="myo-js-indicator">...</div>');
		this.indicator.css({
			borderRadius: '50%',
			position: 'fixed',
			right: '50%',
			bottom: INDICATOR_DECAL + 'px',
			zIndex: 999999,
			width: INDICATOR_SIZE + 'px',
			height: INDICATOR_SIZE + 'px',
			marginRight: -(INDICATOR_SIZE * 0.5) + 'px',
			backgroundColor: '#333',
			textAlign: 'center',
			fontSize: '13px',
			lineHeight: INDICATOR_SIZE + 'px',
			cursor: 'default',
		});

		TweenMax.set(this.indicator, {scale: 0, opacity: 0, transformOrigin: '50% 100%'});

		jQuery('body').append(this.indicator);
	};

	/**
	 *	Update the indicator state
	 */
	p.updateIndicator = function()
	{
		var ready = this.enabled ? true : false; //  && this.device.status == 'connected'

		this.indicator
			.html(this.device.pose)
			.attr('title', this.device.status);

		TweenMax.to(this.indicator, 0.25,
		{
			opacity: (ready ? 1 : 0.5),
			boxShadow: "0px 0px 0px " + (this.enabled ? "3px" : "0px") + " #00BBDE",
			scale: (ready ? 1 : 0.5),
			ease: Quint.easeInOut
		});
	};

	/**
	 *	Start the locking timer
	 */
	p.startLockTimer = function()
	{
		this.device.vibrate(Myo.VIBRATE_SHORT);
		this.lockTimerCounter = 0;
		this.lockTimer = setInterval(function()
		{
			this.lockTimerCounter++;

			if(this.lockTimerCounter >= 2)
			{
				this.lock();
				this.device.vibrate(Myo.VIBRATE_MEDIUM);
			}
			else
			{
				this.device.vibrate(Myo.VIBRATE_SHORT);
			}

		}.bind(this), 1000);
	};

	/**
	 *	Start the locking timer
	 */
	p.stopLockTimer = function()
	{
		clearInterval(this.lockTimer);
	};

	/**
	 *	Start the unlocking timer
	 */
	p.startUnlockTimer = function()
	{
		this.device.vibrate(Myo.VIBRATE_SHORT);
		this.unlockTimerCounter = 0;
		this.unlockTimer = setInterval(function()
		{
			this.unlockTimerCounter++;

			if(this.unlockTimerCounter >= 2)
			{
				this.unlock();
				this.device.vibrate(Myo.VIBRATE_MEDIUM);
			}
			else
			{
				this.device.vibrate(Myo.VIBRATE_SHORT);
			}

		}.bind(this), 1000);
	};

	/**
	 *	Start the locking timer
	 */
	p.stopUnlockTimer = function()
	{
		clearInterval(this.unlockTimer);
	};

	/**
	 *	Lock interactivity
	 */
	p.lock = function()
	{
		this.stopLockTimer();
		this.enabled = false;
		this.updateIndicator();
	};

	/**
	 *	Unlock interactivity
	 */
	p.unlock = function()
	{
		this.stopUnlockTimer();
		this.enabled = true;
		this.updateIndicator();
	};

	/**
	 *	Return the amount of scroll to do (vertically), on next scroll
	 */
	function getScrollStep(side)
	{
		var h = jQuery(window).height() * 0.5;

		if(this.device.arm == 'left')
		{
			switch(side)
			{
				case 'out' :
					return -h;
				break;

				case 'in' :
					return h;
				break;
			}
		}
		else
		{
			switch(side)
			{
				case 'out' :
					return h;
				break;

				case 'in' :
					return -h;
				break;
			}
		}

		return 0;
	}

	/**
	 *	Triggered when a new device is ready
	 */
	function onNewDeviceHandler(device)
	{
		this.device = device;

		this.device.on('STATUS_CHANGED', onDeviceStatusChangedHandler.bind(this));
		this.device.on('POSE_ADOPTED', onDevicePoseAdoptedHandler.bind(this));
		this.device.on('POSE_RELEASED', onDevicePoseReleasedHandler.bind(this));
		this.device.on('ARM_CHANGED', onDeviceArmChangedHandler.bind(this));

		this.updateIndicator();
	}

	/**
	 *	Triggered when a device's pose is adopted
	 */
	function onDevicePoseAdoptedHandler(pose)
	{
		if(!this.focusLock)
		{
			switch(pose)
			{
				case Myo.POSE_THUMB_TO_PINKY :
					if(!this.enabled)
					{
						this.startUnlockTimer();
					}
					else
					{
						this.startLockTimer();
					}
				break;

				case Myo.POSE_FINGERS_SPREAD :
					if(this.enabled)
					{
						// MyoScrollManager.top();
					}
				break;

				case Myo.POSE_WAVE_IN :
					if(this.enabled)
					{
						MyoScrollManager.translate(0, getScrollStep.call(this, 'in'));
					}
				break;

				case Myo.POSE_WAVE_OUT :
					if(this.enabled)
					{
						MyoScrollManager.translate(0, getScrollStep.call(this, 'out'));
					}
				break;

				case Myo.POSE_FIST :
					if(this.enabled)
					{
						MyoScrollManager.top();
					}
				break;
			}

			this.updateIndicator();
		}
	}

	/**
	 *	Triggered when a device's pose is released
	 */
	function onDevicePoseReleasedHandler(pose)
	{
		switch(pose)
		{
			case Myo.POSE_THUMB_TO_PINKY :
				if(this.enabled)
				{
					this.stopLockTimer();
				}
				else
				{
					this.stopUnlockTimer();
				}
			break;
		}
	}

	/**
	 *	Triggered when a device's status changed
	 */
	function onDeviceStatusChangedHandler(status)
	{
		switch(status)
		{
			case 'arm_lost' :
				// this.lock();
			break;
		}

		this.updateIndicator();
	}

	/**
	 *	Triggered when a device's arm changed
	 */
	function onDeviceArmChangedHandler(arm, direction)
	{
		TweenMax.to(this.indicator, 1,
		{
			transformOrigin: (arm == 'right' ? '100% 100%' : '0% 100%'),
			left: (arm == 'left' ? INDICATOR_DECAL + 'px' : 'auto'),
			right: (arm == 'right' ? INDICATOR_DECAL + 'px' : 'auto'),
			marginRight: '0px',
			ease: Quint.easeInOut
		});
	}

	/**
	 *	Triggered when a device's arm changed
	 */
	function onWindowFocusHandler()
	{
		this.focusLock = false;
	}

	/**
	 *	Triggered when a device's arm changed
	 */
	function onWindowBlurHandler()
	{
		this.focusLock = true;
		this.stopLockTimer();
		this.stopUnlockTimer();
	}

	MyoJS.registerPlugin('website', MyoWebsite);

})(window);