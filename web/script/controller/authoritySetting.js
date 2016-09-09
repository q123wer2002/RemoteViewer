define( [
	'../../app',
], function( app ) {
	app.controller( 'SyntecAuthority', function( $scope, authorityMgr, featureMgr ) {
		
		$scope.objAuthorityMenu = {
			USERACCOUNT : {"name":"帳號管理", "style":{}, "isShow":false },
			TEMPLATE : {"name":"權限樣板", "style":{}, "isShow":false },
		};

		$scope.ShowContent = function( objMenu )
		{
			//defult
			for( var keyAuthority in $scope.objAuthorityMenu ){
				$scope.objAuthorityMenu[keyAuthority]['style'] = {};
				$scope.objAuthorityMenu[keyAuthority]['isShow'] = false;
			}

			//set select mark
			objMenu.isShow = true;
			objMenu.style = {"border-color":"#000000"};
		}

		//user
			//user list
				$scope.aryUserList = [];

			//add new user
				$scope.objNewUser = {
					account : "",
					password : "",
					authorityTmp : -1,
				};
				$scope.fnAddNewUser = function()
				{
					if( ($scope.objNewUser['account'].length == 0) || ($scope.objNewUser['password'].length == 0) || ($scope.objNewUser['authorityTmp'] == -1) ){
						return;
					}

					var account = $scope.objNewUser['account'];
					var password = $scope.objNewUser['password'];
					var authorityTmp = $scope.objNewUser['authorityTmp'];

					//create obj insert into user list
					var objUser = {"isEnable":true, "account":account, "password":password, "authorityTmp":authorityTmp, "isEdit":false};
					$scope.aryUserList.push(objUser);

					//clear objNewUser
					$scope.objNewUser['account'] = "";
					$scope.objNewUser['password'] = "";
					$scope.objNewUser['authorityTmp'] = -1;
				}

				$scope.fnDeleteUser = function( nIndex )
				{
					var user = $scope.aryUserList[nIndex];
					$scope.aryUserList.splice(nIndex,1);
				}
		//authority
			$scope.style = {'display':'none'};
			$scope.fnViewDetailAuthority = function()
			{
				$scope.style = {'display':'bolck'};
				
			}
			$scope.objAuthorityList = {
				WEB : authorityMgr.fnGetAuthorityList("WEB"),
				DISPLAYBOARD : authorityMgr.fnGetAuthorityList("DISPLAYBOARD"),
				MOBILE : authorityMgr.fnGetAuthorityList("MOBILE"),
			};

			$scope.objNewAuthorityTemp = authorityMgr.fnNewAuthority();
			$scope.fnTranslateItem = function(szKey)
			{
				//use feature translate function
				return featureMgr.fnTranslate(szKey);
			}
			$scope.fnCheckAuthorityOrCancel = function( objAuthority )
			{
				if( fnIsCheckAuthority(objAuthority) == false ){
					//add this authority
					fnAddAuthority(objAuthority);
					return;
				}

				//delete this authority
				//page delete
				if( szType == "PAGE" ){
					var nIndexOfPage = $scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType].indexOf(szKey);
					$scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType].splice(nIndexOfPage,1);
					return;
				}

				//feature
				if( typeof szValue == "undefined" ){
					//it's feature title
					delete $scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szKey];
					return;
				}

				var nIndexOfFeature = $scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szKey].indexOf(szValue);
				$scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szKey].splice(nIndexOfFeature,1);

				//last feature is been delete
				if( $scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szKey].length == 0 ){
					delete $scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szKey];
				}
			}
			fnAddAuthority = function(objAuthority)
			{
				var szType = objAuthority.TYPE;
				var szMode = objAuthority.MODE;
				var szData = objAuthority.DATA;
				//page add
				if( szType == "PAGE" ){
					$scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType].push(szData);
					return;
				}

				var szParent = objAuthority.PARENT;

				//feature add
				if( typeof $scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szKey] == "undefined" ){
					//create feature key object
					$scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szKey] = [];
				}

				if( szParent == null ){
					//add all feature
					for( var itemKey in $scope.objAuthorityList[szMode][szType][szKey] ){
						$scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szKey].push(itemKey);						
					}
					return;
				}

				//add only one feature
				$scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szKey].push(szValue);
			}
			fnIsCheckAuthority = function( objAuthority )
			{
				var szMode = objAuthority.MODE;
				var szType = objAuthority.TYPE;

				//page checkbox style
				if( szType == "PAGE" ){
					var szPageKey = objAuthority.DATA;
					if( $scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType].indexOf(szPageKey) != -1 ){
						return true;
					}
				}

				var szCurrentFeatureData = JSON.stringify($scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType]);
				var szData = objAuthority.DATA;

				if( szCurrentFeatureData.indexOf(szData) != -1 ){
					return true;
				}

				return false;
			}
			fnGetDefaultChildNum = function( objAuthority )
			{
				var nChild = 0;
				var szType = objAuthority.TYPE;
				if( szType == "PAGE" ){
					return -1;
				}

				var szMode = objAuthority.MODE;
				var szData = objAuthority.DATA;
				var szParent = objAuthority.PARENT;

				//level one
				if( szParent == null ){
					for( var key in $scope.objAuthorityList[szMode][szType][szData] ){
						nChild += Object.keys($scope.objAuthorityList[szMode][szType][szData][key]).length;
						nChild++;
					}

					return nChild;
				}

				//level two
				if( typeof $scope.objAuthorityList[szMode][szType][szParent] != "undefined" ){
					for( var key in $scope.objAuthorityList[szMode][szType][szParent][szData] ){
						nChild += Object.keys($scope.objAuthorityList[szMode][szParent][szData]).length;
					}

					return nChild;
				}

				return nChild;
			}
			fnGetCurrentChildNum = function( objAuthority )
			{
				var szType = objAuthority.TYPE;
				if( szType == "PAGE" ){
					return -1;
				}

				var szMode = objAuthority.MODE;
				var szData = objAuthority.DATA;
				var szParent = objAuthority.PARENT;

				//level one
				if( szParent == null ){
					return $scope.objNewAuthorityTemp[szMode][szType][szData].length;
				}

				//level two
				if( typeof $scope.objAuthorityList[szMode][szType][szParent] != "undefined" ){
					var nChild = 0;
					for( var key in $scope.objAuthorityList[szMode][szType][szParent][szData] ){
						if( $scope.objNewAuthorityTemp[szMode][szType][szData].indexOf(key) != -1 ){
							nChild++;
						}
					}
					return nChild;
				}

				return 0;
			}
			$scope.fnCheckAuthorityStyle = function( objAuthority )
			{
				if( fnIsCheckAuthority(objAuthority) == false ){
					return {};
				}

				var szType = objAuthority,TYPE;
				if( szType == "PAGE" ){
					//full
					return {"height":"9px","top":"1px","background":"#000"};
				}

				var szParent = objAuthority.PARENT;
				var szData = objAuthority.DATA;

				//level one
				var nDefaultChild = fnGetDefaultChildNum(objAuthority);
				var nCurrentChild = fnGetCurrentChildNum(objAuthority);

				if( nCurrentChild < nDefaultChild ){
					//half
					return {"height":"3px","top":"4px","background":"#000"};
				}

				return {"height":"9px","top":"1px","background":"#000"};
			}

			//save
			$scope.fnSaveAuthority = function()
			{
				if( $scope.objNewAuthorityTemp['TEMPLATE_NAME'] == "" ){
					$scope.szLogOfAuthority = "請輸入樣版名稱";
				}

				//TODO:check authority template is not empty
				console.log( $scope.objNewAuthorityTemp );
			}
	});
} );
