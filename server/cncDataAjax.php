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


switch( $method ){
	case "initCncData":
		//get 1. group name 2. factory name 3. group IPCAM
		$tmpResultAry = array();
		$errorCode = $DataClass->DBAPI( 'Group', 'FnG_info', $post['gID'], $tmpResultAry );
		$initData['FnG_info'] = $tmpResultAry;

		//set var
		$fName = $initData['FnG_info'][0]['fName'];
		$gName = $initData['FnG_info'][0]['gName'];

		$initCNCAry = array();

		foreach( $post['DataList'] as $authorityList ){
			$tmpResultAry = array();
			$errorCode = $DataClass->DBAPI( 'Cnc', $authorityList, $post['cncID'], $tmpResultAry );
			$initCNCAry[ $authorityList ] = $tmpResultAry;

			/*if( $errorCode != 0 ){
				$initCNCAry[ $authorityList ] = "__".$errorCode."__";
			}*/
		}

		unset( $initData['FnG_info'] );

		$resultAry = array( 
			"result" => "success", 
			"data" => array( 
				"fName"		=> $fName, 
				"gName"		=> $gName, 
				"cncData"	=> $initCNCAry,
				"List"		=> $post['DataList']
			) 
		);

		print_r( json_encode( $resultAry ) );

		unset( $fName );
		unset( $gName );
		unset( $initCNCAry );
		unset( $resultArray );
	break;

	case "getHisData":
		$cncID = $post['cncID'];
		$hisData = array();

		$codeName = "cnc".$post['HistoryDataName'];

		$tmpResultAry = array();
		$errorCode = $DataClass->DBAPI( 'Cnc', $codeName, $cncID, $tmpResultAry, $post['HistoryDataParam'] );
		$hisData = $tmpResultAry;

		/*if( $errorCode != 0 ){
			$hisData = "__".$errorCode."__";
		}*/

		$resultAry = array( "result" => "success", "data" => $hisData );
		
		
		print_r( json_encode($resultAry) );

		unset( $post );
		unset( $cncID );
		unset( $hisData );
		unset( $resultAry );
	break;

	default:
	break;
}



?>