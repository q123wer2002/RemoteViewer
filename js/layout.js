
var SyntecRemoteWeb = angular.module('SyntecRemoteWeb',[]);

SyntecRemoteWeb.controller('SyntecRemote',['$scope','$http', '$interval',function SyntecRemote($scope,$http,$interval){

    //show the menu
    $scope.isShowMenu = false;
    $scope.showMenum = function(){
        if( $scope.isShowMenu ){
            $scope.isShowMenu = false;
        }else{
            $scope.isShowMenu = true;
        }
    }


    //timer
    $scope.timeToRefresh = 5;
    $interval(function(){
    	$scope.timeToRefresh--;
    	if($scope.timeToRefresh == 0){
    		$scope.timeToRefresh = 5;
    	}
    },1000);
    
    //factroy
    $scope.factories = [
        {'fid':1,'name':'工廠1'},
        {'fid':2,'name':'工廠2'},
        {'fid':3,'name':'工廠3'},
        {'fid':4,'name':'工廠4'},
        {'fid':5,'name':'工廠5'}
    ];

    //cnc group
    $scope.cncGroup = [
        {'fid':1,'number':25},
        {'fid':1,'number':5},
        {'fid':1,'number':15},
        {'fid':1,'number':2},
        {'fid':2,'number':5},
        {'fid':2,'number':8},
        {'fid':2,'number':9},
        {'fid':3,'number':5},
        {'fid':4,'number':25},
        {'fid':5,'number':9},
        {'fid':5,'number':18},
        {'fid':5,'number':3},
    ];

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
