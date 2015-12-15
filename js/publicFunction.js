//change time
function changetime2Date( initType, value ){
	if( initType != null && value != null ){
		var tmpTimeValue = value;
		switch( initType ){
			case 'second':
				var ss = tmpTimeValue % 60;
	            var mm = Math.floor((tmpTimeValue / 60) % 60);
	            var hh = Math.floor(tmpTimeValue / 3600);

            	return hh + " 小時 " + mm + " 分鐘 " + ss + " 秒 ";
			break;

			case 'minute':
				var mm = tmpTimeValue % 60;
	            var hh = Math.floor(tmpTimeValue / 24);

            	return hh + " 小時 " + mm + " 分鐘 " ;
			break;

			case 'hour':
	            var hh = tmpTimeValue % 24;
	            var dd = Math.floor(tmpTimeValue/24);

            	return dd + " 天 " + hh + " 小時 ";
			break;

			default:
			break;
		}
	}
	return 0;
}