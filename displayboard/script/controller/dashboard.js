define(['../../app'], function (app) {
	app.controller('SyntecDashboard',function($scope,$interval,$timeout,PATH,cfgMgr,cncDataMgr,frontendAdaptor,customMgr){

		$scope.factories = [];

		$scope.Initialization = function()
		{
			GetAllFactory();
		}
		//init get factory list
			GetAllFactory = function()
			{
				this.fnGetResult = function(response){
					if( typeof response.data == "undefined" || response.data == "" ){
						return;
					}

					for( var i=0; i<response.data.length; i++ ){
						var factoryObj = { "factory_id":response.data[i].factory_id, "factory_name":response.data[i].name };
						$scope.factories.push( factoryObj );
					}
				}

				frontendAdaptor.fnGetResponse( 'SLIDER', "GetAllFactory", {}, this.fnGetResult, false );
			}
		$scope.fnGoFactoryLink = function( factory, szLink )
		{
			if( szLink == "display" ){
				//go to display this factory
				window.open( PATH['WEBPATH'] + "#/factory/" + factory.factory_id , "_self");
			}else if( szLink == "setting" ){
				//go to display this factory
				window.open( "#/sliderSetting/factory/" + factory.factory_id , "_self");
			}
		}
	});
});