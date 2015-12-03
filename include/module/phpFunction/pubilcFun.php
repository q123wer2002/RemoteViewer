<?php


function redirect($url, $statusCode = 303)
{
   header('Location: ' . $url, true, $statusCode);
   die();
}

function encode( $source ){
	if( $source != null && $source != ""){
		//encode souce
	}
}

?>