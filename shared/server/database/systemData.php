<?php

include_once __dir__."/../../include/controlSetting.php";
include_once __dir__."/../../server/data/databaseData.php";

function systemData( $methodName, $param, &$resultAry )
{
	$ErrorCode = array(
		//minus means error
		//zero means normal finish
		//positive means pass
		"NoUser"		=>	-4,
		"errorPwd"		=>	-3,
		"NoData"		=>	-2,
		"ServerBusy"	=>	-1,
		"Success"		=>	0,
		"NeedDoSome"	=>	1,
	);

	//module to connect to database
	$RemoteAjax	=	new RemoteModule();
	
	//init
	$errorCode = $ErrorCode['Success'];
	$resultAry = '';

	switch( $methodName ){

		case "login":
			//catch user info to compare
			$tmpResultAry = array();
			$tmpErrorCode = systemData( "catchUserInfo", $param, $tmpResultAry );
			if( $tmpErrorCode != $ErrorCode['Success'] ){
				$errorCode = $tmpErrorCode;
				unset( $tmpResultAry );
				unset( $tmpErrorCode );
				break;
			}

			$user = $param['user'];
			$pwd = $param['pwd'];

			$DBUser	= $tmpResultAry['user'];
			$DBPwd = $tmpResultAry['pwd'];

			//compare user and password
			if( $pwd != $DBPwd ){  //md5($pwd) != $DBPwd ){ 
				$errorCode = $ErrorCode['errorPwd'];
				unset( $tmpResultAry );
				unset( $tmpErrorCode );
				break;
			}

			$companyID = $tmpResultAry['company_id'];
			
			//user correct, start to get factory and group
			$tmpResultAry = array();
			$tmpErrorCode = GetDBData( "myFIDnGID", $companyID, $param, $tmpResultAry );
			if( $tmpErrorCode != $ErrorCode['Success'] ){
				$errorCode = $tmpErrorCode;
				unset( $tmpResultAry );
				unset( $tmpErrorCode );
				break;
			}

			//all success, start to save in SESSION
			//save user info, include name, mode
			$userMode = ( $param['userMode'] == 1 ) ? "Management" : "Operation";
			$tmpParam['object'] = "user";
			$tmpParam['value'] = array( "name" => $DBUser, "mode" => $userMode );
			$tmpResultAry = array();
			$tmpErrorCode = systemData( "saveSESSION", $tmpParam, $tmpResultAry );

			//save company info, include fid,gid
			$fidList = array();
			$gidList = array();
			
			foreach( $tmpResultAry as $key => $value ){
				//input fid
				if( !in_array($value['fid'], $fidList) == true ){
					array_push( $fidList, $value['fid']);
				}

				//input gid
				if( !in_array($value['gid'], $gidList) == true ){
					array_push( $gidList, $value['gid']);
				}
			}

			$tmpParam['object'] = "companyInfo";
			$tmpParam['value'] = array( "fid" => $fidList, "gid" => $gidList );
			$tmpResultAry = array();
			$tmpErrorCode = systemData( "saveSESSION", $tmpParam, $tmpResultAry );
		break;

		case "logout":
		break;

		case "catchUserInfo":
			$user = $param['user'];
			$pwd = $param['pwd'];

			$sqlTmp = "SELECT * FROM company WHERE user='".$user."';";
			$RemoteAjax->SQLQuery('catchUserInfo',$sqlTmp);
			
			if( !empty($RemoteAjax->resultArray['catchUserInfo']) == true ){
				$resultAry = $RemoteAjax->resultArray['catchUserInfo'][0];
			}else{
				$errorCode = $ErrorCode['NoUser'];
			}

			unset( $sqlTmp );
			unset( $RemoteAjax->resultArray['catchUserInfo'] );
		break;

		case "saveSESSION":

			$object = $param['object'];
			
			foreach( $param['value'] as $key => $value ){
				$_SESSION[ $object ][ $key ] = $value;
			}
		break;
	}


	unset( $RemoteAjax );
	return $errorCode;
}

?>