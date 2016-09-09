require.config({
	baseUrl : '../mobile',
	// alias libraries paths
	paths: {
		'angular'		: '../shared/script/lib/angular',
		'angular-route'	: '../shared/script/lib/angular-route',
		'angularAMD'	: '../shared/script/lib/angularAMD',
	},
	
	// angular does not support AMD out of the box, put it in a shim
	shim: {
		'angular': { exports: "angular" },
		'angular-route':['angular'],
		'angularAMD': ['angular'],
	},

	// kick start application
	deps: ['app'],

});
