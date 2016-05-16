<?php

$aryPrefixWord = array(
	"sz"	=> "字串",
	"n"		=> "數字",
	"file"	=> "檔案",
	"date"	=> "日期",
);

$aryFunctionList = array(
	//cnc table
	"szName"				=> array("名稱", "", "cncName", false, 0),
	"filePic"				=> array("圖片", "", "cncPic", false, 0),
	"nGroupID"				=> array("隸屬群組", "", "cncGetGroupID", false, 0),
	"szIP"					=> array("IP位置", "", "cncIP", false, 0),
	"szMachine"				=> array("機床代碼", "", "cncMachine", false, 0),
	"szMachineType"			=> array("機床屬性", "", "cncMachineType", false, 0),
	"szVersion"				=> array("軟體版本", "", "cncVersion", false, 0),
	"szSerialNo"			=> array("控制器序號", "", "cncSerialNo", false, 0),
	//end cnc table
	//status table
	"szStatus"				=> array("狀態", "", "cncStatus", true, 0),
	"szMode"				=> array("加工模式", "", "cncMode", true, 0),
	"aryAlarm"				=> array("狀態", "", array("cncAlarm", "cncCurtAlm"), true, 0),
	"szEMG"					=> array("EMG", "", "cncEMG", true, 0),
	"szMainProg"			=> array("主程式", "", "cncMainProg", true, 0),
	//end status table
	//record table
	"datePowerOnTime"		=> array("上電日期", "", "cncPowerOnTime", true, 0),
	"nCycleTime"			=> array("加工時間", "", "cncCycleTime", true, 0),
	"nHisCycTime"			=> array("歷史加工時間", "", "cncTotalCycTime", true, 0),
	"nPartCount"			=> array("目前工件數", "", "cncPartCount", true, 0),
	"nRequirePart"			=> array("需求工件數", "", "cncRequirePartCount", true, 0),
	"nTotalPart"			=> array("總工件數", "", "cncTotalCount", true, 0),
	"nLastWorkTime"			=> array("上次加工時間", "cncLastWorkTime", true, 0),
	"fileWorkFIle"			=> array("加工表單", "", "cncWorkFile", false, 0),
	//end record table
	//time table
	"szTimeStatus"			=> array("保固狀態", "", "cncTimeStatus", false, 0),
	"dateTimeStart"			=> array("保固開始日期", "", array("cncTimeStatus", "cncTimeStart"), false, 0),
	"dateTimeExpire"		=> array("保固過期時間", "", array("cncTimeStatus", "cncExpireTime"), false, 0),
	"nTimeRemain"			=> array("保固剩餘時間", "", array("cncTimeStatus", "cncTimeRemain"), false, 0),
	"dateTimeCurrent"		=> array("控制器目前時間", "", "cncCurrentTime", true, 0),
	"nTimeOfOpening"		=> array("歷史開機時間", "", "cncTimeOfOpening", true, 0),
	"dateAgentTime"			=> array("最後更新時間", "", "cncUpdateTime", true, 0),
	//end time table
	"nOOE"					=> array("稼動率", "", "cncOOE", true, 0),
	"szProcess"				=> array("加工進度", "", "cncProcess", true, 0),
	"cncInfo"				=> array("基本資訊", "", array("cncIP", "cncMachine", "cncMachineType", "cncVersion", "cncRestTime"), false, 0),
	"cncRestDay"			=> array("保固剩餘日子", "", "cncRestDay", false, 0),
	"cncCurtAlm"			=> array("現存警報", "", "cncCurtAlm", true, 0),
	"cncHisAlm"				=> array("歷史警報", "", "cncHisAlm", true, 0),
	"cncHisOOE"				=> array("歷史稼動率", "", "cncHisOOE", true, 0),
	"cncHisRecord"			=> array("歷史加工記錄", "", "cncHisRecord", true, 0),
	"cncExceptRecordTime"	=> array("預計工時", "", "cncExceptRecordTime", false, 0),	
);


?>