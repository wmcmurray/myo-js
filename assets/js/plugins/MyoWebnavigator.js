(function(window) {
	'use strict';

	var win = jQuery(window);
	var INDICATOR_SIZE = 50;
	var INDICATOR_DECAL = 10;

	/**
	 *	This class pack a lot of functionnality that enable a user to navigate
	 *	inside a website using his myo armband.
	 *	@args {array} Arguments passed to the pluginInit method of MyoJS
	 */
	function MyoWebNavigator(args)
	{
		// properties
		this.device = null;
		this.locked = true;
		this.focusLock = false;

		// initialization
		this.initIndicator();
		this.disable(0);

		// events listeners
		MyoJS.on('SOCKET_OPENED', onSocketOpenedHandler.bind(this));
		MyoJS.on('SOCKET_CLOSED', onSocketClosedHandler.bind(this));
		MyoJS.on('NEW_DEVICE', onNewDeviceHandler.bind(this));
		win.on('focus', onWindowFocusHandler.bind(this));
		win.on('blur', onWindowBlurHandler.bind(this));
	};

	var p = MyoWebNavigator.prototype;

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
			bottom: -INDICATOR_SIZE + 'px',
			zIndex: 999999,
			width: INDICATOR_SIZE + 'px',
			height: INDICATOR_SIZE + 'px',
			marginRight: -(INDICATOR_SIZE * 0.5) + 'px',
			backgroundColor: MyoJS.COLOR_DARK,
			textAlign: 'center',
			fontSize: '13px',
			lineHeight: INDICATOR_SIZE + 'px',
			color: MyoJS.COLOR_BLUE,
			cursor: 'pointer',
		});

		this.indicator.on('click', function()
		{
			if(this.locked)
				this.unlock();
			else
				this.lock();
		}.bind(this));

		jQuery('body').append(this.indicator);
	};

	/**
	 *	Update the indicator state
	 */
	p.updateIndicator = function(speed)
	{
		if(typeof speed == 'undefined')
			speed = 0.25;

		var ready = !this.locked && this.device.isReady() ? true : false;
		var image = MyoJS.assets.getPoseImage(this.device);

		this.indicator
			.html(this.device.pose ? (image ? '<img src="'+image+'" alt="'+this.device.pose+'" style="width:100%;height:auto;display:block;">' : '') : (ready ? 'Myo' : '...') )
			.attr('title', this.device.connectionStatus + ' - ' + this.device.armStatus);

		if(this.device.pose == MyoDevice.POSE_THUMB_TO_PINKY)
		{
			if(this.unlockTimer)
				this.indicator.html(this.unlockTimerCounter > 0 ? this.unlockTimerCounter : 'Unlocked');

			else if(this.lockTimer)
				this.indicator.html(this.lockTimerCounter > 0 ? this.lockTimerCounter: 'Locked');
		}

		TweenMax.to(this.indicator, speed,
		{
			opacity: (ready ? 1 : 0.5),
			boxShadow: "0px 0px 15px rgba(0,0,0,0.5), 0px 0px 0px " + (ready ? "2px" : "0px") + " " + MyoJS.COLOR_BLUE,
			scale: (ready ? 1 : 0.5),
			ease: Quint.easeInOut
		});
	};

	/**
	 *	Start the locking timer
	 */
	p.startLockTimer = function()
	{
		this.device.vibrate(MyoDevice.VIBRATE_SHORT);
		this.lockTimerCounter = 2;
		this.lockTimer = setInterval(function()
		{
			this.lockTimerCounter--;

			if(this.lockTimerCounter <= 0)
			{
				this.lock();
				this.device.vibrate(MyoDevice.VIBRATE_MEDIUM);
			}
			else
			{
				this.device.vibrate(MyoDevice.VIBRATE_SHORT);
				this.updateIndicator();
			}

		}.bind(this), 1000);
	};

	/**
	 *	Start the locking timer
	 */
	p.stopLockTimer = function()
	{
		clearInterval(this.lockTimer);
		this.lockTimer = null;
	};

	/**
	 *	Start the unlocking timer
	 */
	p.startUnlockTimer = function()
	{
		this.device.vibrate(MyoDevice.VIBRATE_SHORT);
		this.unlockTimerCounter = 2;
		this.unlockTimer = setInterval(function()
		{
			this.unlockTimerCounter--;

			this.updateIndicator();

			if(this.unlockTimerCounter <= 0)
			{
				this.unlock();
				this.device.vibrate(MyoDevice.VIBRATE_MEDIUM);
			}
			else
			{
				this.device.vibrate(MyoDevice.VIBRATE_SHORT);
				this.updateIndicator();
			}

		}.bind(this), 1000);
	};

	/**
	 *	Start the locking timer
	 */
	p.stopUnlockTimer = function()
	{
		clearInterval(this.unlockTimer);
		this.unlockTimer = null;
	};

	/**
	 *	Lock interactivity
	 */
	p.lock = function()
	{
		this.locked = true;
		this.updateIndicator();
		this.stopLockTimer();
	};

	/**
	 *	Unlock interactivity
	 */
	p.unlock = function()
	{
		this.locked = false;
		this.updateIndicator();
		this.stopUnlockTimer();
	};

	/**
	 *	Enable the plugin (display visual stuff in DOM)
	 */
	p.enable = function(speed)
	{
		if(typeof speed == 'undefined')
			speed = 0.5;

		TweenMax.to(this.indicator, speed, {opacity: 1, bottom: INDICATOR_DECAL + 'px', transformOrigin: '50% 100%', ease: Quint.easeInOut});
	};

	/**
	 *	Disable the plugin (hide visual stuff in DOM)
	 */
	p.disable = function(speed)
	{
		if(typeof speed == 'undefined')
			speed = 0.5;

		TweenMax.to(this.indicator, speed, {opacity: 0, bottom: -INDICATOR_SIZE + 'px', transformOrigin: '50% 100%', ease: Quint.easeInOut});
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
	 *	Triggered when the myo-js socket is ready
	 */
	function onSocketOpenedHandler()
	{
		this.enable();
	}

	/**
	 *	Triggered when the myo-js socket is closed
	 */
	function onSocketClosedHandler()
	{
		this.disable();
	}

	/**
	 *	Triggered when a new device is ready
	 */
	function onNewDeviceHandler(device)
	{
		this.device = device;

		this.device.on('CONNECTION_STATUS_CHANGED', onDeviceStatusChangedHandler.bind(this));
		this.device.on('ARM_STATUS_CHANGED', onDeviceArmStatusChangedHandler.bind(this));
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
				case MyoDevice.POSE_THUMB_TO_PINKY :
					if(this.locked)
					{
						this.startUnlockTimer();
					}
					else
					{
						this.startLockTimer();
					}
				break;

				case MyoDevice.POSE_FINGERS_SPREAD :
					if(!this.locked)
					{
						// MyoScrollManager.top();
					}
				break;

				case MyoDevice.POSE_WAVE_IN :
					if(!this.locked)
					{
						MyoScrollManager.translate(0, getScrollStep.call(this, 'in'));
					}
				break;

				case MyoDevice.POSE_WAVE_OUT :
					if(!this.locked)
					{
						MyoScrollManager.translate(0, getScrollStep.call(this, 'out'));
					}
				break;

				case MyoDevice.POSE_FIST :
					if(!this.locked)
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
			case MyoDevice.POSE_THUMB_TO_PINKY :
				if(!this.locked)
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
			case 'disconnected' :
				this.lock();
			break;

			case 'connected' :
				this.unlock();
			break;
		}

		this.updateIndicator();
	}

	/**
	 *	Triggered when a device's arm status changed
	 */
	function onDeviceArmStatusChangedHandler(status)
	{
		switch(status)
		{
			case 'arm_lost' :
				this.lock();
			break;

			case 'arm_recognized' :
				this.unlock();
			break;
		}

		this.updateIndicator();
	}

	/**
	 *	Triggered when a device's arm changed
	 */
	function onDeviceArmChangedHandler(arm, direction)
	{
		TweenMax.set(this.indicator,
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

	// register the plugin
	MyoJS.registerPlugin('webnavigator', MyoWebNavigator);

})(window);