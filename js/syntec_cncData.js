
SyntecRemoteWeb.controller('SyntecCnc',['$scope','$http', '$interval',function SyntecCnc($scope,$http,$interval){
	$scope.cncInfo = [
    	'name','M7FG52','11MA'
    ];
    $scope.isShowAlarm = true;
    $scope.changeToAlarm = function(){
        $scope.isShowAlarm = true;
        $scope.alramTabBG = {'background': '#ffffff'};
        $scope.recordTabBG = {'background': '#eeeeee'};
    }
    
    $scope.changeToRecord = function(){
        $scope.isShowAlarm = false;
        $scope.alramTabBG = {'background': '#eeeeee'};
        $scope.recordTabBG = {'background': '#ffffff'};
    }
}]);