<?php
//$dbHost = "10.10.80.159";
//120.27.139.74
$dbHost = "localhost";
$dbUser = "root";
$dbPass = "";
$dbData = "synteccloud";
//syntecclient
//testdb

@$conn=mysql_connect($dbHost,$dbUser,$dbPass);


@mysql_query("SET NAMES utf8"); 
@mysql_query("SET CHARACTER_SET_CLIENT=utf8");
@mysql_query("SET CHARACTER_SET_RESULTS=utf8");
@mysql_select_db($dbData, $conn) or die('Cannot conntect to DB');

?>
