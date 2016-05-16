
SyntecRemoteWeb.controller('SyntecLayoutSet',['$scope','$http', '$interval',function SyntecRemote($scope,$http,$interval){
	
	$scope.curtTag = "";
	$scope.tagObjectAry = {
		myLayout		: { 'tagName':"我的樣式", "color":"#FFEC94", "isShow":false, "top":"50px" },
		newLayout		: { 'tagName':"新增樣式", "color":"#00A2E8", "isShow":false, "top":"100px" },
		viewFunList		: { 'tagName':"功能列表", "color":"#22B14C", "isShow":false, "top":"150px" },
	};
	$scope.InitTagName = function()
	{
		$scope.tagObjectAry["myLayout"].tagName = "我的樣式";
		$scope.tagObjectAry["myLayout"].isShow = false;
		$scope.tagObjectAry["viewFunList"].tagName = "功能列表";
		$scope.tagObjectAry["viewFunList"].isShow = false;
	}
	$scope.ShowLayoutItem = function( szTagKey, szTagValue )
	{
		if( szTagValue.tagName == "收起" || szTagKey == "newLayout" ){
			jQuery('.layoutListLeftDiv').css('left','-210px');
			$scope.InitTagName();
		}else{
			$scope.curtTag = szTagKey;
			$scope.InitTagName();

			szTagValue.tagName = "收起";
			szTagValue.isShow = true;

			jQuery('.layoutListLeftDiv').css('left','0px');
		}
	}
	$scope.NewLayout = function()
	{

	}

	$scope.ViewFunList = function( szDevice, szListView )
	{
		if( szDevice == "web" ){
			//web
			if( szListView == "bigView" ){
				$scope.szShowHint = "大圖式";
			}

			if( szListView == "listView" ){
				$scope.szShowHint = "列表";
			}

		}else{
			//mobile
		}
	}


	//
	$scope.myLayoutList = [
		{"name" : "預設樣式"},
		{"name" : "第一樣式"},
		{"name" : "第二樣式"},
		{"name" : "第三樣式"},
	];
	$scope.curtLayout = {
		web : {
			listView : { "com1":"", "com2":"圖片", "com3":"名稱", "com4":"加工件數", "com5":"預計加工數", "com6":"加工完成度", "com7":"機床", "com8":"機型", "com9":"剩餘時間", "com10":"更新時間",},
			bigView : {
				top : { "com1":[ "大圖片", "1*2" ], "com2":[ "加工數", "1*1" ], "com3":[ "預計加工數", "1*1" ] },
				mid : {},
				bot : { "com1":[ "加工進度條", "2*2" ] },
				out : {},
			},
		},
	};

	$scope.isEmptyCom = function( szComName )
	{
		if( szComName == "" ){
			return "#AAFFC3";
		}
	}

	$scope.szCubeStyle = function( viewObj )
	{
		switch( viewObj[1] ){
			case "1*1":
				return "{'width':'45%', 'height':'40px'}";
			break;
			case "1*2":
			console.log("{'width':'45%', 'height':'90px'}");
				return "{'width':'45%', 'height':'90px'}";
			break;
			case "2*1":
				return "{'width':'92%', 'height':'40px'}";
			break;
			case "2*2":
				return "{'width':'92%', 'height':'90px'}";
			break;
		}
	}

}]);