angular.module('starter.controllers', [])

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


    /*.config(function ($stateProvider, $urlRouterProvider,$ionicConfigProvider) {  
        $ionicConfigProvider.views.maxCache(0);
    })*/

    .constant('ApiEndpoint', {
        // url: 'http://www.igmhz.com/fengkong-server/'
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

    // 直播订单信息
    .factory('livingOrderInfo', function () {
        return {
            orderInfo: {}
        };
    })

    // 即将直播订单信息
    .factory('upcomingLivingOrderInfo', function () {
        return {
            orderInfo: {}
        };
    })

    //课程订单信息
    .factory('courseOrderInfo', function () {
        return {
            orderInfo: {}
        };
    })

    //课程的课时订单信息
    .factory('videoOrderInfo', function () {
        return {
            orderInfo: {}
        };
    })


    .controller('HomeCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http, ApiEndpoint) {
        console.log($ionicHistory.viewHistory());
        if($ionicHistory.viewHistory().backView != null){
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        function getBanner() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'banner/getBannerList.do',
                data: $.param({
                    activated: 1,
                    type: 1,
                    pageNum: 1,
                    pageSize: 10
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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


        /*
         * 获取近期直播liveList、线下培训activityList、推荐课程courseList
         */
        $scope.type = 1;

        $scope.setType = function (type) {
            $scope.type = type;
            getHomeList(type);
        }

        function getHomeList(type) {

            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'homePage/homePageH5.do',
                data: $.param({
                    type: type
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.liveList = [];
                    $scope.activityList = [];
                    $scope.courseList = [];

                    angular.forEach(data.result, function (value, key) {
                        if (key == 'liveList') {
                            $scope.liveList = data.result[key];

                            //首页只展示2个
                            if ($scope.liveList.length > 2) {
                                $scope.liveList.length = 2;
                            }
                        } else if (key == 'activityList') {
                            $scope.activityList = data.result[key];

                            if ($scope.activityList.length > 2) {
                                $scope.activityList.length = 2;
                            }
                        } else if (key == 'courseList') {
                            $scope.courseList = data.result[key];

                            if ($scope.courseList.length > 2) {
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
        // 近期直播(selectType:2)
        $scope.isPayStatusLive = function (selectType, videoId, liveId, courseId, activityId, liveStatus, livePrice) {
            console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId, liveStatus, livePrice);
            $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                params: {
                    userId: localStorage.userId,
                    selectType: selectType,
                    videoId: videoId,
                    liveId: liveId,
                    courseId: courseId,
                    activityId: activityId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    // data.result.isPay:(未付费 0) (已付费 >0)


                    //即将直播
                    if (liveStatus == 0) {
                        if (livePrice == 0) {
                            console.log('即将直播免费但需报名');
                            $state.go('upcomingLiving_apply', {
                                upcomingLivingId: liveId
                            });
                        } else if (livePrice > 0) {
                            if (data.result.isPay == 0) {
                                console.log('即将直播不免费且未付费');
                                $state.go('upcomingLiving_apply', {
                                    upcomingLivingId: liveId
                                });
                            } else if (data.result.isPay > 0) {
                                console.log('即将直播不免费但已付费');
                                $state.go('upcomingLiving_details', {
                                    upcomingLivingId: liveId
                                });
                            }
                        }
                    }
                    //正在直播
                    else if (liveStatus == 1) {
                        if (livePrice == 0) {
                            console.log('正在直播免费');
                            $state.go('living_detail', {
                                livingId: liveId
                            });
                        } else if (livePrice > 0) {
                            if (data.result.isPay == 0) {
                                console.log('正在直播不免费且未付费');
                                $state.go('confirm_order_living', {
                                    livingId: liveId
                                });
                            } else if (data.result.isPay > 0) {
                                console.log('正在直播不免费但已付费');
                                $state.go('living_detail', {
                                    livingId: liveId
                                });
                            }
                        }
                    }
                    // 已结束
                    else if (liveStatus == 2) {
                        if (livePrice == 0) {
                            console.log('直播已结束免费');
                            $state.go('livingEnded_apply', {
                                livingEndedId: liveId
                            })
                        } else if (livePrice > 0) {
                            if (data.result.isPay == 0) {
                                console.log('直播已结束不免费且未付费');
                                $state.go('livingEnded_apply', {
                                    livingEndedId: liveId
                                });
                            } else if (data.result.isPay > 0) {
                                console.log('直播已结束不免费但已付费');
                                $state.go('livingEnded_detail', {
                                    livingEndedId: liveId
                                });
                            }
                        }
                    }

                }
            })
        }
        // 线下培训(selectType:4)
        $scope.isPayStatusActivity = function (selectType, videoId, liveId, courseId, activityId) {
            console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId);
            $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                params: {
                    userId: localStorage.userId,
                    selectType: selectType,
                    videoId: videoId,
                    liveId: liveId,
                    courseId: courseId,
                    activityId: activityId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    // data.result.isPay:(未付费 0) (已付费 >0)
                    if (data.result.isPay == 0) {
                        console.log('未付费');
                        $state.go('active_apply');
                    } else if (data.result.isPay > 0) {
                        console.log('已付费');
                        $state.go('active_apply', {
                            activityId: activityId
                        });
                    }
                }
            })
        }
        // 推荐课程(selectType:3)
        $scope.isPayStatusCourse = function (selectType, videoId, liveId, courseId, activityId) {
            console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId);
            $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                params: {
                    userId: localStorage.userId,
                    selectType: selectType,
                    videoId: videoId,
                    liveId: liveId,
                    courseId: courseId,
                    activityId: activityId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    // data.result.isPay:(未付费 0) (已付费 >0)
                    if (data.result.isPay == 0) {
                        console.log('未付费');
                        $state.go('active_apply');
                    } else if (data.result.isPay > 0) {
                        console.log('已付费');
                        $state.go('recorded_list', {
                            courseId: courseId
                        });
                    }
                }
            })
        }
        $scope.homeCourseMore = function () {
            $state.go('tabs.progress', {
                homeCourseMore: 2
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


    //课程
    .controller('ProgressCtrl', function ($scope, $http, $state, $stateParams, $ionicHistory,ApiEndpoint) {
        console.log($ionicHistory.viewHistory());
        if($ionicHistory.viewHistory().backView != null){
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        if(localStorage.userId == undefined){
            $state.go('login');
            return;
        }







        // 此方法不执行
        $scope.$on('$stateChangeSucess',function(evt,toState,roParams,fromState,fromParams){
            console.log(evt);
            console.log(toState.name);
            console.log(roParams);
            console.log(fromState);
            console.log(fromParams);
        });

        $scope.$on('$ionicView.beforeEnter', function() {
            console.log(2);
            // window.location.reload();//有bug  会无限刷新
        });






        /*//jquery选择器失效(莫名其妙)
        var title = $('#recorded').find('.progress-record-title');
        console.log(title.next());
        console.log(title.parent());
        title.on('click', function () {
            $(this).next('.down-list').toggle();
        });

        var li = $('#recorded').find('.down-list').find('li');
        li.click(function () {
            $(this).addClass('active').siblings().removeClass('active');
        });*/

        // $scope.navTitleColor = false;
        $scope.sortByType = function (e) {
            // $scope.navTitleColor = true;
            $(e.target).next().toggle();
        }

        $scope.sortByPrice = function (e) {
            // $scope.navTitleColor = false;
            $(e.target).next().toggle();
        }



        //直播和录播切换
        // $('.header_tab_change').on('click', function () {
        //     $(this).addClass('header_select').siblings().removeClass('header_select');
        //     $('#progress_all_content > div').eq($(this).index()).show().siblings().hide();
        // })
        $scope.selectLivingRecorded = function (status) {
            $scope.selectedLivingRecorded = status;
        }
        //默认显示直播
        $scope.selectedLivingRecorded = 1;
        // 如果有参数homeCourseMore为2,说明是从点击首页的推荐课程的更多过来的,需要显示录播
        if ($stateParams.homeCourseMore) {
            $scope.selectedLivingRecorded = 2;
            getAllCourses();
        }

        function getAllLiveList (){
            //获取时间戳
            $http.post(ApiEndpoint.url + "home/getNowTime.do", {}, {
                params: {}
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var time = new Date(data.result);


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
                            angular.forEach(data.result.LiveList, function (value) {
                                /*if (value.liveStatus == 1) {
                                    $scope.livingList.push(value);
                                } else if (value.liveStatus == 0 || value.liveStatus == 2) {
                                    $scope.beforeAndAfterLivingList.push(value);
                                }*/


                                if (time >= value.liveStartTime && time <= value.liveEndTime) {
                                    //正在直播
                                    $scope.livingList.push(value);
                                    value.newLiveStatus = 0;
                                } else if (time < value.liveStartTime || time > value.liveEndTime) {
                                    // 即将直播和已结束
                                    $scope.beforeAndAfterLivingList.push(value);
                                }

                                if (time < value.liveStartTime) {
                                    // 即将直播
                                    value.newLiveStatus = 0;
                                } else if (time > value.liveEndTime) {
                                    // 已结束
                                    value.newLiveStatus = 2;
                                }
                            })

                            console.log($scope.livingList);
                            console.log($scope.beforeAndAfterLivingList);

                            var swiperContainerProgress = new Swiper('.swiper-container-progress', {
                                autoplay: 4000,
                                loop: true,
                                pagination: '.swiper-pagination',
                                observer: true,//修改swiper自己或子元素时，自动初始化swiper
                                observeParents: true,//修改swiper的父元素时，自动初始化swiper
                            });
                        }
                    })
                }
            })
        }
        getAllLiveList();




        /*
         * orderStatus: 1未支付  2已支付  3已报名
         * 即将直播的orderStatus可能为1或3,正在直播的orderStatus可能为1或2,已结束的orderStatus可能为1或2或3
         * 只有即将直播和已结束无论免费还是收费都需先去报名来获取统计报名人数,正在直播收费且未付费则直接进入确认订单页面
        */
        //即将直播  点击'立即报名'后判断
        $scope.upcomingLivingApply = function (liveId, liveName, livePrice, orderStatus) {
            console.log('price ' + livePrice);
            console.log('orderStatus ' + orderStatus);

            if (livePrice == 0) {
                console.log('即将直播免费但需报名');
                $state.go('upcomingLiving_apply', {
                    upcomingLivingId: liveId
                });
            } else if (livePrice > 0) {
                if (orderStatus == 1) {
                    console.log('即将直播收费且未付费');
                    $state.go('upcomingLiving_apply', {
                        upcomingLivingId: liveId
                    });
                }
            }

        }
        //直播已结束  点击'回看'判断
        $scope.lookback = function (liveId, livePrice, orderStatus) {
            console.log('price ' + livePrice);
            console.log('orderStatus ' + orderStatus);


            if (livePrice == 0) {
                console.log('直播已结束免费');
                $state.go('livingEnded_detail', {
                    livingEndedId: liveId
                });
            } else if (livePrice > 0) {
                if (orderStatus == 1) {
                    console.log('直播已结束收费且未付费');
                    $state.go('livingEnded_apply', {
                        livingEndedId: liveId
                    });
                } else if (orderStatus == 2 || orderStatus == 3) {
                    console.log('直播已结束不免费但已付费');
                    $state.go('livingEnded_detail', {
                        livingEndedId: liveId
                    });
                }
            }
        }




        // 点击即将直播和直播已结束的左侧封面
        // 点击后先根据价格是否免费判断,不是免费再根据用户付费状态判断
        $scope.notLiving = function (liveId, livePrice, orderStatus) {
            // 判断直播是否结束，正在直播已结束需要跳转到已结束视频
            $http({
                method:'POST',
                url:ApiEndpoint.url + 'live/getLiveIsEnd.do',
                data:$.param({
                    liveId:liveId
                }),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function(data){
                if(data.errorCode == 0){
                    // 1==》直播结束，2==》直播中，3==》即将直播
                    var latestLiveStatus = data.result;

                    //即将直播
                    if (latestLiveStatus == 3) {
                        if (livePrice == 0) {
                            console.log('即将直播免费但需报名');
                            $state.go('upcomingLiving_apply', {
                                upcomingLivingId: liveId
                            });
                        } else if (livePrice > 0) {
                            if (orderStatus == 1) {
                                console.log('即将直播收费且未付费');
                                $state.go('upcomingLiving_apply', {
                                    upcomingLivingId: liveId
                                });
                            } else if (orderStatus == 3) {
                                console.log('即将直播收费但已付费');
                                $state.go('upcomingLiving_details', {
                                    upcomingLivingId: liveId
                                });
                            }
                        }
                    }
                    // 直播结束
                    else if(latestLiveStatus == 1){
                        if (livePrice == 0) {
                            console.log('直播已结束免费');
                            $state.go('livingEnded_detail', {
                                livingEndedId: liveId
                            });
                        } else if (livePrice > 0) {
                            if (orderStatus == 1) {
                                console.log('直播已结束收费且未付费');
                                $state.go('livingEnded_apply', {
                                    livingEndedId: liveId
                                });
                            } else if (orderStatus == 2 || orderStatus == 3) {
                                console.log('直播已结束不免费但已付费');
                                $state.go('livingEnded_detail', {
                                    livingEndedId: liveId
                                });
                            }
                        }
                    }
                    // 正在直播
                    else if(latestLiveStatus == 2){
                        if (livePrice == 0) {
                            console.log('直播免费');
                            $state.go('living_detail', {
                                livingId: liveId
                            });
                        } else if (livePrice > 0) {
                            if (orderStatus == 1) {
                                console.log('直播收费且未支付');
                                $state.go('confirm_order_living', {
                                    livingId: liveId
                                });
                            } else if (orderStatus == 2) {
                                console.log('直播收费但已支付');
                                $state.go('living_detail', {
                                    livingId: liveId
                                });
                            }
                        }
                    }
                }
            })
        }
        // 点击正在直播的封面
        // 点击后先根据价格是否免费判断,不是免费再根据用户付费状态判断
        $scope.toLivingDetail = function (liveId, livePrice, orderStatus) {
            // 判断直播是否结束，正在直播已结束需要跳转到已结束视频
            $http({
                method:'POST',
                url:ApiEndpoint.url + 'live/getLiveIsEnd.do',
                data:$.param({
                    liveId:liveId
                }),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function(data){
                if(data.errorCode == 0){
                    // 1==》直播结束，2==》直播中，3==》即将直播
                    var latestLiveStatus = data.result;

                    //即将直播
                    if (latestLiveStatus == 3) {
                        console.log('即将直播');

                        if (livePrice == 0) {
                            console.log('即将直播免费但需报名');
                            $state.go('upcomingLiving_apply', {
                                upcomingLivingId: liveId
                            });
                        } else if (livePrice > 0) {
                            if (orderStatus == 1) {
                                console.log('即将直播收费且未付费');
                                $state.go('upcomingLiving_apply', {
                                    upcomingLivingId: liveId
                                });
                            } else if (orderStatus == 3) {
                                console.log('即将直播收费但已付费');
                                $state.go('upcomingLiving_details', {
                                    upcomingLivingId: liveId
                                });
                            }
                        }
                    }
                    // 直播结束
                    else if(latestLiveStatus == 1){
                        console.log('直播结束');

                        if (livePrice == 0) {
                            console.log('直播已结束免费');
                            $state.go('livingEnded_detail', {
                                livingEndedId: liveId
                            });
                        } else if (livePrice > 0) {
                            if (orderStatus == 1) {
                                console.log('直播已结束收费且未付费');
                                $state.go('livingEnded_apply', {
                                    livingEndedId: liveId
                                });
                            } else if (orderStatus == 2 || orderStatus == 3) {
                                console.log('直播已结束不免费但已付费');
                                $state.go('livingEnded_detail', {
                                    livingEndedId: liveId
                                });
                            }
                        }
                    }
                    // 正在直播
                    else if(latestLiveStatus == 2){
                        console.log('正在直播');

                        if (livePrice == 0) {
                            console.log('直播免费');
                            $state.go('living_detail', {
                                livingId: liveId
                            });
                        } else if (livePrice > 0) {
                            if (orderStatus == 1) {
                                console.log('直播收费且未支付');
                                $state.go('confirm_order_living', {
                                    livingId: liveId
                                });
                            } else if (orderStatus == 2) {
                                console.log('直播收费但已支付');
                                $state.go('living_detail', {
                                    livingId: liveId
                                });
                            }
                        }
                    }
                }
            })
        }


        


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

                    // 获取所有课程后分离是否为推荐课程
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

        $('.header_tab_left').click(function(){
            getAllLiveList();
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
                    userId: localStorage.userId,
                    type: $scope.typeId,
                    price: $scope.priceId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.isRecommendVideoList = [];
                    $scope.notRecommendVideoList = [];

                    // 获取所有视频后分离是否为推荐视频(1:推荐 0:不推荐)
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

                    // 通过类型筛选课程后分离是否为推荐课程(1:推荐 0:不推荐)
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

            // 通过价格筛选课程
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

                    // 通过价格筛选课程后分离是否为推荐课程(1:推荐 0:不推荐)
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



    // 活动
    .controller('ActiveCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http, ApiEndpoint) {
        console.log($ionicHistory.viewHistory());
        if($ionicHistory.viewHistory().backView != null){
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        /*$('.tab-change').on('click', function () {
            $('.tab-change').removeClass('active1');
            $(this).addClass('active1');
            $('#active_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#all').css('display', 'block'); break;
                case 1: $('#camp').css('display', 'block'); break;
                case 2: $('#public').css('display', 'block'); break;
                case 3: $('#salon').css('display', 'block'); break;

            }
        })*/

        /*$http.post(ApiEndpoint.url + "activity/getActivityList.do", {}, {
            params: {
                pageNum: 1,
                pageSize: 10
            }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.activityList = data.result;
                console.log($scope.activityList);
            }
        })*/

        $scope.activityWay = 0;

        function getActivityList(activityWay) {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'home/getNowTime.do',
                data: $.param({}),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var time = data.result;
                    
                    $http({
                        method: 'POST',
                        url: ApiEndpoint.url + 'activity/getAllActivityList.do',
                        data: $.param({
                            activityWay:activityWay
                        }),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            $scope.activityList = data.result;

                            // newActivityStatus(活动状态):1即将开始(报名中)  2正在进行  3已结束

                            $scope.recommendedActivityList = [];
                            $scope.notRecommendedActivityList = [];

                            // activated(推荐状态,默认不推荐):0不推荐  1推荐
                            angular.forEach($scope.activityList,function(value){
                                if(value.activated == 0){
                                    $scope.notRecommendedActivityList.push(value);

                                    if(time < value.activityStartTime){
                                        // 即将开始
                                        value.newActivityStatus = 1;
                                    }else if(time >= value.activityStartTime && time <= value.activityEndTime){
                                        // 正在进行
                                        value.newActivityStatus = 2;
                                    }else if(time > value.activityEndTime){
                                        // 已结束
                                        value.newActivityStatus = 3;
                                    }
                                }else if(value.activated == 1){
                                    $scope.recommendedActivityList.push(value);

                                    if(time < value.activityStartTime){
                                        // 即将开始
                                        value.newActivityStatus = 1;
                                    }else if(time >= value.activityStartTime && time <= value.activityEndTime){
                                        // 正在进行
                                        value.newActivityStatus = 2;
                                    }else if(time > value.activityEndTime){
                                        // 已结束
                                        value.newActivityStatus = 3;
                                    }
                                }
                            })
                            console.log($scope.recommendedActivityList);
                            console.log($scope.notRecommendedActivityList);

                            $timeout(function(){
                                var swiperContainerActivity = new Swiper('#swiper-container-activity', {
                                    autoplay: 4000,
                                    loop: true,
                                    pagination: '.swiper-pagination',
                                    observer: true,//修改swiper自己或子元素时，自动初始化swiper
                                    observeParents: true,//修改swiper的父元素时，自动初始化swiper
                                });
                            },0)
                        }
                    })
                }
            })
        }

        getActivityList(0);

        
        $scope.setActivityWay = function(activityWay){
            $scope.activityWay = activityWay;

            getActivityList(activityWay);
        }


        $scope.toActivityDetail = function(activityId,activityPrice){
            console.log(activityId,activityPrice);
        }
    })

    .controller('MyselfCtrl', function ($ionicActionSheet, $scope, $state, $http, $rootScope, $ionicHistory, $location, $interval, $ionicPopup,ApiEndpoint,PopService) {
        console.log($ionicHistory.viewHistory());
        if($ionicHistory.viewHistory().backView != null){
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        console.log(JSON.parse(localStorage.user));
        $scope.user = JSON.parse(localStorage.user);


        // 得到用户的优惠券数量和用户的余额
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'home/getUserCouponNumberAndBalance.do',
            data: $.param({
                userId:localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            if(data.errorCode == 0){
                $scope.userCouponNumberAndBalance = data.result;
            }
        })

        // 兑换码
        $scope.showPopup = function () {
            $scope.data = {}

            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.exchangeCode" placeholder="请输入兑换码" style="border-radius:5px;">',
                title: '<b>优惠兑换</b>',
                subTitle: '',
                scope: $scope,
                buttons: [//Array[Object] (可选)。放在弹窗footer内的按钮
                    { 
                        text: '取消',
                        type: 'button-default',
                        onTap: function(e) {
                            // 当点击时，e.preventDefault() 会阻止弹窗关闭
                            // e.preventDefault();
                        }
                    }, 
                    {
                        text: '确定',
                        type: 'button-default',
                        onTap: function(e) {
                            // 返回的值会导致处理给定的值
                            e.preventDefault();

                            if($scope.data.exchangeCode != undefined && $scope.data.exchangeCode != ''){
                                $http({
                                    method: 'POST',
                                    url: ApiEndpoint.url + 'redeemCode/exchangeGoods.do',
                                    data: $.param({
                                        userId:localStorage.userId,
                                        exchangeCode:$scope.data.exchangeCode
                                    }),
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                                }).success(function(data){
                                    if(data.errorCode == 0){
                                        myPopup.close();

                                        // redeemType兑换码类型: 1优惠券  2虚拟商品货币
                                        if(data.result.redeemType == 1){
                                            var codeDescription = data.result.codeDescription;

                                            var myPopup1 = $ionicPopup.alert({
                                                title: '<h4>兑换成功!</h4>', // String. 弹窗的标题
                                                subTitle: '', // String (可选)。弹窗的子标题
                                                template: '<div style="text-align:center">成功兑换一张<span style="color:#f00;">'+codeDescription+'</span></div>', // String (可选)。放在弹窗body内的html模板
                                                templateUrl: '', // String (可选)。 放在弹窗body内的html模板的URL
                                                okText: '去看看', // String (默认: 'OK')。OK按钮的文字
                                                okType: 'button-clear button-assertive', // String (默认: 'button-positive')。OK按钮的类型
                                            });
                                            myPopup1.then(function(res){
                                                if(res){
                                                    $('.popup-container').hide();
                                                    $state.go('my_coupon');
                                                }
                                            })
                                        }else if(data.result.redeemType == 2){
                                            var codeDescription = data.result.codeDescription;
                                            
                                            var myPopup2 = $ionicPopup.alert({
                                                title: '<h4>兑换成功!</h4>', // String. 弹窗的标题。
                                                subTitle: '', // String (可选)。弹窗的子标题。
                                                template: '<div style="text-align:center">成功兑换风控币<span style="color:#f00;">'+codeDescription+'</span></div>'+
                                                            '<div style="text-align:center;color:#ccc;font-size:12px;">可到账户充值记录查询</div>', // String (可选)。放在弹窗body内的html模板
                                                templateUrl: '', // String (可选)。 放在弹窗body内的html模板的URL
                                                okText: '去看看', // String (默认: 'OK')。OK按钮的文字
                                                okType: 'button-clear button-assertive', // String (默认: 'button-positive')。OK按钮的类型
                                            });
                                            myPopup2.then(function(res){
                                                if(res){
                                                    $('.popup-container').hide();
                                                    $state.go('over');
                                                }
                                            })
                                        }
                                    }
                                })
                            }else{
                                PopService.showPop('兑换码不能为空');
                            }
                        }
                    }
                ]
            });

            myPopup.then(function(res) {
                console.log('Tapped!', res);
            });
        };
    })


    //搜索页面
    .controller('HomeSearchCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http, ApiEndpoint) {
        console.log($ionicHistory.viewHistory());
        if($ionicHistory.viewHistory().backView != null){
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

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
                    userId: localStorage.userId,
                    serachName: $scope.searchName
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.courseList = [];
                    $scope.videoList = [];
                    $scope.activityList = [];

                    angular.forEach(data.result, function (value, key) {
                        if (key == 'courseList') {
                            $scope.courseList = data.result[key];
                        } else if (key == 'videoList') {
                            $scope.videoList = data.result[key];
                        } else if (key == 'activityList') {
                            $scope.activityList = data.result[key];
                        }
                    })
                }
            })
        }
        search();

        $scope.clickToSearch = function () {
            search();
        }

    })

    .controller('LoginCtrl', function ($scope, $rootScope, $http, $timeout, $ionicLoading,$ionicHistory, $state, ApiEndpoint, PopService) {
        console.log($ionicHistory.viewHistory());
        if($ionicHistory.viewHistory().backView != null){
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        $('.loginbutton>button').click(function (event) {
            $(this).addClass('logincolor').siblings().removeClass('logincolor');
        });

        $scope.loginTab = 1;


        $scope.user = { userName: '', password: '' };

        // 普通登录
        $scope.login = function () {

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
                        if($ionicHistory.viewHistory().backView != null){
                            $ionicHistory.goBack();
                        }else if($ionicHistory.viewHistory().backView == null){
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
    .controller('OverCtrl', function ($scope, $ionicHistory,$http,ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        // 得到用户的优惠券数量和用户的余额
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'home/getUserCouponNumberAndBalance.do',
            data: $.param({
                userId:localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            if(data.errorCode == 0){
                $scope.userCouponNumberAndBalance = data.result;
            }
        })

    })


    //我的活动
    .controller('MyActiveCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.progressType = function(typeId){
            $scope.type_id = typeId;
            $scope.navIndex = 2;
            $('.down-list').hide();
        }

        $scope.progressPrice = function(priceId){
            $scope.price_id = priceId;
            $scope.navIndex = 3;
            $('.down-list').hide();
        }

        $('.dropdownType').on('click',function(){
            $(this).next('.down-list').toggle();
            $('.dropdownPrice').next('.down-list').hide();
        })

        $('.dropdownPrice').on('click',function(){
            $(this).next('.down-list').toggle();
            $('.dropdownType').next('.down-list').hide();
        })

        $('.myself_active_navigation_all').on('click',function(){
            $(this).addClass('progress_select').siblings().removeClass('progress_select');
        })

        $scope.activityType = "";

        function price() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'home/getNowTime.do',
                data: $.param({}),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function(data){
                var time = data.result;

                $http({
                    method:'POST',
                    url:ApiEndpoint.url + 'activity/getMyActivityList.do',
                    data:$.param({
                        userId: localStorage.userId,
                        pageNum: 1,
                        pageSize: 10,
                        isAllStatus: 0,
                        statusPay: 12
                    }),
                    headers:{'Content-Type':'application/x-www-form-urlencoded'}
                }).success(function(data){
                    if(data.errorCode == 0){
                        $scope.activeList = data.result;
                        console.log(data.result);

                        // newActivityStatus(活动状态):1即将开始(报名中)  2正在进行  3已结束
                        angular.forEach($scope.activeList,function(value){
                            if(time < value.activityStartTime){
                                // 即将开始
                                value.newActivityStatus = 1;
                            }else if(time >= value.activityStartTime && time <= value.activityEndTime){
                                // 正在进行
                                value.newActivityStatus = 2;
                            }else if(time > value.activityEndTime){
                                // 已结束
                                value.newActivityStatus = 3;
                            }
                        })
                    }
                })
            })
        }
        price();

        $scope.navIndex = 1;

        $scope.all = function () {
            // price();
            $scope.navIndex = 1;
            $('.down-list').hide();
        }

        $scope.clickPrice = function (id) {
            $http({
                method:'POST',
                url:ApiEndpoint.url + 'activity/getMyActivityList.do',
                data:$.param({
                    userId: localStorage.userId,
                    pageNum: 1,
                    pageSize: 10,
                    isAllStatus: 1,
                    statusPay: id
                }),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function(data){
                if(data.errorCode == 0){
                    $scope.activeList = data.result;
                }
            })
        }

    })


    //我的历史
    .controller('MyHistoryCtrl', function ($scope, $ionicHistory,$http,ApiEndpoint) {
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

        // type: 1视频  2课程 3活动
        $scope.getMyHistory = function(type){
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'home/userHistoryRecord.do',
                data: $.param({
                    userId: localStorage.userId,
                    type: type
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.historyList = data.result;
                    console.log($scope.historyList);
                }
            })
        }
        // 默认显示课程
        $scope.getMyHistory(2);

    })

    
    //我的收藏
    .controller('MyCollectionCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.typeId = 1;
        $scope.getMyCollection = function(type){
            $scope.typeId = type;

            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/getMyCollect.do',
                data: $.param({
                    userId: localStorage.userId,
                    type: type,
                    pageNum: 1,
                    pageSize: 10
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.collectList = data.result;
                }
            })
        }

        $scope.getMyCollection(1);
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

        /*$http({
            method: 'POST',
            url: ApiEndpoint.url + 'record/getUserRecordList.do',
            data: $.param({
                userId: localStorage.userId,
                pageNum: 1,
                pageSize: 10
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.recordList = data.result;
            }
        })*/

        // 消费记录查询
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'record/getUserConsumption.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.recordList = data.result;
            }
        })

    })


    //资料编辑
    .controller('MyEditProfileCtrl', function ($scope, $ionicLoading, $ionicActionSheet, $ionicHistory, $ionicPopup, $http, $timeout, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.showPop = function (text) {
            $ionicLoading.show({
                template: text
            });
            $timeout(function () {
                $ionicLoading.hide();
            }, 1500)
        };


        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'user/getUserByUserId.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.user = data.result;
            }
        })




        $scope.doUploadPhoto = function (element) {
            $scope.fileObj = element.files[0];
        }
        $scope.setImage = function () {
            // 自定义弹框
            var myPopup = $ionicPopup.show({
                template: '<input type="file" class="a_one" ng-model="jxssq.license" accept="image/*" onchange="angular.element(this).scope().doUploadPhoto(this)">',
                title: '上传你的图片',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '取消' },
                    {
                        text: '上传',
                        type: 'button-positive',
                        onTap: function (e) {
                            var addImageUrl = ApiEndpoint.url + "user/modifyUserIcon.do"; // 接收上传文件的后台地址
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
                template: '<input type="text" value="{{user.userName}}" id="changenickName">',
                title: '修改昵称',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<b>确定</b>',
                        onTap: function () {

                            $scope.user.userName = $("#changenickName").val();

                        },
                    }
                ],
            });
        }

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
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'user/modifyUser.do',
                data: $.param({
                    userId: $scope.user.userId,
                    userName: $scope.user.userName,
                    mobile: $scope.user.userPhone,
                    sex: $scope.user.userSex,
                    address: $scope.user.userAddress,
                    email: $scope.user.userEmail,
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('修改成功');
                } else {
                    PopService.showError('修改失败');
                }
            })
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
    .controller('UserFeedbackCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint,PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.type_id = 1;
        $scope.progressType = function (type) {
            $scope.type_id = type;
        }


        $scope.registerData = {};
        $scope.length = 200;

        //显示变更数量
        $scope.textChange = function () {
            $scope.length = 200 - $scope.registerData.message.length;
        }

        $scope.keepinfo = function () {
            console.log(/^1[34578]\d{9}$/.test($scope.registerData.userContact));
            console.log(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test($scope.registerData.userContact));
            console.log(/^1[34578]\d{9}$/.test($scope.registerData.userContact) && /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test($scope.registerData.userContact));
            if($scope.registerData.message == undefined || $scope.registerData.message == ''){
                PopService.showPop('反馈内容不能为空');
                return;
            }else if(!/^1[34578]\d{9}$/.test($scope.registerData.userContact) && !/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test($scope.registerData.userContact)){
                PopService.showPop('手机或邮箱地址有误');
                return;
            }


            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'feedback/addFeedback.do',
                data: $.param({
                    userId: localStorage.userId,
                    feedBackType: $scope.type_id,
                    feedBackContent:$scope.registerData.message,
                    userContact:$scope.registerData.userContact
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('提交成功');
                } else {
                    PopService.showError('提交失败');
                }
            })
            
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
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'coupon/getUserCouponList.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.couponList = data.result;
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
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.activityId = $stateParams.activityId;
        console.log('activityId: '+$scope.activityId);


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

        // 底部购买按钮
        $scope.btnBuyStatus = false;


        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'home/getNowTime.do',
            data: $.param({}),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            if(data.errorCode == 0){
                var time = data.result;

                $http({
                    method:'POST',
                    url:ApiEndpoint.url + 'activity/getActivityById.do',
                    data:$.param({
                        activityId:$scope.activityId
                    }),
                    headers:{'Content-Type':'application/x-www-form-urlencoded'}
                }).success(function(data){
                    if(data.errorCode == 0){
                        $scope.activityInfo = data.result;
                        var activityDescription = data.result.activityDescription;
                        var currentActivityId = data.result.activityId;
                        console.log(currentActivityId);

                        $('#detail').html(activityDescription);
                        

                        // activityType(活动类型): 1内  2审  3财  4税  5风
                        // 活动--相关(根据activityType获取活动的相关活动列表)
                        $http({
                            method:'POST',
                            url:ApiEndpoint.url + 'activity/getAllActivityList.do',
                            data:$.param({
                                // activityWay:$scope.activityInfo.activityWay,
                                activityType:$scope.activityInfo.activityType
                            }),
                            headers:{'Content-Type':'application/x-www-form-urlencoded'}
                        }).success(function(data){
                            if(data.errorCode == 0){
                                var activityRelatedResult = data.result;

                                $scope.activityRelatedList = [];

                                if(activityRelatedResult.length > 0){
                                    angular.forEach(activityRelatedResult,function(value){
                                        if(currentActivityId != value.activityId){
                                            $scope.activityRelatedList.push(value);
                                        }
                                    })
                                }
                            }
                        })



                        // newActivityStatus用于判断活动状态
                        if(time < $scope.activityInfo.activityStartTime){
                            // 即将开始
                            $scope.activityInfo.newActivityStatus = 1;
                        }else if(time >= $scope.activityInfo.activityStartTime && time <= $scope.activityInfo.activityEndTime){
                            // 直播中
                            $scope.activityInfo.newActivityStatus = 2;
                        }else if(time > $scope.activityInfo.activityEndTime){
                            // 已结束
                            $scope.activityInfo.newActivityStatus = 3;
                        }


                        $http({
                            method:'POST',
                            url:ApiEndpoint.url + 'order/getOrderByActivityAndUserId.do',
                            data:$.param({
                                userId:localStorage.userId,
                                activityId:$scope.activityId
                            }),
                            headers:{'Content-Type':'application/x-www-form-urlencoded'}
                        }).success(function(data){
                            if(data.errorCode == 0){
                                // total=1表示已支付 total=2表示未支付
                                var activityPayStatus = data.total;
                                
                                if($scope.activityInfo.activityPrice == 0){
                                    console.log('活动免费');
                                    $scope.btnBuyStatus = false;
                                }else if($scope.activityInfo.activityPrice > 0){
                                    if(activityPayStatus == 1){
                                        console.log('活动收费但已支付');
                                        $scope.btnBuyStatus = false;
                                    }else if(activityPayStatus == 2){
                                        console.log('活动收费且未付费');
                                        $scope.btnBuyStatus = true;
                                    }
                                }
                            }
                        })
                    }
                })
            }
        })


        // 活动--讲师
        $scope.getActivityTeacher = function(){
            $http({
                method:'POST',
                url:ApiEndpoint.url + 'teacher/getTeacherByActivityId.do',
                data:$.param({
                    activityId:$scope.activityId
                }),
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }).success(function(data){
                if(data.errorCode == 0){
                    $scope.activityTeacherInfo = data.result;
                }
            })
        }
  
    })



    //活动报名
    .controller('ActiveApplyCtrl', function ($scope, $ionicHistory) {

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }
    })

    //即将直播报名
    .controller('UpcomingLivingApplyCtrl', function ($scope, $ionicHistory, $state, upcomingLivingOrderInfo) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        console.log(upcomingLivingOrderInfo.orderInfo);

        $scope.applyInfo = {};
        console.log($scope.applyInfo.userName, $scope.applyInfo.contactWay, $scope.applyInfo.companyName);

        $scope.submitInfo = function () {
            upcomingLivingOrderInfo.orderInfo.upcomingLivingId = upcomingLivingOrderInfo.orderInfo.upcomingLivingId;
            upcomingLivingOrderInfo.orderInfo.upcomingLivingName = upcomingLivingOrderInfo.orderInfo.upcomingLivingName;
            upcomingLivingOrderInfo.orderInfo.upcomingLivingPrice = upcomingLivingOrderInfo.orderInfo.upcomingLivingPrice;

            upcomingLivingOrderInfo.orderInfo.userName = $scope.applyInfo.userName;
            upcomingLivingOrderInfo.orderInfo.contactWay = $scope.applyInfo.contactWay;
            upcomingLivingOrderInfo.orderInfo.companyName = $scope.applyInfo.companyName;

            $state.go('confirm_order_upcomingLiving');
        }


        /*$scope.userNameFlag = false;
        $scope.contactWayFlag = false;
        $scope.contactWayFlag2 = false;

        $scope.userNameChange = function(){
            $scope.$watch('applyInfo.userName',function(value){
                if(value == undefined || value == ''){
                    $scope.userNameFlag = true;
                }else if(value != ''){
                    $scope.userNameFlag = false;
                }
            })
        }
        
        $scope.contactWayChange = function(){
            $scope.$watch('applyInfo.contactWay',function(value){
                if(value == undefined || value == ''){
                    $scope.contactWayFlag = true;
                }else if(value != ''){
                    $scope.contactWayFlag = false;
                }
                console.log(/^1[34578]\d{9}$/.test(value));
                if(!/^1[34578]\d{9}$/.test(value)){
                    $scope.contactWayFlag2 = true;
                }else{
                    $scope.contactWayFlag2 = false;
                }
            })
        }


        $scope.submitInfo = function(){
            if($scope.applyInfo.userName == undefined || $scope.applyInfo.userName == ''){
                $scope.userNameFlag = false;
            }else if($scope.applyInfo.userName != ''){
                $scope.userNameFlag = true;
            }

            if($scope.applyInfo.contactWay == undefined || $scope.applyInfo.contactWay == ''){
                $scope.contactWayFlag = false;
            }else if($scope.applyInfo.contactWay != ''){
                $scope.contactWayFlag = true;
            }

            if(/^1[34578]\d{9}$/.test($scope.applyInfo.contactWay)){
                $scope.contactWayFlag2 = true;
            }else{
                $scope.contactWayFlag2 = false;
            }

            console.log('通过');
        }*/

    })

    //直播已结束报名
    .controller('LivingEndedApplyCtrl', function ($scope, $ionicHistory) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }
    })


    //即将直播详情
    .controller('UpcomingLivingDetailsCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint, $stateParams) {






    })

    //确认订单
    .controller('ConfirmOrderCtrl', function ($scope, $ionicPopover, $timeout, $ionicHistory, $ionicModal, $state) {

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        /*$scope.pay = function () {
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
        });*/




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

    //确认订单--课程
    .controller('ConfirmOrderCourseCtrl', function ($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, $stateParams, ApiEndpoint, courseOrderInfo) {

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var courseId = $stateParams.courseId;
        console.log('courseId: ' + courseId);
        /*console.log(courseOrderInfo.orderInfo);
        $scope.courseOrder = {};
        $scope.courseOrder.coursePrice = courseOrderInfo.orderInfo.coursePrice;
        $scope.courseOrder.courseName = courseOrderInfo.orderInfo.courseName;*/

        //获取课程信息
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'course/getCourseById.do',
            data: $.param({
                userId: localStorage.userId,
                courseId: courseId,
                // type(点赞类型):1直播 2视频 3课程
                type: 3,
                //collectType(收藏类型):1课程 2视频
                collectType: 1
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.courseName = data.result.course.courseName;
                $scope.coursePrice = data.result.course.price;


                //获取orderId
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'order/generateOrder.do',
                    data: $.param({
                        userId: localStorage.userId,
                        courseId: courseId,
                        orderTurnover: $scope.coursePrice
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        $scope.orderId = data.result.orderId;
                        console.log('orderId: ' + $scope.orderId);
                    }
                })
            }
        })


        $scope.pay = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
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


        //微信支付
        $scope.wechatPay = function () {
            console.log('orderId: ' + $scope.orderId);

            var clicktag = 0;
            if (clicktag == 0) {
                clicktag = 1;

                $.ajax({
                    type: 'GET',
                    url: 'http://www.igmhz.com/fengkong-server/wechat/getPrepareId.do',
                    data: { openID: 'oPjcrs-c2-k1rUS8Qd6bQOQZvTZE', orderId: $scope.orderId },
                    success: function (data) {
                        if (data.errorCode == 0) {
                            var jsonResult = data.result;
                            WeixinJSBridge.invoke('getBrandWCPayRequest', {
                                "appId": jsonResult.appId, //公众号名称，由商户传入
                                "timeStamp": jsonResult.timeStamp, //时间戳
                                "nonceStr": jsonResult.nonceStr, //随机串
                                "package": jsonResult.package,//扩展包
                                "signType": jsonResult.signType, //微信签名方式:默认使用sha1，使用新版支付需传入MD5
                                "paySign": jsonResult.paySign //微信签名
                            },
                                function (res) {
                                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                                        window.location.href = "http://www.igmhz.com/fengkong-living-h5/";
                                    } else {
                                        alert("取消支付");
                                    }
                                });
                        } else {
                            alert(data.errorMessage);
                        }
                    }
                })
                setTimeout(function () { clicktag = 0 }, 5000);
            }
        }

        //余额支付
        $scope.go = function () {
            alert('余额支付');
        }

        // 优惠券支付
        $scope.payCoupon = function () {
            $state.go("change_coupon");
        }

    })

    //确认订单--课程课时视频
    .controller('ConfirmOrderVideoCtrl', function ($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, ApiEndpoint, videoOrderInfo) {

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        console.log(videoOrderInfo.orderInfo);
        $scope.videoOrder = {};
        $scope.videoOrder.videoPrice = videoOrderInfo.orderInfo.videoPrice;
        $scope.videoOrder.videoName = videoOrderInfo.orderInfo.videoName;
        $scope.videoOrder.courseName = videoOrderInfo.orderInfo.courseName;


        //获取orderId
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'order/generateOrder.do',
            data: $.param({
                userId: localStorage.userId,
                videoId: videoOrderInfo.orderInfo.videoId,
                orderTurnover: videoOrderInfo.orderInfo.videoPrice
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.orderId = data.result.orderId;
            }
        })


        //微信支付
        $scope.wechatPay = function () {
            var orderId = $scope.orderId;
            console.log('orderId: ' + orderId);

            var clicktag = 0;
            if (clicktag == 0) {
                clicktag = 1;

                $.ajax({
                    type: 'GET',
                    url: 'http://www.igmhz.com/fengkong-server/wechat/getPrepareId.do',
                    data: { openID: 'oPjcrs-c2-k1rUS8Qd6bQOQZvTZE', orderId: orderId },
                    success: function (data) {
                        if (data.errorCode == 0) {
                            var jsonResult = data.result;
                            WeixinJSBridge.invoke('getBrandWCPayRequest', {
                                "appId": jsonResult.appId, //公众号名称，由商户传入
                                "timeStamp": jsonResult.timeStamp, //时间戳
                                "nonceStr": jsonResult.nonceStr, //随机串
                                "package": jsonResult.package,//扩展包
                                "signType": jsonResult.signType, //微信签名方式:默认使用sha1，使用新版支付需传入MD5
                                "paySign": jsonResult.paySign //微信签名
                            },
                                function (res) {
                                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                                        window.location.href = "http://www.igmhz.com/fengkong-living-h5/";
                                    } else {
                                        alert("取消支付");
                                    }
                                });
                        } else {
                            alert(data.errorMessage);
                        }
                    }
                })
                setTimeout(function () { clicktag = 0 }, 5000);
            }
        }





        //余额支付
        $scope.go = function () {
            alert('余额支付');
        }
        // 优惠券支付
        $scope.payCoupon = function () {
            $state.go("change_coupon");
        }


        $scope.pay = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
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

    //确认订单--正在直播
    .controller('ConfirmOrderLivingCtrl', ['$scope', '$ionicPopover', '$http', '$timeout', '$ionicHistory', '$ionicModal', '$state', 'ApiEndpoint', 'livingOrderInfo', function ($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, ApiEndpoint, livingOrderInfo) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        console.log(livingOrderInfo.orderInfo);
        $scope.livingName = livingOrderInfo.orderInfo.livingName;
        $scope.livingPrice = livingOrderInfo.orderInfo.livingPrice;



    }])

    //确认订单--即将直播
    .controller('ConfirmOrderUpcomingLivingCtrl', ['$scope', '$ionicPopover', '$http', '$timeout', '$ionicHistory', '$ionicModal', '$state', 'ApiEndpoint', 'upcomingLivingOrderInfo', function ($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, ApiEndpoint, upcomingLivingOrderInfo) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        console.log(upcomingLivingOrderInfo.orderInfo);
        $scope.upcomingLivingName = upcomingLivingOrderInfo.orderInfo.upcomingLivingName;
        $scope.upcomingLivingPrice = upcomingLivingOrderInfo.orderInfo.upcomingLivingPrice;

        $scope.userName = upcomingLivingOrderInfo.orderInfo.userName;
        $scope.contactWay = upcomingLivingOrderInfo.orderInfo.contactWay;
        $scope.companyName = upcomingLivingOrderInfo.orderInfo.companyName;
    }])

    //确认订单--直播已结束
    .controller('ConfirmOrderLivingEndedCtrl', ['$scope', '$ionicPopover', '$http', '$timeout', '$ionicHistory', '$ionicModal', '$state', 'ApiEndpoint', 'upcomingLivingOrderInfo', function ($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


    }])

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

        var liveId = $stateParams.livingId;
        console.log('liveId: ' + liveId);

        // 获取直播的拉流地址
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'live/getLiveUrl.do',
            data: $.param({
                liveId: liveId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                var url = data.result.pullStreamHls;

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


                myPlayer.setDataSource({ type: 'application/x-mpegURL', src: url });
                myPlayer.play();
            }
        })


        /*var myPlayer = neplayer('my-video', {}, function () {
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
        myPlayer.onError(function (data) { console.log(data) });*/


        function playNow() {
            var url = "http://pullhls5abba5f0.live.126.net/live/838a816262af41aba5d81dbdbc960a34/playlist.m3u8";

            if (url === '') {
                alert('请输入播放地址');
                return;
            }
            /*switch (urlType) {
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
        // playNow();


        // 点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'live/addEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: liveId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('点赞成功');
                    $scope.zan_flag = true;
                } else if (data.errorCode == 202) {
                    console.log('已经点赞了');
                    $scope.zan_flag = true;
                }
            })
        }



        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: liveId,
                    courseId: 0,
                    videoId: 0,
                    //commentType:1直播 2视频 3课程
                    commentType: 1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentLiveList = data.result;
                    $scope.commentLiveListLength = data.result.length;
                }
            })
        }
        getCommentList();

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
                        commentType: 1,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: liveId,
                        commentContent: $scope.living.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    .success(function (data) {
                        if (data.errorCode == 0) {
                            PopService.showPop('评论成功');
                            $scope.living.evaluation = '';
                            getCommentList();
                        }
                    })
            }
        }

    })


    //录播课程列表
    .controller('RecordedListCtrl', function ($scope, $http, $ionicHistory, $rootScope, $stateParams, $state, ApiEndpoint, PopService, courseOrderInfo, videoOrderInfo) {
        $scope.courseId = $stateParams.courseId;
        console.log('courseID ' + $scope.courseId);

        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $rootScope.$ionicGoBack();
        }

        // 收藏
        $scope.collection_flag = false;
        $scope.progress_collection = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/collect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectedId: $scope.courseId,
                    //收藏类型type:1课程 2视频
                    type: 1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('收藏成功');
                    $scope.collection_flag = true;
                } else if (data.errorCode == 23310) {
                    console.log('已经收藏过了,请不要重复收藏');
                    $scope.collection_flag = true;
                }
            })
        }

        // 点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'course/courseEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    courseId: $scope.courseId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('点赞成功');
                    $scope.zan_flag = true;
                } else if (data.errorCode == 202) {
                    console.log('已经点赞过了');
                    $scope.zan_flag = true;
                }
            })
        }



        $('.progress_tab_change_selected').on('click', function () {
            $(this).addClass('active1').siblings().removeClass('active1');
            $('#progress_recorded_detail_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress_recorded_related').css('display', 'block'); break;
                case 1: $('#progress_recorded_detail').css('display', 'block'); break;
                case 2: $('#progress_recorded_comment').css('display', 'block'); break;

            }
        })

        // 获取用户的课程收藏点赞状态
        $http.post(ApiEndpoint.url + 'course/getCourseById.do', {}, {
            params: {
                userId: localStorage.userId,
                courseId: $scope.courseId,
                // type(点赞类型):1直播 2视频 3课程
                type: 3,
                //collectType(收藏类型):1课程 2视频
                collectType: 1
            }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.collection_flag = data.result.collectStatus;
                $scope.zan_flag = data.result.earnedStatus;
            }
        })

        //底部'购买课程'按钮显示状态
        $scope.courseBuyStatus = false;

        //课程安排(userId用来获取该用户是否购买该课程)
        $http.post(ApiEndpoint.url + 'video/getCourseVideoForH5.do', {}, {
            params: {
                userId: localStorage.userId,
                courseId: $scope.courseId
            }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.courseInfo = {};
                // 获取课程名称
                $scope.courseInfo.courseName = data.result.course.courseName;
                // 获取课程价格
                $scope.courseInfo.coursePrice = data.result.course.price;
                // 获取课程封面地址
                $scope.courseInfo.imgUrl = data.result.course.imageUrl;
                // 获取用户购买课程状态courseIsPay:0未购买 1已购买
                if (data.result.courseVideoForH5.length > 0) {
                    $scope.courseInfo.courseIsPay = data.result.courseVideoForH5[0].courseIsPay;

                    $scope.recordedCourseList = data.result.courseVideoForH5;
                }


                //如果课程免费,那么该课程下的所有课时肯定全部免费
                if ($scope.courseInfo.coursePrice == 0) {
                    console.log('课程免费');
                    $scope.courseBuyStatus = false;
                } else if ($scope.courseInfo.coursePrice > 0) {
                    if ($scope.courseInfo.courseIsPay == 0) {
                        console.log('课程收费且未支付');
                        $scope.courseBuyStatus = true;
                    } else if ($scope.courseInfo.courseIsPay == 1) {
                        console.log('课程收费但已支付');
                        $scope.courseBuyStatus = false;
                    }
                }
            }
        })

        //课程--详情
        $scope.getCourseDetail = function () {
            $http.post(ApiEndpoint.url + 'course/getCourseDetail.do', {}, {
                params: {
                    courseId: $scope.courseId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.courseDetail = data.result;
                }
            })
        }


        // 用户评论课程
        $scope.recordList = {};
        $scope.evaluate = function () {
            if ($scope.recordList.evaluation == undefined || $scope.recordList.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 3,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: $scope.courseId,
                        commentContent: $scope.recordList.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('评论成功');
                        $scope.recordList.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }
        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: 0,
                    courseId: $scope.courseId,
                    videoId: 0,
                    //commentType:1直播 2视频 3课程
                    commentType: 3
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentList = data.result;
                }
            })
        }
        getCommentList();

        //点击课程列表某个课时进入课时详情页(参数:videoId,payStatus(属于该课时的课程付费状态))
        $scope.recorded_detail = function () {

        }

        //点击'购买课程'存储生成订单所需信息
        $scope.createCourseOrder = function () {
            /*courseOrderInfo.orderInfo.courseId = $scope.courseId;
            courseOrderInfo.orderInfo.coursePrice = $scope.courseInfo.coursePrice;
            courseOrderInfo.orderInfo.courseName = $scope.courseInfo.courseName;*/

            $state.go('confirm_order_course', {
                courseId: $scope.courseId
            });
        }

        // 点击课程的课时视频后存储课时的所需信息
        $scope.videoInfo = function (videoName, videoPrice, videoIcon, courseName) {
            videoOrderInfo.orderInfo.videoName = videoName;
            videoOrderInfo.orderInfo.videoPrice = videoPrice;
            videoOrderInfo.orderInfo.videoIcon = videoIcon;
            videoOrderInfo.orderInfo.courseName = courseName;
        }
    })


    //录播课程的课时详情 和 录播不属于课程的视频详情
    .controller('RecordedDetailCtrl', function ($scope, $ionicHistory, $http, $state, $stateParams,$timeout, ApiEndpoint, PopService, videoOrderInfo) {
        $scope.courseId = $stateParams.courseId;
        $scope.videoId = $stateParams.videoId;

        console.log('courseId: ' + $scope.courseId);
        console.log('videoId: ' + $scope.videoId);


        /*$scope.videoName = videoOrderInfo.orderInfo.videoName;
        $scope.videoPrice = videoOrderInfo.orderInfo.videoPrice;
        $scope.videoIcon = videoOrderInfo.orderInfo.videoIcon;*/


        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


       /* $scope.$on('$ionicView.beforeEnter',function(){
            window.location.reload();
        })*/

        //获取课时信息
        $scope.getVideoInfo = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/getVideoById.do',
                data: $.param({
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.videoResult = data.result;


                    var videoStr = '<video id="my-video" class="video-js vjs-big-play-centered" x-webkit-airplay="allow" webkit-playsinline style="width: 100%;"></video>';
                    $('#recordedDetailVideoWraper').append(videoStr);


                    var myPlayer = neplayer('my-video', 
                        {
                            "controls": true, //是否显示控制条
                            "autoplay": false, //是否自动播放(ios不支持自动播放)
                            /*预加载选项*/
                            "preload": "auto",
                            /*
                            'auto'预加载视频（需要浏览器允许）;
                            'metadata'仅预加载视频meta信息;
                            'none'不预加载;
                            */
                            "poster": $scope.videoResult.videoIcon, //视频播放前显示的图片
                            // "techOrder": ["flash", "html5"], //优先使用的播放模式
                            //设置不显示大播放按钮
                            bigPlayButton:false,
                            controlBar:{
                                'playToggle':true,
                                'volumeMenuButton':true,
                                'progressControl':true,
                                'liveDisplay':true,
                                'fullscreenToggle':true,

                                'currentTimeDisplay':true,
                                'timeDivider':true,
                                'durationDisplay':true,
                                'remainingTimeDisplay':false
                            }
                        }, 
                        function () {
                            console.log('播放器初始化完成');
                            myPlayer.setDataSource({ type: 'video/mp4', src: $scope.videoResult.videoUrl });
                        }
                    );


                    // var playerTech = videojs("my-video").tech({ IWillNotUseThisInPlugins: true });
                    myPlayer.onPlayState(1, function () {
                        console.log('play');
                    });
                    myPlayer.onPlayState(2, function () {
                        console.log('pause');
                    });
                    myPlayer.onPlayState(3, function () {
                        console.log('ended');
                    });
                    myPlayer.onError(function (data) {
                        console.log(data);
                    });


                    // myPlayer.setDataSource({ type: 'video/mp4', src: $scope.videoResult.videoUrl });
                    // myPlayer.play();

                    $scope.$on('$ionicView.beforeLeave',function(){
                        myPlayer.release();
                    });
                }
            })
        }
        $scope.getVideoInfo();


        //底部立即购买按钮
        $scope.btnBuyStatus = false;

        //courseId存在时(录播里面属于课程的课时视频)
        if($scope.courseId != undefined){

            //获取课时所属课程免费收费
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/getCourseVideoForH5.do',
                data: $.param({
                    userId: localStorage.userId,
                    courseId: $scope.courseId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var courseInfo = data.result;
                    // courseIsPay课程付费状态: 0未付费  1已付费
                    var courseIsPay = courseInfo.courseVideoForH5[0].courseIspay;


                    //获取课时免费收费
                    $http({
                        method: 'POST',
                        url: ApiEndpoint.url + 'video/getVideoById.do',
                        data: $.param({
                            videoId: $scope.videoId
                        }),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            var videoResult = data.result;


                            // 获取登录用户课时付费状态  selectType(查询类别):视频1 直播2 课程3 活动4
                            function isPayStatus(selectType, videoId, liveId, courseId, activityId) {
                                console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId);
                                $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                                    params: {
                                        userId: localStorage.userId,
                                        selectType: selectType,
                                        videoId: videoId,
                                        liveId: liveId,
                                        courseId: courseId,
                                        activityId: activityId
                                    }
                                }).success(function (data) {
                                    // isPay:(0:未付费),(>0:已付费)
                                    var videoPayStatus = data.result;


                                    //最终作判断
                                    if (courseInfo.course.price == 0) {
                                        console.log('课程免费');
                                        $scope.btnBuyStatus = false;
                                    } else if (courseInfo.course.price > 0) {
                                        if (courseIsPay == 1) {
                                            console.log('课程收费但用户已付费');
                                            $scope.btnBuyStatus = false;
                                        } else if (courseIsPay == 0) {
                                            if (videoResult.videoPrice == 0) {
                                                console.log('课程收费且用户未付费,但课时免费');
                                                $scope.btnBuyStatus = false;
                                            } else if (videoResult.videoPrice > 0) {
                                                if (videoPayStatus.isPay == 0) {
                                                    console.log('课程收费且用户未付费,课时收费且用户未付费');
                                                    $scope.btnBuyStatus = true;
                                                } else if (videoPayStatus.isPay > 0) {
                                                    console.log('课程收费且用户未付费,课时收费但用户已付费');
                                                    $scope.btnBuyStatus = false;
                                                }
                                            }
                                        }
                                    }

                                })
                            }
                            isPayStatus(1, $scope.videoId, 0, 0, 0);
                        }
                    })

                }
            })
        }
        //courseId不存在时(录播里面不属于课程的视频)
        else if($scope.courseId == undefined){

            //获取课时免费收费
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/getVideoById.do',
                data: $.param({
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var videoResult = data.result;


                    // 获取登录用户课时付费状态  selectType(查询类别):视频1 直播2 课程3 活动4
                    function isPayStatus(selectType, videoId, liveId, courseId, activityId) {
                        console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId);
                        $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                            params: {
                                userId: localStorage.userId,
                                selectType: selectType,
                                videoId: videoId,
                                liveId: liveId,
                                courseId: courseId,
                                activityId: activityId
                            }
                        }).success(function (data) {
                            // isPay:(0:未付费),(>0:已付费)
                            var videoPayStatus = data.result;


                            //最终作判断
                            if (videoResult.videoPrice == 0) {
                                console.log('课时免费');
                                $scope.btnBuyStatus = false;
                            } else if (videoResult.videoPrice > 0) {
                                if (videoPayStatus.isPay == 0) {
                                    console.log('课时收费且用户未付费');
                                    $scope.btnBuyStatus = true;
                                } else if (videoPayStatus.isPay > 0) {
                                    console.log('课时收费但用户已付费');
                                    $scope.btnBuyStatus = false;
                                }
                            }

                        })
                    }
                    isPayStatus(1, $scope.videoId, 0, 0, 0);
                }
            })

        }



        // 收藏
        $scope.collection_flag = false;
        $scope.progress_collection = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/collect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectedId: $scope.videoId,
                    //收藏类型type:1课程 2视频
                    type: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('收藏成功');
                    $scope.collection_flag = true;
                } else if (data.errorCode == 23310) {
                    console.log('已经收藏过了,请不要重复收藏');
                    $scope.collection_flag = true;
                }
            })
        }

        // 点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/addVideoEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('点赞成功');
                    $scope.zan_flag = true;
                } else if (data.errorCode == 202) {
                    console.log('已经点赞了');
                    $scope.zan_flag = true;
                }
            })
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



        // 添加用户评论
        $scope.videoComment = {};
        $scope.evaluate = function () {
            if ($scope.videoComment.evaluation == undefined || $scope.videoComment.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 2,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: $scope.videoId,
                        commentContent: $scope.videoComment.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('评论成功');
                        $scope.videoComment.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }
        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: 0,
                    courseId: 0,
                    videoId: $scope.videoId,
                    //commentType:1直播 2视频 3课程
                    commentType: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentList = data.result;
                }
            })
        }
        getCommentList();

        //获取录播详情--详情
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getVideoDetail.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoDetail = data.result[0];
            }
        })

        //获取录播详情--相关
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getvideoRelevant.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoRelevantList = data.result;
            }
        })


        //点击'立即购买'存储生成订单所需信息
        $scope.createVideoOrder = function () {
            videoOrderInfo.orderInfo.videoId = $scope.videoId;
            //课时视频价格
            videoOrderInfo.orderInfo.videoPrice = $scope.videoPrice;
            //课时视频名称
            videoOrderInfo.orderInfo.videoName = $scope.videoName;
            //课时视频所属课程名称
            videoOrderInfo.orderInfo.courseName = videoOrderInfo.orderInfo.courseName;


            $state.go('confirm_order_video');
        }
    })

    //不属于课程的视频详情
    .controller('RecordedVideoDetailCtrl', function ($scope, $ionicHistory, $http, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.videoId = $stateParams.videoId;
        console.log('videoId: ' + $scope.videoId);


        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


        //获取课时信息
        $scope.getVideoInfo = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/getVideoById.do',
                data: $.param({
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.videoResult = data.result;


                    var myPlayer = neplayer('my-video', {
                            "controls": true, //是否显示控制条
                            "autoplay": false, //是否自动播放(ios不支持自动播放)
                            /*预加载选项*/
                            "preload": "auto",
                            /*
                            'auto'预加载视频（需要浏览器允许）;
                            'metadata'仅预加载视频meta信息;
                            'none'不预加载;
                            */
                            "poster": $scope.videoResult.videoIcon, //视频播放前显示的图片
                            //设置显示大播放按钮
                            bigPlayButton:true,
                            controlBar:{
                                'playToggle':true,
                                'volumeMenuButton':true,
                                'progressControl':true,
                                'liveDisplay':true,
                                'fullscreenToggle':true,

                                'currentTimeDisplay':true,
                                'timeDivider':true,
                                'durationDisplay':true,
                                'remainingTimeDisplay':false
                            }
                        }, function () {
                            console.log('播放器初始化完成');
                            myPlayer.setDataSource({ type: 'video/mp4', src: $scope.videoResult.videoUrl });
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


                    // myPlayer.setDataSource({ type: 'video/mp4', src: $scope.videoResult.videoUrl });
                    // myPlayer.play();

                    $scope.$on('$ionicView.beforeLeave',function(){
                        myPlayer.release();
                    });
                }
            })
        }
        $scope.getVideoInfo();


        //底部立即购买按钮
        $scope.btnBuyStatus = false;


        //获取课时免费收费
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'video/getVideoById.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                var videoResult = data.result;


                // 获取登录用户课时付费状态  selectType(查询类别):视频1 直播2 课程3 活动4
                function isPayStatus(selectType, videoId, liveId, courseId, activityId) {
                    console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId);
                    $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                        params: {
                            userId: localStorage.userId,
                            selectType: selectType,
                            videoId: videoId,
                            liveId: liveId,
                            courseId: courseId,
                            activityId: activityId
                        }
                    }).success(function (data) {
                        // isPay:(0:未付费),(>0:已付费)
                        var videoPayStatus = data.result;


                        //最终作判断
                        /*if (courseInfo.course.price == 0) {
                            console.log('课程免费');
                            $scope.btnBuyStatus = false;
                        } else if (courseInfo.course.price > 0) {
                            if (courseIsPay == 1) {
                                console.log('课程收费但用户已付费');
                                $scope.btnBuyStatus = false;
                            } else if (courseIsPay == 0) {
                                if (videoResult.videoPrice == 0) {
                                    console.log('课程收费且用户未付费,但课时免费');
                                    $scope.btnBuyStatus = false;
                                } else if (videoResult.videoPrice > 0) {
                                    if (videoPayStatus.isPay == 0) {
                                        console.log('课程收费且用户未付费,课时收费且用户未付费');
                                        $scope.btnBuyStatus = true;
                                    } else if (videoPayStatus.isPay > 0) {
                                        console.log('课程收费且用户未付费,课时收费但用户已付费');
                                        $scope.btnBuyStatus = false;
                                    }
                                }
                            }
                        }*/



                        //最终作判断
                        if (videoResult.videoPrice == 0) {
                            console.log('课时免费');
                            $scope.btnBuyStatus = false;
                        } else if (videoResult.videoPrice > 0) {
                            if (videoPayStatus.isPay == 0) {
                                console.log('课时收费且用户未付费');
                                $scope.btnBuyStatus = true;
                            } else if (videoPayStatus.isPay > 0) {
                                console.log('课时收费但用户已付费');
                                $scope.btnBuyStatus = false;
                            }
                        }

                    })
                }
                isPayStatus(1, $scope.videoId, 0, 0, 0);
            }
        })






        // 收藏
        $scope.collection_flag = false;
        $scope.progress_collection = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/collect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectedId: $scope.videoId,
                    //收藏类型type:1课程 2视频
                    type: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('收藏成功');
                    $scope.collection_flag = true;
                } else if (data.errorCode == 23310) {
                    console.log('已经收藏过了,请不要重复收藏');
                    $scope.collection_flag = true;
                }
            })
        }

        // 点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/addVideoEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('点赞成功');
                    $scope.zan_flag = true;
                } else if (data.errorCode == 202) {
                    console.log('已经点赞了');
                    $scope.zan_flag = true;
                }
            })
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



        // 用户评论课时
        $scope.videoComment = {};
        $scope.evaluate = function () {
            if ($scope.videoComment.evaluation == undefined || $scope.videoComment.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 2,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: $scope.videoId,
                        commentContent: $scope.videoComment.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('评论成功');
                        $scope.videoComment.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }
        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: 0,
                    courseId: 0,
                    videoId: $scope.videoId,
                    //commentType:1直播 2视频 3课程
                    commentType: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentList = data.result;
                }
            })
        }
        getCommentList();

        //获取录播详情--详情
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getVideoDetail.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoDetail = data.result[0];
            }
        })

        //获取录播详情--相关
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getvideoRelevant.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoRelevantList = data.result;
            }
        })


    })

    //直播已结束详情
    .controller('LivingEndedDetailCtrl', function ($scope, $ionicHistory, $http, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $ionicHistory.goBack();
        }

        $scope.videoId = $stateParams.livingEndedId;
        console.log('videoId: ' + $scope.videoId);

        //获取直播已结束的视频信息
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'live/liveAgainWatch.do',
            data: $.param({
                liveId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.livingEndedVideoInfo = data.result;
                console.log($scope.livingEndedVideoInfo.videoUrl);



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


                myPlayer.setDataSource({ type: 'video/mp4', src: $scope.livingEndedVideoInfo.videoUrl });
                myPlayer.play();

            }
        })






















        /*$scope.videoName = videoOrderInfo.orderInfo.videoName;
        $scope.videoPrice = videoOrderInfo.orderInfo.videoPrice;
        $scope.videoIcon = videoOrderInfo.orderInfo.videoIcon;*/



        // 收藏
        $scope.collection_flag = false;
        $scope.progress_collection = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/collect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectedId: $scope.videoId,
                    //收藏类型type:1课程 2视频
                    type: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('收藏成功');
                    $scope.collection_flag = true;
                } else if (data.errorCode == 23310) {
                    console.log('已经收藏过了,请不要重复收藏');
                    $scope.collection_flag = true;
                }
            })
        }

        // 点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/addVideoEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('点赞成功');
                    $scope.zan_flag = true;
                } else if (data.errorCode == 202) {
                    console.log('已经点赞了');
                    $scope.zan_flag = true;
                }
            })
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


        /*
         * 判断登录用户付费状态
         *   selectType(查询类别):视频1 直播2 课程3 活动4
        */
        // 
        function isPayStatus(selectType, videoId, liveId, courseId, activityId) {
            console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId);
            $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                params: {
                    userId: localStorage.userId,
                    selectType: selectType,
                    videoId: videoId,
                    liveId: liveId,
                    courseId: courseId,
                    activityId: activityId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    // isPay:(0:未付费),(>0:已付费)
                    if (data.result.isPay == 0) {
                        console.log('未付费');
                        $scope.videoPayStatus = 0;
                    } else if (data.result.isPay > 0) {
                        console.log('已付费');
                        $scope.videoPayStatus = 1;
                    }
                }
            })
        }
        isPayStatus(1, $scope.videoId, 0, 0, 0);

        // 用户评论课时
        $scope.videoComment = {};
        $scope.evaluate = function () {
            if ($scope.videoComment.evaluation == undefined || $scope.videoComment.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 2,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: $scope.videoId,
                        commentContent: $scope.videoComment.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('评论成功');
                        $scope.videoComment.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }
        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: 0,
                    courseId: 0,
                    videoId: $scope.videoId,
                    //commentType:1直播 2视频 3课程
                    commentType: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentList = data.result;
                }
            })
        }
        getCommentList();

        //获取录播详情--详情
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getVideoDetail.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoDetail = data.result[0];
            }
        })

        //获取录播详情--相关
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getvideoRelevant.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoRelevantList = data.result;
            }
        })


        /*//点击'立即购买'存储生成订单所需信息
        $scope.createVideoOrder = function () {
            videoOrderInfo.orderInfo.videoId = $scope.videoId;
            //课时视频价格
            videoOrderInfo.orderInfo.videoPrice = $scope.videoPrice;
            //课时视频名称
            videoOrderInfo.orderInfo.videoName = $scope.videoName;
            //课时视频所属课程名称
            videoOrderInfo.orderInfo.courseName = videoOrderInfo.orderInfo.courseName;


            $state.go('confirm_order_video');
        }*/
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




