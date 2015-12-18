<?php
include_once "../include/createObj.php";

//get post data
if( isset($_POST) && isset($_POST['method']) ){
	$post = $_POST;
}else{
	echo "not defined";
	exit;
}

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
	
	case 'updateGroupStatus':
		$gid = $post['gid'];

		//sql to get time diff over 5 minutes
		$sql_getCncTimeDiff = "SELECT cnc_time.cnc_id, cnc_time.update_time
							   FROM cnc_group
							   LEFT JOIN cnc_time ON cnc_time.cnc_id IN (SELECT cnc.CNC_id FROM cnc WHERE cnc.CNCGroup=cnc_group.cncgid)
							   WHERE cnc_group.cncgid = ".$gid." AND
                               timestampdiff( minute, cnc_time.update_time, now() ) > 5;";
		$SyntecObj->resultArray['getCncTimeDiff'] = array();
		$SyntecObj->SQLQuery('resultArray','getCncTimeDiff',$sql_getCncTimeDiff);
		
		//check offline cnc
		if( !empty($SyntecObj->resultArray['getCncTimeDiff']) ){
			//it has offline cnc
			foreach ($SyntecObj->resultArray['getCncTimeDiff'] as $key => $value) {
				//update status into offline
				$sql_updateToOffline = "UPDATE cnc_status SET Status = 'OFFLINE'  WHERE cnc_id=".$value['cnc_id']."";
				mysql_query($sql_updateToOffline);
			}
		}

		//release space
		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );
			   
		//sql to get cncstatus
		$sql_getGroupStatus="SELECT cnc_group.cncgid as gid, cnc_status.Status, cnc_status.Alarm, COUNT( cnc_status.cnc_id ) as NumOfStatus 
							 FROM cnc_group 
							 LEFT JOIN cnc_status ON cnc_status.cnc_id IN (SELECT cnc.CNC_id FROM cnc WHERE cnc.CNCGroup=cnc_group.cncgid) 
							 WHERE cnc_group.cncgid = ".$gid." 
							 GROUP BY cnc_status.Status;";
		$SyntecObj->resultArray['getGroupStatus'] = array();
		$SyntecObj->SQLQuery('resultArray','getGroupStatus',$sql_getGroupStatus);

		//adjust array
		$groupStatus = array();
		if( !empty($SyntecObj->resultArray['getGroupStatus']) ){
			$groupStatus = $SyntecObj->resultArray['getGroupStatus'];
		}

		//release space
		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		$result = array( "result" => "success", "data" => $groupStatus );
		echo json_encode( $result );

	break;

	default:
	break;
}

?>