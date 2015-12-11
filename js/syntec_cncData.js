
// google api for chart

SyntecRemoteWeb.controller('SyntecCnc',['$scope','$http','$timeout', '$interval',function SyntecCnc($scope,$http,$timeout,$interval){
    
    $scope.tabCode = 3;
    $scope.changeToStatus = function(){
        $scope.tabCode = 0;
        $scope.statusTabBG = {'background': '#ffffff'};
        $scope.alramTabBG = {'background': '#eeeeee'};
        $scope.recordTabBG = {'background': '#eeeeee'};
        $scope.OOETabBG = {'background': '#eeeeee'};
    }
    $scope.changeToAlarm = function(){
        $scope.tabCode = 1;
        $scope.statusTabBG = {'background': '#eeeeee'};
        $scope.alramTabBG = {'background': '#ffffff'};
        $scope.recordTabBG = {'background': '#eeeeee'};
        $scope.OOETabBG = {'background': '#eeeeee'};
    }
    $scope.changeToRecord = function(){
        $scope.tabCode = 2;
        $scope.statusTabBG = {'background': '#eeeeee'};
        $scope.alramTabBG = {'background': '#eeeeee'};
        $scope.recordTabBG = {'background': '#ffffff'};
        $scope.OOETabBG = {'background': '#eeeeee'};
    }
    $scope.changeToOOE = function(){
        $scope.tabCode = 3;
        $scope.statusTabBG = {'background': '#eeeeee'};
        $scope.alramTabBG = {'background': '#eeeeee'};
        $scope.recordTabBG = {'background': '#eeeeee'};
        $scope.OOETabBG = {'background': '#ffffff'};
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
                $scope.updateCncAlarm();
            break;

            case 2:
                //update word record
                $scope.updateCncWordRecord();
            break;
            case 3:
                //update OOE
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
        {'style':'', 'fontColor':'', 'msg':''},
    ];
    $scope.cncStatus = [
        {'status':'','mode':'','alarm':'','EMG':'','MainProg':'','CurProg':'', 'updateTime':''},
    ];
    $scope.cncAlarm = [];
    $scope.cncRecord = [
        {'CurProg':'', 'startDate':'', 'cycleTime':0, 'totalCycleTime':0, 'partCount':0, 'requirePartCount':0, 'totalPartCount':0, 'updateTime':''},
    ];


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

                $timeout(function(){
                    $scope.initCncProcess( json.data );
                    $scope.updateStatusLight( $scope.initCncid );
                },300);
            }
        }).
        error(function(json){
            console.warn(json);
        });
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

    //update status light
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
                    //console.log(json.data);
                    if( json.data.Alarm == "ALARM" ){
                        $scope.cncStatusIconPicker= 3 ;
                        $scope.statusLight.BGColor = {'background':'#ef6262'};
                        $scope.statusLight.fontColor={'color':'#ef6262'};
                        $scope.statusLight.msg = "ALARM";
                        $scope.statusLight.msgDetail = json.data.currentAlarm;
                        //
                    }else{
                        switch( json.data.Status ){
                            case"START":
                                $scope.cncStatusIconPicker= 2 ;
                                $scope.statusLight.BGColor = {'background':'#2aed44'};
                                $scope.statusLight.fontColor={'color':'#2aed44'};
                                $scope.statusLight.msg = json.data.Status;
                                //
                            break;
                            
                            default:
                                if( json.data.Status != null){
                                    $scope.cncStatusIconPicker= 1 ;
                                    $scope.statusLight.BGColor = {'background':'#f4d430'};
                                    $scope.statusLight.fontColor={'color':'#f4d430'};
                                    $scope.statusLight.msg = json.data.Status;
                                    //
                                }else{
                                    $scope.cncStatusIconPicker= 0 ;
                                }
                            break;
                        }
                    }
                    $scope.statusLight.UpdateTime = json.data.update_time;
                }
            }).
            error(function(json){
                console.warn(json);
            });
        }
    }

    //update status
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
                    //console.log(json.data);
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
            $scope.cncStatus.updateTime = cncStatusData.update_time;
        }
    }

    //update alarm
    $scope.updateCncAlarm = function(){
        if( $scope.initCncid != null){
            var initObject={"method":"updateCncAlarm", "cncid":$scope.initCncid };
            $http({
                method:'POST',
                url:'server/cncStatusAjax.php',
                data: $.param(initObject),
                headers: {'Content-type': 'application/x-www-form-urlencoded'},
            }).
            success(function(json){
                if( json.result == "success" ){              
                    $scope.writeCncAlarm( json.data );
                    //console.log(json.data);
                }
            }).
            error(function(json){
                console.warn(json);
            });
        }
    }
    $scope.writeCncAlarm = function( cncAlarmData ){
        //means feedback array is not empty
        if( cncAlarmData != null ){
            //means the number of alarm is not the same
            if( cncAlarmData.length != $scope.cncAlarm.length ){
                
                for(var i=0; i<cncAlarmData.length; i++){
                    for(var j=0; j<$scope.cncAlarm.length; j++){
                        var isthisAlarmExist = false;

                        //check this alarm is exist or not
                        if( $scope.cncAlarm[j].aid == cncAlarmData[i].aid ){
                            isthisAlarmExist = true;
                            continue;
                        } 
                    }

                    if( !isthisAlarmExist ){
                        var alarm = {'aid' : cncAlarmData[i].aid, 'almMsg' : cncAlarmData[i].almMsg, 'almTime' : cncAlarmData[i].almTime, 'updateTime' : cncAlarmData[i].update_time};
                        $scope.cncAlarm.push(alarm);
                    }
                }
            }
        }
    }

    //update work record
    $scope.updateCncWordRecord = function(){
        if( $scope.initCncid != null){
            var initObject={"method":"updateCncRecord", "cncid":$scope.initCncid };
            $http({
                method:'POST',
                url:'server/cncStatusAjax.php',
                data: $.param(initObject),
                headers: {'Content-type': 'application/x-www-form-urlencoded'},
            }).
            success(function(json){
                if( json.result == "success" ){              
                    $scope.writeCncRecord( json.data );
                    //console.log(json.data);
                }
            }).
            error(function(json){
                console.warn(json);
            });
        }
    }
    $scope.writeCncRecord = function( cncRecordData ){
        if( cncRecordData != null ){
            //update cnc status
            $scope.cncRecord.CurProg = cncRecordData.CurProg;
            $scope.cncRecord.startDate = cncRecordData.cycleStartDate;
            $scope.cncRecord.cycleTime = cncRecordData.cycleTime;
            $scope.cncRecord.totalCycleTime = cncRecordData.totalCycleTime;
            $scope.cncRecord.partCount = cncRecordData.partCount;
            $scope.cncRecord.requirePartCount = cncRecordData.requirePartCount;
            $scope.cncRecord.totalPartCount = cncRecordData.totalPartCount;
            $scope.cncRecord.updateTime = cncRecordData.update_time;
        }
    }

}]);

SyntecRemoteWeb.directive('ngOoeChart', ['$timeout',  function OOEChart($timeout) {
    return {
      restrict: 'A',
      link: function($scope, $elm, $attr) {
        // Some raw data (not necessarily accurate)
        var data = google.visualization.arrayToDataTable([
            ['日期', '稼動率', '加工時間', '閒置時間', '警報時間', '關機時間'],
            ['12/09',0.89, 13, 1.2, 0.7, 2.1],
            ['12/10',0.95, 12.5, 1.5, 0.8, 3.4],
            ['12/11',0.87, 11.8, 1.8, 1.5, 1.4],
            ['12/12',0.92, 13.2, 0.7, 0.8, 1.2],
            ['12/13',0.91, 12.8, 1.1,  1.3, 0.8],
            ['12/14',0.96, 13, 1.2, 0.7, 2.1],
            ['12/15',0.97, 12.5, 1.5, 0.8, 3.4],
            ['12/16',0.95, 11.8, 1.8, 1.5, 1.4],
            ['12/17',0.86, 13.2, 0.7, 0.8, 1.2],
            ['12/18',0.93, 12.8, 1.1,  1.3, 0.8]
        ]);

        var options = {
            title : '稼動率',
            vAxis: {
                0 : {//axis 0  OOE
                    title : '稼動率',
                    minValue : 0,
                    viewWindowMode : {min:0},
                }, 
                1 : {//axis 1 time
                    title : '時間(hr)',
                    minValue:0,
                    maxValue:100
                } 
            },
            hAxis: {title: '日期'},
            seriesType: 'bars',
            pointSize: 5,
            series: {
                0 : { //稼動率
                    color : "#1b2568",
                    targetAxisIndex : 0,
                    type: 'line',
                    pointShape: 'circle',
                },
                1 : { //加工
                    color : "#2aed44",
                    targetAxisIndex : 1,
                }, 
                2 : { //閒置
                    color : "#f4d430",
                    targetAxisIndex : 1,
                }, 
                3 : { //警報
                    color : "#ef6262",
                    targetAxisIndex : 1,
                }, 
                4 : { //關機
                    color : "#cecccc",
                    targetAxisIndex : 1,
                }, 
                
            },
        };

        var chart = new google.visualization.ComboChart( $elm[0] );

        $timeout(function(){
            chart.draw( data, options );
        },300);
      }
  }
}]);

google.setOnLoadCallback(function() {
    angular.bootstrap(document.body, ['SyntecRemoteWeb']);
});
google.load('visualization', '1', {packages: ['corechart']});