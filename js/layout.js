
var SyntecRemoteWeb = angular.module('SyntecRemoteWeb',[]);

SyntecRemoteWeb.controller('SyntecExample',['$scope','$http', '$interval',function Syntec($scope,$http,$interval){
    $scope.cncStatus = [
    	{'status' : 'Ready', 'code' : 1},
    	{'status' : 'Alarm', 'code' : 2},
    ];

    $scope.cncInfo = [
    	'name','M7FG52','11MA'
    ];

    $scope.timeToRefresh = 5;
    $interval(function(){
    	$scope.timeToRefresh--;
    	if($scope.timeToRefresh == 0){
    		$scope.timeToRefresh = 5;
    	}
    },1000);
    
    

}]);

//right click
SyntecRemoteWeb.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

//press enter
SyntecRemoteWeb.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                        scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});
