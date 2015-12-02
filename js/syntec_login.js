
SyntecRemoteWeb.controller('SyntecLogin',['$scope','$http', '$interval',function SyntecLogin($scope,$http,$interval){
	$scope.errorMsg = "";

	$scope.isValid = function( text ){
		var pattern = new RegExp("[~'!#$%^&*()-+_=:]");  
        
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
	
	$scope.login = function(){
		//1. check empty
		if( $scope.user == null || $scope.user == "" ){
			$scope.errorMsg = "帳號不能為空";
		}else if( $scope.password == null || $scope.password == "" ){
			$scope.errorMsg = "密碼不可以為空";
		}else if( !$scope.isValid( $scope.user ) ){
			//2. check sql injection
			$scope.user = "";
			$scope.password = "";
			$scope.errorMsg = "帳號密碼包含非法字符"; 
		}
		else{
			//clear error message
			$scope.errorMsg = "";

			//3. use ajax throw data
			var accountObject={"method":"login","user":$scope.user,"pwd":$scope.password};
			$http({
				method:'POST',
				url:'server/accountAjax.php',
				data: $.param(accountObject),
				headers: {'Content-type': 'application/x-www-form-urlencoded'},
			}).
			success(function(json){
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
	}


}]);