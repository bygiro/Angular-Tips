(function() {
	angular.module('demoApp', ['ng-tips']).controller('demoCtrl', [
		'$scope','$window', function($scope, $window){
			
			$scope.tips = [
				{
					content:  'and',
					placement: 'top'
				},
				{
					content:  'Multi tooltip',
					placement: 'bottom'
				},
				{
					content:  'Simple',
					placement: 'left'
				},
				'lightweight'
			];
			
			$scope.settings = {
				//template: 'tooltip.html'
			}
		}
	]);
})();