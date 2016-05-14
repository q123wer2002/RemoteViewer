<?php

//import setting
include_once "include/controlSetting.php";

//new php object
$RemoteModule = new RemoteModule();
$RemoteView = new RemoteView( APP_PATH );

//default set
//check user authority first

//whether is logging
$isLogin = ( isset($_SESSION['RemoteViewer']['companyInfo']) ) ? true : false;
if( $isLogin == false ){
	
	$RemoteView->contentHtml = APP_PATH."/templates/".$RemoteView->viewDevice."/content/login.html";
	$RemoteView->setLayout();
	exit;
}
unset( $isLogin );

//whether is registering company
$isRegisterCompany = ( isset($_SESSION['RemoteViewer']['companyInfo']['fid']) ) ? true : false;
if( $isRegisterCompany == false ){
	
	echo "<h1 style='text-align: center;margin-top: 100px;color: red;'>公司尚未登錄工廠</h1>";
	$RemoteView->setLayout();
	exit;
}
unset( $isRegisterCompany  );

//get cnc id from this factory to check function list
$isGetFunctionList = ( isset($_SESSION['RemoteViewer']['canUseFunctionList']) ) ? true : false;
if( $isGetFunctionList == false ){
	
	//include database api, function module
	include_once APP_PATH.'/include/database/DBDataAPI.php';
	include_once APP_PATH.'/include/module/funModuleClass.php';
	//end include

	$aryCNCList = array();
	$nFactoryID = $_SESSION['RemoteViewer']['companyInfo']['fid'][0];
	$nErrorCode = GetDBData('CncListFromF', $nFactoryID, array(), $aryCNCList );
	
	//means success
	if( $nErrorCode === 0 ){
		$nCNCID = $aryCNCList[0]['cnc_id']; //default

		//get function list
		$functionObj = new FunctionObj( $nCNCID );

		//save into session
		$_SESSION['RemoteViewer']['canUseFunctionList'] = $functionObj->aryCheckFunctionList();
		//print_r($_SESSION['RemoteViewer']['canUseFunctionList']);

		unset( $nCNCID );
		unset( $functionObj );
	}

	unset( $aryCNCList );
	unset( $nFactoryID );
	unset( $nErrorCode );
	//exit;
}
unset( $isGetFunctionList );


//$RemoteModule->userMode = $_SESSION['RemoteViewer']['user']['Mode'];
$RemoteModule->userMode = $_SESSION['RemoteViewer']['user']['Mode'];


?>