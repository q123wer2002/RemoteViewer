<?php
session_start();
header("Content-Type:text/html; charset=utf-8");
date_default_timezone_set("Asia/Taipei");

//include module object
include_once 'moduleClass.php';
//end include

//include public function 
include_once 'publicFunction.php';
//end include

//include database api, function module
include_once 'DBDataAPI.php';
//end include

//include database api, function module
include_once 'funModuleClass.php';
//end include

?>