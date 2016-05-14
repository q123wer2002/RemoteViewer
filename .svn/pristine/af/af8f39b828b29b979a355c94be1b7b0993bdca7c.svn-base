<?php
include_once "../server/datebaseAPI.php";

//module to connect to database
$DataClass = new DatabaseAPI();

//get post data
if( isset($_POST) && isset($_POST['method']) ){
	$post = $_POST;
}else{
	echo "not defined";
	exit;
}

$method = $post['method'];
//"fID", "fName", "fTotalCNC", "fOOE", "fStatusOfCnc", "gName", "gTotalCNC", "gOOE", "gIPCAM", "gStatusOfCnc"
if( $method == "getFactoryData" ){

	$initFacAry = array();
	$initGopAry = array();

	$i = 0;
	foreach($_SESSION['RemoteViewer']['companyInfo']['fid'] as $fID){
		foreach( $post['factoryList'] as $factoryDataName ){
			$tmpResultAry = array();
			$errorCode = $DataClass->DBAPI( 'Factory', $factoryDataName, $fID, $tmpResultAry );
			$initFacAry[ $i ][ $factoryDataName ] = $tmpResultAry;

			/*if( $errorCode !== 0 ){
				$initFacAry[ $i ][ $factoryDataName ] = "__".$errorCode."__";
			}*/
		}
		$i++;
	}
	unset( $i );

	$j = 0;
	foreach($_SESSION['RemoteViewer']['companyInfo']['gid'] as $gID){
		foreach( $post['groupList'] as $groupDataName ){
			$tmpResultAry = array();
			$errorCode = $DataClass->DBAPI( 'Group', $groupDataName, $gID, $tmpResultAry );
			$initGopAry[ $j ][ $groupDataName ] = $tmpResultAry;
		
			/*if( $errorCode !== 0 ){
				$initGopAry[ $j ][ $groupDataName ] = "__".$errorCode."__";
			}*/
		}
		$j++;
	}
	unset( $j );
		
	$result = array(
		"result" => "success", 
		"data" => array( 
			"factory" => $initFacAry, 
			"group" => $initGopAry,
		)
	);
	
	//put data back to ajax
	print_r( json_encode( $result ) );

	//delete local var
	unset( $initFacAry );
	unset( $initGopAry );
	unset( $result );
}
else{
	exit;
}

?>