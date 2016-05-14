<?php

//relate to database (CRUD), box of function
include_once APP_PATH."/include/database/DBConfig.php";

class RemoteModule
{
 
  public $tableName = "";
  public $resultArray = array();
  public $resultJSON = array();

  //authority
  //private $authorityList;

  function __destruct()
  {
    unset($this->resultArray);
    unset($this->resultJSON);
  }

  function SQLQuery( $resultKey, $sqlCmd )
  {
    //declare
    $resultArray = "resultArray";
    $this->{$resultArray}[$resultKey] = array();
    
    //start load data from database
    $result = mysql_query( $sqlCmd );

    if( $result ){
      while( $row = mysql_fetch_assoc( $result )){
        $this->{$resultArray}[$resultKey][] = $row;
      }
      @mysql_free_result( $result );
    }

  }

  function SQLQueryToJSON( $resultKey, $sqlCmd )
  {
    //declare
    $resultArray = "resultArray";
    $this->{$resultArray}[$resultKey] = array();
    
    //start load data from database
    $result = mysql_query( $sqlCmd );

    if( $result ){
      while( $row = mysql_fetch_assoc( $result )){
        $this->{$resultArray}[$resultKey][] = $row;
      }
      @mysql_free_result( $result );
      
      //encode result into json
      $resultJSON = "resultJSON";
      $this->{$resultJSON}[$resultKey] = array();
      $this->{$resultJSON}[$resultKey] = json_encode($this->{$resultArray}[$resultKey]);
      
      //clear this var
      unset($this->{$resultArray}[$resultKey]);
      unset($resultArray);
    }
  }

  function SQLUpdate( $sqlCmd )
  {
    $isOk = mysql_query( $sqlCmd );
    
    @mysql_free_result( $isOk );
  }
  //endregion

  //region authority
  //function getAuthorityBox()
  //{
    //get authority from DB
    //process
    //output authority list
    //nothing
  //}
  //endregion

}


?>