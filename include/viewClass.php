<?php

class RemoteView
{
  public $webVersion = "Beta 1.0.0.1";
  public $meta;
  public $topHtml;
  public $footerHtml;

  public $contentHtml = "";

  //public
  public $viewDevice = "";
  public $isNeedHtml = true;
  public $resultJSON = array();

  //region set html layout
  function __construct ( $htmlPath )
  {
    $this->viewDevice = szDevice();

    $this->meta = $htmlPath."/templates/".$this->viewDevice."/meta.html";
    $this->topHtml = $htmlPath."/templates/".$this->viewDevice."/top.html";
    $this->footerHtml = $htmlPath."/templates/".$this->viewDevice."/footer.html";
  }
  
  function setLayout()
  {
    if( $this->isNeedHtml == true ){
      include_once 'templates/'.$this->viewDevice.'/MasterPage.html';
    }
    else{
      include_once 'templates/msg.htm';
    }
  }
  //endregion

}


?>