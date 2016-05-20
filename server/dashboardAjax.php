<?php
include_once "../include/controlSetting.php";

if( isset($_POST) && isset($_POST['method']) ){
	$post = $_POST;
}else{
	echo "not defined";
	exit;
}

$method = $post['method'];

switch($method){
	case "initDashboardData":			
		//include database api, function module
		include_once APP_PATH.'/include/database/DBDataAPI.php';
		//end include

		$initDashboardObj = array();

		//get factory and group id
		$aryFnGID = array();
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$nErrorCode = GetDBData('myFIDnGID', $nCID, array(), $aryFnGID );
		ErrorLog( $nErrorCode );

		//get cncs from group
		foreach( $aryFnGID as $key => $value ){
			$nGID = $value['gid'];
			$aryGnCNCs = array();
			$nErrorCode = GetDBData('CncListFromG', $nGID, array(), $aryGnCNCs );
			ErrorLog( $nErrorCode );

			//insert data
			$initDashboardObj[$key] = array();
			$initDashboardObj[$key]['fid'] = $value['fid'];
			$initDashboardObj[$key]['fName'] = $value['fName'];
			$initDashboardObj[$key]['gid'] = $nGID;
			$initDashboardObj[$key]['gName'] = $value['gName'];
			$initDashboardObj[$key]['cncs'] = $aryGnCNCs;
		}

		//get layout data
		$param['device'] = $post['device'];

		$initDefaultLayout = array();
		$nErrorCode = GetDBData('GetDefaultLayout', 0, $param, $initDefaultLayout );
		ErrorLog( $nErrorCode );

		$aryLayout = array();
		$nErrorCode = GetDBData('GetMyLayout', $nCID, $param, $aryLayout );
		ErrorLog( $nErrorCode );

		if( empty($aryLayout) == true ){
			$aryLayout[0] = $initDefaultLayout[0];
		}else{
			$index = count($aryLayout);
			$aryLayout[$index] = $initDefaultLayout[0];
		}

		$result = array(
			"result"=> "success", 
			"data"	=> $initDashboardObj,
			"layoutData" => $aryLayout,
		);

		print_r( json_encode($result) );
	break;
	case "updatingCNCData":
		//include database api, function module
		include_once APP_PATH.'/include/database/DBDataAPI.php';
		include_once APP_PATH.'/include/module/funModuleClass.php';
		//end include

		$cncObj = $post['cnc'];
		$nCNCID = $cncObj['nCNCID'];

		//default, status
		$cncStatus = array();
		$nErrorCode = GetDBData('cncStatus', $nCNCID, array(), $cncStatus );
		ErrorLog( $nErrorCode );
		$cncObj['cncStatus'] = $cncStatus;

		//start fetching cutomer list
		$funObj = new FunctionObj($nCNCID);
		foreach( $cncObj['listView'] as $key => $value ){
			$ApiName = $funObj->GetDBAPIFromPrefix($value[2]);
			$aryApi = array();
			$nErrorCode = GetDBData($ApiName, $nCNCID, array(), $aryApi );
			ErrorLog( $nErrorCode );
			
			//save data
			$cncObj['listView'][$key][0] = $aryApi;
		}
		$aaa = array();
		foreach( $cncObj['bigView'] as $key => $value ){
			foreach( $value as $subKey => $subValue ){
				$ApiName = $funObj->GetDBAPIFromPrefix($subValue[3]);
				//array_push($aaa,$subValue );
				$aryApi = array();
				$nErrorCode = GetDBData($ApiName, $nCNCID, array(), $aryApi );
				ErrorLog( $nErrorCode );
				
				//save data
				$cncObj['bigView'][$key][$subKey][0] = $aryApi;
			}
		}


		$result = array(
			"result"=> "success", 
			"data"	=> $cncObj,
		);

		print_r( json_encode($result) );
	break;
}


?>