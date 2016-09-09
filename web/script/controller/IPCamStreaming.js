define( [
	'../../app',
], function( app ) {
	app.controller( 'SyntecIPCamStream', function( $scope, $routeParams, frontendAdaptor ) {
		nCurFid = $routeParams.factory_id;

		$scope.groupID = -1;
		$scope.groupList = [];
		$scope.ipcamList = [];
		$scope.is_chrome;

		//group list init
		$scope.InitializeGroupList = function() {
			this.fnGetResult = function( response ) {
				if( typeof response.data == "undefined" || response.data == "" ) {
					return;
				}

				for( var i = 0; i < response.data.length; i++ ) {
					var groupObj = { "group_id": response.data[ i ].cnc_group_id, "group_name": response.data[ i ].name, "isShow":false };
					$scope.groupList.push( groupObj );
				}
			}
			var f_id = { "f_id": nCurFid };
			frontendAdaptor.fnGetResponse( 'IPCAM', "GetAllGroup", f_id, this.fnGetResult, false );
		}

		//get IPCAM name & rts_url from DB
		$scope.fnInitGetIPCamInfo = function( nGroupID ) {
			this.fnGetResult = function( response ) {
				if( typeof response.data == "undefined" || response.data == "" ) {
					return;
				}

				//show this group
				fnShowGroup(nGroupID);

				for( var i = 0; i < response.data.length; i++ ) {
					var ipcamObj = { "ipcam_id": response.data[ i ].camera_id, "name": response.data[ i ].camera_name, "rtsp_url": response.data[ i ].camera_rtsp_url };
					$scope.ipcamList.push( ipcamObj );

					var isChrome = navigator.userAgent.match( "Safari" );
					if( isChrome ) { //chrome -> run vxgplayer to play video/rtsp streaming
						createPlayerVxg( nGroupID, ipcamObj.name, ipcamObj.rtsp_url );
					} else { //IE firefox -> run VLC to play video/rtsp streaming
						createPlayerVlc( nGroupID, ipcamObj.name, ipcamObj.rtsp_url );
					}
				}
			}
			var g_id = { "g_id": nGroupID };
			frontendAdaptor.fnGetResponse( 'IPCAM', "GetIPCamInfo", g_id, this.fnGetResult, false );
		}

		fnShowGroup = function( nGroupID )
		{
			for( var i=0; i<$scope.groupList.length; i++ ){
				if( $scope.groupList[i]['group_id'] == nGroupID ){
					$scope.groupList[i]['isShow'] = true;
				}
			}
		}

		//detect & classify web browser to choose how to stream
		var isChrome = navigator.userAgent.match( "Safari" );
		if( isChrome ) {
			$scope.is_chrome = 1;
		} else {
			$scope.is_chrome = 0;
		}

		//chrome vxgplayer for rtsp streaming
		var indexPlayer = 0;
		createPlayerVxg = function( nID, szName, szRtspUrl ) {
			indexPlayer++;

			var vxgLi = document.createElement( 'li' );
			var vxgLiId = 'vxgLiId' + indexPlayer;
			vxgLi.setAttribute( "id", vxgLiId );
			vxgLi.setAttribute( "class", "vxgLiId" );

			var nameDiv = document.createElement( 'div' );
			nameDiv.className = 'nameDiv';
			var node_value = document.createTextNode( szName );
			nameDiv.appendChild( node_value );

			var playerId = 'vxg_media_player' + indexPlayer;
			var videoDiv = document.createElement( 'div' );
			videoDiv.setAttribute( "id", playerId );
			videoDiv.setAttribute( "class", "vxgplayer" );
			var runtimePlayers = document.getElementById( 'dynamicallyVxgPlayers' + nID );
			vxgLi.appendChild( nameDiv );
			vxgLi.appendChild( videoDiv );
			runtimePlayers.appendChild( vxgLi );
			vxgplayer( playerId, {
				url: '',
				nmf_path: 'media_player.nmf',
				nmf_src: '../shared/server/vxgplayer_1.8.8/pnacl/Release/media_player.nmf',
				latency: 300000,
				aspect_ratio_mode: 1,
				autohide: 3,
				controls: true,
				width: 400,
				height: 300
			} ).ready( function() {
				console.log( ' =>ready player ' + playerId );
				vxgplayer( playerId ).src( szRtspUrl );
				vxgplayer( playerId ).play();
				console.log( ' <=ready player ' + playerId );
			} );
		}

		//IE,firefox vlc plugin for rtsp streaming
		var indexVlc = 0;
		createPlayerVlc = function( nID, szName, szRtspUrl ) {
			indexVlc++;

			var vlcLi = document.createElement( 'li' );
			var vlcLiId = 'vxgLiId' + indexVlc;
			vlcLi.setAttribute( "id", vlcLiId );
			vlcLi.setAttribute( "class", "vlcLiId" );

			var nameDiv = document.createElement( 'div' );
			nameDiv.className = 'nameDiv';
			var node_value = document.createTextNode( szName );
			nameDiv.appendChild( node_value );

			var playerId = 'vlc_media_player' + indexVlc;
			var videoObject = document.createElement( 'object' );
			videoObject.setAttribute( "id", playerId );
			videoObject.setAttribute( "classid", "clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921" );
			videoObject.setAttribute( "codebase", "http://download.videolan.org/pub/videolan/vlc/last/win64/axvlc.cab" );
			videoObject.setAttribute( "name", "vlc" );
			videoObject.setAttribute( "class", "vlcPlayer" );
			videoObject.setAttribute( "events", "True" );
			videoObject.setAttribute( "z-index", "1" );

			var srcParam = document.createElement( 'param' );
			srcParam.setAttribute( "name", "Src" );
			srcParam.setAttribute( "value", szRtspUrl );
			var showdisplayParam = document.createElement( 'param' );
			showdisplayParam.setAttribute( "name", "ShowDisplay" );
			showdisplayParam.setAttribute( "value", "True" );
			var autoloopParam = document.createElement( 'param' );
			autoloopParam.setAttribute( "name", "AutoLoop" );
			autoloopParam.setAttribute( "value", "False" );
			var autoplayParam = document.createElement( 'param' );
			autoplayParam.setAttribute( "name", "AutoPlay" );
			autoplayParam.setAttribute( "value", "True" );

			videoObject.appendChild( srcParam );
			videoObject.appendChild( showdisplayParam );
			videoObject.appendChild( autoloopParam );
			videoObject.appendChild( autoplayParam );

			var vlcPlayers = document.getElementById( 'dynamicallyVlcPlayers' + nID );
			vlcLi.appendChild( nameDiv );
			vlcLi.appendChild( videoObject );
			vlcPlayers.appendChild( vlcLi );
		}
	} );
} );
