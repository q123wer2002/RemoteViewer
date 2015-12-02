<?php
include_once "include/createObj.php";

//choose the correct page
if(isset($_SESSION)){
	if($_SESSION['user']){
		//login
		$SyntecObj->contentHtml = APP_PATH."/templates/content/cncGroup.html";
	}
	else{
		//no login user
		$SyntecObj->contentHtml = APP_PATH."/templates/content/login.html";
	}
}else{
	//no session
	$SyntecObj->contentHtml = APP_PATH."/templates/content/login.html";
}

//set layout
$SyntecObj->setLayout();

?>