
var SyntecRemoteWeb = angular.module('SyntecRemoteWeb',['ngRoute', 'luegg.directives']);

SyntecRemoteWeb.config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/',{
    })
    .when('/search', {
    templateUrl : 'templates/web/content/search.html',
    });
}]);

SyntecRemoteWeb.controller('MainController',['$scope','$http', '$interval', '$route', '$routeParams', '$location',function SyntecRemote($scope,$http,$interval,$route,$routeParams,$location){
    this.$route = $route;
    this.$location = $location;
    this.$routeParams = $routeParams;

    //need to change
    $scope.allDataList      =   [ "fID", "fName", "fTotalCNC", "fOOE", "fStatusOfCnc", "gID", "gName", "gTotalCNC", "gOOE", "gIPCAM", "gStatusOfCnc", "cncID", "cncName", "cncStatus", "cncPic", "cncMainProg", "cncOOE", "cncMode", "cncProcess", "cncRestTime", "cncInfo", "cncHisOOE", "cncHisRecord", "cncHisAlarm", "cncUpdateTime" ];
    $scope.factoryList      =   [ "fID", "fName", "fTotalCNC", "fOOE", "fStatusOfCnc" ];
    $scope.groupList        =   [ "gID", "gName", "gTotalCNC", "gOOE", "gIPCAM", "gStatusOfCnc" ];
    $scope.cncList          =   [ "cncID", "cncName", "cncStatus", "cncPic", "cncMainProg", "cncOOE", "cncMode", "cncProcess", "cncRestTime", "cncInfo", "cncUpdateTime" ];

    $scope.updateFacList    =   [ "fOOE", "fStatusOfCnc" ];
    $scope.updateGopList    =   [ "gOOE", "gIPCAM", "gStatusOfCnc" ];
    $scope.updateCncList    =   [ "cncOOE", "cncStatus", "cncMainProg", "cncMode", "cncProcess", "cncRestTime", "cncUpdateTime" ];
    $scope.cncHisDataList   =   [ "cncHisAlarm", "cncHisOOE", "cncHisRecord" ];

    //public var
    $scope.ENUM_Status = {
        START   : {name:'加工', color: '#8af779'},
        READY   : {name:'就緒', color: '#FFC600'},
        ALARM   : {name:'警報', color: '#FA6565'},
        OFFLINE : {name:'與控制器失聯', color: '#d8d8d6'},
        AGENTOFF: {name:'與搜集器失聯', color: '#CEB388'},
        ELSE    : {name:'其他', color: "#B6C1F5"},
    };//console.log($scope.ENUM_Status);
    $scope.cncBGColor = function( cnc )
    {
        if( cnc.cncStatus == "" ){
            return;
        }
        
        if( cnc.isElseStatus == false ){
            return $scope.ENUM_Status[cnc.cncStatus].color;
        }

        return  $scope.ENUM_Status['ELSE'].color;
    }
    $scope.cncStatusName = function( status )
    {
        switch( status ){
            case "START":
                return "加工";
            break;
            case "READY":
                return "就緒";
            break;
            case "NOTREADY":
                return "未就緒";
            break;
            case "FEEDHOLD":
                return "暫停";
            break;
            case "STOP":
                return "停止";
            break;
            case "ALARM":
                return "警報";
            break;
            case "OFFLINE":
                return "與控制器失聯";
            break;
            case "AGENTOFF":
                return "與搜集器失聯";
            break;
            default:
                return "***";
            break;
        }
    }


    //only in mobile
        $scope.showLeftMenu = function()
        {
            $scope.bgBlackDisplay = "block";
            $scope.leftMenuleftPx = "0px";
        }
        $scope.hideLeftMenu = function()
        {
            $scope.bgBlackDisplay = "none";
            $scope.leftMenuleftPx = "-100%";
        }
        $scope.openLink = function( url )
        {
            window.open( url, '_self' );
        }

    $scope.changeMode = function()
    {
        var changeModeObj={"method":"changeMode"};
        $http({
            method:'POST',
            url:'server/accountAjax.php',
            data: $.param(changeModeObj),
            headers: {'Content-type': 'application/x-www-form-urlencoded'},
        }).
        success(function(json){
            if(json.result == "success"){
                location.reload();
            }
            //console.log(json);
        }).
        error(function(json){
            //console.log(json);
        });
    }
    
    //logout
    $scope.logout = function()
    {
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

    //search area
    $scope.searchText = "";
    $scope.searchResult = {
        factory : [
            {'id':10, 'name':"苏州联聚自动化设备有限公司", 'addr':'苏州市跨塘镇春辉路9号', 'nGroup':7, 'nCNC':15 },
            {'id':11, 'name':"上海联聚自动化设备有限公司", 'addr':'上海市跨塘镇春辉路9号', 'nGroup':7, 'nCNC':15 },
        ],
        group   : [
            {'id':10, 'name':"蘇州聯聚", 'fName':'fname', 'nCNC':15 },
        ],
        cnc     : [
            {'id':10, 'name':"123456", 'status':'READY', 'gName':"456", 'fName':"987564" },
        ],
    };
    $scope.linkToSearchPage = function()
    {
        $scope.isSearch = true;
        window.open("#/search", "_self");
    }
    $scope.search = function()
    {
        
        if( $scope.searchText.length == 0 ){
            return;
        }

        var searchObject={"method":"search", "keyWord":$scope.searchText};
        $http({
            method:'POST',
            url:'server/searchDataAjax.php',
            data: $.param(searchObject),
            headers: {'Content-type': 'application/x-www-form-urlencoded'},
        }).
        success(function(json){
            if(json.result == "success"){
                //console.log(json.data);
            }
        }).
        error(function(json){
            //console.log(json);
        });
    }

}]);

SyntecRemoteWeb.filter('round', function() {
    return function(input) {
        return Math.round(input*100)/100;
    };
});

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
