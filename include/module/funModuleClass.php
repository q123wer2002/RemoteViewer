<?php

include_once APP_PATH."/include/database/DBDataAPI.php";


class FunctionObj
{
	//public area
		public function __construct( $cncID )
		{
			require "functionList.php";
			$this->m_aryFunctionList = $aryFunctionList;
			$this->m_nCNCID = $cncID;
		}

		public function aryCheckFunctionList()
		{
			$this->m_aryCanUseFunction = array();
			foreach( $this->m_aryFunctionList as $key => $value ){
				//set error code
				$nErrorCode = 0;
				$result = array();

				if( is_array($value[$this->listItemName['NeedDBData']]) ){
					//means it needs more than one dbapi
					foreach ($value[$this->listItemName['NeedDBData']] as $dbKey ) {
						$nErrorCode = GetDBData( $dbKey, $this->m_nCNCID, array(), $result);
						
						if($nErrorCode != 0){
							break;
						}
					}
				}else{
					//means it needs one dbapi
					$nErrorCode = GetDBData( $key, $this->m_nCNCID, array(), $result);
				}

				if( $nErrorCode !== 0 ){
					continue;
				}

				array_push( $this->m_aryCanUseFunction, $key );
			}

			return $this->m_aryCanUseFunction;
		}

		public function GetCNCID()
		{
			return $this->m_nCNCID;
		}

	//private area
		private $m_aryFunctionList = array();
		private $m_aryCanUseFunction = array();
		private $m_nCNCID = 0;
		private $listItemName = array(
			"Name"			=> 0,
			"Size"			=> 1,
			"NeedDBData"	=> 2,
			"isUpdating"	=> 3,
			"isAuthority"	=> 4,
		);
}

/*class FunctionModule
{
	//public area
		function __construct( $szName, $szSize, $aryNeedData, $isNeedUpdating, $nAuthority=0 )
		{
			$this->m_szName = $szName;
			$this->m_szSize = $szSize;
			$this->m_isNeedupdating = $isNeedUpdating;
			$this->m_nAuthority = $nAuthority;

			for( $i=0; $i<count($aryNeedData); $i++){
				array_push( $this->m_aryNeedData, $aryNeedData[$i] );
			}
		}
		function __destruct()
		{
			unset($this->m_aryNeedData);
			unset($this->m_szSize);
			unset($this->m_szName);
			unset($this->m_isNeedupdating);
			unset($this->m_nAuthority);
		}

		function szGetSize()
		{
			return $this->m_szSize;
		}

		function szGetName()
		{
			return $this->m_szName;
		}

		function nGetAuthority()
		{
			return $this->m_nAuthority;
		}

		function aryGetNeedDataList()
		{
			return $this->m_aryNeedData;
		}

		function isNeedUpdating()
		{
			return $this->m_isNeedupdating;
		}

		function isShow()
		{
			return $this->isShow;
		}
	//protected area
	//private area
		private $m_aryNeedData = array();
		private $m_szSize = "";
		private $m_szName = "";
		private $m_isNeedupdating = false;
		private $m_isShow = false;
		private $m_nAuthority = 0; //means no authority
}*/
?>