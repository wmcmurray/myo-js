/**
 *	WEARE TOOLS CONFIG FILE
 *	this file contains all necessary data used by the weare tools
 */
module.exports = {
	// Version of this file
	version: '1.0.0',

	// Name of the project
	name: 'Myo-js',

	// A list of peoples that participated in this project
	authors: [
		"William McMurray <wmcmurray@weareinteractive.ca>"
	],

	// Some dates
	dates:
	{
		// creation date of this file
		creation: '2014-10-11T13:14:18.816Z'
	},

	// Some urls
	urls:
	{
		// local virtual host
		local: null,

		// prod url
		prod: null,

		// repo's url (usually on bitbucket)
		repo: 'https://github.com/wmcmurray/myo-js',

		// wiki url (if any)
		wiki: 'https://github.com/wmcmurray/myo-js/wiki',
	},

	// Some paths
	paths:
	{
		// public directory
		www: 'public/'
	},

	templates:
	{
		frontend:
		{
			// name of the template
			name: 'none',

			// version of the template
			version: null,

			// define how and where we inject template files into project's architechture
			destinations:
			{},

			// static files that we'll watch and compile while developping
			assets:
			{
				"js": [

				// contains all myo-js's dependencies
				{
					"name": "myo-dependencies",
					"vendors": true,
					"basepath": "assets/vendors/js/",
					"dist": "dist/",
					"src": [
						"jquery/jquery.min.js",
						"gsap/TweenMax.min.js",
					]
				},

				// contains myo-js api's files only
				{
					"name": "myo",
					"basepath": "assets/js/",
					"dist": "dist/",
					"src": [
						"EventsDispatcher.js",
						"Myo.js",
						"MyoJS.js",
					]
				},

				// contains myo websites plugin
				{
					"name": "myo-website",
					"basepath": "assets/js/",
					"dist": "dist/",
					"src": [
						"ScrollManager.js",
						"MyoWebsite.js",
					]
				}
				],
				"less": [
				{
					"name": "styles",
					"basepath": "demos/_shared/less/",
					"dist": "demos/_shared/css/",
					"src": [
						"all.less",
					]
				}
				]
			},

			// frontend dependencies that we want to use in this project (installed with bower)
			dependencies:
			{
				"jquery": "~1.11.1",
				"gsap": "~1.13.2",
				"lesshat": "~3.0.2",
				"reset-css": "~2.0.20110126"
			},

			// define how and where we inject dependencies into project's architechture
			dependenciesDestinations:
			{
				"jquery": [
				{
					"destination": "assets/vendors/js/jquery/",
					"sources": [
						"dist/*.min.js",
						"dist/*.min.map"
					]
				}],
				"gsap": [
				{
					"destination": "assets/vendors/js/gsap/",
					"sources": [
						"src/minified/TweenMax.min.js"
					]
				}],
				"lesshat": [
				{
					"destination": "assets/vendors/less/",
					"sources": [
						"build/lesshat.less"
					]
				}],
				"reset-css": [
				{
					"destination": "assets/vendors/css/",
					"sources": [
						"reset.css"
					]
				}]
			}
		},

		backend:
		{
			// name of the template
			name: 'none',

			// version of the template
			version: null,

			// define how and where we inject template files into project's architechture
			destinations:
			{},

			// views files that we'll watch for features like livereload
			views: []
		}
	}
};