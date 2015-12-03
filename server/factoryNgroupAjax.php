<?php
include_once "../include/createObj.php";

//get post data
$post = $_POST;
$method = $post['method'];

switch( $method ){
	case 'getIndexData':
		//company login, get facetory data
		$companyID = $_SESSION['companyInfo']['cid'];
		$sql_getFactory = "SELECT * FROM factory WHERE Company = '".$companyID."';";
		$SyntecObj->resultArray['factoryInfo'] = array();
		$SyntecObj->SQLQuery('resultArray','factoryInfo',$sql_getFactory);

		//get cncgroup by any factories
		if( !empty($SyntecObj->resultArray['factoryInfo']) ){
			
			foreach ($SyntecObj->resultArray['factoryInfo'] as $key => $value) {
				//get grounp infomation
				$sql_getGroup = "SELECT cnc_group.cncgid as gid, cnc_group.Name as gname, cnc_group.Factory as fid, COUNT( cnc.CNC_id ) as cncNumber
								 FROM cnc_group
								 LEFT JOIN cnc ON cnc.CNCGroup=cnc_group.cncgid
								 WHERE Factory = '".$value['fid']."' 
								 GROUP BY cnc_group.cncgid;";
				$SyntecObj->resultArray['tmpGrounpInfo'] = array();
				$SyntecObj->SQLQuery('resultArray','tmpGrounpInfo',$sql_getGroup);
				
				//copy array to result array
				$i = 0;
				while( !empty( $SyntecObj->resultArray['tmpGrounpInfo'][$i] ) ){
					$SyntecObj->resultArray['indexData']['groupInfo'][] = $SyntecObj->resultArray['tmpGrounpInfo'][$i];
					$i++;
				}
			}
			$SyntecObj->resultArray['indexData']['factoryInfo'] = $SyntecObj->resultArray['factoryInfo'];
		}

		//release space
		$SyntecObj->resultArray['tmpGrounpInfo'] = null;
		$SyntecObj->resultArray['factoryInfo'] = null;
		unset( $SyntecObj->resultArray['tmpGrounpInfo'] );
		unset( $SyntecObj->resultArray['factoryInfo'] );

		//return data
		$result = array( "result" => "success", "data" => $SyntecObj->resultArray['indexData'] );
		
		echo json_encode($result);
		
	break;
}

?>