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

		var timeDiffer = ((nowDate-pureDate) < 0) ? ((pureDate-nowDate)/1000) : ((nowDate-pureDate)/1000); //second
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
	TotalSecondOfTimeUnit = function ( recordDate, timeUnit )
	{
		var secondOfTimeunit = 0;

		switch( timeUnit ){
			case "DAY":
				//setDate()
				secondOfTimeunit = 24*60*60; //a day of seconds
			break;

			case "MONTH":
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
			break;

			case "YEAR":
				//setYear();
				var recordStdDate = new Date( recordDate );
				if( recordStdDate.getFullYear()%4 == 0 ){
					secondOfTimeunit = 366*24*60*60; //366 days
				}else{
					secondOfTimeunit = 365*24*60*60; //365 days
				}
			break;
		}

		return secondOfTimeunit;
	}
	StartOfTimeUnitInSeconds = function( recorditem, timeUnit )
	{
		var startOfTimeUnit = 0;
		
		switch( timeUnit ){
			case "DAY":
				var timeString = recorditem.Col_StartTime;

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

				startOfTimeUnit = ( timeAry[0]*60 + timeAry[1] )*60; //second
			break;

			case "MONTH":
				var startOfDay = StartOfTimeUnitInSeconds( recorditem, "DAY" );
				var recordDate = new Date( recorditem.Col_StartDate );

				if( recordDate.getDate() == 1 ){
					startOfTimeUnit = startOfDay;
				}else{
					startOfTimeUnit = (recordDate.getDate()-1)*24*60*60 + startOfDay;
				}
			break;

			case "YEAR":
				var startOfMonth = StartOfTimeUnitInSeconds( recorditem, "MONTH" );
				var recordDate = new Date( recorditem.Col_StartDate );

				if( recordDate.getMonth() == 0 ){
					//means it's Jan
					startOfTimeUnit = startOfMonth;
				}else{
					var startOfDayYearDate = new Date( recordDate.getMonth()+'/1/'+recordDate.getFullYear() );
					startOfTimeUnit = (startOfDayYearDate-recordDate)/1000 + startOfMonth;
				}
			break;
		}

		return startOfTimeUnit;
	}
//export into excel
	Export2ExcelFromTable = function( anchor, tableID, sheetName )
	{
		var uriExcel = 'data:application/vnd.ms-excel;base64,';
		var format = function(s, c) {
			return s.replace(new RegExp("{(\\w+)}", "g"), function(m, p) {
				return c[p];
			});
		};
		var templateExcel = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';


		table = document.getElementById(tableID);
		var ctx = {worksheet: sheetName || 'Worksheet', table: table.innerHTML};
		var hrefvalue = uriExcel + Base64.encode( format(templateExcel, ctx) );
		anchor.href = hrefvalue;

		// Return true to allow the link to work
		return true;
	}

	var tablesToExcel = (function() {
		var uri = 'data:application/vnd.ms-excel;base64,';
		var tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
			+ '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author><Created>{created}</Created></DocumentProperties>'
			+ '<Styles>'
			+ '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>'
			+ '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>'
			+ '</Styles>' 
			+ '{worksheets}</Workbook>';
		var tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>';
		var tmplCellXML = '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>';
		var base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) };
		var format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) };
		
		return function(tables, wsnames, wbname, appname) {
			var ctx = "";
			var workbookXML = "";
			var worksheetsXML = "";
			var rowsXML = "";

			for (var i = 0; i < tables.length; i++) {
				if (!tables[i].nodeType) tables[i] = document.getElementById(tables[i]);
				for (var j = 0; j < tables[i].rows.length; j++) {
					rowsXML += '<Row>'
						for (var k = 0; k < tables[i].rows[j].cells.length; k++) {
							var dataType = tables[i].rows[j].cells[k].getAttribute("data-type");
							var dataStyle = tables[i].rows[j].cells[k].getAttribute("data-style");
							var dataValue = tables[i].rows[j].cells[k].getAttribute("data-value");
							dataValue = (dataValue)?dataValue:tables[i].rows[j].cells[k].innerHTML;
							var dataFormula = tables[i].rows[j].cells[k].getAttribute("data-formula");
							dataFormula = (dataFormula)?dataFormula:(appname=='Calc' && dataType=='DateTime')?dataValue:null;
							ctx = {  attributeStyleID: (dataStyle=='Currency' || dataStyle=='Date')?' ss:StyleID="'+dataStyle+'"':''
								, nameType: (dataType=='Number' || dataType=='DateTime' || dataType=='Boolean' || dataType=='Error')?dataType:'String'
								, data: (dataFormula)?'':dataValue
								, attributeFormula: (dataFormula)?' ss:Formula="'+dataFormula+'"':''
							};
							rowsXML += format(tmplCellXML, ctx);
						}
					rowsXML += '</Row>'
				}
				ctx = {rows: rowsXML, nameWS: wsnames[i] || 'Sheet' + i};
				worksheetsXML += format(tmplWorksheetXML, ctx);
				rowsXML = "";
			}

			ctx = {created: (new Date()).getTime(), worksheets: worksheetsXML};
			workbookXML = format(tmplWorkbookXML, ctx);

			//console.log(workbookXML);

			var link = document.createElement("A");
			link.href = uri + base64(workbookXML);
			link.download = wbname || 'Workbook.xls';
			link.target = '_blank';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	})();
//parse record file into json
	LoadRecordFileHeader = function( recordPlaintext )
	{
		if( recordPlaintext == "" ){
			return;
		}
		
		var defaultHeader = {
			Col_ProgName	: "程式名稱",
			Col_StartDate	: "開始日期",
			Col_StartTime	: "開始時間",
			Col_TotalTime	: "總時間",
			Col_PartCount	: "工件數",
			Col_Comment		: "程式註解",
		};
		
		//DEFAULT 序號
		var headerAry = [
			{"nameENG":"no", "nameTW":"序號"},
			{"nameENG":"Col_ProgName", "nameTW":"程式名稱"},
			{"nameENG":"Col_StartDate", "nameTW":"開始日期"},
			{"nameENG":"Col_StartTime", "nameTW":"開始時間"},
			{"nameENG":"Col_TotalTime", "nameTW":"總時間"},
			{"nameENG":"Col_PartCount", "nameTW":"工件數"},
			{"nameENG":"Col_Comment", "nameTW":"程式註解"},
		];

		var tmpAry = recordPlaintext.split("<Cycle Name=\"CycleEdit\">");
		
		//find first cycle to find each column name
		var recordHeader = [];
		var tmpAry2 = tmpAry[1].split("</Cycle>");
		var tmpAry3 = tmpAry2[0].split("Name=\"");

		for(var j=1; j<tmpAry3.length; j++){
			var tmpAry4 = tmpAry3[j].split("\" ");
			recordHeader[j-1] = tmpAry4[0];
		}

		//Debug(record);
		var nCutomer = 0;
		for( var i=0; i<recordHeader.length; i++ ){
			
			if( typeof defaultHeader[recordHeader[i]] == "undefined" ){
				nCutomer ++;
				var headerObj = new Object();
				headerObj['nameENG'] = recordHeader[i];
				headerObj['nameTW'] = "客製值" + nCutomer;
				headerAry.push(headerObj);
				continue;
			}
		}

		return headerAry;
	}
	LoadRecordFile = function( recordPlaintext )
	{
		//Debug(recordPlaintext);
		var recordAry = [];

		var tmpAry = recordPlaintext.split("<Cycle Name=\"CycleEdit\">");
		
		for(var i=1; i<tmpAry.length; i++){

			var cycleObj = new Object();
			var fieldColumn = tmpAry[i].split("<Field");

			for( var j=1; j<fieldColumn.length; j++ ){
				var fieldName = GetFieldNodeValue(fieldColumn[j], "Name");
				var fieldValue = GetFieldNodeValue(fieldColumn[j], "Value");
				cycleObj[fieldName] = fieldValue;
			}

			recordAry.push( cycleObj );

		}
		//Debug(recordAry);

		return recordAry;
	}
	GetFieldNodeValue = function( fieldColumn, fieldNodeName )
	{
		var tmpAry = fieldColumn.split(fieldNodeName + "=\"");
		var tmpAry2 = tmpAry[1].split("\"");
		return tmpAry2[0];
	}
//parse XMLFile into json
	ParseXML2Json = function( XMLFileSource, jsonNameRules )
	{
		if( XMLFileSource == "" ){
			return "";
		}

		var jsonData = [];
		var parentAry = XMLFileSource.split(jsonNameRules['Parent']);
		//console.log(parentAry);
		for( var i=1; i<parentAry.length; i++ ){
			var jsonNode = new Object;
			for( var j=0; j<jsonNameRules['Child'].length; j++ ){
				var value = GetXMLTagValue( parentAry[i], jsonNameRules['Child'][j]);
				jsonNode[ jsonNameRules['Child'][j] ] = value;
			}
			jsonData.push(jsonNode);
			//console.log(jsonData);
		}

		return jsonData;
	}
	GetXMLTagValue = function( szRowXML, szTag )
	{
		try{
			var tmpAry = szRowXML.split( "<" + szTag + ">" );
			var tmpAry2 = tmpAry[1].split( "</" + szTag + ">" );
			return tmpAry2[0];
		}catch( e ){
			var tmpAry = szRowXML.split( "<" + szTag + " />" );
			return "";
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

//debug
	Debug = function( logData )
	{
		console.log(logData);
	}

//command
	GetCommandFromCmdList = function( CmdHint )
	{
		switch( CmdHint ){
			//debugmode
				case "DEBUGON":
					return "DEBUG_ON";
				break;
				case "DEBUGOFF":
					return "DEBUG_OFF";
				break;
				case "DEBUGUPLOAD":
					return "DEBUG_UPLOAD";
				break;
			//diagnosis
				case "R_Bit":
					return "Read_R";
				break;
				case "I_Bit":
					return "Read_I";
				break;
				case "O_Bit":
					return "Read_O";
				break;
				case "C_Bit":
					return "Read_C";
				break;
				case "S_Bit":
					return "Read_S";
				break;
				case "A_Bit":
					return "Read_A";
				break;
				case "Debug_Var":
					return "Read_D";
				break;
				case "Param":
					return "Read_P";
				break;
			//fileTransfer
				case "NcFile":
					return "Show_nc_dir";
				break;
				case "UploadNcFile":
					return "Upload_nc_file";
				break;
				case "DownloadNcFile":
					return "Download_nc_file";
				break;
				case "DownloadLadFile":
					return "Download_ladder";
				break;
				case "Param":
					return;
				break;
				case "Macro":
					return;
				break;
			//offset
				case "ShowOffset":
					return "Read_tooloffset";
				break;
				case "WriteOffset":
					return "Write_tooloffset";
				break;
		}
	}

var Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
	    var output = "";
	    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	    var i = 0;

	    input = Base64._utf8_encode(input);

	    while (i < input.length) {

	        chr1 = input.charCodeAt(i++);
	        chr2 = input.charCodeAt(i++);
	        chr3 = input.charCodeAt(i++);

	        enc1 = chr1 >> 2;
	        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	        enc4 = chr3 & 63;

	        if (isNaN(chr2)) {
	            enc3 = enc4 = 64;
	        } else if (isNaN(chr3)) {
	            enc4 = 64;
	        }

	        output = output +
	        Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
	        Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

	    }

	    return output;
	},

	// public method for decoding
	decode : function (input) {
	    var output = "";
	    var chr1, chr2, chr3;
	    var enc1, enc2, enc3, enc4;
	    var i = 0;

	    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	    while (i < input.length) {

	        enc1 = Base64._keyStr.indexOf(input.charAt(i++));
	        enc2 = Base64._keyStr.indexOf(input.charAt(i++));
	        enc3 = Base64._keyStr.indexOf(input.charAt(i++));
	        enc4 = Base64._keyStr.indexOf(input.charAt(i++));

	        chr1 = (enc1 << 2) | (enc2 >> 4);
	        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	        chr3 = ((enc3 & 3) << 6) | enc4;

	        output = output + String.fromCharCode(chr1);

	        if (enc3 != 64) {
	            output = output + String.fromCharCode(chr2);
	        }
	        if (enc4 != 64) {
	            output = output + String.fromCharCode(chr3);
	        }

	    }

	    output = Base64._utf8_decode(output);

	    return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
	    string = string.replace(/\r\n/g,"\n");
	    var utftext = "";

	    for (var n = 0; n < string.length; n++) {

	        var c = string.charCodeAt(n);

	        if (c < 128) {
	            utftext += String.fromCharCode(c);
	        }
	        else if((c > 127) && (c < 2048)) {
	            utftext += String.fromCharCode((c >> 6) | 192);
	            utftext += String.fromCharCode((c & 63) | 128);
	        }
	        else {
	            utftext += String.fromCharCode((c >> 12) | 224);
	            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	            utftext += String.fromCharCode((c & 63) | 128);
	        }

	    }

	    return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
	    var string = "";
	    var i = 0;
	    var c = c1 = c2 = 0;

	    while ( i < utftext.length ) {

	        c = utftext.charCodeAt(i);

	        if (c < 128) {
	            string += String.fromCharCode(c);
	            i++;
	        }
	        else if((c > 191) && (c < 224)) {
	            c2 = utftext.charCodeAt(i+1);
	            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
	            i += 2;
	        }
	        else {
	            c2 = utftext.charCodeAt(i+1);
	            c3 = utftext.charCodeAt(i+2);
	            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
	            i += 3;
	        }

	    }
	    return string;
	}
}