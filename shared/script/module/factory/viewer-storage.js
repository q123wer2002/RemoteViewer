define([
	'angularAMD'
], function(angularAMD){
	
	return function viewerStorage($timeout,frontendAdaptor){
		
		var viewerStorage = [];
		
		var m_aryLoginData = "";
		var m_localStorage = {
			initData : function(storageKey){
				frontendAdaptor.fnPromiseData("ACCOUNT","GetSession",{}).then(function(response){
					//success
					m_aryLoginData = response.data;
				}, function(response){
					//error
					console.log("error");
				});

				return;
			},
			getItem : function(storageKey){
				
				if( m_aryLoginData == "" ){
					this.initData(storageKey);
					return;
				}

				return m_aryLoginData;
				
			},
			removeItem : function(storageKey){
				m_aryLoginData = "";
			},
		};

		viewerStorage.fnGetData = function ( storageKey ) {
			if( m_IsStorageAvailable('localStorage') == false ){
				return m_localStorage.getItem(storageKey);
			}

			return JSON.parse(localStorage.getItem(storageKey) || '[]');
		},

		viewerStorage.fnPutData = function ( storageKey, objStorageValue ) {
			if( m_IsStorageAvailable('localStorage') == false ){
				return;
			}
			localStorage.setItem(storageKey, JSON.stringify(objStorageValue));
		}

		viewerStorage.fnRemoveData = function ( storageKey ) {
			if( m_IsStorageAvailable('localStorage') == false ){
				m_localStorage.removeItem(storageKey);
				return;
			}
			localStorage.removeItem(storageKey);
		}

		m_IsStorageAvailable = function(type){
			try {
				var storage = window[type],
					x = '__storage_test__';
				storage.setItem(x, x);
				storage.removeItem(x);
				return true;
			}
			catch(e) {
				//get data from PHP session directly
				return false;
			}
		}

		return viewerStorage;
	};
});