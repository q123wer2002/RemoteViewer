findUpdatingList = function( userShowAry, updatingAry, storeAllUpdatingListAry, storeSubUpdatingListAry )
{
	if( typeof storeSubUpdatingListAry == "undefined" ){
		for( var i=0; i<updatingAry.length; i++ ){
			if( userShowAry.indexOf( updatingAry[i] ) != -1 ){
				storeAllUpdatingListAry.push( updatingAry[i] );
			}
		}
	}else{
		for( var i=0; i<updatingAry.length; i++ ){
			if( userShowAry.indexOf( updatingAry[i] ) != -1 ){
				storeAllUpdatingListAry.push( updatingAry[i] );
				storeSubUpdatingListAry.push( updatingAry[i] );
			}
		}
	}
}

//scroll to buttom
scrollToButtom = function()
{
	window.scrollTo(0,document.body.scrollHeight); 
}

//change time
changeDateToTime = function( dateString )
{
	//console.log(dateString);
	var pureDate = new Date( dateString );
	var nowDate = new Date();

	//minute, hour, days, month, year

	var timeDiffer = (nowDate-pureDate)/1000; //second
	if( timeDiffer < 60 ){
		return Math.round(timeDiffer) + "秒前";
	}

	timeDiffer = timeDiffer/60; //minute
	if( timeDiffer < 60 ){
		return Math.round(timeDiffer) + "分鐘前";
	}

	timeDiffer = timeDiffer/60; //hour
	if( timeDiffer < 24 ){
		return Math.round(timeDiffer) + "小時前";
	}

	timeDiffer = timeDiffer/24 //day
	if( timeDiffer < 30 ){
		return Math.round(timeDiffer) + "天前";
	}
	
	timeDiffer = timeDiffer/30 //month
	return "約" + Math.round(timeDiffer) + "個月前";

	//var monthOfDays = [31,28,31,30,31,30,31,31,30,31,30,31];

	//console.log( (nowDate-pureDate)/86400000/30 ); //ms
}
computeSecondsOfTimeunit = function ( recordDate, timeUnit )
{
	var secondOfTimeunit = 0;

	if( timeUnit == "DAY" ){
		//setDate()
		secondOfTimeunit = 24*60*60; //a day of seconds
	}else if( timeUnit == "MONTH" ){
		//setMonth()
		var recordStdDate = new Date( recordDate );
		if( (recordStdDate.getMonth()+1) == 2 ){
			//Feb
			if( recordStdDate.getFullYear()%4 == 0 ){
				secondOfTimeunit = 29*24*60*60; //29 days
			}else{
				secondOfTimeunit = 28*24*60*60; //28 days
			}
		}else if( (recordStdDate.getMonth()+1) <= 7 ){
			if( (recordStdDate.getMonth()+1)%2 == 0 ){
				secondOfTimeunit = 30*24*60*60; //30 days
			}else{
				secondOfTimeunit = 31*24*60*60; //31 days
			}
		}else if( (recordStdDate.getMonth()+1) > 7 ){
			if( (recordStdDate.getMonth()+1)%2 == 0 ){
				secondOfTimeunit = 31*24*60*60; //31 days
			}else{
				secondOfTimeunit = 30*24*60*60; //30 days
			}
		}
	}else if( timeUnit == "YEAR" ){
		//setYear();
		var recordStdDate = new Date( recordDate );
		if( recordStdDate.getFullYear()%4 == 0 ){
			secondOfTimeunit = 366*24*60*60; //366 days
		}else{
			secondOfTimeunit = 365*24*60*60; //365 days
		}
	}

	return secondOfTimeunit;
}
computeRestSecondOfDay = function( recorditem, timeUnit )
{
	switch( timeUnit ){
		case "DAY":
			var timeString = recorditem.StartTime;

			if( timeString.indexOf( "AM" ) != -1 ){
				var time = timeString.split( "AM" );
				var timeAry = time[0].split( ":" );
				timeAry[0] = parseInt(timeAry[0]); //hour
				timeAry[1] = parseInt(timeAry[1]); //minute
			}

			if( timeString.indexOf("PM") != -1 ){
				var time = timeString.split( "PM" );
				var timeAry = time[0].split( ":" );
				timeAry[0] = ( parseInt(timeAry[0]) == 12 ) ? parseInt(timeAry[0]) : (parseInt(timeAry[0])+12); //hour
				timeAry[1] = parseInt(timeAry[1]); //minute
			}

			var duringSecond = ( timeAry[0]*60 + timeAry[1] )*60; //second
			return duringSecond;
		break;

		case "MONTH":
			var startOfMonth = 0;

			var startOfDay = computeRestSecondOfDay( recorditem, "DAY" );
			var recordDate = new Date( recorditem.StartDate );

			if( recordDate.getDate() == 1 ){
				startOfMonth = startOfDay;
			}else{
				startOfMonth = (recordDate.getDate()-1)*24*60*60 + startOfDay;
			}

			return startOfMonth;
		break;

		case "YEAR":
			var startOfYear = 0;

			var startOfMonth = computeRestSecondOfDay( recorditem, "MONTH" );
			var recordDate = new Date( recorditem.StartDate );

			if( recordDate.getMonth() == 0 ){
				//means it's Jan
				startOfYear = startOfMonth;
			}else{
				var startOfDayYearDate = new Date( recordDate.getMonth()+'/1/'+recordDate.getFullYear() );
				startOfYear = (startOfDayYearDate-recordDate)/1000 + startOfMonth;
			}

			return startOfYear;
		break;
	}
}

tabClick = function( allTabUnitObj, userChoseUnit, chosedColor )
{
	for( key in allTabUnitObj ){
		if( key == userChoseUnit ){
			allTabUnitObj[key].bgColor = chosedColor.bg;
			allTabUnitObj[key].fontColor = chosedColor.font;
			continue;
		}
		
		allTabUnitObj[key].bgColor = chosedColor.font;
		allTabUnitObj[key].fontColor = chosedColor.bg;
	}
}

ErrorCodePaser = function( php_errorCode )
{
	if( isErrorCode( php_errorCode ) == true ){
		var errorAry = php_errorCode.split("__");
		return errorAry[1];
	}
}

isErrorCode = function( data )
{
	try{
		var errorAry = data.split("__");
		if( errorAry.length == 3 ){
			return true;
		}
	}catch( err ){
		//do nothing	
	}

	return false;
}

