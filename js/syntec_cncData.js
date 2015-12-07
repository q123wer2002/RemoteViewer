
SyntecRemoteWeb.controller('SyntecCnc',['$scope','$http', '$interval',function SyntecCnc($scope,$http,$interval){
    
    $scope.tabCode = 0;
    $scope.changeToStatus = function(){
        $scope.tabCode = 0;
        $scope.statusTabBG = {'background': '#ffffff'};
        $scope.alramTabBG = {'background': '#eeeeee'};
        $scope.recordTabBG = {'background': '#eeeeee'};
    }
    $scope.changeToAlarm = function(){
        $scope.tabCode = 1;
        $scope.statusTabBG = {'background': '#eeeeee'};
        $scope.alramTabBG = {'background': '#ffffff'};
        $scope.recordTabBG = {'background': '#eeeeee'};
    }
    $scope.changeToRecord = function(){
        $scope.tabCode = 2;
        $scope.statusTabBG = {'background': '#eeeeee'};
        $scope.alramTabBG = {'background': '#eeeeee'};
        $scope.recordTabBG = {'background': '#ffffff'};
    }

    //updating data every second
    $interval(function(){
        //update status light
        $scope.updateStatusLight();

        //update cnc information
        switch( $scope.tabCode ){
            case 0:
                //update status
                $scope.updateCncStatus();
            break;

            case 1:
                //update alarm
            break;

            case 2:
                //update srecord
            break;

            default:
            break;
        }
    },1000);

    //cnc information
    $scope.thisCnc = [
        {'id' :'', 'serialNo' : '', 'machine' : '', 'machineType' : '', 'version' : '', 'dueDate' : ''},
    ];
    $scope.statusLight = [
        {'style':'', 'fontColor':'', 'msg':''}
    ];
    $scope.cncStatus = [
        {'status':'','mode':'','alarm':'','EMG':'','MainProg':'','CurProg':''},
    ];
    $scope.cncAlarm = [];
    $scope.cncRecord = [];


    $scope.initCncDetail = function(){
        var initObject={"method":"initCncDetail", "cncid":$scope.initCncid};
        $http({
            method:'POST',
            url:'server/cncStatusAjax.php',
            data: $.param(initObject),
            headers: {'Content-type': 'application/x-www-form-urlencoded'},
        }).
        success(function(json){
            if( json.result == "success" ){
                //process data
                $scope.initCncProcess( json.data );
                console.log(json.data);
                
                //update status light ( cncid )
                $scope.updateStatusLight( $scope.initCncid );
            }
        }).
        error(function(json){
            console.warn(json);
        });
    }

    $scope.updateStatusLight = function(){
        if( $scope.initCncid != null ){
            var initObject={"method":"updateStatusLight", "cncid":$scope.initCncid };
            $http({
                method:'POST',
                url:'server/cncStatusAjax.php',
                data: $.param(initObject),
                headers: {'Content-type': 'application/x-www-form-urlencoded'},
            }).
            success(function(json){
                if( json.result == "success" ){              
                    //process status light
                    if( json.data.Alarm == "ALARM" ){
                        $scope.statusLight.style={'background':'rgba(255, 58, 58,0.5)', 'border-color':'#ef6262'};
                        $scope.statusLight.fontColor={'color':'#ef6262'};
                        $scope.statusLight.msg = "ALARM";
                    }else{
                        switch( json.data.Status ){
                            case"START":
                                $scope.statusLight.style={'background':'#8af779', 'border-color':'#14ff3b'};
                                $scope.statusLight.fontColor={'color':'#8af779'};
                                $scope.statusLight.msg = json.data.Status;
                            break;

                            default:
                                $scope.statusLight.style={'background':'#fff770', 'border-color':'#f4d430'};
                                $scope.statusLight.fontColor={'color':'#f4d430'};
                                $scope.statusLight.msg = json.data.Status;
                            break;
                        }
                    }
                }
            }).
            error(function(json){
                console.warn(json);
            });
        }
    }

    $scope.initCncProcess = function( initCncData ){
        if( initCncData != null){
            $scope.thisCnc.id = initCncData.CNC_id;
            $scope.thisCnc.serialNo = initCncData.SerialNo;
            $scope.thisCnc.machine = initCncData.Machine;
            $scope.thisCnc.machineType = initCncData.MachineType;
            $scope.thisCnc.version = initCncData.Version;
            $scope.thisCnc.dueDate = initCncData.DueDate;
        }
        //console.log("hello");
        
        $scope.updateCncStatus();
        //$scope.updaetCncAlarm();
        //$scope.updateCncRecord();
    }

    $scope.updateCncStatus = function(){
        if( $scope.initCncid != null){
            var initObject={"method":"updateCncStatus", "cncid":$scope.initCncid };
            $http({
                method:'POST',
                url:'server/cncStatusAjax.php',
                data: $.param(initObject),
                headers: {'Content-type': 'application/x-www-form-urlencoded'},
            }).
            success(function(json){
                if( json.result == "success" ){              
                    $scope.writeCncStatus( json.data );
                }
            }).
            error(function(json){
                console.warn(json);
            });
        }
    }
    $scope.writeCncStatus = function( cncStatusData ){
        if( cncStatusData != null ){
            //update cnc status
            $scope.cncStatus.status = cncStatusData.Status;
            $scope.cncStatus.mode = cncStatusData.Mode;
            $scope.cncStatus.alarm = cncStatusData.Alarm;
            $scope.cncStatus.EMG = cncStatusData.EMG;
            $scope.cncStatus.MainProg = cncStatusData.MainProg;
            $scope.cncStatus.CurProg = cncStatusData.CurProg;
        }
    }


}]);