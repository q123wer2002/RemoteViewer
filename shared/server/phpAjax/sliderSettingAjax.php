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
	case "GetAllFactory":
		$nCID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$factoryArray = array();
		$nErrorCode = GetDBData('GetAllFactoryInfo', $nCID, array(), $factoryArray );
		//ErrorLog( $nErrorCode );

		$result = array(
			"result"=> "success", 
			"data" => $factoryArray,
		);

		print_r( json_encode($result) );
	break;
	case "initCNCListFromFactory":
		//my layout
		$CNCList = array();
		$nFactoryID = $post['nFID'];
		$nErrorCode = GetDBData('CncListFromF', $nFactoryID, array(), $CNCList );

		$result = array(
			"result"=> "success", 
			"data" => $CNCList,
		);

		print_r( json_encode($result) );
	break;
	case "loadSliderSetting":
		
		$nFID = $post['nFID'];
		$b64SliderSetting = array();
		$nErrorCode = GetDBData('GetSliderSetting', $nFID, array(), $b64SliderSetting );
		//ErrorLog( $nErrorCode );

		$result = array(
			"result"=> "success", 
			"data" => $b64SliderSetting,
		);

		print_r( json_encode($result) );
	break;
	case "saveSliderSetting":
		$param = array(
			"sliderSetting"	=> $post['b64SliderSetting'],
		);

		//my layout
		$tmpArray = array();
		$nFID = $post['nFID'];
		$nErrorCode = GetDBData('SaveSliderSetting', $nFID, $param, $tmpArray );
		//ErrorLog( $nErrorCode );

		$result = array(
			"result"=> "success", 
			//"data" => $initMyLyout,
		);

		print_r( json_encode($result) );
	break;
}

?>