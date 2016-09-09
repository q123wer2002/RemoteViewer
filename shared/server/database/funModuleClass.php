<?php

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

				//always add current alarm
				if( $key == "cncCurtAlm" ){
					$tmpAry = array();
					$tmpAry[ "funName" ] = $key;
					$tmpAry[ "funDetail" ] = $this->m_aryFunctionList[$key];

					array_push( $this->m_aryCanUseFunction, $tmpAry );
					continue;
				}

				if( is_array($value[$this->listItemName['DBAPI']]) ){
					//means it needs more than one dbapi
					foreach ($value[$this->listItemName['DBAPI']] as $dbKey ) {

						$nErrorCode = GetDBData( $dbKey, $this->m_nCNCID, array(), $result);
						
						if($nErrorCode !== 0){
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

				$tmpAry = array();
				$tmpAry[ "funName" ] = $key;
				$tmpAry[ "funDetail" ] = $this->m_aryFunctionList[$key];

				array_push( $this->m_aryCanUseFunction, $tmpAry );
			}
			return $this->m_aryCanUseFunction;
		}

		public function GetDBAPIFromTWName( $szTWName )
		{
			foreach( $this->m_aryFunctionList as $key => $value ){
				if( $value[$this->listItemName['TWName']] == $szTWName ){
					return $value[$this->listItemName['DBAPI']];
				}
			}
		}

		public function GetDBAPIFromPrefix( $prefixName )
		{
			foreach( $this->m_aryFunctionList as $key => $value ){
				if( $key == $prefixName ){
					return $value[$this->listItemName['DBAPI']];
				}
			}
		}

		public function GetIsNeedUpdating( $prefixName )
		{
			foreach( $this->m_aryFunctionList as $key => $value ){
				if( $key == $prefixName ){
					return $value[$this->listItemName['isUpdating']];
				}
			}
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
			"TWName"		=> 0,
			"ViewSize"		=> 1,
			"DBAPI"			=> 2,
			"isUpdating"	=> 3,
			"isAuthority"	=> 4,
		);
}

?>