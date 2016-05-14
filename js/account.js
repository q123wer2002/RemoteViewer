
SyntecRemoteWeb.controller('SyntecAccount',['$scope','$http', '$interval',function SyntecRemote($scope,$http,$interval){
	$scope.errorMsg = "";

	Bool_isValid = function( text )
	{
		var pattern = new RegExp("[~'!#$%^&*()-+=:]");  
        
        if( text != null || text != "" ){  
            if( pattern.test( text ) ){    
                return false;  
            }else{
            	return true;
            }
        }else{
        	return false;
        }
	}
	
	$scope.login = function()
	{
		//console.log($scope.userMode);
		//1. check empty
		
		if( $scope.user == null || $scope.user == "" ){
			$scope.errorMsg = "帳號不能為空";
			return;
		}

		if( $scope.password == null || $scope.password == "" ){
			$scope.errorMsg = "密碼不可以為空";
			return;
		}

		if( !Bool_isValid( $scope.user ) ){
			//2. check sql injection
			$scope.user = "";
			$scope.password = "";
			$scope.errorMsg = "帳號密碼包含非法字符"; 
			return;
		}

		if( typeof $scope.userMode == "undefined"){
			$scope.userMode = 2;
			//$scope.errorMsg = "請選擇登入模式"; 
			//return;
		}

		//clear error message
		$scope.errorMsg = "";

		//3. use ajax throw data
		var accountObject={"method":"login","user":$scope.user,"pwd":$scope.password,"userMode":$scope.userMode};
		$http({
			method:'POST',
			url:'server/accountAjax.php',
			data: $.param(accountObject),
			headers: {'Content-type': 'application/x-www-form-urlencoded'},
		}).
		success(function(json){
			console.log(json);
			switch( json.result ){
				case "noUser":
					$scope.errorMsg = "無此帳號";
				break;

				case "errorPwd":
					$scope.errorMsg = "密碼錯誤";
				break;

				case "success":
					location.reload();
				break;
				
				default:
				break;
			}
			//console.log(json);
		}).
		error(function(json){
			$scope.errorMsg = "伺服器繁忙，稍後再試";
			//console.log(json);
		});
	}

	/* setting page*/
		$scope.userInfo = {
			name : {"name":"使用者名稱", "data":""},
			companyName : {"name":"公司名稱", "data":""},
			companyInfo : {"name":"公司資訊", "data":""},
			newPassword : {"name":"新密碼", "data":""},
		};

		$scope.factoryInfo = [];

		$scope.initSettingData = function()
		{
			var initSetObj={ "method":"initSettingData" };
			$http({
				method:'POST',
				url:'server/accountAjax.php',
				data: $.param(initSetObj),
				headers: {'Content-type': 'application/x-www-form-urlencoded'},
			}).
			success(function(json){
				//console.log(json);
				if(json.result == "success"){
					//console.log(json.data);
					
					//mapping data into userInfo
					for( key in $scope.userInfo ){
						if( key == "newPassword" ){continue;}
						$scope.userInfo[key].data = json.data.userInfo[ key ];
					}

					//mapping data into factoryInfo
					for( key in json.data.factoryInfo ){
						var inputSecond = json.data.factoryInfo[key].expected_work_time;
						
						var hour = Math.floor( inputSecond/3600 );
						inputSecond = inputSecond - hour*3600;
						var min		= Math.floor( inputSecond/60 );
						var sec		= inputSecond%60;

						var Obj = {
							hour : hour,
							minute : min,
							second : sec,
						};
						var factoryObj = {"fID":json.data.factoryInfo[key].factory_id, "name":json.data.factoryInfo[key].name, "address":json.data.factoryInfo[key].addr, "tel":json.data.factoryInfo[key].tel, "workOfDay":Obj};
						//console.log( factoryObj );
						$scope.factoryInfo.push( factoryObj );
					}
				}
			}).
			error(function(json){
				$scope.errorMsg = "伺服器繁忙，稍後再試";
				//console.log(json);
			});
		}
		
		$scope.changePwd = function()
		{
			if( $scope.userInfo['newPassword'].data == null || $scope.userInfo['newPassword'].data.length == 0 ){
				$scope.errorMsg = "密碼不可以為空";
				return;
			}

			if( !Bool_isValid( $scope.userInfo['newPassword'].data ) ){
				$scope.userInfo['newPassword'].data = "";
				$scope.errorMsg = "密碼包含非法字符"; 
				return;
			}

			$scope.errorMsg = ""; 

			var pwdObject={ "method":"changePwd", "newPwd":$scope.userInfo['newPassword'].data };
			$http({
				method:'POST',
				url:'server/accountAjax.php',
				data: $.param(pwdObject),
				headers: {'Content-type': 'application/x-www-form-urlencoded'},
			}).
			success(function(json){
				//console.log(json);
				if(json.result == "success"){
					$scope.errorMsg = "密碼更改成功、下次登入請使用新密碼，";
					$scope.userInfo['newPassword'].data = "";
				}
			}).
			error(function(json){
				$scope.errorMsg = "伺服器繁忙，稍後再試";
				//console.log(json);
			});
			//console.log($scope.userInfo['newPassword'].data);
		}

		$scope.isValidTime = function( factory )
		{
			var secondOfADay = 24*60*60;
			
			var hour = (factory.workOfDay['hour'] == "") ? 0 : factory.workOfDay['hour'];
			var minute = (factory.workOfDay['minute'] == "") ? 0 : factory.workOfDay['minute'];
			var second = (factory.workOfDay['second'] == "") ? 0 : factory.workOfDay['second'];

			var thisTIme = parseInt(hour*60*60) + parseInt(minute*60) + parseInt(second);

			if( parseInt(thisTIme) == 0 ){
				factory.workOfDay['hour']	=	"";
				factory.workOfDay['minute']	=	"";
				factory.workOfDay['second']	=	"";
				factory.isValidTimeUnit		=	false;
				return;
			}

			//check hour first
			if( isNaN(factory.workOfDay['hour']) == true || factory.workOfDay['hour'] > 24 || factory.workOfDay['hour'] < 0 ){
				factory.workOfDay['hour'] = 0;
				$scope.isValidTime( factory );
			}
			secondOfADay -= factory.workOfDay['hour']*60*60;

			//check minute second
			if( isNaN(factory.workOfDay['minute']) == true || factory.workOfDay['minute'] > 60 || factory.workOfDay['minute'] < 0 ){
				factory.workOfDay['minute']	= 0;
				$scope.isValidTime( factory );
			}
			secondOfADay -= factory.workOfDay['minute']*60;
			if( secondOfADay < 0 ){
				factory.workOfDay['minute']	= 0;
				$scope.isValidTime( factory );
			}

			//check second third
			if( isNaN(factory.workOfDay['second']) == true || factory.workOfDay['second'] > 60 || factory.workOfDay['second'] < 0 ){
				factory.workOfDay['second']	= 0;
				$scope.isValidTime( factory );
			}
			secondOfADay -= factory.workOfDay['second'];
			if( secondOfADay < 0 ){
				factory.workOfDay['second']	= 0;
				$scope.isValidTime( factory );
			}

			factory.isValidTimeUnit = true;
		}

		$scope.setOOE = function( factory )
		{
			var timeObj = { "method":"setOOEStand", "factory":factory };
			$http({
				method:'POST',
				url:'server/accountAjax.php',
				data: $.param(timeObj),
				headers: {'Content-type': 'application/x-www-form-urlencoded'},
			}).
			success(function(json){
				//console.log(json);
				if(json.result == "success"){
					factory.isValidTimeUnit = false;
				}
			}).
			error(function(json){
				$scope.errorMsg = "伺服器繁忙，稍後再試";
				//console.log(json);
			});
		}


}]);