
SyntecRemoteWeb.controller('SyntecCncGroup',['$scope','$http', '$interval',function CncGroup($scope,$http,$interval){
	
    $scope.filterCncStatus = "";

    $scope.allCncStatus = [
        'START','ALARM','NOTREADY'
    ];

    $scope.initCncOverview = function(){

        var initObject={"method":"initCncOverview", "gid":$scope.initGid};
        $http({
            method:'POST',
            url:'server/cncStatusAjax.php',
            data: $.param(initObject),
            headers: {'Content-type': 'application/x-www-form-urlencoded'},
        }).
        success(function(json){
            if( json.result == "success" ){
                //console.log( json.data );
                $scope.initCncProcess( json.data );
            }
        }).
        error(function(json){
            console.warn(json);
        });
    }

    $scope.cncs = [];
    $scope.PoolOfUpdateCnc=[];
    $scope.initCncProcess = function( initCncData ){
        if( initCncData != null){
            for(var i=0; i<initCncData.length; i++){
                var cncInfo = {'id' : initCncData[i].CNC_id, 'serialNo' : initCncData[i].SerialNo, 'machine' : initCncData[i].Machine, 'machineType' : initCncData[i].MachineType, 'version' : initCncData[i].Version, 'dueDate' : initCncData[i].DueDate,
                               'status':'','mode':'','alarm':'','EMG':'','MainProg':'','CurProg':'','style':''};
                $scope.cncs.push( cncInfo );
                $scope.PoolOfUpdateCnc.push( initCncData[i].CNC_id );
            }
        }
        //console.log($scope.cncs);
        $scope.updateCncStatus();

        //show factory name and group name
        //$scope.getFactoryNGroup( $scope.initGid );
    }

    //timer
    $interval( function(){
        //update status every second
        $scope.updateCncStatus();
    },1000);

    //updating cnc status
    $scope.updateCncStatus = function(){
        if( $scope.PoolOfUpdateCnc != null){
            for (var i=0; i<$scope.PoolOfUpdateCnc.length; i++){
                var initObject={"method":"updateCncStatus", "cncid":$scope.PoolOfUpdateCnc[i] };
                $http({
                    method:'POST',
                    url:'server/cncStatusAjax.php',
                    data: $.param(initObject),
                    headers: {'Content-type': 'application/x-www-form-urlencoded'},
                }).
                success(function(json){
                    if( json.result == "success" ){
                        //console.log(json.data);
                        $scope.writeCncStatus( json.data );
                    }
                }).
                error(function(json){
                    console.warn(json);
                });
            }
        }
    }

    $scope.writeCncStatus = function( cncStatusData ){
        if( cncStatusData != null ){
            //only write one cnc status at same time
            for(var i=0; i<$scope.cncs.length; i++){
                //find cnc
                if( $scope.cncs[i].id == cncStatusData.cnc_id ){
                    //update cnc status
                    $scope.cncs[i].status = cncStatusData.Status;
                    $scope.cncs[i].mode = cncStatusData.Mode;
                    $scope.cncs[i].alarm = cncStatusData.Alarm;
                    $scope.cncs[i].EMG = cncStatusData.EMG;
                    $scope.cncs[i].MainProg = cncStatusData.MainProg;
                    $scope.cncs[i].CurProg = cncStatusData.CurProg;
                
                    //1. show the color by cnc status
                    $scope.changeCncStyle( $scope.cncs[i] );

                    break;
                }
            }

            
        }
    }

    $scope.changeCncStyle = function( cnc ){
        if( cnc != null ){
            if( cnc.alarm == "ALARM" ){
                cnc.style={'background':'rgba(255, 58, 58,0.5)', 'color':'#ffffff', 'height':'100%'};
            }
            else{
                switch( cnc.status ){
                    case"START":
                        // #8af779, #000000
                        cnc.style={'background':'#8af779', 'color':'#0000000'};
                    break;
                    default:
                        // #fff770
                        cnc.style={'background':'#fff770', 'color':'#0000000'};
                    break;
                }
            }
        }
    }

}]);