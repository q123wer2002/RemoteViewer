<?php
include_once "include/createObj.php";

//choose the correct page
if(isset($_SESSION)){
	if($_SESSION['user']){
		//login
		$ViewObj->contentHtml = APP_PATH."/templates/content/cnc.html";
	}
	else{
		//no login user
		$ViewObj->contentHtml = APP_PATH."/templates/content/login.html";
	}
}else{
	//no session
	$ViewObj->contentHtml = APP_PATH."/templates/content/login.html";
}

//set layout
$ViewObj->setLayout();

?>