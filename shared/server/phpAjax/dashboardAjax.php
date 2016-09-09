<?php
include_once "../database/initSetting.php";

if( isset($_POST) && isset($_POST['method']) ){
	$post = $_POST;
}else{
	echo "not defined";
	exit;
}

$method = $post['method'];

switch($method){
	case "initDashboardData":

		$initDashboardObj = array();

		//get factory and group id
		$aryFnGID = array();
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$nErrorCode = GetDBData('myFIDnGID', $nCID, array(), $aryFnGID );
		//ErrorLog( $nErrorCode );

		//get cncs from group
		foreach( $aryFnGID as $key => $value ){
			$nGID = $value['gid'];
			$aryGnCNCs = array();
			$nErrorCode = GetDBData('CncListFromG', $nGID, array(), $aryGnCNCs );
			//ErrorLog( $nErrorCode );

			//insert data
			$initDashboardObj[$key] = array();
			$initDashboardObj[$key]['fid'] = $value['fid'];
			$initDashboardObj[$key]['fName'] = $value['fName'];
			$initDashboardObj[$key]['gid'] = $nGID;
			$initDashboardObj[$key]['gName'] = $value['gName'];
			$initDashboardObj[$key]['cncs'] = $aryGnCNCs;
		}

		//clear first
		$param['device'] = $post['device'];

		//get layout data
		$initDefaultLayout = array();
		$nErrorCode = GetDBData('GetDefaultLayout', 0, $param, $initDefaultLayout );
		//ErrorLog( $nErrorCode );

		$result = array(
			"result"=> "success", 
			"data"	=> $initDashboardObj,
		);

		print_r( json_encode($result) );
	break;
	case "initShiftSchedule":

		$result = array(
			"result"=> "success", 
			"data"	=> $post,
		);

		print_r( json_encode($result) );
	break;
	case "TranslateDataSource":

		$nCNCID = $post['cncID'];
		$funObj = new FunctionObj($nCNCID);

		$dataSource = array();
		if( !empty($post['dataSource']) == true ){
			foreach( $post['dataSource'] as $key => $value ){
				$szApiName = $funObj->GetDBAPIFromTWName($value);
				array_push( $dataSource, $szApiName );
			}
		}

		$result = array(
			"result"=> "success", 
			"data"	=> $dataSource,
			"rawData"=> $post['dataSource'],
			"cnc_id" => $post['cncID'],
		);

		print_r( json_encode($result) );
	break;
	case "GetRecordStr":

		$recordAry = array();

		foreach( $post['cncs'] as $key ){
			$cncName = array();
			$workFile = array();

			$nCNCID = $key;
			
			$nErrorCode = GetDBData('cncName', $nCNCID, array(), $cncName );
			$nErrorCode = GetDBData('cncWorkFile', $nCNCID, array(), $workFile );

			if( $cncName == "" ){
				$recordAry[$key] = $workFile;
				continue;
			}

			$recordAry[$cncName] = $workFile;
		}

		$result = array(
			"result"=> "success", 
			"data"	=> $recordAry,
		);

		print_r( json_encode($result) );
	break;
}

?>