'use strict';
/**
 * Bonita AngularJS Portal demo
 * Author: Philippe Ozil
 * Project page: https://github.com/pozil/bonita-angular-oortal
 */

(function() {

var appModule = angular.module('angularPortal', ['ui.bootstrap', 'ngBonita']);

appModule.config(function (bonitaConfigProvider) {
    bonitaConfigProvider.setBonitaUrl('/bonita');
});


appModule.controller('PortalController', 
	['$scope', 'bonitaAuthentication',
	function ($scope, bonitaAuthentication) {
	
	var appCtrl = this;
	
	$scope.login = function(username, password, fnCallback) {
		bonitaAuthentication.login(username, password).then(function() {
			fnCallback(true);
		}, function() {
			fnCallback(false);
		});
	};
	
	$scope.logout = function() {
		bonitaAuthentication.logout();
	};
	
	$scope.isLogged = function() {
		return bonitaAuthentication.isLogged;
	};
	
	// Check for active session in case of page refresh
	bonitaAuthentication.checkForActiveSession();
}]);


// Login controller
appModule.controller('LoginController', ['$scope', function($scope){
	$scope.username = null;
	$scope.password = null;
	$scope.isLoginInProgress = false;
	$scope.errorMessage = null;
	
	this.login = function() {
		$scope.isLoginInProgress = true;
		$scope.errorMessage = null;
		$scope.login($scope.username, $scope.password, function(isSuccess) {
			$scope.username = null;
			$scope.password = null;
			$scope.isLoginInProgress = false;
			$scope.errorMessage = isSuccess ? null : "Login failed: invalid username or password.";
		});
	};
}]);


// Home page controller
appModule.controller('HomeController', ['$scope', 'bonitaConfig', function($scope, bonitaConfig) {
	
	$scope.getUsername = function () {
		return bonitaConfig.getUsername();
	};
	
}]);

appModule.filter('dateString', function() {
	return function(input) {
		 return input.substring(0, input.lastIndexOf('.'));
	};
});


// Process definition list controller
appModule.controller('ProcessDefinitionListController', 
	['$scope', '$sce', '$modal', 'bonitaConfig', 'bonitaAuthentication', 'ProcessDefinition', 
	function($scope, $sce, $modal, bonitaConfig, bonitaAuthentication, ProcessDefinition) {
	
	this.procDefs = null;
	var controller = this;
	
	this.refresh = function() {
		controller.procDefs = ProcessDefinition.getStartableByCurrentUser();
	};
	
	this.getCount = function() {
		if (controller.procDefs == null)
			return "-";
		else
			return controller.procDefs.totalCount;
	};
	
	// Opens a modal dialog displaying a Bonita case start form in an iFrame
	$scope.openBonitaCaseStartForm = function (procDef) {
		var dialog = $modal.open({
			templateUrl: 'directives/modal/bonitaForm.html',
			controller:  ['$scope', '$modalInstance', '$sce', 'bonitaConfig', function ($scope, $modalInstance, $sce, bonitaConfig) {
				$scope.cancel = function () {
					$modalInstance.dismiss('cancel');
				};
				$scope.getUrl = function () {
					return $sce.trustAsResourceUrl(bonitaConfig.getBonitaUrl() + '/portal/homepage?ui=form&locale=en&tenant=1#form=' 
						+ procDef.displayName + '--' + procDef.version + '$entry&process=' + procDef.id + '&autoInstantiate=false&mode=form');
				};
			}],
			size: 'lg'
		});
		dialog.result.finally(function() {
			// Broadcast refresh signal to listing
			$scope.$broadcast('refresh_list');
		});
	};
	
	// Init data when we acquire user session
	$scope.$watch(
		function () { return bonitaAuthentication.isLogged; },
		function (newValue, oldValue) {
			if (newValue === true)
				controller.refresh();
		}
	);
}]);


// Task list controller
appModule.controller('TaskListController',
	['$scope', '$sce', '$modal', 'bonitaConfig', 'bonitaAuthentication', 'HumanTask', 'ArchivedHumanTask',
	function($scope, $sce, $modal, bonitaConfig, bonitaAuthentication, HumanTask, ArchivedHumanTask){
	
	this.tasks = null;
	this.archivedTasks = null;
	
	var controller = this;
	
	this.refresh = function() {
		controller.tasks = HumanTask.getFromCurrentUser({d : 'processId'});
		controller.archivedTasks = ArchivedHumanTask.getCompletedByCurrentUser({d : 'processId'});
	};

	this.getTaskCount = function() {
		return (controller.tasks == null) ? "-" : controller.tasks.totalCount;
	};
	
	this.getArchivedTaskCount = function() {
		return (controller.archivedTasks == null) ? "-" : controller.archivedTasks.totalCount;
	};
	
	$scope.getPriorityIconClass = function(priority) {
		if (priority == 'highest')
			return {'glyphicon glyphicon-chevron-up priority-highest':true};
		if (priority == 'lowest')
			return {'glyphicon glyphicon-chevron-down priority-lowest':true};
		return {'glyphicon glyphicon-minus priority-normal':true};
	};
	
	// Opens a modal dialog displaying a Bonita task form in an iFrame
	$scope.openBonitaTaskForm = function(task) {
		var dialog = $modal.open({
			templateUrl: 'directives/modal/bonitaForm.html',
			controller:  ['$scope', '$modalInstance', '$sce', 'bonitaConfig', function ($scope, $modalInstance, $sce, bonitaConfig) {
				$scope.cancel = function () {
					$modalInstance.dismiss('cancel');
				};
				$scope.getUrl = function () {
					return $sce.trustAsResourceUrl(bonitaConfig.getBonitaUrl() + '/portal/homepage?ui=form&locale=en&tenant=1#form=' 
						+ task.processId.displayName + '--' + task.processId.version + '--' + task.displayName +'$entry&task=' + task.id + '&mode=form&assignTask=true');
				};
			}],
			size: 'lg'
		});
		dialog.result.finally(function() {
			// Broadcast refresh signal to listing
			$scope.$broadcast('refresh_list');
		});
	};
	
	// Init data when we acquire user session
	$scope.$watch(
		function () { return bonitaAuthentication.isLogged; },
		function (newValue, oldValue) {
			if (newValue === true)
				controller.refresh();
		}
	);
	
	// Global refresh signal listener
	$scope.$on('refresh_list', function(event) {
		controller.refresh();
	});
}]);


/*
* DIRECTIVES
*/

// Login screen
appModule.directive("login", function() {
	return {
		restrict: 'E',
		templateUrl: 'directives/login.html'
	};
});

// Home screen
appModule.directive("home", function() {
	return {
		restrict: 'E',
		templateUrl: 'directives/home.html'
	};
});


// Task lists
appModule.directive("humanTaskList", function() {
	return {
		restrict: 'E',
		templateUrl: 'directives/humanTaskList.html'
	};
});
appModule.directive("archivedHumanTaskList", function() {
	return {
		restrict: 'E',
		templateUrl: 'directives/archivedHumanTaskList.html'
	};
});

})();