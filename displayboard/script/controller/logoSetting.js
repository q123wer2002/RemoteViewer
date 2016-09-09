define([
	'../../app'
], function (app) {
	app.controller('SyntecLogoSet',function ($scope,fileMgr){

		//menu bar
		$scope.settingMenu = {
			companyLogo : { "name":"公司圖片", "isShow":false, "style":{} },
		};
		
		$scope.fnLogoFrameStyle = function()
		{
			var logoInfo = jQuery("#logoFrame");

			var width = 1000;
			var height = width*logoInfo.height()/logoInfo.width();
			return {"width": width + "px", "height": height + "px", "padding":"16px"};
		}

		//click event
		$scope.ShowMenu = function( menuObj )
		{
			//clear all foucs
			for( var key in $scope.settingMenu ){
				$scope.settingMenu[key].isShow = false;
				$scope.settingMenu[key].style = {};
			}

			//set select mark
			menuObj.isShow = true;
			menuObj.style = {"border-color":"#000000"};
		}
		$scope.fnSelectedImg = function()
		{
			//open file
			jQuery("#fileupload").click();
		}

		$scope.fnUploadImg = function( files )
		{
			if( files.length == 0 ){
				return;
			}

			var file = files[0];
			var reader = new FileReader();
			reader.onload = function(event){
				$scope.loading = event.load;
				fileMgr.fnUploadFile( 0, event, "CompanyLogo", function(response){
					if( response.result == "success" ){
						//show logo to user
						jQuery("#companySmallLogo").attr('src', "data:image/png;base64," + response.data );

						//refresh logo (from app.js mainController)
						$scope.fnShowComapnyLogo();
					}
				});
			};
			reader.readAsDataURL(file);
		}

	});
});