<?php
include_once "include/createObj.php";

$isUser = 0;

if( isset($_SESSION['userInfo']) && isset($_SESSION['userInfo']['user']) ){
	//print_r($_SESSION['userInfo']);
	$isUser = 1;
}



//choose the correct page
if($isUser){
	//yes, user login
	$SyntecObj->contentHtml = APP_PATH."/templates/content/factory.html";
}
else{
	//no login user
	$SyntecObj->contentHtml = APP_PATH."/templates/content/login.html";
}

//set layout
$SyntecObj->setLayout();

?>