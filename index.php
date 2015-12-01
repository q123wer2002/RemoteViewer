<?php
include_once "include/createObj.php";

$_SESSION['user']="null";
$isUser = 0;


if($_SESSION['user']){
	$isUser = 1;
}
/*$sql = "SELECT * FROM testtable";
//$RemoteObj->resultArray['test'] = array();
$ViewObj->SQL2JSON('resultArray','test',$sql);


//print_r($RemoteObj->resultArray['test']);
echo $ViewObj->resultArray['test'];
echo "<hr>";
echo APP_PATH;
echo "<hr>";
echo WEB_URL;
echo "<hr>";
echo PAGE_NAME;
*/


//choose the correct page
if($isUser){
	//yes, user login

	//sql to search user's info

	$ViewObj->contentHtml = APP_PATH."/templates/content/factory.html";
}
else{
	//no login user
	$ViewObj->contentHtml = APP_PATH."/templates/content/login.html";
}

//set layout
$ViewObj->setLayout();

?>