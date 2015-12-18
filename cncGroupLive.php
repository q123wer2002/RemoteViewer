<?php
include_once "include/createObj.php";

$isCompanyLogin = 0;
$isOwnGroup = 0;

//does company have been login
if( isset($_SESSION['companyInfo']) && isset($_SESSION['companyInfo']['user']) ){
	//print_r($_SESSION['userInfo']);
	$isCompanyLogin = 1;
}

//cncgroup info
$gid = $_GET['group'];


//check does group is in this company
if( isset($_SESSION['companyInfo']['gid']) && in_array( $gid, $_SESSION['companyInfo']['gid']) ){
	$isOwnGroup = 1;
}


#============================== layout setting =====================================


//choose the correct page
if( $isCompanyLogin ){
	
	if( $isOwnGroup ){
		//pass cncgroup id
		$SyntecObj->gid = $gid;
		$SyntecObj->contentHtml = APP_PATH."/templates/content/cncGroupLive.html";
	}
	else{
		//this company does not have this group
		redirect(WEB_URL);
	}
}
else{
	//no login user
	redirect(WEB_URL);
}

//set layout
$SyntecObj->setLayout();

?>