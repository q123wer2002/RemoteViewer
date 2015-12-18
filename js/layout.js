
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
    //live
    $scope.isLiveFactory = "離線";


    //factroy
    $scope.factories = [];

    //cnc group
    $scope.cncGroups = [];
    $scope.PoolOfUpdateGroup = [];

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
                //console.log( json.data );
                $scope.initFayNGupProcess( json.data );
            }
        }).
        error(function(json){
            console.warn(json);
        });
    }

    $scope.initFayNGupProcess = function( initFacNGroData ){
        if( initFacNGroData != null ){
            //input factory information
            for(var i=0; i < initFacNGroData.factoryInfo.length; i++){
                var factory = {'fid' : initFacNGroData.factoryInfo[i].fid, 'name' : initFacNGroData.factoryInfo[i].name};
                $scope.factories.push( factory );
            }

            //input group information
            for (var i=0; i < initFacNGroData.groupInfo.length; i++){
                var group = {'fid' : initFacNGroData.groupInfo[i].fid, 'gid':initFacNGroData.groupInfo[i].gid, 'name' : initFacNGroData.groupInfo[i].gname, 'cncNumber' : initFacNGroData.groupInfo[i].cncNumber,
                            'YellowNum' : 0, 'GreenNum' : 0, 'RedNum' : 0, 'OfflineNum' : 0, 'YellowBarWidth':'','GreenBarWidth':'','RedBarWidth':'', 'OfflineWidth':''};
                $scope.cncGroups.push( group );
 
                $scope.PoolOfUpdateGroup.push( initFacNGroData.groupInfo[i].gid );
            }
        }
        //console.log($scope.cncGroups);

        //show factory name and group name
        $scope.getFactoryNGroup( $scope.initGid );
    }

    $interval( function(){
        $scope.updateGroupStatusBar();
    },1000);

    $scope.updateGroupStatusBar = function(){
        if( $scope.PoolOfUpdateGroup != null){
            for (var i=0; i<$scope.PoolOfUpdateGroup.length; i++){
                var initObject={"method":"updateGroupStatus", "gid":$scope.PoolOfUpdateGroup[i] };
                $http({
                    method:'POST',
                    url:'server/factoryNgroupAjax.php',
                    data: $.param(initObject),
                    headers: {'Content-type': 'application/x-www-form-urlencoded'},
                }).
                success(function(json){
                    if( json.result == "success" ){
                        //console.log(json.data);
                        $scope.writeGroupStatus( json.data );
                    }
                }).
                error(function(json){
                    console.warn(json);
                });
            }
        }
    }
    $scope.writeGroupStatus = function( GroupData ){
        if( GroupData != null ){
            //init
            var gid;
            var greenNum = 0;
            var yellowNum = 0;
            var redNum = 0;
            var offlineNum = 0;
            
            //count number of each light
            for(var i=0; i<GroupData.length; i++){
                gid = GroupData[i].gid;
                if( GroupData[i].NumOfStatus == "0" ){}
                else if( GroupData[i].Status == "OFFLINE" ){ offlineNum += parseInt( GroupData[i].NumOfStatus ); }
                else if( GroupData[i].Alarm == "ALARM" ){ redNum += parseInt( GroupData[i].NumOfStatus ); }
                else if( GroupData[i].Status == "START" ){ greenNum += parseInt( GroupData[i].NumOfStatus ); }
                else{ yellowNum += parseInt( GroupData[i].NumOfStatus ); }
            }

            //write back into group
            for(var i=0; i<$scope.cncGroups.length; i++){
                if( $scope.cncGroups[i].gid == gid ){
                    var totalNum = $scope.cncGroups[i].cncNumber;
                    //var restNum = totalNum - yellowNum - greenNum - redNum;

                    $scope.cncGroups[i].YellowNum = yellowNum;
                    $scope.cncGroups[i].GreenNum = greenNum;
                    $scope.cncGroups[i].RedNum = redNum;
                    $scope.cncGroups[i].OfflineNum = offlineNum;

                    $scope.cncGroups[i].YellowBarWidth = {'width' : (yellowNum/totalNum)*100 +'%' };
                    $scope.cncGroups[i].GreenBarWidth = {'width' : (greenNum/totalNum)*100 +'%' };
                    $scope.cncGroups[i].RedBarWidth = {'width' : (redNum/totalNum)*100 +'%' };
                    $scope.cncGroups[i].OfflineWidth = {'width' : (offlineNum/totalNum)*100 + '%'};
                    
                    if( totalNum != 0 && totalNum != null){
                        //show the status bar
                        jQuery(".StatusElement").css('display','block');
                    }
                }
            }
        }
    }

    $scope.getFactoryNGroup = function( gid ){
        if( gid != null && gid != "" ){
            var fid;

            //layout.js has cncGroups (array)
            for(var i=0; i<$scope.cncGroups.length; i++){
                if( $scope.cncGroups[i].gid == gid ){
                    fid = $scope.cncGroups[i].fid;
                    $scope.thisGroupName = $scope.cncGroups[i].name;
                    break;
                }
            }

            //layout.js has factories (array)
            for(var i=0; i<$scope.factories.length; i++){
                if( $scope.factories[i].fid == fid ){
                    $scope.thisFactoryName = $scope.factories[i].name;
                    break;
                }
            }
            
            //push id into scope
            $scope.gid = gid;
        }
    }


    //show the menu
    $scope.isShowMenu = false;
    $scope.showMenum = function(){
        if( $scope.isShowMenu ){
            $scope.isShowMenu = false;
        }else{
            //default css .menuDiv is display:none
            jQuery(".menuDiv").css('display','block');

            //default cross is display none
            jQuery('.cross').css('display','block');
            
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
