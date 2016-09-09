<?php

function redirect($url, $statusCode = 303)
{
  header('Location: ' . $url, true, $statusCode);
  die();
}

function encode( $source )
{
  if( $source != null && $source != ""){
  	//encode souce
  }
}

function szDevice()
{
  $regex_match="/(nokia|iphone|android|motorola|^mot\-|softbank|foma|docomo|kddi|up\.browser|up\.link|";
  $regex_match.="htc|dopod|blazer|netfront|helio|hosin|huawei|novarra|CoolPad|webos|techfaith|palmsource|";
  $regex_match.="blackberry|alcatel|amoi|ktouch|nexian|samsung|^sam\-|s[cg]h|^lge|ericsson|philips|sagem|wellcom|bunjalloo|maui|";
  $regex_match.="symbian|smartphone|midp|wap|phone|windows ce|iemobile|^spice|^bird|^zte\-|longcos|pantech|gionee|^sie\-|portalmmm|";   
  $regex_match.="jig\s browser|hiptop|^ucweb|^benq|haier|^lct|opera\s*mobi|opera\*mini|320x320|240x320|176x220";
  $regex_match.=")/i";

  $isMobile = preg_match($regex_match, strtolower($_SERVER['HTTP_USER_AGENT']));

  if( $isMobile == true ){
    return "mobile";
  }

  return "web";
}

function ErrorLog( $nErrorCode )
{
  if( $nErrorCode === 0 ){
    return;
  }

  $result = array(
    "result"=> "error", 
    "data"  => "__".$nErrorCode."__",
  );
  print_r( json_encode($result) );
  exit;
}

function TranslateDiagnosisType( $szType )
{
  switch( $szType ){
    case "R":
      return GetDiagnosisIndex("Read_R");
    break;
  }
}

function GetDiagnosisIndex( $command )
{
  switch( $command ){
    case "Read_I":
      return 0;
    break;
    case "Read_O":
      return 1;
    break;
    case "Read_C":
      return 2;
    break;
    case "Read_S":
      return 3;
    break;
    case "Read_A":
      return 4;
    break;
    case "Read_R":
      return 5;
    break;
    case "Global_Var": //@
      return 6;
    break;
    case "System_Var": //#
      return 7;
    break;
    case "Read_D":
      return 8;
    break;
    case "Read_P":
      return 9;
    break;
    case "Registry_Var": //L
      return 10;
    break;
    // add new type here
    default:
      return -1;
    break;
  } 
}



?>