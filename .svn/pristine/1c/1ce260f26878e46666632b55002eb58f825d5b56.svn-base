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

if( $method == "getCNCData_current" ){

	//get the group and factory information;  fID, fName, gName, cncList 
	$tmpResultAry = array();
	$errorCode = $DataClass->DBAPI( 'Group', 'FnG_info', $post['gID'], $tmpResultAry );
	$initData['FnG_info'] = $tmpResultAry;

	//set var
	$fID = $initData['FnG_info'][0]['fID'];
	$fName = $initData['FnG_info'][0]['fName'];
	$gName = $initData['FnG_info'][0]['gName'];

	//protect
	if( $initData['FnG_info'][0]['cncList'] == null ){
		
		$result = array( "result" => "success", "data" => array( "fID" => $fID, "fName" => $fName, "gName" => $gName ));

		print_r( json_encode( $result ) );
		
		unset( $initData['FnG_info'] );
		unset( $result );
		exit;
	}

	$initCNCAry = array();

	$i = 0;
	foreach( $initData['FnG_info'] as $key => $value ){
		foreach( $post['cncDataList'] as $cncDataName ){

			$tmpResultAry = array();
			$errorCode = $DataClass->DBAPI( 'Cnc', $cncDataName, $value['cncList'], $tmpResultAry );
			$initCNCAry[ $i ][ $cncDataName ] = $tmpResultAry;

			/*if( $errorCode !== 0 ){
				$initCNCAry[ $i ][ $cncDataName ] = "__".$errorCode."__";
			}*/
		}
		$i++;
	}
	unset( $i );

	$result = array( 
		"result" => "success", 
		"data" => array(
			"fID" => $fID,
			"fName" => $fName,
			"gName" => $gName,
			"cncData" => $initCNCAry,
		)
	);
	//print_r($result);
	//put data back to ajax
	print_r( json_encode( $result ) );

	//delete local var
	unset( $initData['FnG_info'] );
	unset( $initCNCAry );
	unset( $result );
	unset( $fID );
	unset( $fName );
	unset( $gName );

}elseif( $method == "getCNCData_update" ){

	$initCNCAry = array();
	$cncID = $post['cncID'];

	$initCNCAry['cncKey'] = $post['cncKey'];
	$initCNCAry['cncID'] = $cncID;

	foreach( $post['DataList'] as $authorityList ){
		$tmpResultAry = array();
		$errorCode = $DataClass->DBAPI( 'Cnc', $authorityList,  $cncID, $tmpResultAry );
		$initCNCAry[ $authorityList ] = $tmpResultAry;

		/*if( $errorCode != 0 ){
			$initCNCAry[ $authorityList ] = "__".$errorCode."__";
		}*/
	}

	$result = array( "result" => "success", "data" => $initCNCAry );
	
	//put data back to ajax
	print_r( json_encode( $result ) );

	//delete local var
	unset( $initCNCAry );
	unset( $result );
	unset( $sqlTmp );
	unset( $fName );
	unset( $gName );
}else{
	exit;
}

?>