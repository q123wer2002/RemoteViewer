 <?php
include_once "../database/initSetting.php";

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
		//get group id from cid
		$group_id = array();
		$nErrorCode = GetDBData('cncGetGroupID', $post['cncID'], array(), $group_id );

		//get 1. group name 2. factory name 3. group IPCAM
		$tmpResultAry = array();
		$nErrorCode = GetDBData('FnG_info', $group_id, array(), $tmpResultAry );
		$initData['FnG_info'] = $tmpResultAry;

		//set var
		$fName = $initData['FnG_info'][0]['fName'];
		$gName = $initData['FnG_info'][0]['gName'];

		$initCNCAry = array();

		foreach( $post['DataList'] as $authorityList ){
			$tmpResultAry = array();
			$nErrorCode = GetDBData($authorityList, $post['cncID'], array(), $tmpResultAry );
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
				"gID"		=> $group_id,
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
		$nErrorCode = GetDBData($codeName, $cncID, $post['HistoryDataParam'], $tmpResultAry );
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
	case "GetParamSchema":
		$cncID = $post['cncID'];
		
		$paramSchema = array();
		$nErrorCode = GetDBData('GetParamSchema', $cncID, array(), $paramSchema );

		$resultAry = array(
			"result" => "success",
			"data" => $paramSchema,
		);
		
		
		print_r( json_encode($resultAry) );
	break;
	case "GetCncDataAPIFromViewerName":
		$aryDataOfViewerName = $post['dataOfViewer'];

		$aryCncDataInfo = array();


		$objFunction = new FunctionObj(0);
		foreach( $post['dataOfViewer'] as $key => $value ){
			$szApiName = $objFunction->GetDBAPIFromPrefix($value);
			$isNeedUpdating = $objFunction->GetIsNeedUpdating($value);
			
			$aryCncDataInfo[$value]['api'] = $szApiName;
			$aryCncDataInfo[$value]['isUpdating'] = $isNeedUpdating;
			$aryCncDataInfo[$value]['value'] = '';
		}

		$result = array(
			"result"	=> "success",
			"data"		=> $aryCncDataInfo,
		);

		print_r( json_encode($result) );
	break;
	case "GettingCNCDataByUpdate":

		$cncObj = $post['cnc'];
		$nCNCID = $cncObj['nCNCID'];

		//default, status
		$cncStatus = array();
		$nErrorCode = GetDBData('cncStatus', $nCNCID, array(), $cncStatus );
		//ErrorLog( $nErrorCode );
		$cncObj['cncStatus'] = $cncStatus;

		//start fetching data list
		foreach( $cncObj['aryData'] as $key => $value ){
			
			if( empty($value['value']) == true  || $value['isUpdating'] == true ){

				//check customized component first
				if( strrpos( $key, "cuz_") !== false ){
					
					//means it's customization
					$resultData = array();
					$param = GetDiagnosisValue( $key );
					$nErrorCode = GetDBData( "GetCustomerDiagnosisValue", $nCNCID, $param, $resultData );
					if( $nErrorCode === 0 ){
						$cncObj['aryData'][$key]['value'] = $resultData;
					}else{
						$cncObj['aryData'][$key]['value'] = "N";
					}
					continue;
				}

				$resultData = array();
				$nErrorCode = GetDBData( $value['api'], $nCNCID, array(), $resultData );

				$cncObj['aryData'][$key]['value'] = $resultData;
			}
		}
		

		$cncObj['cncIndex'] = $post['cncIndex'];
		$cncObj['dataCluster'] = $post['dataCluster'];

		$result = array(
			"result"=> "success", 
			"data"	=> $cncObj,
		);

		print_r( json_encode($result) );
	break;
	case "GetInfo":
		$nCNCID = $post['cncID'];

		$result = array();
		$nErrorCode = GetDBData('cncInfo', $nCNCID, array(), $result );

		print_r( json_encode($result) );
	break;
	case "GetCncAgentVersion":
		$nCNCID = $post['cncID'];

		$aryCncAgentVersion = array();
		$nErrorCode = GetDBData('cncAgentVersion', $nCNCID, array(), $aryCncAgentVersion );

		$result = array(
			"result" => "success",
			"data"	=> $aryCncAgentVersion,
		);
		
		print_r( json_encode($result) );
	break;
}

function GetDiagnosisValue( $szCustomizedComponent )
{
	//init
	$diagnosisType = array("R");
	$returnAry = array();
	
	//start 
	$splitValue=split("[(,)]", $szCustomizedComponent);
	for( $i=0; $i<count($diagnosisType); $i++ ){
		if( strrpos( $splitValue[1], $diagnosisType[$i] ) !== false ){
			
			$subSplitValue=split( $diagnosisType[$i], $splitValue[1] );

			$returnAry['type'] = TranslateDiagnosisType( $diagnosisType[$i] );
			$returnAry['no'] = $subSplitValue[1];
			return $returnAry;
		}
	}
}


?>