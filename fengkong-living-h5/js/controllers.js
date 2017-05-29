angular.module('starter.controllers', [])
    // .constant('Request',{
    //   // url:'http://www.igmhz.com/energy-server/'
    //   //url:'http://localhost:8080/energy-server/'

    // })
    // .filter('numberFormat',function(){
    //     return function(num){
    //         if(num<10){
    //           num = "0"+num;
    //         }
    //         return num;
    //     }
    // })
    // .filter('trustedUrl', function ($sce) {
    //     return function (url) {
    //         return $sce.trustAsResourceUrl(url);
    //     }
    // })

    .constant('ApiEndpoint', {
        // url: 'http://www.tone-tv.com/fengkong-server/'
        url: 'http://localhost:8080/fengkong-server/'
    })
    .controller('TabCtrl', function ($scope, $rootScope, $ionicLoading, $timeout, $ionicHistory, $state) {

        // 隐藏tabs
        $rootScope.$on('$ionicView.beforeEnter', function () {
            var statename = $state.current.name;
            //tabs中存在的主页面不需要隐藏，hidetabs=false
            if (statename === 'tabs.myself' || statename === 'tabs.home' || statename === 'tabs.progress' || statename === 'tabs.progress1' || statename === 'tabs.record' || statename === 'tabs.active') {
                $rootScope.hideTabs = false;
            } else {
                $rootScope.hideTabs = true;
            }

        })


        $scope.goHome = function () {

            $state.go("tabs.home");

        }
        $scope.goProgress = function () {

            $state.go("tabs.progress");

        }
        $scope.goActive = function () {

            $state.go("tabs.active");

        }
        $scope.goMySelf = function () {


            if (localStorage.userId) {
                $state.go('tabs.myself');
            } else {
                $state.go('login');
            }
        }

        $scope.showError = function () {
            $ionicLoading.show({
                template: '系统繁忙，请稍后再试'
            });
        }

        $scope.showPop = function (text) {
            $ionicLoading.show({
                template: text
            });
            $timeout(function () {
                $ionicLoading.hide();
            }, 1500)
        };

    })


    .controller('HomeCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http, ApiEndpoint) {

        function getBanner() {
            $http.post(ApiEndpoint.url + "banner/getBannerList.do", {}, {
                params: {
                    activated: 2,
                    type: 1,
                    pageNum: 1,
                    pageSize: 10
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.bannerList = data.result;
                    $timeout(function () {
                        var mySwiper = new Swiper('.swiper-container', {
                            direction: 'horizontal',
                            pagination: '.swiper-pagination',
                            autoplay: 3000,
                            loop: true
                        })
                    }, 0)
                }
            })
        }
        getBanner();

        /*$http.post(ApiEndpoint.url + "video/getVideoList.do", {}, {
            params: {
                pageNum: 1,
                pageSize: 10
            }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoList = data.result;
            }
        })*/


        /*
         * 获取近期直播liveList、线下培训activityList、推荐课程courseList
         */
        $scope.type = 1;

        $scope.setType = function (type) {
            $scope.type = type;
            getHomeList(type);
        }

        function getHomeList(type) {
            $http.post(ApiEndpoint.url + "homePage/homePageH5.do", {}, {
                params: {
                    type: type
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.liveList = [];
                    $scope.activityList = [];
                    $scope.courseList = [];

                    angular.forEach(data.result, function (value, key) {
                        if (key == 'liveList') {
                            $scope.liveList = data.result[key];
                            
                            //首页只展示2个
                            if($scope.liveList.length > 2){
                                $scope.liveList.length = 2;
                            }
                        } else if (key == 'activityList') {
                            $scope.activityList = data.result[key];

                            if($scope.activityList.length > 2){
                                $scope.activityList.length = 2;
                            }
                        } else if (key == 'courseList') {
                            $scope.courseList = data.result[key];

                            if($scope.courseList.length > 2){
                                $scope.courseList.length = 2;
                            }
                        }
                    })
                }
            })
        }
        getHomeList(1);

        /*
         * 点击判断登录用户付费状态
         *   selectType(查询类别):视频1 直播2 课程3 活动4
        */
        // 直播(2)
        $scope.isPayStatusLive = function(selectType,videoId,liveId,courseId,activityId){
            console.log(localStorage.userId,selectType,videoId,liveId,courseId,activityId);
            $http.post(ApiEndpoint.url + "homePage/slectUserIsPayStatus.do", {}, {
                params: {
                    userId:localStorage.userId,
                    selectType:selectType,
                    videoId:videoId,
                    liveId:liveId,
                    courseId:courseId,
                    activityId:activityId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    // data.result:(未付费 0) (已付费 >0)
                   if(data.result == 0){
                       $state.go('active_apply');
                   }else{
                       $state.go('living_detail',{
                           liveId:liveId
                       });
                   }
                }
            })
        }
        // 线下培训(4)
        $scope.isPayStatusActivity = function(selectType,videoId,liveId,courseId,activityId){
            console.log(localStorage.userId,selectType,videoId,liveId,courseId,activityId);
            $http.post(ApiEndpoint.url + "homePage/slectUserIsPayStatus.do", {}, {
                params: {
                    userId:localStorage.userId,
                    selectType:selectType,
                    videoId:videoId,
                    liveId:liveId,
                    courseId:courseId,
                    activityId:activityId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    // data.result:(未付费 0) (已付费 >0)
                    if(data.result == 0){
                        console.log('未付费');
                        $state.go('active_apply');
                    }else{
                       console.log('已付费');
                       $state.go('active_details',{
                           activityId:activityId
                       });
                    }
                }
            })
        }
        // 推荐课程(3)
        $scope.isPayStatusCourse = function(selectType,videoId,liveId,courseId,activityId){
            console.log(localStorage.userId,selectType,videoId,liveId,courseId,activityId);
            $http.post(ApiEndpoint.url + "homePage/slectUserIsPayStatus.do", {}, {
                params: {
                    userId:localStorage.userId,
                    selectType:selectType,
                    videoId:videoId,
                    liveId:liveId,
                    courseId:courseId,
                    activityId:activityId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    // data.result:(未付费 0) (已付费 >0)
                    if(data.result == 0){
                        console.log('未付费');
                        $state.go('active_apply');
                    }else{
                       console.log('已付费');
                    //    $state.go('');
                    }
                }
            })
        }
        $scope.homeCourseMore = function(){
            $state.go('tabs.progress',{
                homeCourseMore:2
            });
        }


        $('.tab_circle').click(function (event) {
            $(this).addClass('a1').parents().siblings().children('.tab_circle').removeClass('a1');
        });

    })




    .controller('ProgressOldCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http, ApiEndpoint) {
        $scope.l = [1, 2, 3, 4, 5, 6, 7];
        $scope.type_id = 1;
        $scope.price_id = 1;
        var background_flag = 0;//背景层

        $scope.video = '视频';
        $scope.course = '课程';
        var mySwiper = new Swiper('.swiper-container', {
            direction: 'horizontal',
            // autoplay: 5000,

        })

        $http.post(ApiEndpoint.url + "live/getLiveList.do", {}, {
            params: {
                pageNum: 1,
                pageSize: 10
            }
        }).success(function (data) {
            // console.log(data);
            if (data.errorCode == 0) {
                $scope.liveList = data.result;
            }
        })
        $http.post(ApiEndpoint.url + "teacher/getTeacherList.do", {}, {
            params: {
                pageNum: 1,
                pageSize: 10
            }
        }).success(function (data) {
            if (data.errorCode == 0) {

                $scope.teacherList = data.result;
            }
        })
        $http.post(ApiEndpoint.url + "course/getCourseListForH5.do", {}, {
            params: {
                pageNum: 1,
                pageSize: 10
            }
        }).success(function (data) {

            if (data.errorCode == 0) {

                $scope.courseList = data.result;
                // console.log($scope.courseList)
            }
        })
        $('.directView').on('click', function () {

        })

        //直播和录播切换
        $('.header_tab_change').on('click', function () {
            $('.header_tab_change').removeClass('header_select');
            $(this).addClass('header_select');
            $('#progress_all_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress_content').css('display', 'block'); break;
                case 1: $('#recorded').css('display', 'block'); break;

            }
        })
        //录播下的导航栏切换
        $('.progress_record_navigation_all').on('click', function () {
            $('.progress_record_navigation_all').removeClass('progress_select');
            $(this).addClass('progress_select');

            // if($(this).index() == 0){
            //     $('#progress_recorded_content > div').css('display','none');
            //     $('#progress_all').css('display','block');
            // }else if($(this).index() == 1 ||$(this).index() == 2){
            //     background_flag = 0;
            // }

        })
        $scope.progressType = function (type) {
            $scope.type_id = type;
            $('#progress_recorded_content > div').css('display', 'none');
            $('#progress_type').css('display', 'block');
            $('.progress_background_color').hide();
            background_flag = 1;


        }
        $scope.progressPrice = function (type) {
            $scope.price_id = type;
            $('#progress_recorded_content > div').css('display', 'none');
            $('#progress_price').css('display', 'block');
            $('.test').css('display', 'none');
            $('.progress_background_color').hide();
            background_flag = 1;


        }
        $('.record_navigation_all').on('click', function () {
            $('.record_navigation_all').removeClass('progress_select');
            $(this).addClass('progress_select');

        })

        $('.progress-course').on('click', function () {
            $('.dropdown-menu1').css('display', 'block');
            if ($scope.course == '视频') {
                // $scope.video = '课程';
                // $scope.course = '视频';
                $('.dropdown-menu1').css('margin-top', '0');

            } else if ($scope.course == '课程') {
                // $scope.course = '课程';
                // $scope.video = '视频';
                $('.dropdown-menu1').css('margin-top', '-250px');
            }

        })
        $('.progress-video').on('click', function (evt) {

            evt.stopPropagation();
            $('.dropdown-menu1').css('display', 'none');
            if ($scope.video == '视频') {
                $scope.course = '视频';
                $scope.video = '课程';
                $('#progress_recorded_content > div').css('display', 'none');
                $('#progress_all').css('display', 'block');
            } else {
                $scope.course = '课程';
                $scope.video = '视频';
                $('#progress_recorded_content > div').css('display', 'none');
                $('#progress_progress').css('display', 'block');
            }
        })

    })


    .controller('ProgressCtrl', function ($scope, $http, ApiEndpoint,$stateParams) {

        var title = $('#recorded').find('.progress-record-title');
        title.on('click', function () {
            $(this).next('.down-list').toggle();
        });

        $('#recorded').find('.down-list').find('li').click(function () {
            $(this).addClass('active').siblings().removeClass('active');
        })


        //直播和录播切换
        // $('.header_tab_change').on('click', function () {
        //     $(this).addClass('header_select').siblings().removeClass('header_select');
        //     $('#progress_all_content > div').eq($(this).index()).show().siblings().hide();
        // })
        $scope.selectLivingRecorded = function(status){
            $scope.selectedLivingRecorded = status;
        }
        //默认显示直播
        $scope.selectedLivingRecorded = 1;
        // 如果有参数homeCourseMore为2,说明是从点击首页的推荐课程的更多过来的,需要显示录播
        if($stateParams.homeCourseMore){
            $scope.selectedLivingRecorded = 2;
            getAllCourses();
        }

        //直播
        $http.post(ApiEndpoint.url + "live/getAllLiveList.do", {}, {
            params: {
                pageNum: 1,
                pageSize: 10,
                userId: localStorage.userId
            }
        }).success(function (data) {
            if (data.errorCode == 0) {
                // 正在直播
                $scope.livingList = [];
                // 即将直播、已结束
                $scope.beforeAndAfterLivingList = [];

                // 获取所有视频后分离正在直播和即将直播、已结束
                angular.forEach(data.result, function (value) {
                    if (value.liveStatus == 1) {
                        $scope.livingList.push(value);
                    } else if (value.liveStatus == 0 || value.liveStatus == 2) {
                        $scope.beforeAndAfterLivingList.push(value);
                    }
                })

                var swiperContainerProgress = new Swiper('.swiper-container-progress', {
                    autoplay: 3000,
                    loop: true,
                    observer: true,//修改swiper自己或子元素时，自动初始化swiper
                    observeParents: true,//修改swiper的父元素时，自动初始化swiper
                });
            }
        })


        //1.录播 获取所有课程
        function getAllCourses() {
            $http.post(ApiEndpoint.url + "course/getCourseListForH5.do", {}, {
                params: {
                    pageNum: 1,
                    pageSize: 10
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.isRecommendCourseList = [];
                    $scope.notRecommendCourseList = [];

                    // 获取所有课程后分离是否推荐课程
                    angular.forEach(data.result, function (value) {
                        if (value.isRecommend == 1) {
                            $scope.isRecommendCourseList.push(value);
                        } else {
                            $scope.notRecommendCourseList.push(value);
                        }
                    })
                }
            })
        }

        //2.录播 课程切换到视频后获取所有视频
        $scope.courseVideos = [
            {
                id: 1,
                name: '课程'
            },
            {
                id: 2,
                name: '视频'
            }
        ]
        //默认为课程
        // $scope.courseVideoId = 1;

        $scope.formData = {};
        $scope.formData.courseVideoId = 1;

        //录播 默认获取所有课程
        $('.header_tab_right').click(function () {

            $scope.$apply(function () {
                $scope.courseVideoId = 1;
            })

            $scope.formData.courseVideoId = 1;

            getAllCourses();

            $('#progress_progress').show();
            $('#progress_video').hide();
            $('#progress_type').hide();
            $('#progress_price').hide();
        })


        /**
         * 类别(typeId,未点击类别下的分类时typeId为0)
         *     内控1
         *     审计2
         *     财务3
         *     税务4
         *     风控5
         * 价格(priceId,未点击价格下的分类时priceId为2)
         *     免费0
         *     收费1
         */


        //录播 获取所有视频(未点击类别时typeId为0,未点击价格时priceId为2)
        $scope.typeId = 0;
        $scope.priceId = 2;

        function getAllVideos() {
            $http.post(ApiEndpoint.url + "video/getAllNotCourseVideo.do", {}, {
                params: {
                    type: $scope.typeId,
                    price: $scope.priceId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.isRecommendVideoList = [];
                    $scope.notRecommendVideoList = [];

                    // 获取所有视频后分离是否推荐视频(1:推荐 0:不推荐)
                    angular.forEach(data.result, function (value) {
                        if (value.videoRecommend == 1) {
                            $scope.isRecommendVideoList.push(value);
                        } else if (value.videoRecommend == 0) {
                            $scope.notRecommendVideoList.push(value);
                        }
                    })
                }
            })
        }

        $scope.getCourseVideoId = function (id) {
            $('#progress_progress').show();
            $('#progress_video').hide();
            $('#progress_type').hide();
            $('#progress_price').hide();

            switch (id) {
                case 1:
                    $scope.typeId = 0;
                    $scope.priceId = 2;
                    getAllCourses();
                    break;
                case 2:
                    $scope.typeId = 0;
                    $scope.priceId = 2;
                    getAllVideos();
                    break;
            }
        }


        //3录播 通过类型筛选课程和视频
        $scope.getTypeId = function (typeId) {
            $('#recorded').find('.down-list').hide();

            $('#progress_progress').hide();
            $('#progress_video').hide();
            $('#progress_type').show();
            $('#progress_price').hide();

            $scope.typeId = typeId;
            $scope.priceId = 2;

            // 通过类型筛选课程
            courseFilterByType(typeId);

            // 通过类型筛选视频
            getAllVideos();
        }

        function courseFilterByType(typeId) {
            $http.post(ApiEndpoint.url + "course/courseFilterByType.do", {}, {
                params: {
                    pageNum: 1,
                    pageSize: 10,
                    courseType: typeId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.isRecommendCourseFilterByTypeList = [];
                    $scope.notRecommendCourseFilterByTypeList = [];

                    // 通过类型筛选课程后后分离是否推荐课程(1:推荐 0:不推荐)
                    angular.forEach(data.result, function (value) {
                        if (value.isRecommend == 1) {
                            $scope.isRecommendCourseFilterByTypeList.push(value);
                        } else if (value.isRecommend == 0) {
                            $scope.notRecommendCourseFilterByTypeList.push(value);
                        }
                    })
                }
            })
        }


        //4.录播 通过价格筛选课程和视频
        $scope.getPriceId = function (priceId) {
            $('#recorded').find('.down-list').hide();

            $('#progress_progress').hide();
            $('#progress_video').hide();
            $('#progress_type').hide();
            $('#progress_price').show();

            $scope.typeId = 0;
            $scope.priceId = priceId;

            // 通过价格筛选视频
            courseFilterByPrice(priceId);

            // 通过价格筛选视频
            getAllVideos();
        }

        function courseFilterByPrice(priceId) {
            $http.post(ApiEndpoint.url + "coure/courseFilterBtPrice.do", {}, {
                params: {
                    pageNum: 1,
                    pageSize: 10,
                    coursePrice: priceId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.isRecommendCourseFilterByPriceList = [];
                    $scope.notRecommendCourseFilterByPriceList = [];

                    // 通过价格筛选课程后后分离是否推荐课程(1:推荐 0:不推荐)
                    angular.forEach(data.result, function (value) {
                        if (value.isRecommend == 1) {
                            $scope.isRecommendCourseFilterByPriceList.push(value);
                        } else if (value.isRecommend == 0) {
                            $scope.notRecommendCourseFilterByPriceList.push(value);
                        }
                    })
                }
            })
        }


    })




    .controller('ActiveCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http, ApiEndpoint) {
        $('.tab-change').on('click', function () {
            $('.tab-change').removeClass('active1');
            $(this).addClass('active1');
            $('#active_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#all').css('display', 'block'); break;
                case 1: $('#camp').css('display', 'block'); break;
                case 2: $('#public').css('display', 'block'); break;
                case 3: $('#salon').css('display', 'block'); break;

            }
        })

        $http.post(ApiEndpoint.url + "activity/getActivityList.do", {}, {
            params: {
                pageNum: 1,
                pageSize: 10
            }
        }).success(function (data) {
            // console.log(data);
            if (data.errorCode == 0) {
                $scope.activityList = data.result;
            }
        })
    })

    .controller('MyselfCtrl', function ($ionicActionSheet, $scope, $state, $http, $rootScope, ApiEndpoint, $location, $interval, $ionicPopup) {
        $scope.user = JSON.parse(localStorage.user);
        console.log($scope.user);

        $http.post(ApiEndpoint.url + "coupon/getUserCouponList.do", {}, {
            params: {
                userId: localStorage.userId,
            }
        }).success(function (data) {
            // console.log(data)
            if (data.errorCode == 0) {
                $scope.couponList = data.result;
                $scope.couponNumber = $scope.couponList.length;
            }
        })

        // 兑换码
        $scope.showPopup = function () {
            $scope.data = {}

            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.couponCode" placeholder="请输入兑换码">',
                title: '兑换优惠券',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span class="aa">取消</span>' },
                    {
                        text: '<span class="aa">确定</span>',

                        onTap: function (e) {
                            if (!$scope.data.couponCode) {
                                // 不允许用户关闭，除非输入 wifi 密码
                                e.preventDefault();
                            } else {
                                return $scope.data.couponCode;
                            }
                        }
                    },
                ]
            });
            console.log($('.popup span'));

        };

        $('.backdrop').on('click', function () {
            console.log(13);
            $('.backdrop').css('visibility', 'hidden');
            $('.popup-container').css('visibility', 'hidden');
        })
        // if ( $(".popup").show()) {



        //  $(document).bind("click",function(e){
        //       var target  = $(e.target);
        //       if(target.closest(".popup").length == 0){
        //            $(".popup").hide();
        //       }
        // }) 

        //     }

        // $http.post(ApiEndpoint.url+"user/getUserById.do",{},{params:{
        //         userId:localStorage.userId
        //      }}).success(function(data){
        //         if(data.errorCode == 0){
        //             localStorage.user = JSON.stringify(data.result);
        //         }
        // })
    })

    //搜索页面
    .controller('HomeSearchCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http, ApiEndpoint) {
        $scope.l = [1, 2, 3, 4, 5, 6, 7];
        $scope.type = 1;
        $scope.getType = function (type_id) {
            $scope.type = type_id;
        }
        $('.col-33').click(function (event) {
            $(this).addClass('b1').siblings().removeClass('b1');
        });


        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


        function search() {
            console.log($scope.searchName);
            $http.post(ApiEndpoint.url + "homePage/homePageSearch.do", {}, {
                params: {
                    serachName: $scope.searchName
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.courseList = [];
                    $scope.videoList = [];
                    $scope.activityList = [];

                    angular.forEach(data.result,function(value,key){
                        if(key == 'courseList'){
                            $scope.courseList = data.result[key];
                        }else if(key == 'videoList'){
                            $scope.videoList = data.result[key];
                        }else if(key == 'activityList'){
                            $scope.activityList = data.result[key];
                        }
                    })
                }
            })
        }
        search();

        $scope.clickToSearch = function(){
            search();
        }

    })

    .controller('LoginCtrl', function ($scope, $http, $timeout, $ionicLoading, $state, ApiEndpoint, PopService) {

        $('.loginbutton>button').click(function (event) {
            $(this).addClass('logincolor').siblings().removeClass('logincolor');
        });

        $scope.loginTab = 1;


        $scope.user = { userName: '', password: '' };
        $scope.showPop = function (text) {
            $ionicLoading.show({
                template: text
            });
            $timeout(function () {
                $ionicLoading.hide();
            }, 1000)
        }

        // 普通登录
        $scope.login = function () {

            if (!$scope.user.userName) {
                $scope.showPop('用户名不能为空');
                return false;
            } else if (!$scope.user.password) {
                $scope.showPop('密码不能为空');
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
                        localStorage.password = data.result.password;
                        $scope.showPop('登录成功');
                        $state.go('tabs.myself');
                    } else {
                        $scope.showPop(data.errorMessage);

                    }
                })
            }

        }
        // 短信登录
        // 获取验证码
        $scope.getCode1 = true;
        $scope.timer = 60;
        $scope.timerCode = function () {
            $timeout.cancel($scope.timer1);
            if ($scope.timer == 0) {
                $scope.getCode1 = true;
                $scope.timer = 60;
            } else {
                $scope.timer--;
                $scope.timer1 = $timeout(function () {
                    $scope.timerCode();
                }, 1000)
            }
        }
        $scope.user = { mobile: '', authcode: '' }
        $scope.getCode = function () {
            $http.post(ApiEndpoint.url + 'user/genAuthCode.do', {}, {
                params: {
                    mobile: $scope.user.mobile,
                    type: 2
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.code = data.result;
                    $scope.getCode1 = false;
                    $timeout.cancel($scope.timer2);
                    $scope.timer2 = $timeout(function () {
                        $scope.timerCode();
                    }, 1000);
                }
            })
        }
        $scope.submit = function () {
            if (!$scope.user.mobile) {
                PopService.showPop('手机号码不能为空');
            } else if (!$scope.user.authcode) {
                PopService.showPop("验证码不能为空");
            } else {
                if ($scope.code == undefined) {
                    PopService.showPop("请先获取验证码");
                } else if ($scope.code != $scope.user.authcode) {
                    PopService.showPop("验证码错误");
                } else {
                    $http.post(ApiEndpoint.url + 'user/messageLogin.do', {}, {
                        params: {
                            mobile: $scope.user.mobile,
                            authcode: $scope.user.authcode
                        }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            localStorage.user = JSON.stringify(data.result);
                            localStorage.userId = data.result.userId;
                            localStorage.userName = data.result.userName;
                            localStorage.password = data.result.password;

                            $state.go('tabs.myself');
                        } else {
                            PopService.showPop(data.errorMessage);
                        }
                    })
                }
            }

        }

    })

    //注册
    .controller('RegisterCtrl', function ($scope, $http, $timeout, ApiEndpoint, $state, PopService) {
        $scope.getCode1 = true;
        $scope.timer = 60;
        $scope.timerCode = function () {
            $timeout.cancel($scope.timer1);
            if ($scope.timer == 0) {
                $scope.getCode1 = true;
                $scope.timer = 60;
            } else {
                $scope.timer--;
                $scope.timer1 = $timeout(function () {
                    $scope.timerCode();
                }, 1000)
            }
        }
        $scope.registerData = { mobile: '', authcode: '', password: '', rpassword: '', nickName: '' }
        $scope.getCode = function () {
            $http.post(ApiEndpoint.url + 'user/genAuthCode.do', {}, {
                params: {
                    mobile: $scope.registerData.mobile,
                    type: 2
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.code = data.result;
                    $scope.getCode1 = false;
                    $timeout.cancel($scope.timer2);
                    $scope.timer2 = $timeout(function () {
                        $scope.timerCode();
                    }, 1000);
                }
            })
        }

        $scope.submit = function () {
            if (!$scope.registerData.mobile) {
                PopService.showPop('手机号码不能为空');
            } else if (!$scope.registerData.authcode) {
                PopService.showPop("验证码不能为空");
            } else if (!$scope.registerData.password) {
                PopService.showPop("密码不能为空");
            } else if (!$scope.registerData.rpassword) {
                PopService.showPop("重复密码不能为空");
            } else if ($scope.registerData.password.length < 6) {
                PopService.showPop("密码的位数不能小于6位");
            } else if ($scope.registerData.rpassword != $scope.registerData.password) {
                PopService.showPop("两次输入的密码不相同");
            } else {
                $http.post(ApiEndpoint.url + 'user/register.do', {}, {
                    params: {
                        mobile: $scope.registerData.mobile,
                        password: $scope.registerData.password,
                        authcode: $scope.registerData.authcode,
                        nickName: $scope.registerData.nickName
                    }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        localStorage.user = JSON.stringify(data.result);
                        localStorage.userId = data.result.userId;
                        localStorage.userName = data.result.userName;
                        localStorage.password = data.result.password;
                        PopService.showPop('注册成功，已登录');
                        $state.go('tabs.home');
                    } else {
                        PopService.showPop(data.errorMessage);
                    }
                })
            }
        }
    })
    .controller('LiveDetailsCtrl', function ($scope) {


        $scope.good = 0;
    })
    .controller('RecordCtrl', function ($scope, $ionicHistory) {
        $('.record_navigation_all').on('click', function () {
            $('.record_navigation_all').removeClass('select');
            $(this).addClass('select');
        })
        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $ionicHistory.goBack();

        }
    })
    //余额
    .controller('OverCtrl', function ($scope, $ionicHistory) {

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

    })

    //我的活动
    .controller('MyActiveCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        var background_flag = 0;//背景层
        $scope.type_id = 1;
        $scope.price_id = 1;
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $('#my_active_price').css('display', 'none');
        $('#my_active_type').css('display', 'none');
        $('.myself_active_navigation_all').on('click', function () {
            $('.myself_active_navigation_all').removeClass('progress_select');
            $(this).addClass('progress_select');
            // console.log($(this).index());
            if ($(this).index() == 0) {
                $('#my_active_content > div').css('display', 'none');
                $('#my_active_all').css('display', 'block');
            }
            // else if($(this).index() == 1 ||$(this).index() == 2){
            // if(!background_flag){
            //     $('.progress_background_color').show();
            // } else {
            //     background_flag = 0;
            //      $('.progress_background_color').hide();
            // }

            // }
            $scope.progressType = function (type) {
                $scope.type_id = type;
                $('#my_active_content > div').css('display', 'none');
                $('#my_active_type').css('display', 'block');
                // $('.progress_background_color').hide();
                // background_flag = 0;

            }
            $scope.progressPrice = function (price) {
                $scope.price_id = price;
                $('#my_active_content > div').css('display', 'none');
                $('#my_active_price').css('display', 'block');
                // $('.progress_background_color').hide();
                background_flag = 1;
            }
        })
        $scope.activityType = "";

        function price() {
            $http.post(ApiEndpoint.url + "activity/getMyActivityList.do", {}, {
                params: {
                    userId: localStorage.userId,
                    pageNum: 1,
                    pageSize: 10,
                    isAllStatus: 0,
                    statusPay: 12
                }
            }).success(function (data) {
                // console.log(data)
                if (data.errorCode == 0) {
                    $scope.activeList = data.result;

                }
            })
        }
        price();
        $scope.allPrice = function () {
            price();
        }
        $scope.clickPrice = function (id) {
            $http.post(ApiEndpoint.url + "activity/getMyActivityList.do", {}, {
                params: {
                    userId: localStorage.userId,
                    pageNum: 1,
                    pageSize: 10,
                    isAllStatus: 1,
                    statusPay: id
                }
            }).success(function (data) {
                console.log(data)
                if (data.errorCode == 0) {
                    $scope.activeList = data.result;
                }
            })
        }




        // #########################################

    })

    //我的历史
    .controller('MyHistoryCtrl', function ($scope, $ionicHistory) {
        $('.tab-item1').on('click', function () {
            $('.tab-item1').removeClass('active1');
            $(this).addClass('active1');
            $('#history_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress').css('display', 'block'); break;
                case 1: $('#video').css('display', 'block'); break;
                case 2: $('#activity').css('display', 'block'); break;
            }
        })
        $scope.goBack = function () {

            $ionicHistory.goBack();
        }

    })
    //我的收藏
    .controller('MyCollectionCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $('.tab-item2').on('click', function () {
            $('.tab-item2').removeClass('active1');
            $(this).addClass('active1');
            $('#content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress').css('display', 'block'); break;
                case 1: $('#video').css('display', 'block'); break;

            }
        })
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


        function getcollect() {
            $http.post(ApiEndpoint.url + "collect/getMyCollect.do", {}, {
                params: {
                    userId: localStorage.userId,
                    type: 1,
                    pageNum: 1,
                    pageSize: 10
                }
            }).success(function (data) {
                console.log(data)

                if (data.errorCode == 0) {
                    $scope.collectList = data.result;
                }
            })
        }
        getcollect();
        $scope.getCourse = function () {
            getcollect();
        }

        $scope.getVideo = function () {
            function getcollect() {
                $http.post(ApiEndpoint.url + "collect/getMyCollect.do", {}, {
                    params: {
                        userId: localStorage.userId,
                        type: 0,
                        pageNum: 1,
                        pageSize: 10
                    }
                }).success(function (data) {
                    console.log(data)
                    if (data.errorCode == 0) {
                        $scope.collectList = data.result;
                    }
                })
            }
        }





    })
    //账户设置
    .controller('MySettingCtrl', function ($scope, $ionicHistory, $ionicActionSheet, $state, $http, ApiEndpoint) {

        $scope.goBack = function () {

            $ionicHistory.goBack();
        }


        $scope.loginOut = function () {
            $ionicActionSheet.show({
                buttons: [
                    { text: '确定' },
                ],
                titleText: '确定退出登陆吗？',
                cancelText: '取消',
                buttonClicked: function (index) {
                    localStorage.clear();
                    $state.go('login');
                }
            });
        }

    })
    //消费记录
    .controller('MyConsumeRecordCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $scope.goBack = function () {

            $ionicHistory.goBack();
        }
        $http.post(ApiEndpoint.url + "record/getUserRecordList.do", {}, {
            params: {
                userId: localStorage.userId,
                pageNum: 1,
                pageSize: 10
            }
        }).success(function (data) {
            console.log(data)
            if (data.errorCode == 0) {
                $scope.recordList = data.result;

            }
        })


    })
    //资料编辑
    .controller('MyEditProfileCtrl', function ($scope, $ionicLoading, $ionicActionSheet, $ionicHistory, $ionicPopup, $http, ApiEndpoint, $timeout) {
        $scope.user = JSON.parse(localStorage.user);

        $scope.showPop = function (text) {
            $ionicLoading.show({
                template: text
            });
            $timeout(function () {
                $ionicLoading.hide();
            }, 1500)
        };

        $scope.doUploadPhoto = function (element) {

            $scope.fileObj = element.files[0];
        }
        $scope.setImage = function () {
            // 自定义弹框
            var myPopup = $ionicPopup.show({
                template: '<input type="file" class="a_one" ng-model="jxssq.license"  accept="image/*" onchange="angular.element(this).scope().doUploadPhoto(this)">',
                title: '上传你的图片',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '取消' },
                    {
                        text: '上传',
                        type: 'button-positive',
                        onTap: function (e) {
                            var addImageUrl = ApiEndpoint.url + "user/modifyUserIcon.do";              // 接收上传文件的后台地址
                            var form = new FormData();
                            form.append("userId", localStorage.userId);
                            form.append("file", $scope.fileObj);

                            var xhr = new XMLHttpRequest();

                            var response;
                            xhr.open("post", addImageUrl, true);

                            xhr.onload = function (el) {

                                response = JSON.parse(el.target.response);

                            };
                            xhr.send(form);
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState == 4 && xhr.status == 200) {
                                    $scope.showPop('上传成功');
                                    $http.post(ApiEndpoint.url + "user/getUserByUserId.do", {}, {
                                        params: {
                                            userId: $scope.user.userId
                                        }
                                    }).success(function (data) {
                                        console.log(data);
                                        if (data.errorCode == 0) {
                                            localStorage.user = JSON.stringify(data.result);
                                            $scope.user = data.result;
                                        }
                                    })
                                }
                            }
                        }
                    },
                ]
            });
        }
        $scope.setnickName = function () {
            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" value="{{user.userRealName}}" id="changenickName">',
                title: '修改昵称',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<b>确定</b>',
                        onTap: function () {

                            $scope.user.userRealName = $("#changenickName").val();

                        },
                    }

                ],


            });
        }

        // $scope.setbirthday = function(){
        //     // 自定义弹窗
        //         var myPopup = $ionicPopup.show({
        //             template: '<input type="date" ng-model="user.birthday" value="{{user.birthday }}" id="changebirthday">',
        //             title: '修改出生日期',
        //             subTitle: '',
        //             scope: $scope,
        //             buttons: [
        //                 { text: '<span>取消</span>' },
        //                 {
        //                     text: '<b>确定</b>',
        //                     onTap: function() {         
        //                         $http.post(ApiEndpoint.url+"user/modifyUser.do",{},{params:{
        //                             birthday:$("#changebirthday").val(),
        //                             userId:$scope.user.userId
        //                         }}).success(function(data){
        //                             // console.log(data);
        //                            $scope.user.birthday = data.result.birthday;
        //                         })
        //                         return true;
        //                     },
        //                 }

        //             ],


        //         });
        // }
        $scope.setGender = function () {
            // 显示操作表
            $ionicActionSheet.show({
                buttons: [
                    { text: '男' },
                    { text: '女' },
                ],
                titleText: '',
                cancelText: '取消',
                buttonClicked: function (index) {
                    switch (index) {
                        case 0:
                            $scope.user.userSex = '男';
                            break;
                        case 1:
                            $scope.user.userSex = '女';
                            break;
                    }

                    $http.post(ApiEndpoint.url + "user/modifyUser.do", {}, {
                        params: {
                            sex: $scope.user.userSex,
                            userId: $scope.user.userId
                        }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            $http.post(ApiEndpoint.url + "user/getUserByUserId.do", {}, {
                                params: {
                                    userId: $scope.user.userId
                                }
                            }).success(function (data) {
                                if (data.errorCode == 0) {
                                    localStorage.user = JSON.stringify(data.result);
                                }
                            })
                        } else {
                            $scope.showError();
                        }
                    })
                    return true;
                }
            });
        }

        // 修改公司
        $scope.setcompany = function () {
            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" value="{{user.userAddress}}" id="changecompany">',
                title: '修改公司',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<b>确定</b>',
                        onTap: function () {

                            $scope.user.userAddress = $("#changecompany").val();

                        },

                    }

                ],


            });
        }

        // 修改邮箱
        $scope.setemail = function () {
            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" value="{{user.userEmail}}" id="changeemail">',
                title: '修改邮箱',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<b>确定</b>',
                        onTap: function () {

                            $scope.user.userEmail = $("#changeemail").val();

                        },
                    }

                ],


            });
        }

        // 修改手机
        $scope.setmobile = function () {
            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" value="{{user.userPhone}}" id="changemobile">',
                title: '修改手机号',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<b>确定</b>',
                        onTap: function () {
                            $scope.user.userPhone = $("#changemobile").val();
                        },
                    }

                ],


            });
        }

        // 保存
        $scope.keepinfo = function () {
            $http.post(ApiEndpoint.url + "user/modifyUser.do", {}, {
                params: {
                    sex: $scope.user.gender,
                    mobile: $scope.user.mobile,
                    email: $scope.user.email,
                    nickName: $scope.user.userRealName,
                    // birthday:$scope.user.birthday,
                    userAddress: $scope.user.company,
                    userLevel: $scope.user.level,
                    userId: $scope.user.userId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.showPop('修改成功');
                    localStorage.user = JSON.stringify(data.result);

                } else {
                    $scope.showError();
                }
            })
        }

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

    })
    //我的私信
    .controller('MyPrivateMessageCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $scope.goBack = function () {

            $ionicHistory.goBack();
        }

        $scope.noMorePage = false;
        $scope.pageNum = 1;

        function getMessage() {
            $http.post(ApiEndpoint.url + "message/getMessageList.do", {}, {
                params: {
                    userId: localStorage.userId,
                    fromUserId: 0,
                    toUserId: localStorage.userId,
                    type: 0,
                    pageNum: 1,
                    pageSize: 10
                }
            }).success(function (data) {
                $scope.$broadcast('scroll.refreshComplete');
                if (data.errorCode == 0) {
                    $scope.messageList = data.result;
                }
            })
        }
        getMessage()
        $scope.doRefresh = function () {
            getMessage();
            $scope.noMorePage = false;
            $scope.pageNum = 1;
        }
        $scope.loadMore = function () {
            $scope.pageNum++;
            $http.post(ApiEndpoint.url + "message/getMessageList.do", {}, {
                params: {
                    userId: localStorage.userId,
                    fromUserId: 0,
                    toUserId: localStorage.userId,
                    type: 0,
                    pageNum: $scope.pageNum,
                    pageSize: 10
                }
            }).success(function (data) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if (data.errorCode == 0) {
                    for (var i = 0; i < data.result.length; i++) {
                        $scope.messageList.push(data.result[i]);
                    }
                    if (data.result.length < 10) {
                        $scope.noMorePage = true;
                    }
                } else {
                    $scope.noMorePage = true;
                }
            })
        }



    })
    //余额充值
    .controller('MyRechangeCtrl', function ($scope, $ionicHistory) {


        $('.checked-money').on('click', function () {
            $('.checked-money').removeClass('rechange');
            $(this).addClass('rechange');


        })

        $scope.a = 1;
        $scope.b = 0;
        $scope.c = 1;
        $scope.d = 0;

        $scope.alipay = function () {
            $scope.a = 1;
            $scope.b = 0;
            $scope.c = 1;
            $scope.d = 0;

        }
        $scope.weixin = function () {
            $scope.a = 0;
            $scope.b = 1;
            $scope.c = 0;
            $scope.d = 1;

        }
        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $ionicHistory.goBack();
        }

    })
    //修改密码手机号验证界面
    .controller('MyModifyPasswordCtrl', function ($scope, $ionicHistory, $http, $timeout, $state, ApiEndpoint, PopService) {
        // 获取验证码
        $scope.getCode1 = true;
        $scope.timer = 60;
        $scope.timerCode = function () {
            $timeout.cancel($scope.timer1);
            if ($scope.timer == 0) {
                $scope.getCode1 = true;
                $scope.timer = 60;
            } else {
                $scope.timer--;
                $scope.timer1 = $timeout(function () {
                    $scope.timerCode();
                }, 1000)
            }
        }
        $scope.registerData = { mobile: '', nickName: '' }
        $scope.getCode = function () {
            $http.post(ApiEndpoint.url + 'user/genAuthCode.do', {}, {
                params: {
                    mobile: $scope.registerData.mobile,
                    type: 2
                }
            }).success(function (data) {

                if (data.errorCode == 0) {
                    $scope.code = data.result;
                    $scope.getCode1 = false;
                    $timeout.cancel($scope.timer2);
                    $scope.timer2 = $timeout(function () {
                        $scope.timerCode();
                    }, 1000);
                }
            })
        }
        $scope.submit = function () {
            if ($scope.code == undefined) {
                PopService.showPop("请先获取验证码");
            } else if ($scope.code != $scope.registerData.authcode) {
                PopService.showPop("验证码错误");
            } else {
                $state.go('edit_password');
            }

        }


        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $ionicHistory.goBack();
        }

    })
    //修改密码
    .controller('MyEditPasswordCtrl', function ($scope, $ionicHistory, $http, $state, ApiEndpoint, PopService) {
        $scope.user = JSON.parse(localStorage.user);
        $scope.registerData = { password: '', rpassword: '' }
        $scope.keepinfo = function () {
            if (!$scope.registerData.password) {
                PopService.showPop("新密码不能为空");
            } else if (!$scope.registerData.rpassword) {
                PopService.showPop("确认密码不能为空");
            } else if ($scope.registerData.password.length < 6) {
                PopService.showPop("密码的位数不能小于6位");
            } else if ($scope.registerData.rpassword != $scope.registerData.password) {
                PopService.showPop("两次输入的密码不相同");
            } else {
                // console.log($scope.registerData);
                // console.log($scope.user.password);
                $http.post(ApiEndpoint.url + "user/modifyPassword.do", {}, {
                    params: {
                        newPwd: $scope.registerData.password,
                        confirmPwd: $scope.registerData.rpassword,
                        userId: $scope.user.userId
                    }
                }).success(function (data) {
                    // console.log(data);
                    if (data.errorCode == 0) {
                        PopService.showPop("修改成功");
                        localStorage.userId = JSON.stringify(data.result);
                        // console.log(localStorage.user)
                        $state.go('tabs.myself');
                    } else {
                        $scope.showError();
                    }
                })
            }
        }

        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $ionicHistory.goBack();
        }


    })
    // 用户反馈
    .controller('UserFeedbackCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {


        $scope.type_id = 1;
        $scope.progressType = function (type) {
            $scope.type_id = type;
        }















        $scope.registerData = { mobile: '', message: '' };
        $scope.length = 0;

        //显示变更数量
        $scope.textChange = function () {
            $scope.length = $scope.registerData.message.length;
        }
        $scope.keepinfo = function () {
            // console.log(localStorage);
            $http.post(ApiEndpoint.url + "feedback/addFeedback.do", {}, {
                params: {
                    userId: localStorage.userId,
                    userType: localStorage.userType,
                    mobile: $scope.registerData.mobile,
                    name: $scope.registerData.name,
                    cotent: $scope.registerData.message
                }
            }).success(function (data) {
                // console.log(data)
                if (data.errorCode == 0) {
                    $scope.couponList = data.result;
                }
            })


        }
        $scope.goBack = function () {

            $ionicHistory.goBack();
        }

    })


    // 账户绑定
    .controller('AccountBindCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {



        $scope.goBack = function () {

            $ionicHistory.goBack();
        }

    })


    //我的优惠券
    .controller('MyCouponCtrl', function ($scope, $ionicHistory, $ionicPopup, $http, ApiEndpoint) {

        // $http.post(ApiEndpoint.url+"coupon/getCouponById.do",{},{params:{
        //     userId:localStorage.userId
        //  }}).success(function(data){
        //     if(data.errorCode == 0){
        //         localStorage.user = JSON.stringify(data.result);
        //     }
        // })
        console.log(localStorage.userId);
        $http.post(ApiEndpoint.url + "coupon/getUserCouponList.do", {}, {
            params: {
                userId: localStorage.userId,
            }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.couponList = data.result;
                localStorage.couponNumber = $scope.couponList.length;
            }
        })

        $scope.showPopup = function () {
            $scope.data = {}

            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.couponCode" placeholder="请输入兑换码">',
                title: '兑换优惠券',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<sapn ng-click="">确定</span>',

                        onTap: function (e) {
                            if (!$scope.data.couponCode) {
                                // 不允许用户关闭，除非输入 wifi 密码
                                e.preventDefault();
                            } else {
                                return $scope.data.couponCode;
                            }
                        }
                    },
                ]
            });


        };

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }
    })

    //活动详情
    .controller('ActiveDetailsCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint, $stateParams) {


        //活动结束
        // if(1){
        //     $('.tab_change_selected').eq(0).hide();
        //     $('.tab_change_selected').eq(1).hide();
        // } else{//活动开始
        //     $('.tab_change_selected').eq(2).hide();
        //     $('.tab_change_selected').eq(3).hide();
        // }

        $('.tab_change_selected').on('click', function () {
            $('.tab_change_selected').removeClass('active1');
            $(this).addClass('active1');
            $('#content > div').css('display', 'none');
            // console.log($(this).index());
            switch ($(this).index()) {
                case 0: $('#detail').css('display', 'block'); break;//详情
                case 1: $('#lector').css('display', 'block'); break;//讲师
                case 2: $('#related').css('display', 'block'); break;//相关
            }
        })

        $scope.goBack = function () {
            $ionicHistory.goBack();

        }

        $http.post(ApiEndpoint.url + "activity/getActivityById.do", {}, {
            params: {
                activityId: $stateParams.activityId
            }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.activity = data.result;
                // console.log($scope.activity)
            }
        })
    })

    //活动报名
    .controller('ActiveApplyCtrl', function ($scope, $ionicHistory) {

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }
    })

    //确认订单
    .controller('ConfirmOrderCtrl', function ($scope, $ionicPopover, $timeout, $ionicHistory, $ionicModal, $state) {

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.pay = function () {
            var tmp = `<div style="text-align: center;border-bottom: 1px solid silver;padding-bottom: 10px;font-size: 16px;">支付方式</div>
                    <div style="border-bottom: 1px solid silver;padding-top:20px;padding-bottom: 20px;font-size: 16px;" click="go()">
                        <a href=""><img style="display: inline-block;float:left;margin-left: 20px" src="img/over.png" width="25px" height="25px">
                        <span style="margin-left: -100px;color:black">余额支付</span>
                        <img style="display: inline-block;float:right;" src="img/right.png" width="25px" height="25px">
                        </a>
                    </div>
                    <div style="padding-top:20px;padding-bottom: 20px;font-size: 16px;border-bottom: 1px solid silver;">
                        <a href=""><img style="display: inline-block;float:left;margin-left: 20px" src="img/wechat.png" width="25px" height="25px">
                        <span style="margin-left: -100px;color:black">微信支付</span>
                        <img style="display: inline-block;float:right;" src="img/right.png" width="25px" height="25px">
                        </a>
                    </div>
                    <div id="payCoupon" style="padding-top:20px;padding-bottom: 20px;font-size: 16px;border-bottom: 1px solid silver;" click="payCoupon()">
                        <a href=""><img style="display: inline-block;float:left;margin-left: 20px" src="img/wechat.png" width="25px" height="25px">
                        <span style="margin-left: -100px;color:black">使用入场券</span>
                        <img style="display: inline-block;float:right;" src="img/right.png" width="25px" height="25px">
                        </a>
                    </div>
                    `;
            $('.modal-data').html(tmp);
            overlay();
        }
        $('#modal-overlay').click(function () {
            overlay();
        });




        //余额支付
        $scope.go = function () {
            // $state.go("tabs.home");
            alert('余额支付');
        }
        // 优惠券支付
        $scope.payCoupon = function () {
            $state.go("change_coupon");
        }

        $scope.pay1 = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
                console.log($scope.modal);
                $scope.openModal();
            });
            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            //当我们用到模型时，清除它！
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            // 当隐藏的模型时执行动作
            $scope.$on('modal.hide', function () {
                // 执行动作
            });
            // 当移动模型时执行动作
            $scope.$on('modal.removed', function () {
                // 执行动作
            });
        }
    })

    //选择优惠券
    .controller('ChangeCouponCtrl', function ($scope, $ionicHistory) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }
    })

    //直播详情
    .controller('LivingDetailCtrl', function ($scope, $ionicHistory, $stateParams, ApiEndpoint, $http, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


        var myPlayer = neplayer('my-video', {}, function () {
            console.log('播放器初始化完成');
        });
        var playerTech = videojs("my-video").tech({ IWillNotUseThisInPlugins: true });
        myPlayer.onPlayState(1, function () {
            console.log('play');
        });
        myPlayer.onPlayState(2, function () {
            console.log('pause');
        });
        myPlayer.onPlayState(3, function () { console.log('ended') });
        myPlayer.onError(function (data) { console.log(data) });


        function playNow() {
            var url = "http://pullhlsbb8f2e48.live.126.net/live/5a31388e859249a1b24710ed3ea97cc9/playlist.m3u8";

            if (url === '') {
                alert('请输入播放地址');
                return;
            }
            /*            switch (urlType) {
                        case 'http':
                            if (lowUrl.indexOf('mp4') !== -1) {
                                type = 'video/mp4';
                            } else if (lowUrl.indexOf('flv') !== -1) {
                               type = 'video/x-flv';
                            } else if (lowUrl.indexOf('m3u8') !== -1) {
                                type = 'application/x-mpegURL';
                            }
                            break;
                        case 'rtmp':
                            type = 'rtmp/flv';
                            break;
                        // default:
                        //     alert('请输入正确的播放地址');
                        //     return;
                    }*/
            myPlayer.setDataSource({ type: 'application/x-mpegURL', src: url });
            myPlayer.play();
        }

        playNow();

        // 点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            if(!$scope.zan_flag){
                console.log(1);
            }
            $scope.zan_flag = true;
        }
        // console.log(localStorage.courseId);

        var liveId = $stateParams.liveId;
        console.log('liveId: '+liveId);
        // 查询某一个直播的评论信息
        function getCommentLiveList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'commment/getCommentLiveList.do',
                data: $.param({
                    liveId: liveId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
                .success(function (data) {
                    if (data.errorCode == 0) {
                        $scope.commentLiveList = data.result;
                        $scope.commentLiveListLength = data.result.length;
                    } else {
                        console.log(data);
                    }
                })
        }
        getCommentLiveList();

        // 用户评论直播
        $scope.living = {};
        $scope.evaluate = function () {
            if ($scope.living.evaluation == undefined || $scope.living.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 1,
                        commentObjectId: liveId,
                        commentContent: $scope.living.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    .success(function (data) {
                        if (data.errorCode == 0) {
                            PopService.showPop('评论成功');
                            $scope.living.evaluation = '';
                            getCommentLiveList();
                        }
                    })
            }
        }

    })

    //录播课程列表
    .controller('RecordedListCtrl', function ($scope, $ionicHistory, $rootScope) {

        $scope.collection_flag = 0;
        $scope.progress_collection = function (flag) {
            $scope.collection_flag = flag;
        }
        $scope.zan_flag = 0;
        $scope.zan = function (flag) {
            $scope.zan_flag = flag;
        }
        $('.progress_tab_change_selected').on('click', function () {
            // $('.progress_tab_change_selected').removeClass('active1');
            // $(this).addClass('active1');
            $(this).addClass('active1').siblings().removeClass('active1')
            $('#progress_recorded_detail_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress_recorded_related').css('display', 'block'); break;
                case 1: $('#progress_recorded_detail').css('display', 'block'); break;
                case 2: $('#progress_recorded_comment').css('display', 'block'); break;

            }
        })


        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $rootScope.$ionicGoBack();


        }
    })


    //录播详情
    .controller('RecordedDetailCtrl', function ($scope, $ionicHistory) {
        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $ionicHistory.goBack();

        }
        $scope.collection_flag = 0;
        $scope.progress_collection = function (flag) {
            $scope.collection_flag = flag;
        }
        $scope.zan_flag = 0;
        $scope.zan = function (flag) {
            $scope.zan_flag = flag;
        }


        $('.progress_tab_change_selected').on('click', function () {
            $('.progress_tab_change_selected').removeClass('active1');
            $(this).addClass('active1');
            $('#progress_recorded_detail_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress_recorded_comment').css('display', 'block'); break;
                case 1: $('#progress_recorded_detail').css('display', 'block'); break;
                case 2: $('#progress_recorded_related').css('display', 'block'); break;

            }
        })
    })
    //忘记密码
    .controller('ForgetPasswordCtrl', function ($scope, $ionicLoading, $ionicActionSheet, $rootScope, $ionicHistory, $ionicPopup, $http, ApiEndpoint, $timeout, PopService) {
        // 获取验证码
        $scope.getCode1 = true;
        $scope.timer = 60;
        $scope.timerCode = function () {
            $timeout.cancel($scope.timer1);
            if ($scope.timer == 0) {
                $scope.getCode1 = true;
                $scope.timer = 60;
            } else {
                $scope.timer--;
                $scope.timer1 = $timeout(function () {
                    $scope.timerCode();
                }, 1000)
            }
        }
        $scope.registerData = { mobile: '', password: '', rpassword: '' }
        $scope.getCode = function () {
            $http.post(ApiEndpoint.url + 'user/genAuthCode.do', {}, {
                params: {
                    mobile: $scope.registerData.mobile,
                    type: 2
                }
            }).success(function (data) {

                if (data.errorCode == 0) {
                    $scope.code = data.result;
                    $scope.getCode1 = false;
                    $timeout.cancel($scope.timer2);
                    $scope.timer2 = $timeout(function () {
                        $scope.timerCode();
                    }, 1000);
                }
            })
        }
        $scope.submit = function () {
            if ($scope.code == undefined) {
                PopService.showPop("请先获取验证码");
            } else if ($scope.code != $scope.registerData.authcode) {
                PopService.showPop("验证码错误");
            } else {
                $http.post(ApiEndpoint.url + "user/messageLogin.do", {}, {
                    params: {
                        password: $scope.registerData.password,
                        rpassword: $scope.registerData.rpassword,
                        mobile: $scope.registerData.mobile,
                        authcode: $scope.registerData.authcode
                    }
                }).success(function (data) {
                    // console.log(data);
                    if (data.errorCode == 0) {
                        $scope.showPop('修改成功');
                        localStorage.user = JSON.stringify(data.result);
                        $state.go('login');
                    } else {
                        $scope.showError();
                    }
                })
            }


        }
        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $rootScope.$ionicGoBack()
        }
    })
    //充值记录
    .controller('RechangeRecordCtrl', function ($scope, $ionicHistory) {
        $scope.goBack = function () {
            //$ionicHistory.goBack()

            $ionicHistory.goBack();

        }
    })




