define([
	'angularAMD'
],function( angularAMD ){
	return function fileMgr( $http, PATH, frontendAdaptor ){

		var fileMgr = [];

		fileMgr.m_objFileType = [
			"NcFile",
			"Ladder",
			"CompanyLogo",
			"AgentFile",
		];

		fileMgr.m_objMaxImage = {
			nWidth : 500,
			nHeight : 500,
			nSize : 50000,
		};

		//download file
		fileMgr.fnDownloadFile = function( objFileParam, szFileTypeFromMgr ){
			
			if( fileMgr.m_objFileType.indexOf(szFileTypeFromMgr) == -1 ){
				return;
			}


			switch( szFileTypeFromMgr ){
				case "NcFile":
					var nCNCID = objFileParam['nCNCID'];
					var szfileName = objFileParam['szFileName'];
					if( typeof szfileName == "undefined" || szfileName.length == 0 ){
						return;
					}
					frontendAdaptor.fnDownloadFile( "DownloadNcFile", szfileName, {'param1':nCNCID, 'param2':szfileName} );
				break;
				case "Ladder":
					var nCNCID = objFileParam['nCNCID'];
					var szfileName = objFileParam['szFileName'];
					frontendAdaptor.fnDownloadFile( "DownloadLadFile", szfileName, {'param1':nCNCID, 'param2':szfileName} );
				break;
				case "AgentFile":
					var szAgnetVersion = objFileParam['szAgnetVersion'];
					var szAPIVersion = objFileParam['szAPIVersion'];
					frontendAdaptor.fnDownloadFile( "DownloadAgentFile", "SyntecRemoteAgent_"+szAPIVersion+"_"+szAgnetVersion+".zip", {'param1':szAgnetVersion, 'param2':szAPIVersion} );
				break;
			}
		}

		//uplaod file
		fileMgr.fnUploadFile = function( nItemID, file, szFileTypeFromMgr, fnResponse ){
			if( fileMgr.m_objFileType.indexOf(szFileTypeFromMgr) == -1 ){
				return;
			}

			var szMethod;
			switch( szFileTypeFromMgr ){
				case "NcFile":
					szMethod = "UploadNcFile";
					var fileInfo = m_CreateFileFormat( szMethod, nItemID, file );
					frontendAdaptor.fnUploadFile( fileInfo, function(response){
						fnResponse(response);
					}, false );
				break;
				case "Ladder":
					return;
				break;
				case "CompanyLogo":
					szMethod = "UploadCompanyLogo";
					//does it need to compress
					if( file.total > fileMgr.m_objMaxImage['nSize'] ){
						//yes, need to compress
						m_CompressImage( file, function(image){
							//compressing
							var resizeImage = m_resizeImg( image );
							var b64Image = resizeImage.split("base64,").pop();
							var fileInfo = m_CreateFileFormat( szMethod, nItemID, b64Image );
							
							//sent data to be storing
							frontendAdaptor.fnUploadFile( fileInfo, function(response){
								fnResponse(response);
							}, false );
						});
					}else{
						//no, it doesnot compress
						var b64Image = file.target.result.split("base64,").pop();
						var fileInfo = m_CreateFileFormat( szMethod, nItemID, b64Image );
						
						//send to db storing
						frontendAdaptor.fnUploadFile( fileInfo, function(response){
							fnResponse(response);
						}, false );
					}
				break;
			}
		}

		m_CreateFileFormat = function( szMethod, nItemID, file ){
			var fileInfo = new FormData();

			//append another info
			fileInfo.append( "nItemID", nItemID );
			fileInfo.append( "method", szMethod );

			fileInfo.append( "file", file );
			return fileInfo;
		}

		m_CompressImage = function( event, fnOnload ){
			// helper Image object
			var image = new Image();
			image.src = event.target.result;
			image.onload = fnOnload(image);
		}

		m_resizeImg = function(image){
			var canvas = document.createElement('canvas');

			var nMaxwidth = fileMgr.m_objMaxImage['nWidth'];
			var nMaxheight = fileMgr.m_objMaxImage['nHeight'];
			var width = image.width;
			var height = image.height;

			// calculate the width and height, constraining the proportions
			if (width > height) {
				if (width > nMaxwidth) {
					//height *= nMaxwidth / width;
					height = Math.round(height *= nMaxwidth / width);
					width = nMaxwidth;
				}
			}else{
				if (height > nMaxheight) {
					//width *= nMaxheight / height;
					width = Math.round(width *= nMaxheight / height);
					height = nMaxheight;
				}
			}

			// resize the canvas and draw the image data into it
			canvas.width = width;
			canvas.height = height;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(image, 0, 0, width, height);

			return canvas.toDataURL("image/png",0.5); // get the data from canvas as 50% JPG (can be also PNG, etc.)
		}

		return fileMgr;
	}
});
