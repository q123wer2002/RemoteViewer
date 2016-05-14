<?php

include_once __dir__.'/../include/database/DBDataAPI.php';

class DatabaseAPI
{
	protected $transCodeAry = array(
		300	=>	"fID",
		301	=>	"fName",
		302	=>	"fTotalCNC",
		303	=>	"fOOE",
		304	=>	"fStatusOfCnc",
		305	=>	"CncListFromF",
		306	=>	"factoryExceptRecordTime", //factory End
		400	=>	"gID",
		401	=>	"gName",
		402	=>	"gTotalCNC",
		403	=>	"gOOE",
		404	=>	"gStatusOfCnc",
		405	=>	"CncListFromG",
		412	=>	"Group_fID",//only show in get data
		415	=>	"gIPCAM",
		416	=>	"GroupExceptRecordTime",		//group End
		500	=>	"cncID",
		501	=>	"cncName",
		503	=>	"cncOOE",
		504	=>	"cncStatus",
		505	=>	"cncPic",
		506	=>	"cncMainProg",
		507	=>	"cncMode",
		508	=>	"cncProcess",
		509	=>	"cncRestTime",
		510	=>	"cncUpdateTime",
		511	=>	"cncInfo",
		512	=>	"cncHisAlarm",
		513	=>	"cncHisOOE",
		514	=>	"cncHisRecord",
		515	=>	"cncPreRecordTime",
		516	=>	"openRecordFile",
		517	=>	"CncExceptRecordTime",
		518	=>	"cncTimeOfOpening",
		519	=>	"cncTotalCycTime",	//cnc End
	);

	function DBAPI( $categoryName, $dataName="", $categoryID, &$resultAry, $param=array() )
	{
		$apiName = $dataName;
		//return $param;
		return GetDBData( $apiName, $categoryID, $param, $resultAry );
	}

} 

//"fID", "fName", "fTotalCNC", "fOOE", "fStatusOfCnc"
//"gID", "gName", "gTotalCNC", "gOOE", "gIPCAM", "gStatusOfCnc"
//"cncID", "cncName", "cncStatus", "cncPic", "cncMainProg", "cncOOE", "cncMode", "cncProcess", "cncRestTime", "cncUpdateTime","cncInfo", "cncOOE", "cncAlarm", "cncRecord",

?>