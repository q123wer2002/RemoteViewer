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
		$scope.selectedYMD = {
			Year	: 0,
			Month	: 0,
			Day		: 0,
		};
		$scope.defaultShift = [
			{"Name":"早班", "StartTime":"", "EndTime":"", "During":0, "Staff":""},
			{"Name":"午班", "StartTime":"", "EndTime":"", "During":0, "Staff":""},
			{"Name":"晚班", "StartTime":"", "EndTime":"", "During":0, "Staff":""},
		];
		$scope.defaultStaff = ["", "", ""];

		$scope.ShiftSchedule = [];
		//menu bar
		$scope.settingMenu = {
			factoryInfo : { "name":"工廠設定", "isShow":false, "style":{} },
			companyInfo : { "name":"公司資訊", "isShow":false, "style":{} },
		};
		$scope.WeekUnits = [ "日", "一", "二", "三", "四", "五", "六" ];
		$scope.isShowAddDiv = false;

		//show schedule
			$scope.GetDaysOfMonth = function()
			{
				var today = new Date();
				if( (today.getFullYear()%4) == 0 ){
					$scope.DaysOfMonth = [ 31,29,31,30,31,30,31,31,30,31,30,31 ];
					return;
				}

				$scope.DaysOfMonth = [ 31,28,31,30,31,30,31,31,30,31,30,31 ];
			}
			$scope.ShowMoreMonth = function( nMoreMonth )
			{
				if( nMoreMonth < 0 ){
					return "";
				}

				var today = new Date();
				var thisMonth = today.getMonth();

				var moreMonth = [];
				for(var i=thisMonth; i<thisMonth+nMoreMonth; i++ ){
					moreMonth.push(i);
				}

				return moreMonth;
			}
			$scope.GetYearMonth = function( nMonthNum )
			{
				var today = new Date();
				today.setMonth( nMonthNum );

				return today.getFullYear() + " " + TranslateMonth( today.getMonth()+1 );
			}
			TranslateMonth = function( month )
			{
				switch( month ){
					case 1:
						return "一月";
					break;
					case 2:
						return "二月";
					break;
					case 3:
						return "三月";
					break;
					case 4:
						return "四月";
					break;
					case 5:
						return "五月";
					break;
					case 6:
						return "六月";
					break;
					case 7:
						return "七月";
					break;
					case 8:
						return "八月";
					break;
					case 9:
						return "九月";
					break;
					case 10:
						return "十月";
					break;
					case 11:
						return "十一月";
					break;
					case 12:
						return "十二月";
					break;
				}
			}
			$scope.GetDays = function( nMonth )
			{
				$scope.GetDaysOfMonth();

				//get days from month
				var today = new Date();
				today.setMonth( nMonth );
				var days = [];

				var maxDaysOfMonth = $scope.DaysOfMonth[today.getMonth()];

				for( var i=1; i<=maxDaysOfMonth; i++ ){
					days.push(i);
				}

				return days;
			}
			$scope.GetNullDays = function( nMonth )
			{
				var dateObj = new Date();
				dateObj.setMonth( nMonth );
				dateObj.setDate(1);

				var nullDays = [];

				for( var i=0; i<dateObj.getDay(); i++ ){
					nullDays.push(i);
				}

				return nullDays;
			}
			$scope.isEmptyShiftTime = function()
			{
				for( var i=0; i<$scope.defaultShift.length; i++ ){
					if( ($scope.defaultShift[i]['StartTime'] != "") && ($scope.defaultShift[i]['EndTime'] != "") ){
						return true;
					}
				}

				return false;
			}
			$scope.StyleOfShiftTitle = function()
			{
				if( $scope.isEmptyShiftTime() == false ){
					return {"background":"#FA757A"};
				}

				return {"background":"#000"};
			}
			$scope.StyleOfShiftEachDay = function(nMonth,nDay)
			{
				for( var i=0; i<$scope.ShiftSchedule.length; i++ ){
					if( typeof $scope.ShiftSchedule[i] == "undefined" ){
						return {"border-bottom":"1px solid #fff"};
					}

					
					var today = new Date();
					today.setMonth( nMonth );

					var thisDay = [];
					thisDay['Year'] = today.getFullYear();
					thisDay['Month'] = today.getMonth()+1;
					thisDay['Day'] = nDay;

					var bSameDate = isSameDate( thisDay, $scope.ShiftSchedule[i]['date'] );
					
					//not same date
					if( bSameDate == false ){
						continue;
					}

					//same date
					return {"border-bottom":"2px solid #ED1C24"};
				}
			}
		//set schedule
			$scope.ShowSchedule = function(nMonth,nDay)
			{
				var today = new Date();
				var finallyMonth = nMonth;

				while( finallyMonth > 11 ){
					finallyMonth = finallyMonth - 12;
				}

				$scope.selectedYMD['Year'] = today.getFullYear() + Math.floor( nMonth/12 );
				$scope.selectedYMD['Month'] = finallyMonth+1;
				$scope.selectedYMD['Day'] = nDay;
				//console.log($scope.selectedYMD);

				//
				$scope.isCanEdit = false;
			}
			$scope.GetSelectedDay = function()
			{
				if( $scope.selectedYMD['Year'] == "" ){
					return;
				}

				var thisDay = new Date();
				thisDay.setFullYear( $scope.selectedYMD['Year'] );
				thisDay.setMonth( $scope.selectedYMD['Month'] -1  );
				thisDay.setDate( $scope.selectedYMD['Day'] );

				//console.log(thisDay.getDay());
				if( thisDay.getDay() == 7 ){
					return "星期日";
				}

				return "星期" + $scope.WeekUnits[thisDay.getDay()];
			}
			$scope.GetShiftTime = function( shift )
			{
				if( shift['StartTime'] == "" || shift['EndTime'] == "" ){
					return "";
				}

				var start = new Date( shift['StartTime'] );
				var end = new Date( shift['EndTime'] );
				
				shift['During'] = ( ((end-start)/3600000) < 0 ) ? ((end-start)/3600000) + 24 : ((end-start)/3600000);

				start = ("0" + start.getHours()).substr(-2) + ":" + ("0" + start.getMinutes()).substr(-2);
				end = ("0" + end.getHours()).substr(-2)+ ":" + ("0" + end.getMinutes()).substr(-2);

				return start + " - " + end;
			}
			$scope.GetShiftStaff = function( index )
			{
				if( $scope.ShiftSchedule.length == 0 ){
					return "無操作員";
				}

				var schedule = GetSelectedSchedule();

				if( schedule == null ){
					return "無操作員";
				}

				return schedule['shift'][index];
			}
			GetSelectedSchedule = function()
			{
				//get shift
				for( var i=0; i<$scope.ShiftSchedule.length; i++ ){
					
					if( typeof $scope.ShiftSchedule[i] == "undefined" ){
						return null;
					}

					var bSameDate = isSameDate( $scope.selectedYMD, $scope.ShiftSchedule[i]['date'] );
					
					//not same date
					if( bSameDate == false ){
						continue;
					}

					//same date
					return $scope.ShiftSchedule[i];
				}

				return null;
			}
			isSameDate = function( selectedDate, scheduleDate )
			{
				if( selectedDate['Year'] != scheduleDate['Year'] ){
					return false;
				}

				if( selectedDate['Month'] != scheduleDate['Month'] ){
					return false;
				}

				if( selectedDate['Day'] != scheduleDate['Day'] ){
					return false;
				}

				return true;
			}
			$scope.isCanEdit = false;
			$scope.ChangeEditStatus = function()
			{
				if( $scope.isCanEdit == true ){
					//save default staff
					SaveShiftName();
					$scope.DBSaveSchedule();
					$scope.isCanEdit = false;
					return;
				}
				MapShiftNameIntoDefault();
				$scope.isCanEdit = true;
			}
			SaveShiftName = function()
			{

				var schedule = GetSelectedSchedule();

				if( schedule == null ){
					//not find
					var selectedDate = $scope.selectedYMD;
					var shiftScheduleObj = { "date":{Year:selectedDate['Year'], Month:selectedDate['Month'], Day:selectedDate['Day']}, "shift":[] };
					var shiftObj = [];
					for( var j=0; j<$scope.defaultStaff.length; j++ ){
						shiftObj.push($scope.defaultStaff[j]);
						$scope.defaultStaff[j] = "";
					}
					shiftScheduleObj['shift'] = shiftObj;
					$scope.ShiftSchedule.push( shiftScheduleObj );
					return;
				}

				//same date
				for( var j=0; j<schedule['shift'].length; j++ ){
					schedule['shift'][j] = $scope.defaultStaff[j];
					$scope.defaultStaff[j] = "";
				}
			}
			MapShiftNameIntoDefault = function()
			{
				var schedule = GetSelectedSchedule();

				if( schedule == null ){
					return;
				}

				for( var i=0; i<$scope.defaultStaff.length; i++ ){
					$scope.defaultStaff[i] = schedule['shift'][i];
				}
			}
			isAddSchedule = function()
			{
				if( $scope.ShiftSchedule.lenfth == 0 ){
					return false;
				}

				for( var i=0; i<$scope.ShiftSchedule.length; i++ ){
					if( typeof $scope.ShiftSchedule[i] == "undefined" ){
						return false;
					}

					var bSameDate = isSameDate( $scope.selectedYMD, $scope.ShiftSchedule[i]['date'] );
					
					//not same date
					if( bSameDate == false ){
						continue;
					}
					var shiftObj = {"Name":$scope.newSchedule['Name'], "StartTime":$scope.newSchedule['StartTime'], "EndTime":$scope.newSchedule['EndTime'], "During":$scope.newSchedule['During'], "Staff":$scope.newSchedule['Staff']};
					$scope.ShiftSchedule[i]['shift'].push( shiftObj );
					return true;
				}

				return false;
			}
		//schedule db connect
			$scope.DBSaveSchedule = function()
			{	
				var szJsonShiftSchedule = JSON.stringify($scope.ShiftSchedule);
				var szJsonShiftTime = JSON.stringify($scope.defaultShift);

				this.fnGetResult = function(response){
					//Debug(response);
				}

				var initSetObj={ "B64_scheduleTime":Base64.encode(szJsonShiftTime), "B64_schedule":Base64.encode(szJsonShiftSchedule), "fid":$scope.selectedFactory['fID'] };
				frontendAdaptor.fnGetResponse( 'SCHEDULE', "SaveSchedule", initSetObj, this.fnGetResult, false );
			}
			$scope.DBLoadSchedule = function()
			{
				this.fnGetResult = function(response){
					//Debug(json.data);
					if( response.data == "" ){
						return;
					}
					
					//get javascript array from json
					var scheduleObj = JSON.parse(Base64.decode(response.data['shiftS']));
					var shiftTime = JSON.parse(Base64.decode(response.data['shiftTime']));
					
					//get time object from response
					GetTimeFromJson( shiftTime );

					//mapping into object
					$scope.ShiftSchedule = scheduleObj;
					$scope.defaultShift = shiftTime;
				}

				var initSetObj={ "fid":$scope.selectedFactory['fID'] };
				frontendAdaptor.fnGetResponse( 'SCHEDULE', "LoadSchedule", initSetObj, this.fnGetResult, false );
			}
			GetTimeFromJson = function( JSON_shiftObj )
			{
				for( var i=0; i<JSON_shiftObj.length; i++ ){
					//get time from json
					var start = new Date( JSON_shiftObj[i]['StartTime'] );
					var end = new Date( JSON_shiftObj[i]['EndTime'] );

					//map back into time 
					JSON_shiftObj[i]['StartTime'] = start;
					JSON_shiftObj[i]['EndTime'] = end;
				}
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
			$scope.SlectFactory = function( factoryObj )
			{
				//clear all foucs
				ClearFactoryInfo();
				for( var i=0; i<$scope.factoryInfo.length; i++ )
				{
					$scope.factoryInfo[i].isSelected = false;
					$scope.factoryInfo[i].style = {};
				}

				//set select mark
				factoryObj.isSelected = true;
				factoryObj.style = {"border-bottom":"1px solid #000000"};

				//selected factory
				$scope.selectedFactory = factoryObj;

				//load factory info
				$scope.DBLoadSchedule();
			}
			ClearFactoryInfo = function()
			{
				$scope.selectedYMD = {
					Year	: 0,
					Month	: 0,
					Day		: 0,
				};
				$scope.defaultShift = [
					{"Name":"早班", "StartTime":"", "EndTime":"", "During":0, "Staff":""},
					{"Name":"午班", "StartTime":"", "EndTime":"", "During":0, "Staff":""},
					{"Name":"晚班", "StartTime":"", "EndTime":"", "During":0, "Staff":""},
				];
				$scope.defaultStaff = ["", "", ""];

				$scope.ShiftSchedule = [];
			}
		//db connected
			$scope.initSettingData = function()
			{
				this.fnGetResult = function(response){
					if(response.result == "success"){
						//Debug(json);
						
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

						//default select first factory
						if( $scope.factoryInfo.length != 0 ){
							$scope.SlectFactory( $scope.factoryInfo[0] );
						}
						$scope.ShowMenu( $scope.settingMenu['factoryInfo'] );

						//load schedule
						$scope.DBLoadSchedule();
					}
				}

				var initSetObj={ "fid":$scope.selectedFactory['fID'] };
				frontendAdaptor.fnGetResponse( 'ACCOUNT', "initSettingData", initSetObj, this.fnGetResult, false );
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
			$scope.setOOE = function( factory )
			{
				this.fnGetResult = function(response){
					if(response.result == "success"){
						factory.isValidTimeUnit = false;
					}
				}

				var timeObj = { "factory":factory };
				frontendAdaptor.fnGetResponse( 'ACCOUNT', "setOOEStand", timeObj, this.fnGetResult, false );
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