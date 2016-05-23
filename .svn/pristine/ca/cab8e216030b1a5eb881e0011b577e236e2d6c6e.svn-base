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

//delete command
if( !empty($_SESSION['companyInfo']['oldWid']) == true ){
	include_once APP_PATH.'/include/database/DBDataAPI.php';
	$result = array();
	GetDBData('DeleteAllOldCmdByWid', 0, array(), $result );
}

//$RemoteModule->userMode = $_SESSION['RemoteViewer']['user']['Mode'];
$RemoteModule->userMode = $_SESSION['RemoteViewer']['user']['Mode'];


?>