<?php

//import setting
include_once "preLoadPage.php";

//default
$RemoteView->allShowList = array(
	"web" => array( "companyInfo", "userName", "password", "OOEView", "OOESetting" ),
	"mobile" => array(),
);

if( $RemoteView->viewDevice == "web" ){
	$RemoteView->userDefinedShowList = json_encode( $RemoteView->allShowList['web'] );
}elseif( $RemoteView->viewDevice == "mobile" ){
	$RemoteView->userDefinedShowList = json_encode( $RemoteView->allShowList['mobile'] );
}

//show page depend on user mode
if( $RemoteModule->userMode == "Management" || $RemoteModule->userMode == "Operation"){

	//choose the correct page
	$RemoteView->contentHtml = APP_PATH."/templates/".$RemoteView->viewDevice."/content/layoutSetting.html";
}

$RemoteView->setLayout();

unset($RemoteView);
unset($RemoteModule);

?>