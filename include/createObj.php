<?php

include_once 'phpSetting.php';
header("Content-Type:text/html; charset=utf-8");


//new php object
$ViewObj = new  SyntecViewObj();

//default set
$ViewObj->meta = APP_PATH."/templates/meta.html";
$ViewObj->topHtml = APP_PATH."/templates/top.html";
$ViewObj->contentHtml = "";
$ViewObj->footerHtml = APP_PATH."/templates/footer.html";


?>