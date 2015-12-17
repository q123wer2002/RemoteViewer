
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
        $scope.updateStatusLightNSysTime();

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
        {'id' :'', 'serialNo' : '', 'machine' : '', 'machineType' : '', 'version' : '', 'restTime' : ''},
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
                //console.log(json.data.cncTime);
                $timeout(function(){
                    $scope.initCncProcess( json.data );
                    $scope.updateStatusLightNSysTime( $scope.initCncid );
                },300);
            }
        }).
        error(function(json){
            console.warn(json);
        });
    }
    $scope.initCncProcess = function( initCncData ){
        if( initCncData != null){
            //info data
            if( initCncData.cncInfo != null ){
                $scope.thisCnc.id = initCncData.cncInfo.CNC_id;
                $scope.thisCnc.serialNo = initCncData.cncInfo.SerialNo;
                $scope.thisCnc.machine = initCncData.cncInfo.Machine;
                $scope.thisCnc.machineType = initCncData.cncInfo.MachineType;
                $scope.thisCnc.version = initCncData.cncInfo.Version;
                $scope.thisCnc.dueDate = initCncData.cncInfo.DueDate;
            }
            //time data
            if( initCncData.cncTime != null ){
                if( initCncData.cncTime.TimeStatus == "DT_NoTimeLimit" ){
                    $scope.thisCnc.restTime = "無限制";
                }else{
                    $scope.thisCnc.restTime = changetime2Date( "hour", initCncData.cncTime.TimeRemain );
                }
            }
        }
        //console.log("hello");
        
        $scope.updateCncStatus();
        //$scope.updaetCncAlarm();
        //$scope.updateCncRecord();
    }

    //update status light
    $scope.updateStatusLightNSysTime = function(){
        if( $scope.initCncid != null ){
            var initObject={"method":"updateStatusLightNSysTime", "cncid":$scope.initCncid };
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
                    //systime
                    $scope.cncSysTime = json.data.systime.TimeCurrent;
                    
                    //status and alarm
                    if( json.data.statusNalarm.Status == "OFFLINE" ){
                        $scope.cncStatusIconPicker= 0 ;
                        $scope.statusLight.BGColor = {'background':'#a4a6b2'};
                        $scope.statusLight.fontColor={'color':'#a4a6b2'};
                        $scope.statusLight.msg = json.data.statusNalarm.Status;
                    }
                    else if( json.data.statusNalarm.Alarm == "ALARM" ){
                        $scope.cncStatusIconPicker= 3 ;
                        $scope.statusLight.BGColor = {'background':'#ef6262'};
                        $scope.statusLight.fontColor={'color':'#ef6262'};
                        $scope.statusLight.msg = "ALARM";
                        $scope.statusLight.msgDetail = json.data.statusNalarm.currentAlarm;
                        //
                    }else{
                        switch( json.data.statusNalarm.Status ){
                            case"START":
                                $scope.cncStatusIconPicker= 2 ;
                                $scope.statusLight.BGColor = {'background':'#2aed44'};
                                $scope.statusLight.fontColor={'color':'#2aed44'};
                                $scope.statusLight.msg = json.data.statusNalarm.Status;
                                //
                            break;
                            
                            default:
                                if( json.data.statusNalarm.Status != null){
                                    $scope.cncStatusIconPicker= 1 ;
                                    $scope.statusLight.BGColor = {'background':'#f4d430'};
                                    $scope.statusLight.fontColor={'color':'#f4d430'};
                                    $scope.statusLight.msg = json.data.statusNalarm.Status;
                                    //
                                }else{
                                    $scope.cncStatusIconPicker= 999 ; //default
                                }
                            break;
                        }
                    }
                    $scope.statusLight.UpdateTime = json.data.statusNalarm.update_time;
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
                        if( $scope.cncAlarm[j].almTime == cncAlarmData[i].almTime ){
                            isthisAlarmExist = true;
                            continue;
                        } 
                    }

                    if( !isthisAlarmExist ){
                        var alarm = {'almMsg' : cncAlarmData[i].almMsg, 'almTime' : cncAlarmData[i].almTime, 'updateTime' : cncAlarmData[i].update_time};
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
            $scope.cncRecord.startDate = cncRecordData.cycleStartDate;
            $scope.cncRecord.cycleTime = changetime2Date( "second", cncRecordData.cycleTime );
            $scope.cncRecord.totalCycleTime = changetime2Date( "second", cncRecordData.totalCycleTime );
            $scope.cncRecord.totalPartCount = cncRecordData.partCount;
            $scope.cncRecord.requirePartCount = cncRecordData.requirePartCount;
            $scope.cncRecord.totalPartCount = cncRecordData.totalPartCount;
            $scope.cncRecord.updateTime = cncRecordData.update_time;
        }
    }

    $scope.updateOOE = function(){
        $scope.OOEDate = ['12/1', '12/2', '12/3', '12/4', '12/5', '12/6', '12/7', '12/8', '12/9', '12/10'];
        $scope.OOE = [95, 94, 89, 92, 90, 84, 96, 87, 93, 90];
        $scope.OOECycleTime = [15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 16, 13.9];
        $scope.OOEAlarmTime = [5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6, 3.9];
        $scope.OOEIdleTime = [5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6, 3.9];
        $scope.OOEOffTime = [5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6, 3.9];

        //OOE chart
        jQuery('.OOEChart').highcharts({
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: '稼動率圖表'
            },
            xAxis: [{
                categories: $scope.OOEDate,
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}%',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: '稼動率',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }, { // Secondary yAxis
                title: {
                    text: '時間',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value}hr',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: true
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'horizontal',
                align: 'center',
                x: 0,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            series: [{
                name: '稼動率',
                type: 'line',
                data: $scope.OOE,
                color: '#111d6d',
                zIndex: 2,
                tooltip: {
                    valueSuffix: ' %'
                }
            },{
                name: '加工時間',
                type: 'column',
                yAxis: 1,
                data: $scope.OOECycleTime,
                color: '#8af779',
                tooltip: {
                    valueSuffix: ' hr'
                }

            },{
                name: '警報時間',
                type: 'column',
                yAxis: 1,
                data: $scope.OOEAlarmTime,
                color: '#ef6262',
                tooltip: {
                    valueSuffix: ' hr'
                }

            },{
                name: '閒置時間',
                type: 'column',
                yAxis: 1,
                data: $scope.OOEIdleTime,
                color: '#fff770',
                tooltip: {
                    valueSuffix: ' hr'
                }

            },{
                name: '關機時間',
                type: 'column',
                yAxis: 1,
                data: $scope.OOEOffTime,
                color: '#bfbfbd',
                tooltip: {
                    valueSuffix: ' hr'
                }

            }]
        });
    }

}]);
