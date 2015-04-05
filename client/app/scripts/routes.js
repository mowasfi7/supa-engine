'use strict';

angular.module('clientApp')
.config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/notfound');

	$stateProvider
	.state('home', {
		url: '/',
		templateUrl: '/views/home/main.html',
		controller: 'HomeCtrl',
		redirectTo: 'home.location'
	})
	.state('about', {
		url: '/about',
		templateUrl: '/views/about/main.html',
		redirectTo: 'about.theApp'
	})
	.state('profile', {
		url: '/profile',
		templateUrl: '/views/profile/main.html',
		redirectTo: 'profile.details'
	})
	.state('signup', {
		url: '/signup',
		templateUrl: '/views/users/signup.html',
		controller: 'SignupCtrl'
	})

	.state('notfound', {
		url: '/notfound',
		templateUrl: '/views/notfound.html'
	})

	// nested states
	// each of these sections will have their own view
	.state('home.location', {
		url: '',
		templateUrl: '/views/home/location.html'
	})

	.state('home.shoppinglist', {
		url: '',
		templateUrl: '/views/home/shoppinglist.html'
	})

	.state('about.theApp', {
		url: '/theapp',
		templateUrl: '/views/about/theapp.html'
	})

	.state('about.wasfi', {
		url: '/wasfi',
		templateUrl: '/views/about/wasfi.html'
	})

	.state('about.marco', {
		url: '/marco',
		templateUrl: '/views/about/marco.html'
	})

	.state('about.amanda', {
		url: '/amanda',
		templateUrl: '/views/about/amanda.html'
	})

	.state('profile.options', {
		url: '/options',
		templateUrl: '/views/profile/options-edit.html'
	})

	.state('profile.details', {
		url: '/details',
		templateUrl: '/views/profile/details-view.html'
	})

	.state('profile.details.edit', {
		url: '/edit',
		templateUrl: '/views/profile/details-edit.html'
	});
}])
.run(['$rootScope', '$state', function run($rootScope, $state) {
	// https://github.com/angular-ui/ui-router/issues/1584#issuecomment-75137373
	$rootScope.$on('$stateChangeStart', function(evt, to, params) {
		if (to.redirectTo) {
			evt.preventDefault();
			$state.go(to.redirectTo, params);
		}
	});
}]);


