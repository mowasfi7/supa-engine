'use strict';

angular.module('clientApp')
.config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/notfound');

	$stateProvider
	.state('home', {
		url: '/',
		templateUrl: '/views/home/main.html',
		controller: 'HomeCtrl',
		abstract: true
	})
	.state('about', {
		url: '/about',
		templateUrl: '/views/about/main.html',
		abstract: true
	})
	.state('profile', {
		url: '/profile',
		templateUrl: '/views/profile/main.html',
		abstract: true
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

}]);
