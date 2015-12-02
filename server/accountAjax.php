<?php
include_once "../include/createObj.php";

//get post data
$post = $_POST;
$method = $post['method'];

switch( $method ){
	case 'login':
		
		$user = $post['user'];
		$pwd = $post['pwd'];

		//catch user data from DB
		$sql_findUser = "SELECT * FROM company WHERE binary user='".$post['user']."'";
		$SyntecObj->resultArray['userInfo'] = array();
		$SyntecObj->SQLQuery('resultArray','userInfo',$sql_findUser);

		//can it search data
		if( empty($SyntecObj->resultArray['userInfo']) ){
			$result = array( "result" => "noUser" );
		}else{
			$DBUser = $SyntecObj->resultArray['userInfo'][0]['user'];
			$DBPwd = $SyntecObj->resultArray['userInfo'][0]['pwd'];
			
			//compare user and password
			if( $user == $DBUser && md5($pwd) == $DBPwd ){
				//correct, and save user into SESSION
				$_SESSION['userInfo'] = $SyntecObj->resultArray['userInfo'][0];

				//return result
				$result = array( "result" => "success" );
			}else{
				$result = array( "result" => "errorPwd" );
			}
		}

		//return result
		echo json_encode( $result );
		//print_r($SyntecObj->resultArray['userInfo']);

	break;

	case 'logout':
		
		//set session null
		$_SESSION['userInfo'] = null;
		
		//return result
		$result = array( "result" => "success", "index" => WEB_URL );
		echo json_encode( $result );

	break;

	default:
	break;
}

?>