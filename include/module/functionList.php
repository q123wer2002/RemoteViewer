<?php


$aryFunctionList = array(
	"cncName"				=> array("名稱", "", "cncName", false, 0),
	"cncOOE"				=> array("稼動率", "", "cncOOE", true, 0),
	"cncStatus"				=> array("狀態", "", "cncStatus", true, 0),
	"cncPic"				=> array("圖片", "", "cncPic", false, 0),
	"cncMainProg"			=> array("主程式", "", "cncMainProg", true, 0),
	"cncMode"				=> array("加工模式", "", "cncMode", true, 0),
	"cncProcess"			=> array("加工進度", "", "cncProcess", true, 0),
	"cncRestTime"			=> array("保固剩餘時間", "", "cncRestTime", false, 0),
	"cncUpdateTime"			=> array("更新時間", "", "cncUpdateTime", true, 0),
	"cncInfo"				=> array("基本資訊", "", array("cncIP", "cncMachine", "cncMachineType", "cncVersion", "cncRestTime"), false, 0),
	"cncIP"					=> array("IP位置", "", "cncIP", false, 0),
	"cncMachine"			=> array("機床代碼", "", "cncMachine", false, 0),
	"cncMachineType"		=> array("機床屬性", "", "cncMachineType", false, 0),
	"cncVersion"			=> array("軟體版本", "", "cncVersion", false, 0),
	"cncSerialNo"			=> array("控制器序號", "", "cncSerialNo", false, 0),
	"cncRestDay"			=> array("保固剩餘日子", "", "cncRestDay", false, 0),
	"cncCurtAlm"			=> array("現存警報", "", "cncCurtAlm", true, 0),
	"cncHisAlm"				=> array("歷史警報", "", "cncHisAlm", true, 0),
	"cncHisOOE"				=> array("歷史稼動率", "", "cncHisOOE", true, 0),
	"cncHisRecord"			=> array("歷史加工記錄", "", "cncHisRecord", true, 0),
	"cncPreRecordTime"		=> array("上次加工時間", "", "cncPreRecordTime", true, 0),
	"cncExceptRecordTime"	=> array("預計工時", "", "cncExceptRecordTime", false, 0),
	"cncTimeOfOpening"		=> array("歷史開機時間", "", "cncTimeOfOpening", true, 0),
	"cncHisCycTime"			=> array("歷史加工時間", "", "cncTotalCycTime", true, 0),
);


?>