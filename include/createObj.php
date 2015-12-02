<?php

include_once 'phpSetting.php';
header("Content-Type:text/html; charset=utf-8");


//new php object
$SyntecObj = new  SyntecObj();

//default set
$SyntecObj->meta = APP_PATH."/templates/meta.html";
$SyntecObj->topHtml = APP_PATH."/templates/top.html";
$SyntecObj->contentHtml = "";
$SyntecObj->footerHtml = APP_PATH."/templates/footer.html";


?>