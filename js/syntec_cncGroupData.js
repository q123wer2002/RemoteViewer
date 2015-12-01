
SyntecRemoteWeb.controller('SyntecCncGroup',['$scope','$http', '$interval',function SyntecCncGroup($scope,$http,$interval){
	$scope.filterCncStatus = "";

    $scope.cncStatus = [
        {'status' : 'Ready', 'code' : 1},
        {'status' : 'Idle', 'code' : 2},
        {'status' : 'Process', 'code' : 3},
        {'status' : 'Alarm', 'code' : 4},
    ];

    $scope.cncs = [
        {'seriesNo':'M7F5852','status':1},
        {'seriesNo':'M7F5652','status':1},
        {'seriesNo':'M7F5752','status':2},
        {'seriesNo':'M7F5812','status':2},
        {'seriesNo':'M7F5452','status':3},
        {'seriesNo':'M7F5549','status':4},
        {'seriesNo':'M7G41852','status':4},
        {'seriesNo':'M7G5852','status':1},
        {'seriesNo':'M7F5752','status':2},
        {'seriesNo':'M7F5812','status':2},
        {'seriesNo':'M7F5452','status':3},
        {'seriesNo':'M7F5549','status':4},
        {'seriesNo':'M7G41852','status':4},
        {'seriesNo':'M7G5852','status':1},
    ];

}]);