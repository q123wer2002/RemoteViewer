define([
	'../../app'
], function(app){
	app.controller('SyntecSetting',function ($scope,$http,$interval,accountMgr,frontendAdaptor){
		
		$scope.userInfo = {
			name		: {"name":"使用者名稱", "data":""},
			companyName	: {"name":"公司名稱", "data":""},
			companyInfo	: {"name":"公司資訊", "data":""},
			newPassword	: {"name":"新密碼", "data":""},
		};

		$scope.factoryInfo = [];
		$scope.selectedFactory = {};

		//db connected
			$scope.initSettingData = function()
			{
				this.fnGetResult = function(response){
					
					if(response.result != "success"){
						//Debug(json);
						return;	
					}

					//mapping data into userInfo
					for( key in $scope.userInfo ){
						if( key == "newPassword" ){continue;}
						$scope.userInfo[key].data = response.data.userInfo[ key ];
					}

					//mapping data into factoryInfo
					for( key in response.data.factoryInfo ){
						var inputSecond = response.data.factoryInfo[key].expected_work_time;
						
						var hour = Math.floor( inputSecond/3600 );
						inputSecond = inputSecond - hour*3600;
						var min		= Math.floor( inputSecond/60 );
						var sec		= inputSecond%60;

						var Obj = {
							hour : hour,
							minute : min,
							second : sec,
						};
						var factoryObj = {"fID":response.data.factoryInfo[key].factory_id, "name":response.data.factoryInfo[key].name, "address":response.data.factoryInfo[key].addr, "tel":response.data.factoryInfo[key].tel, "workOfDay":Obj, "isSelected":false, "style":{}};
						//Debug(response);
						$scope.factoryInfo.push( factoryObj );
					}
				}

				frontendAdaptor.fnGetResponse( 'ACCOUNT', "initSettingData", {}, this.fnGetResult, false );
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

				this.fnGetResult = function(response){
					if(response.result == "success"){
						$scope.errorMsg = "密碼更改成功、下次登入請使用新密碼，";
						$scope.userInfo['newPassword'].data = "";
					}
				}

				accountMgr.fnChangePwd($scope.userInfo['newPassword'].data, this.fnGetResult);
			}
		//input valid
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
			Bool_isValid = function(szString)
			{
				var aryInvalidChar = ['/','$','|','\\','(',')','[',']','{','}','~','*','+','.'];
				for( var i=0; i<aryInvalidChar.length; i++ ){
					if( szString.indexOf(aryInvalidChar[i]) != -1 ){
						return false;
					}
				}

				return true;
			}

	});
});