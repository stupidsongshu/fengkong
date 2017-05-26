angular.module('fkgame.controller',['fkgame.services'])

.directive('modalDialog',function(){
	return {
		restrict:'AE',
		templateUrl:'templates/modal-dialog.html',
		replace:true,
		controller:function(){
			var screen = $('#screen'),
				modalDialog = $('#modal-dialog'),
				btnConfirm = modalDialog.find('.btn-confirm'),
				btnCancel = modalDialog.find('.btn-cancel'),
				btnClose = modalDialog.find('.btn-close');

				btnConfirm.on('click',function(){
					screen.hide();
					modalDialog.hide();
				});
				btnCancel.on('click',function(){
					screen.hide();
					modalDialog.hide();
				});
				btnClose.on('click',function(){
					screen.hide();
					modalDialog.hide();
				});
		},
		link:function(scope,ele,attr){
			console.log(ele);
			console.log(ele.find('#screen'));
		}
	}
})

//角色选择
.controller('SelectRoleCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '角色选择',
		rightTitle : '返回首页',
		rightHide : true
	}
	
	$scope.role = {};
}])

//选择投资
.controller('SelectInvestCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '选择投资',
		rightTitle : '返回首页',
		rightHide : false
	}
}])

//分配股权
.controller('DistributeStockCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '分配股权、股权收益比例',
		rightTitle : '返回首页',
		rightHide : false
	}
}])

//投资列表
.controller('InvestmentListCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '我的投资',
		rightTitle : '返回首页',
		rightHide : false
	}
}])

//股权分配结果反馈
.controller('StaffFeedbackCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '股权分配结果反馈',
		rightTitle : '返回首页',
		rightHide : false
	}
}])

//选择入职
.controller('selectEntryCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '选择入职',
		rightTitle : '返回首页',
		rightHide : false
	}

	$(function(){
		$('.btn-submit').click(function(){
			$('#screen').show();
			$('#modal-dialog').show();
		});
	});

}])

//员工招聘、分配职务（董事长）
.controller('StaffEmployeeCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '员工招聘',
		rightTitle : '返回首页',
		rightHide : false
	}
}])

//权限分配（入职状态）
.controller('DistributePermissionStatusCtrl',['$scope','GetParams',function($scope,GetParams){
	$scope.header = {
		leftTitle : '入职状态',
		rightTitle : '返回首页',
		rightHide : false
	}

	$scope.role = {};
	if(location.href){
		var UrlSearch = new GetParams.UrlSearch();
		$scope.role.type = UrlSearch.type;
	}
}])

//权限分配（董事长）
.controller('DistributePermissionCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '权限分配',
		rightTitle : '返回首页',
		rightHide : false
	}
}])

//权限分配（员工）
.controller('DistributePermissionStaffCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '权限分配',
		rightTitle : '返回首页',
		rightHide : false
	}
}])

//合同台账(销售)
.controller('ContractLedgerSellCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '合同台账',
		rightTitle : '返回经营页',
		rightHide : false
	}
}])

//合同详情(销售)
.controller('ContractDetailSellCtrl',['$scope','GetParams',function($scope,GetParams){
	$scope.header = {
		leftTitle : '合同详情',
		rightTitle : '返回经营页',
		rightHide : false
	}

	$scope.role = {};
	var UrlSearch = new GetParams.UrlSearch();
	if(UrlSearch.type){
		$scope.role.type = UrlSearch.type;
	}
	
}])

//发起签订合同（特殊）
.controller('SignContractSpecialCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '合同详情',
		rightTitle : '返回经营页',
		rightHide : false
	}
}])

//合同台账(采购)
.controller('ContractLedgerPurchaseCtrl',['$scope',function($scope){
	$scope.header = {
		leftTitle : '合同台账',
		rightTitle : '返回经营页',
		rightHide : false
	}
}])

//合同详情(采购)
.controller('ContractDetailPurchaseCtrl',['$scope','GetParams',function($scope,GetParams){
	$scope.header = {
		leftTitle : '合同详情',
		rightTitle : '返回经营页',
		rightHide : false
	}

	$scope.role = {};
	var UrlSearch = new GetParams.UrlSearch();
	if(UrlSearch.type){
		$scope.role.type = UrlSearch.type;
	}
}])




//合同结果
.controller('ContractResultCtrl',['$scope','GetParams',function($scope,GetParams){
	$scope.header = {
		leftTitle : '合同结果',
		rightTitle : '返回经营页',
		rightHide : false
	}
	
	var UrlSearch = new GetParams.UrlSearch();
	if(UrlSearch.id){
		$scope.UrlSearchId = UrlSearch.id;

		console.log($scope.UrlSearchId);
	}
	
}])