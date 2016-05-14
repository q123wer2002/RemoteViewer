<?php

//import setting
include_once "preLoadPage.php";

//get group ID
$group = (isset($_GET['group']) == true) ? $_GET['group'] : "none";
$RemoteView->gID = $group;
if( $group == "none" || 
	isset($_SESSION['RemoteViewer']['companyInfo']['gid']) == false || 
	in_array( $group, $_SESSION['RemoteViewer']['companyInfo']['gid']) == false 
  ){
	redirect(WEB_URL);
}


//get web structure from database
$RemoteView->allShowList = array(
	//array( "fName", "gName", "gTotalCNC", "gIPCAM", "cncID", "cncName", "cncStatus", "cncPic", "cncMainProg", "cncOOE", "cncMode", "cncProcess", "cncRestTime", "cncUpdateTime" ),
	"web" => array( "fName", "gName", "gTotalCNC", "cncID", "cncName", "cncStatus", "cncPic", "cncMainProg", "cncOOE", "cncMode", "cncProcess", "cncRestTime", "cncUpdateTime" ),
	"mobile" => array( "fName", "gName", "gTotalCNC", "cncID", "cncName", "cncStatus", "cncPic", "cncMainProg", "cncOOE", "cncMode", "cncProcess", "cncRestTime", "cncUpdateTime" ),
);
if( $RemoteView->viewDevice == "web" ){
	$RemoteView->userDefinedShowList = json_encode( $RemoteView->allShowList['web'] );
}elseif( $RemoteView->viewDevice == "mobile" ){
	$RemoteView->userDefinedShowList = json_encode( $RemoteView->allShowList['mobile'] );
}



//show page depend on user mode
if( $RemoteModule->userMode == "Management" || $RemoteModule->userMode == "Operation"){
	//choose the correct page
	$RemoteView->contentHtml = APP_PATH."/templates/".$RemoteView->viewDevice."/content/groupList.html";
}



$RemoteView->setLayout();
unset($RemoteView);
unset($RemoteModule);

?>