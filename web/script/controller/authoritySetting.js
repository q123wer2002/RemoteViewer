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
			$scope.isAddNewAuthority = false;
			$scope.myAuthorityList = [];			
			$scope.fnInitAuthority = function()
			{
				//init authority list
				$scope.objAuthorityList = {
					WEB : authorityMgr.fnGetAuthorityList("WEB"),
					DISPLAYBOARD : authorityMgr.fnGetAuthorityList("DISPLAYBOARD"),
					MOBILE : authorityMgr.fnGetAuthorityList("MOBILE"),
				};

				//init new authority
				$scope.objNewAuthorityTemp = authorityMgr.fnNewAuthority();

				//init my authority list
				$scope.myAuthorityList = authorityMgr.fnInitAuthority("EDIT");
				for( var i=0; i<$scope.myAuthorityList.length; i++ ){
					$scope.myAuthorityList[i]['isEdit'] = false;
					$scope.myAuthorityList[i].szDetailHint = "展開細項";
					$scope.myAuthorityList[i]['style'] = {'height':'0px','overflow':'hidden'};
				}
			}
			$scope.fnTranslateItem = function(szKey)
			{
				//use feature translate function
				return featureMgr.fnTranslate(szKey);
			}
			$scope.fnCheckAuthorityOrCancel = function( objAuthority, objAuthorityBox )
			{
				if( fnIsCheckAuthority(objAuthority,objAuthorityBox) == false ){
					//add this authority
					fnAddAuthority(objAuthority,objAuthorityBox);
					return;
				}

				var szMode = objAuthority.MODE;
				var szType = objAuthority.TYPE;
				var szData = objAuthority.DATA;
				//delete this authority
				//page delete
				if( szType == "PAGE" ){
					var nIndexOfPage = objAuthorityBox['AUTHORITY'][szMode][szType].indexOf(szData);
					objAuthorityBox['AUTHORITY'][szMode][szType].splice(nIndexOfPage,1);
					return;
				}

				var szParent = objAuthority.PARENT;

				//feature
				if( szParent == null ){
					//it's feature title
					delete objAuthorityBox['AUTHORITY'][szMode][szType][szData];
					return;
				}

				var szMyRoot = (typeof $scope.objAuthorityList[szMode][szType][szParent] != "undefined") ? objAuthority.PARENT : objAuthority.ROOT;;
				
				var nIndexOfFeature = objAuthorityBox['AUTHORITY'][szMode][szType][szMyRoot].indexOf(szData);
				objAuthorityBox['AUTHORITY'][szMode][szType][szMyRoot].splice(nIndexOfFeature,1);

				if( szParent == szMyRoot ){
					for( var subKey in $scope.objAuthorityList[szMode][szType][szParent][szData] ){
						var nIndexOfFeature = objAuthorityBox['AUTHORITY'][szMode][szType][szParent].indexOf(subKey);
						if( nIndexOfFeature == -1 ){
							continue;
						}
						objAuthorityBox['AUTHORITY'][szMode][szType][szParent].splice(nIndexOfFeature,1);
					}
				}
				
				//last feature is been delete
				if( objAuthorityBox['AUTHORITY'][szMode][szType][szMyRoot].length == 0 ){
					delete objAuthorityBox['AUTHORITY'][szMode][szType][szMyRoot];
				}
			}
			fnAddAuthority = function( objAuthority, objAuthorityBox )
			{
				var szType = objAuthority.TYPE;
				var szMode = objAuthority.MODE;
				var szData = objAuthority.DATA;
				//page add
				if( szType == "PAGE" ){
					objAuthorityBox['AUTHORITY'][szMode][szType].push(szData);
					return;
				}

				var szParent = objAuthority.PARENT;

				//level one
				if( szParent == null ){
					if( typeof objAuthorityBox['AUTHORITY'][szMode][szType][szData] == "undefined" ){
						//new array
						objAuthorityBox['AUTHORITY'][szMode][szType][szData] = [];
					}

					//add all feature
					for( var itemKey in $scope.objAuthorityList[szMode][szType][szData] ){
						//level three
						if( Object.keys($scope.objAuthorityList[szMode][szType][szData][itemKey]).length != 0 ){
							for( var subItemKey in $scope.objAuthorityList[szMode][szType][szData][itemKey] ){
								objAuthorityBox['AUTHORITY'][szMode][szType][szData].push(subItemKey);
							}	
						}

						objAuthorityBox['AUTHORITY'][szMode][szType][szData].push(itemKey);
					}
					return;
				}

				var szMyRoot = (typeof $scope.objAuthorityList[szMode][szType][szParent] != "undefined") ? objAuthority.PARENT : objAuthority.ROOT;;

				if( typeof objAuthorityBox['AUTHORITY'][szMode][szType][szMyRoot] == "undefined" ){
					objAuthorityBox['AUTHORITY'][szMode][szType][szMyRoot] = [];
				}

				objAuthorityBox['AUTHORITY'][szMode][szType][szMyRoot].push(szData);

				//add parent
				if( szMyRoot != szParent ){
					var nIndexOfFeature = objAuthorityBox['AUTHORITY'][szMode][szType][szMyRoot].indexOf(szParent);
					if( nIndexOfFeature != -1 ){
						return;
					}

					var tempObj = {MODE:szMode,TYPE:szType,DATA:szParent,PARENT:szMyRoot};
					fnAddAuthority(tempObj,objAuthorityBox);
				}			
			}
			fnIsCheckAuthority = function( objAuthority, objAuthorityBox )
			{
				var szMode = objAuthority.MODE;
				var szType = objAuthority.TYPE;

				//page checkbox style
				if( szType == "PAGE" ){
					var szPageKey = objAuthority.DATA;
					if( objAuthorityBox['AUTHORITY'][szMode][szType].indexOf(szPageKey) != -1 ){
						return true;
					}
				}

				var szCurrentFeatureData = JSON.stringify(objAuthorityBox['AUTHORITY'][szMode][szType]);
				var szData = objAuthority.DATA;

				if( szCurrentFeatureData.indexOf(szData) != -1 ){
					return true;
				}

				return false;
			}
			fnGetDefaultChildNum = function( objAuthority )
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
					var nChild = 0;
					for( var key in $scope.objAuthorityList[szMode][szType][szData] ){
						nChild += Object.keys($scope.objAuthorityList[szMode][szType][szData][key]).length;
						nChild++;
					}

					return nChild;
				}

				//level two
				/*if( typeof $scope.objAuthorityList[szMode][szType][szParent] != "undefined" ){
					for( var key in $scope.objAuthorityList[szMode][szType][szParent][szData] ){
						nChild += Object.keys($scope.objAuthorityList[szMode][szParent][szData]).length;
					}

					return nChild;
				}*/

				return 0;
			}
			fnGetCurrentChildNum = function( objAuthority, objAuthorityBox )
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
					return objAuthorityBox['AUTHORITY'][szMode][szType][szData].length;
				}

				//level two
				/*if( typeof $scope.objAuthorityList[szMode][szType][szParent] != "undefined" ){
					var nChild = 0;
					for( var key in $scope.objAuthorityList[szMode][szType][szParent][szData] ){
						if( $scope.objNewAuthorityTemp['AUTHORITY'][szMode][szType][szData].indexOf(key) != -1 ){
							nChild++;
						}
					}
					return nChild;
				}*/

				return 0;
			}
			$scope.fnCheckAuthorityStyle = function( objAuthority, objAuthorityBox )
			{
				if( fnIsCheckAuthority(objAuthority,objAuthorityBox) == false ){
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
				var nCurrentChild = fnGetCurrentChildNum(objAuthority,objAuthorityBox);

				if( nCurrentChild < nDefaultChild ){
					//half
					return {"height":"3px","top":"4px","background":"#000"};
				}

				return {"height":"9px","top":"1px","background":"#000"};
			}
			$scope.fnIsShowCncFeatureList = function( objAuthority, objAuthorityBox )
			{
				var szMode = objAuthority.MODE;
				
				if( $scope.objAuthorityList[szMode]['CNCFEATURE'] == null ){
					return false;
				}
				
				if( objAuthorityBox['AUTHORITY'][szMode]['PAGE'].indexOf('CNC') != -1 ){
					return true;
				}

				return false;
			}
			$scope.fnChangeDetailStatus = function( authority )
			{
				if( authority.szDetailHint == "展開細項" ){
					authority.szDetailHint = "縮小";
					authority.style = {'min-height':'200px', 'max-height':''};
					return;
				}

				authority.szDetailHint = "展開細項";
				authority.style = {'height':'0px','overflow':'hidden'};
			}

			//edit
			$scope.fnEditAuthority = function( objAuthorityBox )
			{
				objAuthorityBox.isEdit = true;
			}
			//delete
			$scope.fnDelAuthority = function( objAuthorityBox )
			{
				authorityMgr.fnDeleteAuthority(objAuthorityBox);
			}

			//save
			$scope.fnSaveAuthority = function( objAuthorityBox )
			{
				if( objAuthorityBox['TEMPLATE_NAME'] == "" ){
					$scope.szLogOfAuthority = "請輸入樣版名稱";
					return;
				}

				for( var i=0; i<$scope.myAuthorityList.length; i++ ){
					if( ($scope.myAuthorityList[i]['TEMPLATE_NAME'] == objAuthorityBox['TEMPLATE_NAME']) && ($scope.myAuthorityList[i]['AUTHORITY_TEMPLATE_ID'] != objAuthorityBox['AUTHORITY_TEMPLATE_ID']) ){
						$scope.szLogOfAuthority = "樣版名稱不能重複";
						return;		
					}
				}

				var isEmptyPage = true;
				for( var szMode in objAuthorityBox['AUTHORITY'] ){
					if( objAuthorityBox['AUTHORITY'][szMode]['PAGE'].length != 0 ){
						isEmptyPage = false;
						break;
					}
				}

				if( isEmptyPage == true ){
					$scope.szLogOfAuthority = "請設定頁面權限";
					return;
				}

				//save
				$scope.szLogOfAuthority = "";
				authorityMgr.fnSaveAuthority( objAuthorityBox );

				//flag
				$scope.isAddNewAuthority = false;

				if( typeof objAuthorityBox['isEdit'] == "undefined" ){
					return;
				}

				objAuthorityBox['isEdit'] = false;
			}
	});
} );
