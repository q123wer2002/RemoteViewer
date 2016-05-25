<?php
session_start();
header("Content-Type:text/html; charset=utf-8");
date_default_timezone_set("Asia/Taipei");

//define global var
@define('APP_PATH', str_replace('\\', '/', substr(dirname(__FILE__),0,strlen(dirname(__FILE__))-8 )));
@define('WEB_URL', "http://".$_SERVER['HTTP_HOST']."/"); // http://localhost:5566 (set by htaccess)
@define("PAGE_NAME", basename($_SERVER['PHP_SELF'],'.php'));
//end define

//include module object
include_once APP_PATH.'/include/module/moduleClass.php';
//end include

//include viewer object
include_once APP_PATH.'/include/viewClass.php';
//end include

//include public function 
include_once APP_PATH.'/include/module/phpFunction/publicFunction.php';
//end include


?>