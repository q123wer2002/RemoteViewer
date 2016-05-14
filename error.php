<?php 
//import setting
include_once "preLoadPage.php";

$errorCode = ( isset($_GET['errorCode']) ) ? $_GET['errorCode'] : "noError";
$errorShow = "";

switch( $errorCode ){
	case 401:
		$errorShow = "401 請求錯誤";
	break;

	case 403:
		$errorShow = "403 沒有權限";
	break;

	case 404:
		$errorShow = "404 找不到頁面";
	break;

	case 500:
		$errorShow = "500 伺服器繁忙中";
	break;

	default:
		$errorShow = "異常錯誤";
	break;
}

echo "<h1 style='text-align:center;margin-top:150px;'>".$errorShow."<br><br><a href='".WEB_URL."' style='text-align:center;color:blue;'>回首頁吧！</a></h1>";

$RemoteView->setLayout();

?>