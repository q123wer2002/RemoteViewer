<?php

class SyntecObj
{
  public $topHtml = "";
  public $footerHtml = "";

  public $tableName = "";
  public $contentHtml = "";

  //public
  public $isNeedHtml = true;
  public $resultArray = array();

  //region get data from database
  function SQL2JSON( $resultArray, $resultKey, $sql )
  {
    $result = mysql_query( $sql );

    if( $result ){
      while( $row = mysql_fetch_assoc( $result )){
        $this->{$resultArray}[$resultKey][] = $row;
      }
      @mysql_free_result( $result );
      $this -> { $resultArray }[ $resultKey ] = json_encode($this -> { $resultArray }[ $resultKey ]);
    }
  }
  //endregion

   //region get data from database
  function SQLQuery( $resultArray, $resultKey, $sql )
  {
    $result = mysql_query( $sql );

    if( $result ){
      while( $row = mysql_fetch_assoc( $result )){
        $this->{$resultArray}[$resultKey][] = $row;
      }
      @mysql_free_result( $result );
    }
  }
  //endregion

  //region set html layout
  function setLayout()
  {  
    if( $this->isNeedHtml == true ){
      include_once 'templates/MasterPage.html';
    }
    else{
      include_once 'templates/msg.htm';
    }
  }
  //endregion

}


?>