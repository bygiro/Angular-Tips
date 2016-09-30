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
			
			$scope.openModal = function(){
				angular.element(document.querySelectorAll('#backdrop')).addClass('modal-backdrop in');
				angular.element(document.querySelectorAll('#myModal')).addClass('in').css('display','block');
			}
			
			$scope.closeModal = function(){
				angular.element(document.querySelectorAll('#backdrop')).removeClass('modal-backdrop in');
				angular.element(document.querySelectorAll('#myModal')).removeClass('in').css('display','');
			}
		}
	]);
})();