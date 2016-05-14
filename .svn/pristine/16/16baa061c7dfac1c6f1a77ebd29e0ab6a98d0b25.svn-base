<?php

//import setting
include_once "preLoadPage.php";

//get factory ID
$factory = (isset($_GET['factory']) == true) ? $_GET['factory'] : "none";
$RemoteView->fID = $factory;
if( $factory == "none" ){
	redirect(WEB_URL);
}


//get web structure from database
$RemoteView->allShowList = array(
	//array( "fID", "fName", "fTotalCNC", "fOOE", "fStatusOfCnc", "gName", "gTotalCNC", "gOOE", "gIPCAM", "gStatusOfCnc" ),
	"web" => array( "fID", "fName", "fTotalCNC", "fOOE", "fStatusOfCnc", "gID", "gName", "gTotalCNC", "gOOE", "gIPCAM", "gStatusOfCnc" ),
	"mobile" => array( "fID", "fName", "fTotalCNC", "fOOE", "fStatusOfCnc", "gID", "gName", "gTotalCNC", "gOOE", "gIPCAM", "gStatusOfCnc" ),
);
if( $RemoteView->viewDevice == "web" ){
	$RemoteView->userDefinedShowList = json_encode( $RemoteView->allShowList['web'] );
}elseif( $RemoteView->viewDevice == "mobile" ){
	$RemoteView->userDefinedShowList = json_encode( $RemoteView->allShowList['mobile'] );
}


//show page depend on user mode
if( $RemoteModule->userMode == "Management"){
	//choose the correct page
	$RemoteView->contentHtml = APP_PATH."/templates/".$RemoteView->viewDevice."/content/groupOverview.html";
}elseif( $RemoteModule->userMode == "Operation"){
	//not support
	redirect(WEB_URL);
}


$RemoteView->setLayout();
unset($RemoteView);
unset($RemoteModule);




?>