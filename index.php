<?php
include_once "include/createObj.php";

$isCompanyLogin = 0;

//does company have been login
if( isset($_SESSION['companyInfo']) && isset($_SESSION['companyInfo']['user']) ){
	//print_r($_SESSION['userInfo']);
	$isCompanyLogin = 1;
}



//choose the correct page
if( $isCompanyLogin ){
						   
	//yes, company login
	$SyntecObj->contentHtml = APP_PATH."/templates/content/factory.html";
}
else{
	//no login user
	$SyntecObj->contentHtml = APP_PATH."/templates/content/login.html";
}

//set layout
$SyntecObj->setLayout();

?>