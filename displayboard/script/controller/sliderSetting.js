define([
	'../../app'
], function(app){
	app.controller('SyntecSliderSet',function ($scope,$interval,$timeout,$routeParams,customMgr,frontendAdaptor){

		$interval(function(){
			$scope.clock = Date.now();
		}, 1000);

		$scope.sliderPages = {
			"VIEWER"		: {"name":"播放首頁", "isSelected":false, "style":{}},
			//"IPCAM"			: {"name":"播放IPCAM", "isSelected":false, "style":{}},
			//"FACTORYLAYOUT"	: {"name":"播放工廠平面圖", "isSelected":false, "style":{}},
			"SLIDERSETTING"	: {"name":"播放設定", "isSelected":false, "style":{}},
		};

		var nFactoryID = $routeParams.factory_id;

		$scope.ShowSliderPage = function( sliderPage )
		{
			//set all slider page into default
			for( var page in $scope.sliderPages ){
				$scope.sliderPages[page].isSelected = false;
				$scope.sliderPages[page].style = {};
			}
			
			//set selected page
			$scope.sliderPages[sliderPage].isSelected = true;
			$scope.sliderPages[sliderPage].style = {"color":"#000", "border-bottom":"2px solid #000"};
		}
		var isInitReadMonitorDone = false;
		$scope.StyleOfRealMonitorView = function()
		{
			var monitorWidth = $(document).width();
			var monitorHeight = $(document).height();

			var maxLength = 500;
			
			if( monitorWidth < monitorHeight ){
				return {"width":maxLength+"px", "height":(monitorHeight*maxWidth)/monitorWidth+"px"};	
			}

			//flag to load
			isInitReadMonitorDone = true;

			return {"width":(monitorWidth*maxLength)/monitorHeight+"px", "height":maxLength+"px"};
		}
		$scope.SelectFactory = function()
		{
			var nFactoryID = $routeParams.factory_id;

			//init factory object
			InitFactoryObj( nFactoryID );

			//create factory comsponent
			CreateCustomerAreaObj();
		}
		$scope.ExitFactory = function()
		{
			//default object
			DestoryFactoryObj();
			nFactoryID = 0;

			//link to default page
			window.open( "#/", "_self" );
		}
		DestoryFactoryObj = function()
		{
			$scope.CNCDataCustomer['cnc_list'] = [];
			$scope.CNCDataCustomer['use_component'] = [];
		}

		//create customer area
			GetCustomerAreaInfo = function()
			{
				//calculate width
				var nTotalWidth = jQuery("#header").width();
				var nLogoWidth = jQuery("#logoImg").width();
				var nTimeWidth = 280;
				var nCustomerWidth = nTotalWidth-nLogoWidth-nTimeWidth;

				//calculate fitness number of area
				var nMinArea = 3;
				var nMaxArea = 6;
				var areaHeight = jQuery("#header").height();

				return {"width":Math.round((nCustomerWidth/nMaxArea)*100)/100, "height":areaHeight, "number":nMaxArea};
			}
			CreateCustomerAreaObj = function()
			{
				//clear 
				$scope.sliderSetting['customer_area'] = [];
						
				//check is done or not every 300ms 
				var interval_createCustomComponent = $interval(function(){
					if( isInitReadMonitorDone == true ){
						//load component width height
						var areaInfo = GetCustomerAreaInfo();

						for( var i=0; i<areaInfo.number; i++ ){
							var obj = { "type":"", "style":{'width':areaInfo.width+"px"} };
							$scope.sliderSetting['customer_area'].push(obj);
						}

						//load done, cleat interval
						$interval.cancel(interval_createCustomComponent);
					}
				},300);
			}
		
		$scope.sliderSetting = {
			"customer_area"	: [],
			"marquee"		: {text:"",},
			"jump_second"	: 5, //5 second
			"layout_index"	: 0, //default
		};
		//customer area setting
			var customerCNCObj = {
				"type"			: "cnc_data",
				"fun_type"		: "",
				"cnc_id"		: 0,
				"name"			: "",
				"nickname"		: "",
				"db_schema"		: "",
				"viewer_data_name": "",
				"value"			: "",
			};
			var customerTextObj = {
				"type"		: "plaintext",
				"title"		: "",
				"content"	: "",
			};

			$scope.tmpData = {};
			$scope.selectedArea = {};
			CustomerAreaDefaultSetting = function()
			{
				$scope.selectedArea = {
					"INDEX" : -1, //default
					"DATA"	: {},
					"STYLE" : {},
				};

				//set default
				$scope.tmpData = {
					"TYPE"	: "",
					"CNC"	: {
						"FUN_TYPE"	: "",
						"FUNCTION"	: "",
					},
					"TEXT"	: {
						"TITLE"		: "",
						"CONTENT"	: "",
					},
				};

				customerCNCObj = {
					"type"			: "cnc_data",
					"style"			: "",
					"cnc_id"		: 0,
					"name"			: "",
					"nickname"		: "",
					"db_schema"		: "",
					"viewer_data_name": "",
					"value"			: "",
				};

				customerTextObj = {
					"type"		: "plaintext",
					"style"		: "",
					"title"		: "",
					"content"	: "",
				};
			}
			DefaultStyleOfCustomerArea = function()
			{
				for( var i=0; i<$scope.sliderSetting['customer_area'].length; i++ ){
					$scope.sliderSetting['customer_area'][i]['style']['background'] = "#4DB6AC";
				}
			}
			$scope.AddCustomerArea = function( area, nIndex )
			{
				//default (css)
				$scope.CloseCustomerArea();

				//is already setting
				if( area.type.length == 0 ){ //no
					//set to select customer area
					$scope.selectedArea = {};
					$scope.selectedArea['INDEX'] = nIndex;
					$scope.selectedArea['DATA'] = area;
					$scope.selectedArea['STYLE'] = area.style;
				}else{ //yes
					SetCustomerAreaData( area, nIndex );
				}

				//css setting
				area.style['background'] = "#B9F1EC";
				
				//show editint div
				jQuery(".SelectCustomerComponent").css({"left":"0px"});
			}
			SetCustomerAreaData = function( cuzAreaObj, nIndex )
			{
				var dataObj = {};
				if( cuzAreaObj.type == "cnc_data" ){
					dataObj = {
						"type"			: "cnc_data",
						"fun_type"		: cuzAreaObj.fun_type,
						"cnc_id"		: cuzAreaObj.cnc_id,
						"name"			: cuzAreaObj.name,
						"nickname"		: cuzAreaObj.nickname,
						"db_schema"		: cuzAreaObj.db_schema,
						"viewer_data_name": cuzAreaObj.viewer_data_name,
						"value"			: cuzAreaObj.value,
					};
				}else if( cuzAreaObj.type == "plaintext" ){
					dataObj = {
						"type"		: "plaintext",
						"title"		: cuzAreaObj.title,
						"content"	: cuzAreaObj.content,
					};
				}else{
					//do nothing
					return;
				}

				$scope.tmpData = {
					"TYPE"	: cuzAreaObj.type,
					"CNC"	: {
						"FUN_TYPE"	: cuzAreaObj.fun_type,
					},
					"TEXT"	: {
						"TITLE"		: cuzAreaObj.title,
						"CONTENT"	: cuzAreaObj.content,
					},
				};

				$scope.selectedArea = {
					"INDEX" : nIndex, //default
					"DATA"	: dataObj,
					"STYLE" : cuzAreaObj.style,
				};
			}
			$scope.CloseCustomerArea = function()
			{
				DefaultStyleOfCustomerArea();
				CustomerAreaDefaultSetting();
				jQuery(".SelectCustomerComponent").css({"left":"-100%"});	
			}
			$scope.SelectDataType = function( dataType )
			{
				if( dataType == "cnc_data" ){
					$scope.selectedArea['DATA'] = customerCNCObj;
				}else if( dataType == "plaintext" ){
					$scope.selectedArea['DATA'] = customerTextObj;
				}else{
					//do nothing
				}
			}
			// text edit
				$scope.PlaintextEditing = function( textObj )
				{
					//protected
					if( $scope.selectedArea['DATA']['type'] != "plaintext" ){
						return;
					}

					$scope.selectedArea['DATA']['title'] = textObj.TITLE;
					$scope.selectedArea['DATA']['content'] = textObj.CONTENT;
				}
			// cnc data edit
				$scope.SetCNC = function( cnc )
				{
					if( $scope.selectedArea['DATA']['type'] != "cnc_data" ){
						return;
					}
					
					$scope.selectedArea['DATA']['cnc_id'] = cnc.cnc_id;
				}
				$scope.StyleOfSelectedCNC = function( cnc )
				{
					//not cnc data
					if( typeof $scope.selectedArea['DATA'] == "undefined" || $scope.selectedArea['DATA']['type'] != "cnc_data" ){
						return {"background":"none"};
					}

					if( cnc.cnc_id == $scope.selectedArea['DATA']['cnc_id'] ){
						return {"background":"#fff"};
					}

					return {"background":"none"};
				}
				$scope.SelectCNCFunType = function( fType )
				{
					if( $scope.selectedArea['DATA']['type'] != "cnc_data" ){
						return;
					}

					$scope.selectedArea['DATA']['fun_type'] = fType;
				}
				$scope.SetCNCFunction = function( f )
				{
					if( $scope.selectedArea['DATA']['type'] != "cnc_data" ){
						return;
					}
					
					for( var key in f ){
						$scope.selectedArea['DATA'][key] = f[key];
					}
				}
				$scope.StyleOfSelectedFunction = function( f )
				{
					if( $scope.selectedArea['DATA']['type'] != "cnc_data" ){
						return {};
					}

					if( f['name'] == $scope.selectedArea['DATA']['name'] ){
						return {"background":"#fff"};
					}

					return {"background":"none"};
				}
			$scope.SaveCustomerArea = function()
			{
				//save data into slider setting
				var index = $scope.selectedArea['INDEX'];
				var data = $scope.selectedArea['DATA'];
				var style = $scope.selectedArea['STYLE'];

				$scope.sliderSetting['customer_area'][index] = data;
				$scope.sliderSetting['customer_area'][index]['style'] = style;
				
				//set default data
				delete index;
				delete data;
				delete style;
				$scope.CloseCustomerArea();

				//save into database
				SaveSliderSetting();
			}
		//marquee
			$scope.marquee = {
				text	: "跑馬燈設定(雙點擊編輯)",
				isEdit	: false,
			};
			$scope.EditMarquee = function()
			{
				$scope.marquee.isEdit = true;
			}
			$scope.SaveMarquee = function()
			{
				$scope.marquee.isEdit = false;

				//save into marquee
				$scope.sliderSetting['marquee'].text = $scope.marquee.text;

				//save into database
				SaveSliderSetting();
			}
			$scope.isEditOfMarquee = function()
			{
				return $scope.marquee.isEdit;
			}
		//database related
			$scope.CNCDataCustomer = {
				"cnc_list" 				: [],
				"use_component" 		: [],
				"my_customer_component"	: [],
			};
			$scope.SaveJumpSecond = function()
			{
				SaveSliderSetting();
			}
			//page init
			//factory init
				InitFactoryObj = function( nFID )
				{
					InitizlCNCList( nFID );

					customMgr.fnInitCustomManager(["DISPLAYBOARD","COMPONENT","NICKNAME","DASHBOARD"]);
					customMgr.fnFetchCustomData({"nFID":nFID},function(response){
						if( response.result != "success" ){
							return;
						}

						var aryDisplayboardData = customMgr.fnGetCustomData("DISPLAYBOARD");
						var aryComponentData = customMgr.fnGetCustomData("COMPONENT");
						MappingNickname = customMgr.fnGetCustomData("NICKNAME");
						var aryDashboardData = customMgr.fnGetCustomData("DASHBOARD");

						//dashboard
							$scope.aryDashboard = aryDashboardData;
						//displayboard
							//mapping data into slider setting
							var DBSliderSetting = aryDisplayboardData;
							for( var i=0; i<DBSliderSetting['customer_area'].length; i++ ){
								//max = 6s
								DBSliderSetting['customer_area'][i]['style'] = new Object();
								DBSliderSetting['customer_area'][i]['style'] = $scope.sliderSetting['customer_area'][i].style;
							}
							$scope.sliderSetting = DBSliderSetting;

							//mapping marquee
							$scope.sliderSetting['marquee'] = DBSliderSetting['marquee'];
							$scope.marquee['text'] = DBSliderSetting['marquee']['text'];
						//component
							$scope.CNCDataCustomer['my_customer_component'] = aryComponentData['custom'];
							$scope.CNCDataCustomer['use_component'] = aryComponentData['normal'];
						//nickname
							MappingComponentNicknames();
					});
				}
				//init cnc list
					InitizlCNCList = function( nFID )
					{
						this.fnGetResult = function(response){
							if( typeof response.data == "undefined" || response.data.length == 0 ){
								return;
							}

							//set cnc list into layout
							$scope.CNCDataCustomer['cnc_list'] = response.data;
						}

						var initCNCListObj={ "nFID":nFID };
						frontendAdaptor.fnGetResponse( 'SLIDER', "initCNCListFromFactory", initCNCListObj, this.fnGetResult, false );
					}	
				MappingComponentNicknames = function()
				{
					//check component list
					for( var i=0; i<$scope.CNCDataCustomer['use_component'].length; i++ ){
						for( var j=0; j<MappingNickname.length; j++ ){
							if( $scope.CNCDataCustomer['use_component'][i].name === MappingNickname[j].componentName ){
								$scope.CNCDataCustomer['use_component'][i].nickname = MappingNickname[j].nickname;
								continue;
							}
						}
					}

					//check customer list
					for( var i=0; i<$scope.CNCDataCustomer['my_customer_component'].length; i++ ){
						for( var j=0; j<MappingNickname.length; j++ ){
							if( $scope.CNCDataCustomer['my_customer_component'][i].name === MappingNickname[j].componentName ){
								$scope.CNCDataCustomer['my_customer_component'][i].nickname = MappingNickname[j].nickname;
								continue;
							}
						}
					}	
				}
			//load and save
				SaveSliderSetting = function()
				{
					customMgr.fnSaveCustomData( {"nFID":nFactoryID}, "DISPLAYBOARD", "", $scope.sliderSetting, function(response){});
				}
	});

	app.directive('viewlistModel', function($timeout) {
		return function(scope, element, attr) {

			//delay one second to show
			$timeout(function(){
				var layout_index = scope.$eval("sliderSetting['layout_index']");
				var objListViewData = scope.$eval("aryDashboard[" + layout_index + "]['web']['listView']");

				//add items into element
				var nExist = 0;
				for( var component in objListViewData ){
					if( typeof objListViewData[component]['name'] != "undefined" ){
						nExist++;
					}
				}
				var nMarginLeftStyle = (45/nExist) + "%";

				for( var component in objListViewData ){
					var szName = ( objListViewData[component]['nickname'] == "" ) ?  objListViewData[component]['name'] : objListViewData[component]['nickname'];
					
					if( typeof objListViewData[component]['name'] == "undefined" ){
						continue;
					}

					element.append("<div style='margin-left:" + nMarginLeftStyle + ";width:5%;height:5px;color:#E8E8E8;margin-top:7px;display:inline-block;white-space:nowrap;font-size:9px;text-align:center'>" + szName + "</div>");
				}
			},1000);
			
		};
	});
	app.directive('viewlistData', function($document) {
		return function(scope, element, attr) {

			var CNCData = "";
			for( var i=0; i<10; i++ ){
				CNCData += "<div style='width:5%;height:5px;background:#E8E8E8;margin-left:4.5%;margin-top:13px;display:inline-block'>　</div>";
			}

			//add items into element
			for( var i=0; i<attr.number; i++ ){
				element.append("<li style='border-bottom:1px solid #000;height:28px;background:#F9F8F8;'>" +
					CNCData
					+ "</li>");
			}
		};
	});
});