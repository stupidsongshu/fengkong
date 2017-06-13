angular.module('fkliving.controller',['fkliving.services'])

.constant('ApiEndpoint', {
	// url: 'http://www.igmhz.com/fengkong-server/'
	url: 'http://localhost:8080/fengkong-server/'
})

.directive('loginRegister',function(){
	return {
		restrict:'EA',
		templateUrl:'templates/login.html',
		scope:'',
		controller:function($scope,$http,ApiEndpoint){
			// console.log(PopService)
			$scope.user = {};

			$scope.login = function(){
				if (!$scope.user.userName) {
					PopService.showPop('用户名不能为空');
					return false;
				} else if (!$scope.user.password) {
					PopService.showPop('密码不能为空');
					return false;
				} else {
					$http.post(ApiEndpoint.url + "user/login.do", {}, {
						params: {
							userName: $scope.user.userName,
							password: $scope.user.password
						}
					}).success(function (data) {
						if (data.errorCode == 0) {
							localStorage.user = JSON.stringify(data.result);
							localStorage.userId = data.result.userId;
							localStorage.userName = data.result.userName;

							PopService.showPop('登录成功');
							// $state.go('tabs.myself');
							if ($ionicHistory.viewHistory().backView != null) {
								$ionicHistory.goBack();
							} else if ($ionicHistory.viewHistory().backView == null) {
								$state.go('tabs.home');
								/*if($ionicHistory.viewHistory().backView.stateName == 'login'){
								}*/
							}
						} else {
							PopService.showPop(data.errorMessage);
						}
					})
				}
			}
		}
	}
})

/*.directive('headerCommon',function(){
	return {
		restrict:'EA',
		templateUrl:'trmplates/login.html',

	}
})*/

.controller('HeaderCtrl',['$scope','$http',function($scope,$http){
	var register = $('.headerIndex').find('.register');
	var login = $('.headerIndex').find('.login');

	var loginRegister = $('#loginRegister');
	var close = loginRegister.find('.close');
	var registerContent = loginRegister.find('.register');
	var loginContent = loginRegister.find('.login');

	var mask = $('#mask');

	register.on('click',function(){
		mask.show();
		loginRegister.show();
	})
	login.on('click',function(){
		mask.show();
		loginRegister.show();
		registerContent.hide();
		loginContent.show();
	})

	close.on('click',function(){
		mask.hide();
		registerContent.show();
		loginContent.hide();
		loginRegister.hide();
	})

	var li = loginRegister.find('.title').children('li');
	li.on('click',function(){
		$(this).addClass("active").siblings().removeClass("active").parent().next().children('div').eq($(this).index()).show().siblings().hide();
	})



}])

//个人中心
.controller('PersonalCenterCtrl',['$scope','$http',function($scope,$http){
	//用户资料
	
}])

//首页
.controller('IndexCtrl',['$scope',function($scope){
	
}])

//搜索
.controller('SearchCtrl',['$scope',function($scope){

}])