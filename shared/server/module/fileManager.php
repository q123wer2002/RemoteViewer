<?php
include_once "../database/initSetting.php";

if( isset($_GET) && isset($_GET['method']) ){
	$request = $_GET;
}else if( isset($_POST) && isset($_POST['method']) ){
	$request = $_POST;
}
else{
	echo "not defined";
	exit;
}

$method = $request['method'];

switch( $method ){
	case "Download":

		$param = array(
			"param1"	=> $request['param1'],
			"param2"	=> $request['param2'],
		);

		$fileAry = array();
		$nErrorCode = GetDBData( $request['DBAPI'], 0, $param, $fileAry );

		//create tmp file to store byte data
		$tmpfile = tmpfile();

		//write btye into tmpfile
		fwrite( $tmpfile, base64_decode(base64_encode($fileAry['file'])), strlen($fileAry['file']) );
		fseek( $tmpfile, 0 );

		//download file header
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename="'.$request['fileName'].'"');
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		
		//print file content
		echo fread( $tmpfile, strlen($fileAry['file']) );
		
		// this removes the file
		fclose($tmpfile);
	break;
	case "UploadNcFile":
		$timeObj = new DateTime();
		$currenttime = $timeObj->format('Y-m-d H:i:s');

		//upload file
		$fileConecnt = file_get_contents($_FILES['file']['tmp_name']);
		$param = array(
			"name"			=> $_FILES['file']['name'],
			"file"			=> addslashes($fileConecnt),
			"size"			=> $_FILES['file']['size'],
			"upload_time"	=> $currenttime,
		);

		$nCNCID = $request['nItemID'];
		$result = array();
		$nErrorCode = GetDBData('UploadNcFile', $nCNCID, $param, $result );

		//remove unless param, and sent param back
		unset($param['file']);

		$result = array(
			"result"	=> "success",
			"data"		=> $param,
		);

		print_r( json_encode($result) );
	break;
	case "UploadCompanyLogo":
		
		$param = array(
			'logoImage' => $request['file'],
		);

		$nCompanyID = $_SESSION['RemoteViewer']['companyInfo']['company_id'];
		$result = array();
		$nErrorCode = GetDBData('UploadCompanyLogo', $nCompanyID, $param, $result );

		$result = array(
			"result"	=> "success",
			"data"		=> $param['logoImage'],
		);

		print_r( json_encode($result) );
	break;
}

?>