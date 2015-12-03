
var SyntecRemoteWeb = angular.module('SyntecRemoteWeb',[]);

SyntecRemoteWeb.controller('SyntecRemote',['$scope','$http', '$interval',function SyntecRemote($scope,$http,$interval){
    //logout
    $scope.logout = function(){
        var accountObject={"method":"logout"};
        $http({
            method:'POST',
            url:'server/accountAjax.php',
            data: $.param(accountObject),
            headers: {'Content-type': 'application/x-www-form-urlencoded'},
        }).
        success(function(json){
            switch( json.result ){
                case "success":
                    window.open( json.index, "_self");
                break;
                default:
                break;
            }
            //console.log(json);
        }).
        error(function(json){
            //console.log(json);
        });
    }

    $scope.initData = "";
    $scope.initFactoryNGroup = function(){
        var initObject={"method":"getIndexData"};
        $http({
            method:'POST',
            url:'server/factoryNgroupAjax.php',
            data: $.param(initObject),
            headers: {'Content-type': 'application/x-www-form-urlencoded'},
        }).
        success(function(json){
            if( json.result == "success" ){
                $scope.initData = json.data;
                //console.log( $scope.initData );
                $scope.initFayNGupProcess();
            }
        }).
        error(function(json){
            console.warn(json);
        });
    }

     //factroy
    $scope.factories = [];

    //cnc group
    $scope.cncGroups = [];

    $scope.initFayNGupProcess = function(){
        if( $scope.initData != null ){
            //input factory information
            for(var i=0; i < $scope.initData.factoryInfo.length; i++){
                var factory = {'fid' : $scope.initData.factoryInfo[i].fid, 'name' : $scope.initData.factoryInfo[i].name};
                $scope.factories.push( factory );
            }

            //input group information
            for (var i=0; i < $scope.initData.groupInfo.length; i++) {
                var group = {'fid' : $scope.initData.groupInfo[i].fid, 'gid':$scope.initData.groupInfo[i].gid, 'name' : $scope.initData.groupInfo[i].gname, 'cncNumber' : $scope.initData.groupInfo[i].cncNumber};
                $scope.cncGroups.push( group );
            }
        }
        //console.log($scope.cncGroups);
    }


    //show the menu
    $scope.isShowMenu = false;
    $scope.showMenum = function(){
        if( $scope.isShowMenu ){
            $scope.isShowMenu = false;
        }else{
            $scope.isShowMenu = true;
        }
    }    

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
