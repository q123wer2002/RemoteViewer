<?php

include_once "../database/initSetting.php";

//module to connect to database
$RemoteAjax = new RemoteModule();

//get post data
if( isset($_POST) && isset($_POST['method']) ){
	$post = $_POST;
}else{
	echo "not defined";
	exit;
}

$method = $post['method'];

switch( $method ){
	case 'login':
		$user = $post['user'];
		$pwd = $post['pwd'];

		//catch user data from DB
		$sql_findUser = "SELECT * FROM company WHERE user='".$user."';";
		$RemoteAjax->SQLQuery( 'companyInfo',$sql_findUser);

		//can it search data
		if( empty($RemoteAjax->resultArray['companyInfo']) ){
			unset( $post );
			unset( $RemoteAjax->resultArray['companyInfo'] );
			
			$result = array( "result" => "noUser" );
			echo json_encode( $result );
			exit;
		}

		$DBUser = $RemoteAjax->resultArray['companyInfo'][0]['user'];
		$DBPwd = $RemoteAjax->resultArray['companyInfo'][0]['pwd'];

		//compare user and password
		if( md5($pwd) != $DBPwd ){  //$pwd != $DBPwd ){
			unset( $post );
			unset( $RemoteAjax->resultArray['companyInfo'] );

			$result = array( "result" => "errorPwd" );
			echo json_encode( $result );
			exit;
		}

		//correct, and save company info into SESSION
		$_SESSION['RemoteViewer']['user']['name'] = $DBUser;
		$_SESSION['RemoteViewer']['user']['pwd'] = $DBPwd;
		$_SESSION['RemoteViewer']['companyInfo'] = $RemoteAjax->resultArray['companyInfo'][0];
		unset($_SESSION['RemoteViewer']['companyInfo']['img']);
		unset($_SESSION['RemoteViewer']['companyInfo']['small_logo']);

		//get all factory id and group id owned this company
		$sql_getfidNgid = "SELECT factory.factory_id as fid, cnc_group.cnc_group_id as gid FROM factory LEFT JOIN cnc_group ON factory.factory_id=cnc_group.factory_id WHERE factory.company_id=".$_SESSION['RemoteViewer']['companyInfo']['company_id']." GROUP BY cnc_group.cnc_group_id;";
		$RemoteAjax->SQLQuery( 'getfidNgid',$sql_getfidNgid);

		//input fid and gid into session
		if( !empty($RemoteAjax->resultArray['getfidNgid']) ){
			$_SESSION['RemoteViewer']['companyInfo']['fid'] = array();
			$_SESSION['RemoteViewer']['companyInfo']['gid'] = array();

			foreach ($RemoteAjax->resultArray['getfidNgid'] as $key => $value) {
				
				//input fid
				if( !in_array($value['fid'], $_SESSION['RemoteViewer']['companyInfo']['fid']) ){
					array_push( $_SESSION['RemoteViewer']['companyInfo']['fid'], $value['fid']);
				}

				//input gid
				if( !in_array($value['gid'], $_SESSION['RemoteViewer']['companyInfo']['gid']) ){
					array_push( $_SESSION['RemoteViewer']['companyInfo']['gid'], $value['gid']);
				}
			}

			unset($RemoteAjax->resultArray['getfidNgid']);
		}

		//control the updating note
		$_SESSION['RemoteViewer']['user']['firstEnter'] = 1;
		
		//return result
		$resultAry = array( 
			"result" => "success",
			"data" => $_SESSION,
		);
		print_r( json_encode( $resultAry ) );
	break;
	case 'logout':

		$szCompanyName = $_SESSION['RemoteViewer']['companyInfo']['name'];
		
		//release all
		$_SESSION['RemoteViewer']['companyInfo']['fid'] = null;
		$_SESSION['RemoteViewer']['companyInfo']['gid'] = null;
		$_SESSION['RemoteViewer']['companyInfo'] = null;
		$_SESSION['RemoteViewer']['canUseFunctionList'] = null;

		unset( $post );
		unset( $_SESSION['RemoteViewer']['user']['name'] );
		unset( $_SESSION['RemoteViewer']['user']['Mode'] );
		unset( $_SESSION['RemoteViewer']['user'] );
		unset( $_SESSION['RemoteViewer']['companyInfo']['fid'] );
		unset( $_SESSION['RemoteViewer']['companyInfo']['gid'] );
		unset( $_SESSION['RemoteViewer']['companyInfo'] );
		unset( $_SESSION['RemoteViewer']['canUseFunctionList'] );
		unset( $_SESSION['RemoteViewer'] );
		
		//return result
		$resultAry = array( 
			"result" => "success",
			"data" => $szCompanyName,
		);

		print_r( json_encode($resultAry) );

		unset($resultAry);
	break;
	case 'initSettingData':
		$setData = array();

		//get user info
		$sqlTmp = "SELECT user as name, name as companyName, info as companyInfo FROM company WHERE user='".$_SESSION['RemoteViewer']['user']['name']."';";
		$RemoteAjax->SQLQuery( 'companyInfo',$sqlTmp);
		
		$setData['userInfo'] = $RemoteAjax->resultArray['companyInfo'][0];

		unset( $sqlTmp );
		unset( $RemoteAjax->resultArray['companyInfo'] );
		
		//get factory info
		$i=0;
		foreach($_SESSION['RemoteViewer']['companyInfo']['fid'] as $fID){
			$sqlTmp = "SELECT * FROM factory WHERE factory_id=".$fID;
			$RemoteAjax->SQLQuery( 'factoryInfo',$sqlTmp);

			$setData['factoryInfo'][$i] = $RemoteAjax->resultArray['factoryInfo'][0];
			$i++;

			unset( $sqlTmp );
			unset( $RemoteAjax->resultArray['factoryInfo'] );
		}
		unset( $i );

		$resultAry = array( "result" => "success", "data" => $setData );
		print_r( json_encode( $resultAry ) );

		unset( $setData );
		unset( $resultAry );
	break;
	case 'changePwd':
		//use userName to change his pwd
		$sqlTmp = "UPDATE company SET pwd='".md5($post['newPwd'])."' WHERE user ='".$_SESSION['RemoteViewer']['user']['name']."'";
		$RemoteAjax->SQLUpdate( $sqlTmp );

		//set pwd
		$_SESSION['RemoteViewer']['user']['pwd'] = md5($post['newPwd']);

		$resultAry = array( "result" => "success" );
		print_r( json_encode( $resultAry ) );

		unset( $sqlTmp  );
		unset( $RemoteAjax->resultArray['changePwd'] );
		unset( $resultAry );
	break;
	case "DoubleCheckPwd":
		
		$isSamePwd = false;
		if( md5($post['pwd']) == $_SESSION['RemoteViewer']['user']['pwd'] ){
			$isSamePwd = true;
		}

		$resultAry = array(
			"result" => "success",
			"isSamePwd" => $isSamePwd,
		);
		print_r( json_encode( $resultAry ) );
	break;
	case "GetComapnyLogo":
		$nCompanyID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		
		$companyLogo = array();
		$nErrorCode = GetDBData('GetCompanyLogo', $nCompanyID, array(), $companyLogo );

		$resultAry = array(
			"result" => "success",
			"data" => $companyLogo,
		);
		
		
		print_r( json_encode($resultAry) );
	break;
	case "initAuthority":

		$param = array(
			"comapny_name" => $post['companyName'],
		);

		$aryComapnyInfo = array();
		$nErrorCode = GetDBData('initAuthority', 0, $param, $aryComapnyInfo );

		$resultAry = array( 
			"result" => "success", 
			"data" => $aryComapnyInfo,
		);

		print_r( json_encode( $resultAry ) );
	break;
	case "GetSession":
		$resultAry = array( 
			"result" => "success",
			"data" => $_SESSION,
		);
		echo json_encode( $resultAry );
	break;
}

?>