<?php
include_once "../include/createObj.php";

//get post data
$post = $_POST	;
$method = $post['method'];

switch( $method ){
	case 'login':
		
		$user = $post['user'];
		$pwd = $post['pwd'];

		//catch user data from DB
		$sql_findUser = "SELECT * FROM company WHERE binary user='".$post['user']."';";
		$SyntecObj->resultArray['companyInfo'] = array();
		$SyntecObj->SQLQuery('resultArray','companyInfo',$sql_findUser);

		//can it search data
		if( empty($SyntecObj->resultArray['companyInfo']) ){
			$result = array( "result" => "noUser" );
		}else{
			$DBUser = $SyntecObj->resultArray['companyInfo'][0]['user'];
			$DBPwd = $SyntecObj->resultArray['companyInfo'][0]['pwd'];
			
			//compare user and password
			if( $user == $DBUser && md5($pwd) == $DBPwd ){
				//correct, and save company info into SESSION
				$_SESSION['companyInfo'] = $SyntecObj->resultArray['companyInfo'][0];

				//get all factory id and group id owned this company
				$sql_getfidNgid = "SELECT factory.fid, cnc_group.cncgid as gid
								   FROM factory
								   LEFT JOIN cnc_group ON factory.fid=cnc_group.Factory
								   WHERE factory.Company=".$_SESSION['companyInfo']['cid']."
								   GROUP BY cnc_group.cncgid;";
				$SyntecObj->resultArray['getfidNgid'] = array();
				$SyntecObj->SQLQuery('resultArray','getfidNgid',$sql_getfidNgid);

				//input fid and gid into session
				if( !empty($SyntecObj->resultArray['getfidNgid']) ){
					$_SESSION['companyInfo']['fid'] = array();
					$_SESSION['companyInfo']['gid'] = array();

					foreach ($SyntecObj->resultArray['getfidNgid'] as $key => $value) {
						
						//input fid
						if( !in_array($value['fid'], $_SESSION['companyInfo']['fid']) ){
							array_push( $_SESSION['companyInfo']['fid'], $value['fid']);
						}

						//input gid
						if( !in_array($value['gid'], $_SESSION['companyInfo']['gid']) ){
							array_push( $_SESSION['companyInfo']['gid'], $value['gid']);
						}
					}
				}
				
				//return result
				$result = array( "result" => "success" );
			}else{
				$result = array( "result" => "errorPwd" );
			}
		}

		//release space
		$SyntecObj->resultArray = null;
		unset( $SyntecObj->resultArray );

		//return result
		echo json_encode( $result );
		//print_r($SyntecObj->resultArray['companyInfo']);

	break;

	case 'logout':
		
		//release all
		
		//unset( $SyntecObj );
		//unset( $_SESSION );
		//$SyntecObj = null;
		$_SESSION['companyInfo'] = null;
		unset( $_SESSION['companyInfo'] );
		
		//return result
		$result = array( "result" => "success", "index" => WEB_URL );
		echo json_encode( $result );

	break;

	default:
	break;
}

?>