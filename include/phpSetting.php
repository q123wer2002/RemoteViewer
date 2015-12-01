<?php
session_start();

//define global var
define('APP_PATH', str_replace('\\', '/', substr(dirname(__FILE__),0,strlen(dirname(__FILE__))-8 )));
define('WEB_URL', "http://".$_SERVER['HTTP_HOST']."/syntecRemote/"); // http://localhost:5566
define("PAGE_NAME", basename($_SERVER['PHP_SELF'],'.php'));
//end define

date_default_timezone_set("Asia/Taipei");

//include database
include_once APP_PATH.'/include/module/database/DBConfig.php';
//end include

//include public function 
include_once APP_PATH.'/include/module/phpFunction/pubilcFun.php';
//end include

//include php object
include_once APP_PATH.'/include/view/SyntecViewObj.php';
//end include

?>