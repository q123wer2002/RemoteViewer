define(['../../app'], function (app) {
	app.controller('SyntecAccount', function($scope,$http,$interval,accountMgr,MODE,PATH){

		$scope.errorMsg = "";

		fnIsValid = function( text )
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
		
		$scope.fnLogin = function()
		{
			//1. check empty	
			if( $scope.user.account == null || $scope.user.account == "" ){
				$scope.errorMsg = "帳號不能為空";
				return;
			}

			if( $scope.user.password == null || $scope.user.password == "" ){
				$scope.errorMsg = "密碼不可以為空";
				return;
			}

			if( !fnIsValid( $scope.user.account ) ){
				//2. check sql injection
				$scope.user.account = "";
				$scope.user.password = "";
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

			//3. use frontend adaptor module to get data
			
			
			this.fnGetResult = function(response){
				switch( response.result ){
					case "noUser":
						$scope.errorMsg = "無此帳號";
					break;

					case "errorPwd":
						$scope.errorMsg = "密碼錯誤";
					break;

					case "success":
						//save user information
						window.open( PATH['WEBPATH'] , '_self');
					break;
					
					default:
					break;
				}
			}
			accountMgr.fnLogin( $scope.user.account, $scope.user.password, this.fnGetResult, MODE );
		}

	});
});