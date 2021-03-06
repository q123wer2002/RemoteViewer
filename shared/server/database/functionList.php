<?php

require "DBSchema.php";

$aryPrefixWord = array(
	"sz"	=> "字串",
	"n"		=> "數字",
	"file"	=> "檔案",
	"date"	=> "日期",
);

$aryFunctionList = array(
	//cnc table
		"szName"				=> array("名稱", array("mobile"=>"", "web"=>"1*1"), "cncName", false, 0, $CNC['NAME']),
		"filePic"				=> array("圖片", array("mobile"=>"", "web"=>"1*2"), "cncPic", false, 0, $CNC['IMG']),
		"nGroupID"				=> array("隸屬群組", array("mobile"=>"", "web"=>"1*1"), "cncGetGroupID", false, 0, $CNC['GROUPID']),
		"szIP"					=> array("IP位置", array("mobile"=>"", "web"=>"1*1"), "cncIP", false, 0, $CNC['IP']),
		"szMachine"				=> array("機床代碼", array("mobile"=>"", "web"=>"1*1"), "cncMachine", false, 0, $CNC['MACHINE']),
		"szMachineType"			=> array("機床屬性", array("mobile"=>"", "web"=>"1*1"), "cncMachineType", false, 0, $CNC['MACHINETYPE']),
		"szVersion"				=> array("軟體版本", array("mobile"=>"", "web"=>"1*1"), "cncVersion", false, 0, $CNC['VERSION']),
		"szSerialNo"			=> array("控制器序號", array("mobile"=>"", "web"=>"1*1"), "cncSerialNo", false, 0, $CNC['SERIALNO']),
		"szGroupName"			=> array("群組名稱", array("mobile"=>"", "web"=>"1*1"), "cncGetGroupName", false, 0, $CNC['GROUPID']),
		"szFactoryName"			=> array("工廠名稱", array("mobile"=>"", "web"=>"1*1"), "cncGetFactoryName", false, 0),
	//status table
		"szStatus"				=> array("狀態", array("mobile"=>"", "web"=>"1*1"), "cncStatus", true, 0, $CNCSTATUS['STATUS']),
		"szMode"				=> array("加工模式", array("mobile"=>"", "web"=>"1*1"), "cncMode", true, 0, $CNCSTATUS['MODE']),
		//"aryAlarm"				=> array("狀態", array("mobile"=>"", "web"=>"1*1"), array("cncAlarm", "cncCurtAlm"), true, 0, $CNCSTATUS['ALARM']),
		"szEMG"					=> array("EMG", array("mobile"=>"", "web"=>"1*1"), "cncEMG", true, 0, $CNCSTATUS['EMG']),
		"szMainProg"			=> array("主程式", array("mobile"=>"", "web"=>"1*1"), "cncMainProg", true, 0, $CNCSTATUS['MAINPROG']),
	//record table
		"datePowerOnTime"		=> array("上電日期", array("mobile"=>"", "web"=>"1*1"), "cncPowerOnTime", true, 0, $CNCRECORD['POWERONTIME']),
		"nCycleTime"			=> array("加工時間", array("mobile"=>"", "web"=>"1*1"), "cncCycleTime", true, 0, $CNCRECORD['CYCLETIME']),
		"nHisCycTime"			=> array("總加工時間", array("mobile"=>"", "web"=>"1*1"), "cncTotalCycTime", true, 0, $CNCRECORD['TOTALCOUNT']),
		"nPartCount"			=> array("目前工件數", array("mobile"=>"", "web"=>"1*1"), "cncPartCount", true, 0, $CNCRECORD['PARTCOUNT']),
		"nRequirePart"			=> array("需求工件數", array("mobile"=>"", "web"=>"1*1"), "cncRequirePartCount", true, 0, $CNCRECORD['REQUIRECOUNT']),
		"nTotalPart"			=> array("總工件數", array("mobile"=>"", "web"=>"1*1"), "cncTotalCount", true, 0, $CNCRECORD['TOTALCOUNT']),
		"nLastWorkTime"			=> array("上次加工時間", array("mobile"=>"", "web"=>"1*1"), "cncLastWorkTime", true, 0, $CNCRECORD['LASTWORKTIME']),
		//"fileWorkFIle"			=> array("加工表單", array("mobile"=>"", "web"=>"1*1"), "cncWorkFile", false, 0),
	//time table
		"szTimeStatus"			=> array("保固狀態", array("mobile"=>"", "web"=>"1*1"), "cncTimeStatus", false, 0, $CNCTIME['TIMESTATUS']),
		//"dateTimeStart"			=> array("保固開始日期", array("mobile"=>"", "web"=>"1*1"), array("cncTimeStatus", "cncTimeStart"), false, 0, $CNCTIME['TIMESTART']),
		//"dateTimeExpire"		=> array("保固過期時間", array("mobile"=>"", "web"=>"1*1"), array("cncTimeStatus", "cncExpireTime"), false, 0, $CNCTIME['TIMEEXPIRE']),
		//"nTimeRemain"			=> array("保固剩餘時間", array("mobile"=>"", "web"=>"1*1"), array("cncTimeStatus", "cncTimeRemain"), false, 0, $CNCTIME['TIMEREMAIN']),
		"dateTimeCurrent"		=> array("控制器時間", array("mobile"=>"", "web"=>"1*1"), "cncCurrentTime", true, 0, $CNCTIME['TIMECURRENT']),
		"nTimeOfOpening"		=> array("總開機時間", array("mobile"=>"", "web"=>"1*1"), "cncTimeOfOpening", true, 0, $CNCTIME['TIMEOFOPENING']),
		"dateAgentTime"			=> array("更新時間", array("mobile"=>"", "web"=>"1*1"), "cncUpdateTime", true, 0, $CNCTIME['AGENTTIME']),
	//cnc information

	//else
		"nOOE"					=> array("稼動率", array("mobile"=>"", "web"=>"1*1"), "cncOOE", true, 0),
		"szProcess"				=> array("加工進度百分比", array("mobile"=>"", "web"=>"1*1"), "cncProcess", true, 0),
		"szPartProcess"			=> array("加工進度", array("mobile"=>"", "web"=>"1*1"), "cncPartProcess", true, 0),
		"cncRestDay"			=> array("保固剩餘日", array("mobile"=>"", "web"=>"1*1"), "cncRestDay", false, 0),
		"cncCurtAlm"			=> array("現存警報", array("mobile"=>"", "web"=>"1*1"), "cncCurtAlm", true, 0),
		"cncInfo"				=> array("基本資訊", array("mobile"=>"", "web"=>"1*1"), "cncInfo", false, 0),
		//"cncHisAlm"				=> array("歷史警報", array("mobile"=>"", "web"=>"1*1"), "cncHisAlm", true, 0),
		//"cncHisOOE"				=> array("歷史稼動率", array("mobile"=>"", "web"=>"1*1"), "cncHisOOE", true, 0),
		//"cncHisRecord"			=> array("加工記錄", array("mobile"=>"", "web"=>"1*1"), "cncHisRecord", true, 0),	
);


?>