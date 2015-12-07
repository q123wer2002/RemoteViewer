<?php
include_once "include/createObj.php";

$isCompanyLogin = 0;
$isOwnGroup = 0;
$isOwnCnc = 0;

//does company have been login
if( isset($_SESSION['companyInfo']) && isset($_SESSION['companyInfo']['user']) ){
	//print_r($_SESSION['userInfo']);
	$isCompanyLogin = 1;
}

//get cnc info
$cncid = $_GET['cnc'];

//get group which own this cnc
if( !empty($cncid) ){
	
	$sql_getGid = "SELECT CNCGroup as gid FROM cnc WHERE CNC_id=".$cncid."";
	$SyntecObj->resultArray['getGid'] = array();
	$SyntecObj->SQLQuery('resultArray','getGid',$sql_getGid);

	if( !empty($SyntecObj->resultArray['getGid']) ){
		$gid = $SyntecObj->resultArray['getGid'][0]['gid'];
	}
}


//check does group is in this company
if( in_array( $gid, $_SESSION['companyInfo']['gid']) ){
	$isOwnGroup = 1;
}

#============================== layout setting =====================================

//choose the correct page
if( $isCompanyLogin ){
	
	if( $isOwnGroup ){
		//pass cncgroup id
		$SyntecObj->gid = $gid;
		$SyntecObj->cncid = $cncid;
		$SyntecObj->contentHtml = APP_PATH."/templates/content/cnc.html";
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