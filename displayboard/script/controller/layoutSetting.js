define([
	'../../app'
], function(app){
	app.controller('SyntecLayoutSet',function($scope,$interval,customMgr,frontendAdaptor){
		
		$scope.curtTag = "";
		$scope.tagObjectAry = {
			newLayout		: { 'tagName':"清空樣式", "color":"#00A2E8", "isShow":false, "top":"20px" },
			myLayout		: { 'tagName':"我的樣式", "color":"#FFEC94", "isShow":false, "top":"70px" },
			viewFunList		: { 'tagName':"功能列表", "color":"#22B14C", "isShow":false, "top":"120px" },
			myCuzComponent	: { 'tagName':"客製元件", "color":"#F78185", "isShow":false, "top":"170px" },
		};
		InitTagName = function()
		{
			for( var key in $scope.tagObjectAry ){
				$scope.tagObjectAry[key].isShow = false;
			}
		}
		$scope.GetTagName = function( tagKey, tagValue )
		{
			if( tagValue.isShow == true ){
				return "收起";
			}
			return tagValue.tagName;
		}
		$scope.ShowLayoutItem = function( szTagKey, szTagValue, isSelectCom )
		{	
			//
			if( (isSelectCom == false) && ($scope.GetTagName(szTagKey,szTagValue) == "收起" || szTagKey == "newLayout") ){
				//hide
				jQuery('.layoutListLeftDiv').css('left','-210px');
				
				//init tag
				InitTagName();
				
				//new layout
				if( szTagKey == "newLayout" ){
					$scope.NewLayout( $scope.viewDevice );
				}
			}else{
				//init tag name
				InitTagName();

				//current tag name
				$scope.curtTag = szTagKey;

				//only show one tag
				szTagValue.isShow = true;

				//show
				jQuery('.layoutListLeftDiv').css('left','0px');
			}
		}
		$scope.NewLayout = function()
		{
			//new layout
			$scope.curtLayout = customMgr.fnGetDefaultStructure("DASHBOARD");

			//new layout, it cannot delete
			$scope.isCanDelete = false;
		}
		$scope.ViewMyLayout = function( layout )
		{
			//set layout component name into nickname
			SetLayoutComponentNickname( layout );

			//set selected layout into view
			$scope.curtLayout = layout;

			//close mylayout tag
			$scope.ShowLayoutItem('myLayout', $scope.tagObjectAry['myLayout'], false);
			
			//default layout cannot delete
			if( layout.name == "預設樣版" ){
				$scope.isCanDelete = false;
				return;
			}

			//means it can delete this layout from db
			$scope.isCanDelete = true;
		}
		SetLayoutComponentNickname = function( layout )
		{
			//foreach component in layout listview and bigview to translate name into nickname
			//listview first
			for( var key in layout['web']['listView'] ){
				for( var i=0; i<MappingNickname.length; i++ ){
					if( layout['web']['listView'][key].name === MappingNickname[i].componentName ){
						layout['web']['listView'][key].nickname = MappingNickname[i].nickname;
					}
				}
			}

			//bigview
			for( var LocationKey in layout['web']['bigView'] ){
				for( var subKey in layout['web']['bigView'][LocationKey] ){
					for( var i=0; i<MappingNickname.length; i++ ){
						//isExist
						if( Object.keys(layout['web']['bigView'][LocationKey][subKey]).length == 0 ){
							continue;
						}

						if( layout['web']['bigView'][LocationKey][subKey].name === MappingNickname[i].componentName ){
							layout['web']['bigView'][LocationKey][subKey].nickname = MappingNickname[i].nickname;
						}
					}
				}
			}		
		}

		$scope.isBigView = false;
		$scope.ShowViewHint = function( isBigView )
		{
			if( isBigView == true ){
				return "大圖式";
			}

			return "列表";
		}
		$scope.ShowSelectedComValue = function( isBigView )
		{
			if( $scope.selectedPosition.length == 0 ){
				return "";
			}

			//web
			//check is big view or list view
			var viewType = ( isBigView == true ) ? "bigView" : "listView";
			if( isBigView == false ){
				//list view
				//slected undefined component
				if(typeof $scope.curtLayout["web"][viewType][$scope.selectedPosition]  == "undefined" ){
					return "";
				}

				//return component name
				return $scope.curtLayout["web"][viewType][$scope.selectedPosition]["name"];
			}else{
				//big view
				var showObj = $scope.selectedPosition.split(",");

				return $scope.curtLayout["web"][viewType][showObj[0]][showObj[1]]["name"];
			}
		}
		$scope.ViewFunList = function( szListView )
		{
			//web
			if( szListView == "bigView" ){
				$scope.isBigView = true;
			}

			if( szListView == "listView" ){
				$scope.isBigView = false;
			}
		}
		$scope.SetComponentToSelected = function( isBigView, componentObj )
		{
			if( $scope.selectedPosition.length == 0 ){
				return;
			}

			var viewType = ( isBigView == true ) ? "bigView" : "listView";
			if( isBigView == false ){
				$scope.curtLayout["web"][viewType][$scope.selectedPosition] = componentObj;
			}else{
				var showObj = $scope.selectedPosition.split(",");
				$scope.curtLayout["web"][viewType][showObj[0]][showObj[1]] = componentObj;				
				ResizeViewSpace( $scope.curtLayout["web"][viewType][showObj[0]] );
			}
		}
		$scope.RemoveComponent = function( isBigView )
		{
			var viewType = ( isBigView == true ) ? "bigView" : "listView";
			if( isBigView == false ){
				$scope.curtLayout["web"][viewType][$scope.selectedPosition] = {};
			}else{
				var showObj = $scope.selectedPosition.split(",");
				$scope.curtLayout["web"][viewType][showObj[0]][showObj[1]] = {};
				
				ResizeViewSpace( $scope.curtLayout["web"][viewType][showObj[0]] );
			}
		}

	//rename component
		var isSelectedCuzComponent = false;
		$scope.TriggerComponentType = function()
		{
			if( isSelectedCuzComponent == true ){
				isSelectedCuzComponent = false;
				return;
			}

			isSelectedCuzComponent = true;
		}
		$scope.TriggerRenameMode = function( component )
		{
			if( component.isRenameMode == false ){
				component.isRenameMode = true;
				return;
			}

			SaveCuzComponentName(component);
			component.isRenameMode = false;
		}
		$scope.GetIsRenameType = function( component )
		{
			return component.isRenameMode;
		}
		$scope.StyleOfComponentInList = function( component )
		{
			if( component.isRenameMode == false && component.nickname.length == 0 ){
				return {};
			}

			if( component.isRenameMode == false ){
				return { "position":"absolute", "font-size":"9px", "left":"2px", "top":"2px" };
			}

			if( component.isRenameMode == true ){
				return {"display":"none"};
			}
		}
	//view funciton
		$scope.myLayoutList = [];
		var ComponentStructure = {
			"name"				: "",
			"nickname"			: "",//for rename
			"db_schema"			: "",//for agent to get data
			"viewer_data_name"	: "",//for viewer to find this data
			"value"				: "",//for get data use
			"big_view_size"		: "",//for show layout
			"isRenameMode"		: false,//for show layout
		};
		$scope.canUseComponentList = [];
		$scope.myCuzComponent = [];

		$scope.StyleOfEmptyListViewComponet = function( viewType, comObj )
		{
			if( viewType == "listView" && typeof comObj['name'] == "undefined" ){
				return {'background':"#AAFFC3"};
			}
		}
		$scope.isEmptyCom = function( viewType, comObj )
		{
			var nCountObj = Object.keys(comObj).length;

			if( nCountObj == 0 ){
				comObj['com1'] = {};
				comObj['com2'] = {};
				comObj['com3'] = {};
				comObj['com4'] = {};
				return;
			}

			if( nCountObj == 4 ){
				return;
			}

			ResizeViewSpace( comObj );
		}
		ResizeViewSpace = function( componentObj )
		{
			var nSpace = 0;
			var nComponentNum = 0;
			var componentNameAry = ['com1', 'com2', 'com3', 'com4'];
			
			for( var i=0; i<componentNameAry.length; i++ ){
				nSpace += CountViewSpace( componentObj[componentNameAry[i]] );
				nComponentNum = i;
				if( nSpace == 4 ){
					break;
				}
			}

			//not occupy 4 space, no 4 components
			while( nSpace < 4 ){
				componentObj[componentNameAry[nComponentNum]] = {};
				nSpace ++;
			}
			
			//not 4 components, but occupy 4 space
			if( nSpace == 4 && nComponentNum != 3 ){
				while( nComponentNum < 3 ){
					nComponentNum ++;
					if( typeof componentObj[componentNameAry[nComponentNum]] == "undefined" ){
						break;
					}

					if( Object.keys(componentObj[componentNameAry[nComponentNum]]).length == 0 ){
						delete componentObj[componentNameAry[nComponentNum]];
					}
				}
			}
		}
		CountViewSpace = function( objValue )
		{
			if( typeof objValue == "undefined" ){
				return 0;
			}

			if( typeof objValue['big_view_size'] == "undefined" ){
				return 1;
			}

			var nWH = objValue['big_view_size'].split("*");
			var nOccuSpace = parseInt(nWH[0])*parseInt(nWH[1]);

			return nOccuSpace;
		}

		$scope.objCubeStyle = function( viewObj )
		{
			switch( viewObj["big_view_size"] ){
				case "1*1":
					return {'width':'45%', 'height':'40px'};
				break;
				case "1*2":
					return {'width':'45%', 'height':'90px'};
				break;
				case "2*1":
					return {'width':'92%', 'height':'40px'};
				break;
				case "2*2":
					return {'width':'92%', 'height':'90px'};
				break;
			}
		}

		$scope.selectedPosition = "";
		$scope.SetViewComponent = function( szViewType, item )
		{
			//Debug(item);
			//var bigViewObj = item.split(",");
			$scope.selectedPosition = item;
			$scope.isBigView = ( szViewType == "listView" ) ? false : true;
			$scope.ShowLayoutItem('viewFunList', $scope.tagObjectAry['viewFunList'], true);
		}
	//connect db function
		var MappingNickname = [];
		$scope.InitLayoutSetting = function()
		{
			//init custom
			customMgr.fnInitCustomManager(["DASHBOARD","NICKNAME","COMPONENT"]);

			//start doing function
			var aryDashBoardLayout = [];
			var aryNicknameData = [];
			var aryComponentData = [];

			customMgr.fnFetchCustomData(0,function(response){
				if( response.result != "success" ){
					return;
				}

				//link
				aryDashBoardLayout = customMgr.fnGetCustomData("DASHBOARD");
				aryNicknameData = customMgr.fnGetCustomData("NICKNAME");
				aryComponentData = customMgr.fnGetCustomData("COMPONENT");

				//insert layout into local storage
				for( var i=0; i<aryDashBoardLayout.length; i++ ){
					$scope.myLayoutList.push(aryDashBoardLayout[i]);
				}

				//nickname
				MappingNickname = aryNicknameData;

				//Component init
				$scope.canUseComponentList = aryComponentData['normal'];
				//Customer Component
				$scope.myCuzComponent = aryComponentData['custom'];

				//mapping nickname into component
				MappingComponentNicknames();

				//set default layout
				$scope.NewLayout();
			});
		}
		MappingComponentNicknames = function()
		{
			//check component list
			for( var i=0; i<$scope.canUseComponentList.length; i++ ){
				for( var j=0; j<MappingNickname.length; j++ ){
					if( $scope.canUseComponentList[i].name === MappingNickname[j].componentName ){
						$scope.canUseComponentList[i].nickname = MappingNickname[j].nickname;
						continue;
					}
				}
			}

			//check customer list
			for( var i=0; i<$scope.myCuzComponent.length; i++ ){
				for( var j=0; j<MappingNickname.length; j++ ){
					if( $scope.myCuzComponent[i].name === MappingNickname[j].componentName ){
						$scope.myCuzComponent[i].nickname = MappingNickname[j].nickname;
						continue;
					}
				}
			}
		}

		//Save layout
			IsValidLayoutName = function( szLayoutName )
			{
				//default name, cannot be same
				if( szLayoutName == "預設樣版" ){
					return false;
				}

				//already exist layout name
				for( var i=0; i<$scope.myLayoutList.length; i++ ){
					if( $scope.myLayoutList[i]['name'] == szLayoutName ){
						return false;
					}
				}

				return true;
			}
			$scope.SaveLayoutIntoDB = function()
			{
				if( $scope.curtLayout['name'] == "" ){
					$scope.errorMsg = "名稱未輸入";
					return;
				}

				if( IsValidLayoutName($scope.curtLayout['name']) == false ){
					$scope.errorMsg = "名字重複，請重新輸入";
					return;
				}

				//save
				$scope.errorMsg = "儲存資料中..";

				customMgr.fnSaveCustomData(0,"DASHBOARD",$scope.curtLayout['name'],$scope.curtLayout,function(response){
					$scope.errorMsg = "儲存完畢";

					//insert into layout list
					$scope.myLayoutList.push($scope.curtLayout);
				});
			}
		//Delete layout
			$scope.isCanDelete = false;
			$scope.DeleteLayout = function()
			{
				//delete
				$scope.errorMsg = "刪除樣版中..";

				customMgr.fnDeleteCustomData(0,"DASHBOARD",$scope.curtLayout['name'],function(response){
					//show message
					$scope.errorMsg = "刪除成功";
						
					//delete layout from layout list
					for( var i=0; i<$scope.myLayoutList.length; i++ ){
						if( $scope.myLayoutList[i]['name'] == $scope.curtLayout['name'] ){
							//find this layout, to delete it
							delete $scope.myLayoutList[i];

							//brand new layout
							$scope.NewLayout();
						}
					}
				});
			}
		//Save Rename Component
			var MappingNickname = [];
			AddNicknameIntoData = function( component )
			{
				var isExistNickname = false;
				for( var i=0; i<MappingNickname.length; i++ ){
					if( MappingNickname[i].componentName == component.name ){
						isExistNickname = true;
						MappingNickname[i].nickname = component.nickname;
						break;
					}
				}

				if( isExistNickname == false ){
					var nicknameObj = {"componentName":component.name, "nickname":component.nickname};
					MappingNickname.push( nicknameObj );
				}
			}
			SaveCuzComponentName = function( component )
			{
				AddNicknameIntoData( component );
				customMgr.fnSaveCustomData(0,"NICKNAME","NICKNAME",MappingNickname,function(response){});
			}
	});
});