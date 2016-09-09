define([
	'../../app'
], function(app){
	app.controller('SyntecManuDispBoard', function ($scope, $http, $interval, $timeout, $routeParams, cfgMgr, cncDataMgr, customMgr,frontendAdaptor) {

		//param
		nCurFid = $routeParams.factory_id;

		//timer tick
		$scope.clock = "clock"; // initialise the time variable

		// update per second
		$scope.nRestTimeToUpdatePage = 0;
		var ncontentHeight = "60px";
		var ncontentAlpha = "1";
		var ncontentBorder = "1px";
		$interval(function() {
			//clock
			$scope.clock = Date.now();

			// Countdown change page timer
			$scope.nRestTimeToUpdatePage--;

			// time to update
			if ($scope.nRestTimeToUpdatePage <= 0) {

				// data shink animation
				ncontentHeight = "0px";
				ncontentAlpha = "0";
				ncontentBorder = "0px";

				//wait 0.5 second to let user feel the bar would be small
				$timeout(function(){
					//Reflash current page data
					fnUpdateCurrentPageData();

					// wait 0.5 second then expand grid
					$timeout(function() {
						ncontentHeight = "60px";
						ncontentAlpha = "1";
						ncontentBorder = "1px";

					}, 500);
				},500);

				//Reset timer
				$scope.nRestTimeToUpdatePage = $scope.nSecondToJumpView;
			}
		}, 1000);

		$scope.ENUMViewType = {
			listView: 0,
			bigView: 1,
		};
		$scope.viewType = $scope.ENUMViewType['listView'];

		
		$scope.nDivision = 0;
		$scope.nTotalDivision = 0;
		$scope.nCurrentCNCDataIndex = 999;
		$scope.nTotalPageCount = 0;
		$scope.nCurPageIndex = 0;
		$scope.AutoJumpView = function()
		{
			//total heigth
			var height = jQuery(document).height() - 150; //minus top(70) and footer heigth(50)
			//current view
			var currentH = jQuery(window).height() - 150; //minus top(70) and footer heigth(50)

			$scope.nTotalDivision = (Math.ceil(height / currentH) - 1); //start from 0

			if (currentH >= height) {
				return;
			}

			var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
			$body.animate({
				scrollTop: currentH * $scope.nDivision
			}, 300);
		}
		fnUpdateCurrentPageData = function()
		{
			// Calculate how much row per page
			var nWindowHeight = jQuery(window).height() - 260; //it's magic number...
			var nRowPerpage = Math.floor(nWindowHeight / 60); // item height(60)

			$scope.nCurrentCNCDataIndex = $scope.nCurrentCNCDataIndex + nRowPerpage;

			// loop while displing all data
			if ($scope.nCurrentCNCDataIndex >= $scope.cncData.length) {
				$scope.nCurrentCNCDataIndex = 0;
			}

			// update page data
			$scope.nTotalPageCount = Math.ceil( $scope.cncData.length / nRowPerpage );
			$scope.nCurPageIndex = Math.ceil(($scope.nCurrentCNCDataIndex + 1) / nRowPerpage) - 1;

			// get display CNC datas
			$scope.displayCncs = $scope.cncData.slice($scope.nCurrentCNCDataIndex, $scope.nCurrentCNCDataIndex + nRowPerpage);

			// get display Groups 
			$scope.displayGroups = fnGetGroupList($scope.displayCncs);
		}

		$scope.fnGoMainPage = function()
		{
			//dispose all factory
			customMgr.fnDispose();
			cncDataMgr.fnDispose();

			//link to default page
			window.open("#/","_self");
		}
		$scope.SelectLayout = function(viewType)
		{
			for (var i = 0; i < $scope.layoutList.length; i++) {
				if ($scope.layoutList[i].name == $scope.selectedLayout) {
					return $scope.layoutList[i]['web'][viewType];
				}
			}
		}

		$scope.ShowHTMLObj = function(cnc, viewObj)
		{
			var data = GetCncData( cnc, viewObj );

			switch( viewObj['viewer_data_name'] ){
				case "nOOE":
					return ( data == "" ) ? 0 : (Math.round(data*100)/100);
				break;
				case "dateAgentTime":
					return changeDateToTime( data );
				break;
				case "szStatus":
					return $scope.fnCNCStatusName(data,'cht');
				break;
				case "filePic":
					return "";
				break;
				default:
					return data;
				break;
			}
		}
		$scope.ShowIMGSrc = function(cnc, viewObj)
		{
			var data = GetCncData( cnc, viewObj );

			if( typeof data == "undefined" || data == "" || data == "undefined" ){
				return "images/cncs/cnc.jpg";
			}

			return "data:image/PNG;base64," + data;
		}
		GetCncData = function( cnc, viewObj )
		{
			if( typeof viewObj['viewer_data_name'] == "undefined" ){
				return "";
			}

			if( viewObj['viewer_data_name'] == "CustomerComponent" ){
				var cncData = cnc['aryData'][ "cuz_" + viewObj['name'] ];
				if( typeof cncData == "undefined" ){
					return "";
				}
				return cncData['value'];
			}

			var cncData = cnc['aryData'][viewObj['viewer_data_name']];
			if( typeof cncData == "undefined" ){
				return "";
			}
			return cncData['value'];
		}

		$scope.customColWidth = function()
		{
			var nWindowWidth = jQuery(window).width() - 490; //it's magic number...
			return Math.floor(nWindowWidth / 6) + "px";
		}

		//data
		$scope.factories = [];
		$scope.cncs = [];
		$scope.displayCncs = [];
		$scope.displayGroups = [];

		$scope.listViewTitle = {};
		$scope.selectedLayout = "";
		$scope.layoutList = [];

		$scope.customCulData = [];
		$scope.customMarquee = "";
		var customCulDataInfo = [];

		//init function
		var MappingNickname = [];
		var sliderSetting = [];
		$scope.cncData = [];
		$scope.fnInitData = function()
		{
			InitDashBoardData();
			InitSliderData();

			customMgr.fnInitCustomManager(["DASHBOARD","NICKNAME","DISPLAYBOARD"]);
			customMgr.fnFetchCustomData({"nFID":nCurFid},function(response){
				if( response.result != "success" ){
					return;
				}

				$scope.layoutList = customMgr.fnGetCustomData("DASHBOARD");
				MappingNickname = customMgr.fnGetCustomData("NICKNAME");
				sliderSetting = customMgr.fnGetCustomData("DISPLAYBOARD");
				
				//set layout
				$scope.SetLayout($scope.layoutList[ sliderSetting['layout_index'] ]);

				//set slider setting
					//marquee
					$scope.customMarquee = sliderSetting['marquee']['text'];
					//set jump second
					if( typeof sliderSetting['jump_second'] == "undefined" ){
						$scope.nSecondToJumpView = 5;	
					}else{
						$scope.nSecondToJumpView = sliderSetting['jump_second'];
					}
					//protected, the length must be same
					if( $scope.customCulData.length != sliderSetting['customer_area'].length ){
						return;
					}

					//set custom column data
					$scope.sliderCncData = fnGetDISPLAYBOARDCncData( sliderSetting['customer_area'] );

					//view
					for( var i=0; i<$scope.customCulData.length; i++ ){
						$scope.customCulData[i] = sliderSetting['customer_area'][i];
					}

					//mapping nickname
					for( var i=0; i<MappingNickname.length; i++ ){
						for( var j=0; j<$scope.customCulData.length; j++ ){
							if ($scope.customCulData[j].name == MappingNickname[i].componentName) {
								$scope.customCulData[j].nickname = MappingNickname[i].nickname;
							}
						}
					}
			});
		}
		InitDashBoardData = function()
		{
			this.fnGetResult = function(response){
				//Debug(response);
				if (response.result == "error") {
					Debug(response);
				}
				CreateDashboardObj(response.data);
			}
			
			var initDashboardObj = { "device": "web" };
			frontendAdaptor.fnGetResponse( 'DASHBOARD', "initDashboardData", initDashboardObj, this.fnGetResult, false );
		}
		CreateDashboardObj = function(initDashboardObj)
		{
			for( var i=0; i<initDashboardObj.length; i++ ){
				//group object
				var tmpGroupOnj = {"groupName":initDashboardObj[i].gName, "cncs":[]};
				
				//create cnc object
				for( var j=0; j<initDashboardObj[i].cncs.length; j++ ){

					if( initDashboardObj[i].cncs[j]['cnc_id'] == null){
						continue;
					}
					
					//only push cnc id into group
					tmpGroupOnj['cncs'].push( initDashboardObj[i].cncs[j]['cnc_id'] );
					
					//insert into cncs to manage
					$scope.cncs.push( initDashboardObj[i].cncs[j]['cnc_id'] );
				}

				//check and insert into factoryObj
				var nFIndex = GetFactoryIndex(initDashboardObj[i].fName, $scope.factories);
				if( nFIndex == -1 ){
					//means new factory
					var tmpFactoryObj = {"factoryName":initDashboardObj[i].fName, "fid":initDashboardObj[i].fid, "groups":[]};
					tmpFactoryObj['groups'].push( tmpGroupOnj );
					$scope.factories.push( tmpFactoryObj );
					
					continue;
				}

				$scope.factories[nFIndex]['groups'].push( tmpGroupOnj );
			}

			//Debug( $scope.factories );
		}
		$scope.SetLayout = function(layoutObj)
		{
			if( $scope.selectedLayout == layoutObj['name'] ){
				return;
			}

			//show to viewer
			$scope.selectedLayout = layoutObj['name'];
			$scope.listViewTitle = layoutObj['web']['listView'];

			//set layout component name into nickname
			SetLayoutComponentNickname(layoutObj);

			var aryAllDataSource = GetLayoutCncSource( 'web', layoutObj );

			//default
			cncDataMgr.fnDispose();

			//ready to get cnc data
			cncDataMgr.fnInitConstruct( $scope.cncs, aryAllDataSource['normal'], aryAllDataSource['customization'], function(response){
				m_fnSetSliderCustomCncData();
				cncDataMgr.fnStartFetching();
				$scope.cncData = cncDataMgr.fnGetCncDataPersistently();
			});
		}
		m_fnSetSliderCustomCncData = function()
		{
			//add into cnc data to fetch data
			for( var i=0; i<$scope.sliderCncData.length; i++ ){
				if( $scope.sliderCncData[i]['aryNormalCncData'].length != 0 ){
					cncDataMgr.fnAddDataIntoCnc( $scope.sliderCncData[i]['cnc_id'], $scope.sliderCncData[i]['aryNormalCncData'], function(response){} );
				}

				if( $scope.sliderCncData[i]['aryCustomData'].length != 0 ){
					cncDataMgr.fnAddCustomDataIntoCnc( $scope.sliderCncData[i]['cnc_id'], $scope.sliderCncData[i]['aryCustomData'] );
				}
			}
		}
		$scope.toggleFullScreen = function ()
		{
			if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
				if (document.documentElement.requestFullscreen) {
					document.documentElement.requestFullscreen();
				} else if (document.documentElement.msRequestFullscreen) {
					document.documentElement.msRequestFullscreen();
				} else if (document.documentElement.mozRequestFullScreen) {
					document.documentElement.mozRequestFullScreen();
				} else if (document.documentElement.webkitRequestFullscreen) {
					document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				}
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
			}
		}
		$scope.fullScrIcon = function()
		{
			if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
				return {'background-image':"url(images/fullScreen_icon.png)"}
			} else {
				return {'background-image':"url(images/exitFullScreen_icon.png)"}
			}
		}
		fnGetDISPLAYBOARDCncData = function( aryCustomCncData )
		{
			var aryCncData = [];

			//for each custom data to do
			for( var i=0; i<aryCustomCncData.length; i++ ){
				
				//only analyze cnc data
				if( aryCustomCncData[i]['type'] != "cnc_data" ){
					continue;
				}

				//check already exist in aryCncData or not
				var isExistCnc = false;
				var nCncIndex = -1;
				for( var j=0; j<aryCncData.length; j++ ){
					if( aryCncData[j]["cnc_id"] == aryCustomCncData[i]['cnc_id'] ){
						//yes, exist
						isExistCnc = true;
						nCncIndex = j;
						break;
					}
				}

				//check if customcomponent or normal data
				if( aryCustomCncData[i]['viewer_data_name'] == "CustomerComponent" ){
					//custom component
					if( nCncIndex != -1 ){ //exist in array
						//push correct cnc
						aryCncData[nCncIndex]['aryCustomData'].push( "cuz_" + aryCustomCncData[i]['name'] );
						continue;
					}

					//create cnc data obj
					var objCncDisplayBoardData = {
						"cnc_id" : aryCustomCncData[i]['cnc_id'],
						"aryCustomData" : [ "cuz_" + aryCustomCncData[i]['name'], ],
						"aryNormalCncData"	: [],
					};
					aryCncData.push( objCncDisplayBoardData );
					continue;
				}

				//normal data component
				if( nCncIndex != -1 ){ //exist in array
					//push correct cnc
					aryCncData[nCncIndex]['aryNormalCncData'].push( aryCustomCncData[i]['viewer_data_name'] );
					continue;
				}

				//create cnc data obj
				var objCncDisplayBoardData = {
					"cnc_id" : aryCustomCncData[i]['cnc_id'],
					"aryCustomData" : [],
					"aryNormalCncData"	: [ aryCustomCncData[i]['viewer_data_name'], ],
				};
				aryCncData.push( objCncDisplayBoardData );

			}

			return aryCncData;
		}
		$scope.ShowCustomCulData = function( cuzData )
		{
			var nCNCID = cuzData['cnc_id'];
			
			for( var i=0; i<$scope.cncData.length; i++ ){
				if( nCNCID == $scope.cncData[i]['nCNCID'] ){
					return $scope.ShowHTMLObj( $scope.cncData[i], cuzData );
				}
			}
		}
		
		GetFactoryIndex = function(factoryName, aryFactory)
		{
			for (var i = 0; i < aryFactory.length; i++) {
				if (aryFactory[i].factoryName == factoryName) {
					return i;
				}
			}
			return -1;
		}
		InitSliderData = function()
		{
			//create view obj
			for( var i=0; i<6; i++ ){
				$scope.customCulData[i] = [];
			}

			// custom marquee
			$scope.customMarquee = "loading...";
		}
		//layout component setting
		var aryAllDataSource;
		
		SetLayoutComponentNickname = function(layoutObj)
		{
			//foreach component in layout listview and bigview to translate name into nickname
			//listview first
			for (var key in layoutObj['web']['listView']) {
				for (var i = 0; i < MappingNickname.length; i++) {
					if (layoutObj['web']['listView'][key].name === MappingNickname[i].componentName) {
						layoutObj['web']['listView'][key].nickname = MappingNickname[i].nickname;
					}
				}
			}
		}
		GetLayoutCncSource = function(device, layoutObj)
		{
			var aryAllDataSource = [];
			var aryDataSource = [];
			var aryCuzComponent = [];

			//get from listview
			for (var key in layoutObj[device]['listView']) {

				var szSource = layoutObj[device]['listView'][key]["name"];
				var szType = layoutObj[device]['listView'][key]["viewer_data_name"];

				if (typeof szSource == "undefined") {
					continue;
				}

				//get customer component first
				if ((szType == "CustomerComponent") && (aryCuzComponent.indexOf(szSource) == -1)) {
					//add into customer array
					aryCuzComponent.push( "cuz_" + szSource);
					continue;
				}

				//get source
				if ((szSource == "") || (aryDataSource.indexOf(szSource) != -1) || (szType == "CustomerComponent")) {
					//already added
					continue;
				}

				aryDataSource.push(szType);
			}

			//get form big view
			for (var key in layoutObj[device]['bigView']) {
				for (var subKey in layoutObj[device]['bigView'][key]) {

					var szSource = layoutObj[device]['bigView'][key][subKey]["name"];
					var szType = layoutObj[device]['bigView'][key][subKey]["viewer_data_name"];

					if (typeof szSource == "undefined") {
						continue;
					}

					//get customer component first
					if ((szType == "CustomerComponent") && (aryCuzComponent.indexOf(szSource) == -1)) {
						//add into customer array
						aryCuzComponent.push( "cuz_" + szSource);
						continue;
					}

					if ((szSource == "") || (aryDataSource.indexOf(szSource) != -1) || (szType == "CustomerComponent")) {
						//already added
						continue;
					}

					aryDataSource.push(szType);
				}
			}

			aryAllDataSource['customization'] = aryCuzComponent;
			aryAllDataSource['normal'] = aryDataSource;
			return aryAllDataSource;
		}

		// get all group type in cnclist
		fnGetGroupList = function(cnclist)
		{
			var tmpGroupList = [];
			//check each group
			for( var i=0; i<$scope.factories[0]['groups'].length; i++ ){
				var groupName = $scope.factories[0]['groups'][i]['groupName'];
				var isFindCNC = false;

				//check cnclist
				for( var j=0; j<cnclist.length; j++ ){
					if( $scope.factories[0]['groups'][i]['cncs'].indexOf(cnclist[j]['nCNCID']) != -1 ){
						//find this cnc in this group
						//push group name
						isFindCNC = true;
						continue;
					}
				}

				if( isFindCNC == false ){
					continue;
				}

				tmpGroupList.push(groupName);
			}
			return tmpGroupList;
		}

		$scope.fnLayoutStyle = function()
		{
			var nExistCom = 0;
			var listView = $scope.layoutList[sliderSetting['layout_index']]['web']['listView'];
			for( var comKey in listView ){
				if( typeof listView[comKey]['name'] != "undefined"){
					nExistCom++;
				}
			}

			var nWidthOfEachCom = Math.floor(95/nExistCom);

			return {"width":nWidthOfEachCom + "%"};
		}
		$scope.fnSetCNCRowStyle = function(nIndex)
		{
			var normalStyle = {'height':ncontentHeight, 'line-height':ncontentHeight, 'opacity':ncontentAlpha};
			var bottonGroupSegStyle = {'border-bottom':"3px solid #B5DDF5"}

			var tmpStyle = normalStyle;

			// Group segmatation
			if( (nIndex + 1) < $scope.displayCncs.length ){
				var needSegmate = ($scope.displayCncs[nIndex].groupName != $scope.displayCncs[nIndex+1].groupName);
				if( needSegmate ){
					tmpStyle = $.extend(tmpStyle, bottonGroupSegStyle);
				}
			}

			return tmpStyle;
		}

		$scope.fnTopCuzStyle = function( szData ){

			if( typeof szData == "undefined" ){
				return {};
			}

			if( szData.length > 7 && szData.length <= 11 ){
				return {'font-size': '20px'};
			}else if( szData.length > 11 ){
				return {'font-size': '18px'};
			}

			return {};
		}

		$scope.fnSetCNCRowItemStyle = function()
		{
			//"font size" is set by directive			
			//width style
			var objStyle = $.extend($scope.fnLayoutStyle(),{'height':ncontentHeight, 'line-height':ncontentHeight, 'opacity':ncontentAlpha});

			return objStyle;
		}

		setBGColor = function(nIndex) {

			if (nIndex % 2 == 1) {
				return cfgMgr.view.formStyle['ODD'].color;
			}
			
			return cfgMgr.view.formStyle['EVEN'].color;
		}

		$scope.setDotStyle = function(nIndex){
			if(nIndex == $scope.nCurPageIndex){
				return {'opacity':".5"};
			}else{
				return {'opacity':".3"};
			}
		}

		// for ng-repeat use
		$scope.getNumberArry = function(num) {
			return new Array(num);
		}

	});
});