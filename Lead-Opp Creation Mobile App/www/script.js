var app = angular.module('myApp', ['ngRoute', '720kb.datepicker']);

// configure our routes
app.config(function ($routeProvider) {
    $routeProvider
    //route for splash
    .when('/', {
        templateUrl: 'splash.html',
        controller: 'splashController'
    })
    // route for the login page
    .when('/login', {
        templateUrl: 'login.html',
        controller: 'loginController'
    })

    // route for the home page
    .when('/home/:directOpp?/:mb_pk?', {
        templateUrl: 'home.html',
        controller: 'homeController'
    })

    // route for the meeting schedule page
    .when('/schedule-meeting/:mb_pk?', {
        templateUrl: 'schedule-meeting.html',
        controller: 'scheduleController'
    })

    // route for the lead form page
    .when('/lead/:mb_pk?', {
        templateUrl: 'lead.html',
        controller: 'leadController'
    })
    //route for the opportunity form page
    .when('/opp/:mb_pk?/:directOpp?',{
        templateUrl: 'opportunity.html',
        controller: 'oppController'
    })
    // route for the lead form page
    .when('/direct-opp', {
        templateUrl: 'lead.html',
        controller: 'leadController'
    })
    //route for the emi calculator page
    .when('/calculate-emi',{
        templateUrl: 'emi-calculator.html',
        controller: 'emiCalController'
    })
    //route for the reports page
    .when('/reports',{
        templateUrl: 'reports.html',
        controller: 'reportsController'
    })
    //route for the pocket guide page
    .when('/pocket-guide',{
        templateUrl: 'pocket-guide.html',
        controller: 'pocketGuideController'
    })
    //route for the my profile page
    .when('/my-profile',{
        templateUrl: 'my-profile.html',
        controller: 'myProfileController'
    })
    //route for the my profile page
    .when('/register',{
        templateUrl: 'register.html',
        controller: 'registerController'
    })
    //route for the my profile page
    .when('/forgot-password',{
        templateUrl: 'forgot-password.html',
        controller: 'forgotPasswordController'
    }).
    otherwise({
        redirectTo: '/home'
    });
});

app.controller('splashController',['$scope', '$window', function($scope, $window){
    //    localStorage.removeItem('username');
    //    localStorage.removeItem('password');
    //    // localStorage.removeItem('reloadFlag');
    //    localStorage.removeItem('finalobject');
    //    localStorage.removeItem('refreshTime');
    //    localStorage.removeItem('pocketData');
    //    localStorage.removeItem('finalobject1');
    //    localStorage.removeItem('primaryObject');
    //    localStorage.removeItem("dispName");
    //dropUserTable();
    //dropLoginTable();
    }]);

app.controller('loginController', ['$scope', '$window', '$http','$route','generateToken',function ($scope, $window, $http, $route, generateToken) {

    $scope.dispName= localStorage.getItem("dispName");
    $scope.userId= localStorage.getItem("username");
    $scope.loginSubmit = function(isValid) {
        $scope.submitted = true;
        if(isValid) {
                
            if (navigator.connection == null) {
                // alert('Connection Error');
                var networkState="unknown";
            //   console.log(networkState);
            }
            else{
                var networkState = navigator.connection.type;
                console.log(networkState);
            }
            var height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
            $('.loginpage .loading').height(height);
            $scope.loading = true;
            var userLogin = {};
            localStorage.setItem("username", $scope.userName);
            localStorage.setItem("password", $scope.password);
            userLogin['userId'] = localStorage.getItem('username');
            userLogin['password'] = localStorage.getItem('password');
            userLogin['loginFlag']="L";
            userLogin['token']=generateToken.makeToken();
            //console.log(JSON.stringify(userLogin));
            var loginURL= "http://rocuat.tmf.co.in/SageAppProj/resources/genericResource/login";
            //check network
            if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi"|| networkState == "unknown") {
                $http.post(loginURL, JSON.stringify(userLogin)).
                success(function (data) {
                    insertIntoLogin(userLogin.userId, userLogin.password,userLogin.token);
                    console.log(data.bdmName);
                    localStorage.setItem("dispName", data.bdmName);
                    $scope.loading = false;
                    if (data.responseStatus == "SUCCESS") {
                        var pagePreference = $window.localStorage['pagePreference'];

                        if(pagePreference) {
                            $window.location.href = '#/' + pagePreference;
                        } else {
                            $window.localStorage['reloadFlag'] = "true";
                            $window.location.href = '#/home';
                        }
                    }
                    else if(data.responseStatus == "FAIL"){
                        
                        $('#loginFailAlert').css('opacity', 1).slideDown();
                        startTimeout('#loginFailAlert');
                    }
                    function startTimeout(id) {
                        window.setTimeout(function() {
                            $(id).fadeTo(500, 0).slideUp(500, function(){
                                //$(id).toggle();
                                });
                        }, 5000);
                    }
                })
            }
            else if(networkState == "none" || networkState == "unknown")
            {
                $scope.loading = false;
                alert('Please check your internet connection and try again');
            }
        }
    }

    $("input[name='rating']").click(function(){
        var starValue = $("input[name='rating']:checked").val();
        if(starValue){
            $scope.titleDisp= $("input[name='rating']:checked").attr('title');
            $(".titleRating").html($scope.titleDisp);
        }
    });
}]);

var scheduleMeetingData = null;

app.controller('homeController', ['$scope', 'FavoritesService', 'getFavorites', 'removeUniqueLeadData', '$routeParams', '$window','GetCurrentDateTime', function ($scope, FavoritesService, getFavorites, removeUniqueLeadData, $routeParams, $window, GetCurrentDateTime) {
    $scope.title = "My Worklist";

    var reloadFlag = localStorage.getItem('reloadFlag');
    var leadMbPk = $routeParams.mb_pk;
    
    if(reloadFlag == "true") {
        $scope.loading = true;
        localStorage.setItem('reloadFlag', 'false');

        setTimeout(function(){
            window.location.reload();
            if(leadMbPk) {
                $window.location.href = "#/opp/" + leadMbPk;
            }
        }, 1000);
    }

    

    //For sorting
    $scope.sortCategories = [
    {
        key: 'FName',
        value: 'First Name'
    },
    {
        key: 'LName',
        value: 'Last Name'
    },
    {
        key: 'CreationDate',
        value: 'Aging'
    },
    {
        key: 'LoanAmount',
        value: 'Loan Amount'
    },
    {
        key: 'channel-new',
        value: 'Channel - New'
    },
    {
        key: 'channel-used',
        value: 'Channel - Used'
    },
    ];

    $scope.setOrder = function() {
        var order;
        if($scope.categorySelected.key === 'LoanAmount') {
            order = '-Opportunity.' + $scope.categorySelected.key;
        } else if($scope.categorySelected.key === 'channel-new') {
            order = '-Lead.Channel';
        } else if($scope.categorySelected.key === 'channel-used') {
            order = 'Lead.Channel';
        } else {
            order = 'Lead.' + $scope.categorySelected.key;
        }
        $scope.order = order;
    };
    //    console.log("before grid "+localStorage.getItem('username'));
    displayDataOnGrid(localStorage.getItem('username'));
    var leadData = JSON.parse(localStorage.getItem('finalobject'));
    //console.log("leadData "+JSON.stringify(leadData));
    if(leadData) {
        $scope.data = {
            "TransactionData": removeUniqueLeadData.remove(leadData.TransactionData)
        }
    } else {
        $scope.data = {
            "TransactionData": []
        }
    }
    //console.log(JSON.stringify($scope.data.TransactionData.MetaData));
    

    //for converting loan amount from string to number
    angular.forEach($scope.data.TransactionData, function (value, index) {
        value.Opportunity.LoanAmount = parseInt(value.Opportunity.LoanAmount);
    });
  
    //calculate no of leads and opportunities
    var opportunityCount = 0,
    leadCount = 0;
      
    angular.forEach($scope.data.TransactionData, function(value, index) {
        //console.log(value.MetaData.LeadId);
        if(value.MetaData.OpportunityId === '' || value.MetaData.OpportunityId === 'undefined') {
            leadCount++;
        }
        if(value.MetaData.OpportunityId !== '' && value.MetaData.OpportunityId !== 'undefined') {
            opportunityCount++;
        }
    });
    var currDate = GetCurrentDateTime.getCurrDate();
    angular.forEach($scope.data.TransactionData, function(value, index) {
        // console.log(value.Lead.CreationDate);
        if(value.Lead.CreationDate == 'undefined') {
            value.Lead.CreationDate=currDate;
        }
    });
    $scope.opportunityCount = opportunityCount;
    $scope.leadCount = leadCount;
    var totalCount = opportunityCount + leadCount;

    var leadCountPercentage = ((leadCount / totalCount) * 100) + '%';

    var oppCountPercentage = ((opportunityCount / totalCount) * 100) + '%';

    // $('.lead-progress-bar').css('width', leadCountPercentage);

    // $('.opp-progress-bar').css('width', oppCountPercentage);

    //clear entered input text
    $scope.clearInput = function() {
        $scope.FName = "";
        if(leadCount) {
            $('.no-data-message').hide();
            $('.content-wrapper .tag-line').removeClass('tag-line-stick-bottom');
            setTimeout(function(){
                showNoDataText();
            }, 50);
        }
    };

    //show meeting popover
    $scope.showScheduleDetails = function(key) {
        angular.forEach($scope.data.TransactionData, function(value, index) {
            if(value.MetaData.Mobile_PK === key) {
                scheduleMeetingData = value.Lead;
            }
        });
    }

    $scope.isCompleteLead = function(leadObj) {
        if(!(leadObj.LeadType && leadObj.Product && leadObj.Channel && leadObj.FinanaceType
            && leadObj.FName && leadObj.LName && leadObj.MobileNo && leadObj.Address1
            && leadObj.City && leadObj.Meetinglocation && leadObj.MeetingTime)) {
            var colorPreference = $window.localStorage['colorPreference'];

            if(colorPreference) {
                if(colorPreference == '#FF0000') {
                    return 'red';
                }
                else if(colorPreference == '#265599') {
                    return 'dark-blue';
                } else if(colorPreference == '#eb8204') {
                    return 'orange';
                }
            } else {
                return 'incompleteLead';
            }
        }
    }
  
    //add to favorites code
    $scope.favorites = getFavorites.get();
  
    $scope.addToFavorite =  function(id) {
        return $.inArray(id, $scope.favorites) > -1;
    }
  
    $scope.addToFav = function(id) {
        FavoritesService.addFav(id);
  
        $scope.favorites = getFavorites.get();
  
        $scope.addToFavorite =  function(id) {
            return $.inArray(id, $scope.favorites) > -1;
        }
    };

    // $scope.addEventsToMoreButton = function() {
    //     $('.content-wrapper .customer-details .dot-image').on('click', function() {
    //         $('.content-wrapper .customer-details .dot-image').fadeIn();
    //         $('.content-wrapper .customer-details .icons-wrapper').removeClass('icons-wrapper-show');
    //         $(this).fadeOut();
    //         $(this).siblings('.icons-wrapper').addClass('icons-wrapper-show');
    //     });
        
    //     $('.search-box input').on('input', function() {
    //         $scope.showNoDataText();
    //     });

    //     $scope.showNoDataText();
    // };

    $('.search-box input').on('input', function() {
        setTimeout(function(){
            showNoDataText();
        }, 50);

    });

    showNoDataText = function() {
        length = $('.home .content-wrapper > div .emp-info').length;
        if(!$('.content-wrapper .emp-info').length) {
            $('.no-data-message').show();
        } else {
            $('.no-data-message').hide();
        }

        if($('.content-wrapper > div').height() < $('.content-wrapper').height()) {
            $('.content-wrapper .tag-line').addClass('tag-line-stick-bottom');
        } else {
            $('.content-wrapper .tag-line').removeClass('tag-line-stick-bottom');
        }
    }

    setTimeout(function(){
        showNoDataText();
    }, 50);

    if(!leadCount) {
        showNoDataText();
    }

    $scope.redirectToExistingLead = function($event, leadMbPk) {
        var senderElement = event.target;
        //check if sender is the DIV element
      
        if(!$(event.target).hasClass('do-not-redirect')) {
            $window.location.href = '#/lead/' + leadMbPk;
        }
    }

    $scope.redirectToNewLead = function() {
        $('.modal-backdrop').hide();
        $window.location.href = '#/lead/';
    }

    $scope.redirectToNewOpp = function() {
        $('.modal-backdrop').hide();
        $window.location.href = '#/direct-opp';
    }

    $scope.smsPop = function(mobNo){
        window.location ="sms:"+mobNo+"?body=" + encodeURIComponent("");
    }


}]);

app.controller('scheduleController', ['$scope', '$window', '$routeParams', 'GetCurrentDateTime', function ($scope, $window, $routeParams, GetCurrentDateTime) {
    $scope.title = "Set Reminder";

    $('#date').attr('min', GetCurrentDateTime.getCurrDate());

    var mbPk = $routeParams.mb_pk;
    $scope.scheduleData = scheduleMeetingData;

    $scope.meetingLocation = $scope.scheduleData.Meetinglocation;

    $scope.meetingRemarks = $scope.scheduleData.Remarks;

    if($scope.scheduleData.MeetingTime) {
        var setMeetdetails = ($scope.scheduleData.MeetingTime).split(" ");
        document.getElementById("date").value = setMeetdetails[0];
        $scope.meetingDate = setMeetdetails[0];

        //$scope.meetTime = "12:00:00";
        var time = setMeetdetails[1].split(':');
        if(time[0].length < 2) {
            time[0] = '0' + time[0];
        }

        if(time[1].length < 2) {
            time[1] = '0' + time[1];
        }

        var setTime = time[0] + ':' + time[1];
        $scope.meetingTime = setTime;
        document.getElementById("meetingTime").value = setTime;
    }
  
    $scope.checkTimeEmpty = function() {
        if(document.getElementById("meetingTime").value) {
            $scope.meetTimeStatus = true;
        } else {
            $scope.meetTimeStatus = false;
        }
    }

    $scope.checkDateEmpty = function() {
        if(document.getElementById("date").value) {
            $scope.meetDateStatus = true;
        } else {
            $scope.meetDateStatus = false;
        }
    }

    $scope.smsPop = function(mobNo){
        window.location ="sms:"+mobNo+"?body=" + encodeURIComponent("");
    }

    console.log(JSON.stringify($scope.scheduleData));

    var clientName = $scope.scheduleData.FName+" "+$scope.scheduleData.LName;
    var clientNum = $scope.scheduleData.MobileNo;
    $scope.socialShare = function(){
        //alert("clientName "+clientName);
        //alert("ClientNum "+clientNum);
        window.plugins.socialsharing.share('Client Name :'+clientName+'\nContact number :'+clientNum);
    }

    $scope.rescheduleMeeting = function(isValid) {
        $scope.submitted = true;
        $scope.meetTimeStatus = false;
        $scope.meetDateStatus = false;
        $scope.checkTimeEmpty();
        $scope.checkDateEmpty();
        if (isValid && $scope.meetTimeStatus && $scope.meetDateStatus) {
            var meetingTime = document.getElementById("meetingTime").value;
            var meetDate = document.getElementById("date").value;
            $scope.rescheduleData = {
                "meeting": {
                    "Meetinglocation":"",
                    "MeetingTime":"",
                    "Remarks":""
                }
            }
                
                
                
                
            var startDate = document.getElementById("date").value;
            var meetTime = document.getElementById("meetingTime").value;
            var title = "SalesAnywhere Meeting";
            var location = $scope.scheduleData.Meetinglocation;
            var notes = "You have a meeting with "+$scope.scheduleData.FName+ " "+$scope.scheduleData.LName;
            console.log("Date:"+startDate);
            console.log("Title:"+title);
            console.log("Location:"+location);
            console.log("meetingTime:"+meetingTime);
            var success = function() {
                console.log("Success");
            };
            var error = function(message) {
                console.log("Oopsie! " + message);
            };
            calendar.createEvent(title, location, notes, startDate, meetTime, success, error);


            if($scope.meetingLocation) {
                $scope.rescheduleData.meeting.Meetinglocation = $scope.meetingLocation;
            }

            if(meetingTime && meetDate) {
                //var meetTime = GetCurrentDateTime.getFormatedTime($scope.meetingTime);
                $scope.rescheduleData.meeting.MeetingTime = meetDate + " " + meetingTime;
            }

            if($scope.meetingRemarks) {
                $scope.rescheduleData.meeting.Remarks = $scope.meetingRemarks;
            }

            insertRescheduleMeetingdata($scope.rescheduleData, mbPk);

            $window.localStorage['reloadFlag'] = "true";

            $window.location.href = "#/home";
        }
    }
}]);

var leadData = {};
app.controller('leadController',['$scope', '$window', '$http', 'GetCurrentDateTime', '$routeParams', 'removeUniqueLeadData', function ($scope, $window, $http, GetCurrentDateTime, $routeParams, removeUniqueLeadData) {
    $scope.title="Lead Form";
    $('#date').attr('min', GetCurrentDateTime.getCurrDate());
    $scope.particularLeadData = {};
    var mbPk = $routeParams.mb_pk;

    if(mbPk) {

        $('#leadSubmit').text('Update Lead');

        var leadDataFromLocalStorage = JSON.parse(localStorage.getItem('finalobject'));

        $scope.data = {
            "TransactionData": removeUniqueLeadData.remove(leadDataFromLocalStorage.TransactionData)
        }

        angular.forEach($scope.data.TransactionData, function(value, index) {
            if(value.MetaData.Mobile_PK === mbPk) {
                $scope.particularLeadData = {
                    "TransactionData": value
                };
            }
        });

        if($scope.particularLeadData.TransactionData.Lead.MeetingTime) {
            var setMeetdetails = ($scope.particularLeadData.TransactionData.Lead.MeetingTime).split(" ");
            document.getElementById("date").value = setMeetdetails[0];
            $scope.mettingDate = setMeetdetails[0];

            //$scope.meetTime = "12:00:00";
            var time = setMeetdetails[1].split(':');
            if(time[0].length < 2) {
                time[0] = '0' + time[0];
            }

            if(time[1].length < 2) {
                time[1] = '0' + time[1];
            }
            var setTime = time[0] + ':' + time[1];
            
            document.getElementById("meetTime").value = setTime;
            $scope.meetTime = setTime;
        }

        var custAdd = "";
        if($scope.particularLeadData.TransactionData.Lead.Address1) {
            custAdd += $scope.particularLeadData.TransactionData.Lead.Address1;
        }
        if($scope.particularLeadData.TransactionData.Lead.Address2) {
            custAdd += ';' + $scope.particularLeadData.TransactionData.Lead.Address2;
        }
        if($scope.particularLeadData.TransactionData.Lead.Address3) {
            custAdd += ';' + $scope.particularLeadData.TransactionData.Lead.Address3;
        }

        $scope.searchProd = $scope.particularLeadData.TransactionData.Lead.Product;
        $scope.searchChan = $scope.particularLeadData.TransactionData.Lead.Channel;
        $scope.custFName = $scope.particularLeadData.TransactionData.Lead.FName;
        $scope.custLName = $scope.particularLeadData.TransactionData.Lead.LName;
        $scope.mobNumber = $scope.particularLeadData.TransactionData.Lead.MobileNo;
        $scope.custAddr = custAdd;
        $scope.cityInput = $scope.particularLeadData.TransactionData.Lead.City;
        $scope.meetLoc = $scope.particularLeadData.TransactionData.Lead.Meetinglocation;

        if($scope.particularLeadData.TransactionData.Lead.LeadType == 'Organisation') {
            $('.ind-org').prop('checked', true);
            $scope.leadType = true;
        }

        if($scope.particularLeadData.TransactionData.Lead.FinanaceType == 'Used') {
            $('.new-used').prop('checked', true);
            $scope.financialType = true;
        }

        if($scope.particularLeadData.TransactionData.MetaData.Sync_Status) {
            $scope.sync_status = 'U';
        }
    }

    $scope.goToDashboard = function() {
        $window.location.href = "#/home";
    }

    //city autoComplete
    $http.get('city.json').success(function(cityData) {
        $scope.cities = cityData
        //        /console.log(JSON.stringify(cityData));
        localStorage.setItem("cityJson", JSON.stringify(cityData));
    });
    //console.log(localStorage.getItem("cityJson"));
    $scope.callback = function(cities) {
        $scope.cities = cities
    //console.log($scope.cities);
    }
   

    //product autoComplete
    $http.get('product.json').success(function(productData){
        // console.log(JSON.stringify(data));
        $scope.products = productData
        //console.log(JSON.stringify($scope.productData));
        localStorage.setItem("productJson", JSON.stringify(productData));
    });

    $scope.callback = function(product){
        $scope.product = product
    }

    $scope.checkValid = function(type){
        setTimeout(function(){
            //console.log(localStorage.getItem("cityJson"));
            var checkJson={};
            if(type == 'product') {
                checkJson=JSON.parse(localStorage.getItem("productJson"));
            
                var inputValue = $scope.searchProd;
            } else {
                checkJson=JSON.parse(localStorage.getItem("cityJson"));
                var inputValue = $scope.cityInput;
            }

            if(inputValue) {
                angular.forEach(checkJson, function(value, index) {
                    // if(value.MetaData.OpportunityId === '') {
                    //     leadCount++;
                    // }
                    if((value.label).toLowerCase() == (inputValue).toLowerCase()) {
                        if(type == 'product') {
                            $scope.isValidProduct = true;
                        } else {
                            $scope.isValidCity = true;
                        }
                    }
            
                });
            }
        }, 10);

        
    //var autoFound = false;
        
    // for(var idx = 0, length = checkJson.length; idx < length; idx++) {
    //     if (checkJson[idx] === value) {
    //         autoFound = true;
    //         $scope.autoFound= true;
    //         break;
    //     }
    // }

    // if (!autoFound) {
    //     $(event.target).val("");
    //     $scope.autoFound= false;
    //     $('#autoFailAlert').css('opacity', 1).slideDown();
    //     startTimeout('#autoFailAlert');
    //     function startTimeout(id) {
    //         window.setTimeout(function() {
    //             $(id).fadeTo(500, 0).slideUp(500, function(){
    //                 //$(id).toggle();
    //                 });
    //         }, 5000);
    //     }
    // }
    }

    //do not remove - Atul
    var hash = window.location.hash;
    if(hash.indexOf('direct-opp') > -1) {
        $('.lead-wrapper .lead-btns').hide();
        $('.lead-wrapper .direct-opp-btn').show();
    }
    

    $scope.checkTimeEmpty = function() {
        if(document.getElementById("date").value) {
            if(document.getElementById("meetTime").value) {
                $scope.meetTimeStatus = true;
            } else {
                $scope.meetTimeStatus = false;
            }
        }
    }

    $scope.checkDateEmpty = function() {
        if(document.getElementById("meetTime").value) {
            if(document.getElementById("date").value) {
                $scope.meetDateStatus = true;
            } else {
                $scope.meetDateStatus = false;
            }
        }
    }

    $scope.channelSelected = function() {
        if($scope.searchChan) {
            $scope.channelSelectedStatus = true;
        } else {
            $scope.channelSelectedStatus = false;
        }
    };


    //lead data save
    $scope.leadSubmit = function(directOpp, isValid) {
        $scope.submitted = true;
        $scope.meetTimeStatus = true;
        $scope.meetDateStatus = true;
        $scope.channelSelectedStatus = false;
        //$scope.autoFound= true;
        $scope.checkTimeEmpty();
        $scope.checkDateEmpty();
        $scope.channelSelected();
        //setTimeout(function(){
        $scope.isValidProduct = false;
        $scope.isValidCity = false;
        $scope.checkValid('product');
        $scope.checkValid('city');
        //}, 10);
        setTimeout(function(){
            if (isValid && $scope.meetTimeStatus && $scope.meetDateStatus && $scope.channelSelectedStatus &&
                $scope.isValidProduct && $scope.isValidCity) {
                var currDate = GetCurrentDateTime.getCurrDate();
                leadData = {
                    "TransactionData":
                    [
                    {
                        "Lead":{
                            "LeadType":"Individual",
                            "Product":"",
                            "Channel":"",
                            "FinanaceType":"New",
                            "FinanaceCategory":"",
                            "FName":"",
                            "LName":"",
                            "MobileNo":"",
                            "Addreess1":"",
                            "Addreess2":"",
                            "Addreess3":"",
                            "City":"",
                            "Meetinglocation":"",
                            "MeetingTime":"",
                            "CreationDate": currDate
                        },
                        "Opportunity": {
                            "LeadId":"",
                            "Segment":"",
                            "AssetValue":"",
                            "LoanAmount":"0",
                            "Tenure":"",
                            "IRR":""
                        },
                        "MetaData": {
                            "UserId":"",
                            "Mobile_PK":"",
                            "LeadId":"",
                            "OpportunityId":"",
                            "Sync_Status":"N",
                            "Token_Id":""
                        }
                    }
                    ]
                }

                if($scope.sync_status && $scope.sync_status !== 'N') {
                    leadData.TransactionData[0].MetaData.Sync_Status = $scope.sync_status;
                }

                if($scope.searchProd) {
                    leadData.TransactionData[0].Lead.Product = $scope.searchProd;
                }

                if($scope.searchChan) {
                    leadData.TransactionData[0].Lead.Channel = $scope.searchChan;
                }

                if($scope.custFName) {
                    leadData.TransactionData[0].Lead.FName = $scope.custFName;
                }

                if($scope.custLName) {
                    leadData.TransactionData[0].Lead.LName = $scope.custLName;
                }

                if($scope.mobNumber) {
                    leadData.TransactionData[0].Lead.MobileNo = $scope.mobNumber;
                }

                if($scope.cityInput) {
                    leadData.TransactionData[0].Lead.City = $scope.cityInput;
                }

                if($scope.meetLoc) {
                    leadData.TransactionData[0].Lead.Meetinglocation = $scope.meetLoc;
                }

                if($scope.custAddr) {
                    var address = ($scope.custAddr).split(';');
                    if(address[0]) {
                        leadData.TransactionData[0].Lead.Addreess1 =  address[0];
                    }

                    if(address[1]) {
                        leadData.TransactionData[0].Lead.Addreess2 =  address[1];
                    }

                    if(address[2]) {
                        leadData.TransactionData[0].Lead.Addreess3 =  address[2];
                    }
                }
                if($scope.leadType) {
                    leadData.TransactionData[0].Lead.LeadType = "Organisation";
                }

                if($scope.financialType) {
                    leadData.TransactionData[0].Lead.FinanaceType = "Used";
                }

                if(document.getElementById("date").value && document.getElementById("meetTime").value) {
                    //var meetDate = ($scope.mettingDate).split('-');
                    //meetDate = meetDate[2] + '-' + meetDate[1] + '-' + meetDate[0];
                    var meetDate= document.getElementById("date").value;
                    //var meetTime = GetCurrentDateTime.getFormatedTime($scope.meetTime);
                    var meetTime = document.getElementById("meetTime").value;
                    leadData.TransactionData[0].Lead.MeetingTime = meetDate + " " + meetTime;
                }

                var mobilePk = GetCurrentDateTime.getMobilePK();
                leadData.TransactionData[0].MetaData.Mobile_PK = mobilePk;

                if(mbPk) {
                    leadData.TransactionData[0].MetaData.Mobile_PK = mbPk;
                }

                leadData.TransactionData[0].MetaData.UserId = $window.localStorage['username'];
                //leadData.TransactionData[0].MetaData.UserId = "99020969";

                
                //save lead data in web sql
                // localStorage.setItem("reloadFlag", true);
                insertIntoUserdata(leadData, mbPk, directOpp);
                

                var requiredMbPk = mobilePk;

                if(mbPk) {
                    requiredMbPk = mbPk;
                }

                if(directOpp) {
                    $window.localStorage['reloadFlag'] = "true";
                    $window.location.href = '#/home/directOpp/' + requiredMbPk;
                } else {
                    $window.localStorage['reloadFlag'] = "true";
                    $window.location.href = "#/home";
                }
           
            }
        }, 100);
    }

}]);

app.controller('oppController',['$scope', '$window', 'removeUniqueLeadData', '$routeParams', 'GetCurrentDateTime', function ($scope, $window, removeUniqueLeadData, $routeParams, GetCurrentDateTime) {
    $scope.title="Opportunity Form";
    $scope.loanTenure = 12;
    var mbPk = $routeParams.mb_pk;

    var leadDataForOPP = JSON.parse(localStorage.getItem('finalobject'));

    $scope.data = {
        "TransactionData": removeUniqueLeadData.remove(leadDataForOPP.TransactionData)
    }

    angular.forEach($scope.data.TransactionData, function(value, index) {
        if(value.MetaData.Mobile_PK === mbPk) {
            $scope.particularLeadData = {
                "TransactionData": value
            };
        }
    });

    $('#userName').text($scope.particularLeadData.TransactionData.Lead.FName + " " + $scope.particularLeadData.TransactionData.Lead.LName);

    if(($scope.particularLeadData.TransactionData.MetaData.LeadId != 'undefined') && ($scope.particularLeadData.TransactionData.MetaData.LeadId != '')) {
        $('#leadId').text($scope.particularLeadData.TransactionData.MetaData.LeadId);
    }
            
    if($scope.particularLeadData.TransactionData.Opportunity.AssetValue) {
        $scope.assetVal = $scope.particularLeadData.TransactionData.Opportunity.AssetValue;
        $('#opportunitySubmit').text('Update Opportunity');
    }

    if($scope.particularLeadData.TransactionData.Opportunity.Segment !== "customerSegment") {
        $scope.custSeg = $scope.particularLeadData.TransactionData.Opportunity.Segment;
    }

    if($scope.particularLeadData.TransactionData.Opportunity.Segment) {
        $('#opportunitySubmit').text('Update Opportunity');
    }

    if($scope.particularLeadData.TransactionData.Opportunity.LoanAmount) {
        $scope.loanAmtVal = $scope.particularLeadData.TransactionData.Opportunity.LoanAmount;
        $('#opportunitySubmit').text('Update Opportunity');
    }

    if($scope.particularLeadData.TransactionData.Opportunity.IRR) {
        $scope.irrVal = $scope.particularLeadData.TransactionData.Opportunity.IRR;
        $('#opportunitySubmit').text('Update Opportunity');
    }

    if($scope.particularLeadData.TransactionData.Opportunity.Tenure) {
        $scope.loanTenure = $scope.particularLeadData.TransactionData.Opportunity.Tenure;
        $('#tenure').text($scope.particularLeadData.TransactionData.Opportunity.Tenure);
    }

    $scope.addDocument = function() {
        var addDocumentStructure = '<div class="form-group clearfix photo-wrapper">' +
        '<select class="document-type form-control" >' +
        '<option value"">Please Select</option>' +
        '<option value="pancard">Pan Card</option>' +
        '<option value="adharcard">Adhar Card</option>' +
        '<option value="passport">Passport</option>' +
        '</select>' +
        '<span class="camera-icon" id="add-document"></span>' +
        '<span class="remove-icon" id="remove-document"></span>' +
        '</div>';
        $('.selected-photos-main-wrapper').append(addDocumentStructure);
        if($('.photo-wrapper').length == 5) {
            $('.add-document-button').hide();
        }
    }

    $(document).on('click', '.photo-wrapper #remove-document' , function() {
        $(this).parent('.photo-wrapper').remove();
        if($('.photo-wrapper').length < 5) {
            $('.add-document-button').show();
        }
    });


    $scope.cameraDemo= function(){
        event.preventDefault();
        if (!navigator.camera) {
            alert("Camera API not supported", "Error");
            return;
        }
        var options =   {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Album
            encodingType: 0,     // 0=JPG 1=PNG
            saveToPhotoAlbum: true,
            correctOrientation: true
        };

        navigator.camera.getPicture(
            function(imgData) {
                $(".cameraCapture").attr('src', "data:image/jpeg;base64,"+imgData);
            },
            function() {
                alert('Error taking picture', 'Error');
            },
            options);

        return false;
    }

    $scope.isAssetAmtSmaller = function() {
        if($scope.assetVal >= $scope.loanAmtVal) {
            $scope.loanAmtSmaller = false;
        } else {
            $scope.loanAmtSmaller = true;
        }
    }

    $scope.irrValueStatus = function() {
        if($scope.irrVal >=10 && $scope.irrVal <=20) {
            $scope.irrCorrectValue = true;
        } else {
            $scope.irrCorrectValue = false;
        }
    }

    // $scope.tenureValueStatus = function() {
    //     if($scope.loanTerm >=12 && $scope.loanTerm <=60) {
    //         $scope.tenureCorrectValue = true;
    //     } else {
    //         $scope.tenureCorrectValue = false;
    //     }
    // }

    $scope.oppSubmit = function(isValid) {
        $scope.submitted = true;
        $scope.irrCorrectValue = false;
        //$scope.tenureCorrectValue = false;
        $scope.loanAmtSmaller = true;
        $scope.isAssetAmtSmaller();
        $scope.irrValueStatus();
        //$scope.tenureValueStatus();
        if(isValid && !$scope.loanAmtSmaller && $scope.irrCorrectValue) {
            $scope.oppData = {
                "Opportunity": {
                    "LeadId":"",
                    "Segment":"customerSegment",
                    "AssetValue":"",
                    "LoanAmount":"0",
                    "Tenure":"",
                    "IRR":""
                },
                "MetaData": {
                    "UserId":"",
                    "Mobile_PK":"",
                    "LeadId":"",
                    "OpportunityId":"",
                    "Sync_Status":"O",
                    "Token_Id":""
                }
            }

            if($scope.custSeg) {
                $scope.oppData.Opportunity.Segment = $scope.custSeg;
            }

            if($scope.assetVal) {
                $scope.oppData.Opportunity.AssetValue = $scope.assetVal;
            }

            if($scope.loanAmtVal) {
                $scope.oppData.Opportunity.LoanAmount = $scope.loanAmtVal;
            }

            if($scope.irrVal) {
                $scope.oppData.Opportunity.IRR = $scope.irrVal;
            }

            if($scope.loanTenure) {
                $scope.oppData.Opportunity.Tenure = $scope.loanTenure;
            }
            insertOpportunitydata($scope.oppData, mbPk);
            $window.localStorage['reloadFlag'] = "true";
            $window.location.href = "#/home";
        }
    }

}]);

app.controller('emiCalController', ['$scope', function ($scope) {
    $scope.title="EMI Calculator";

    $scope.irrValueStatus = function() {
        if($scope.irrVal >=10 && $scope.irrVal <=20) {
            $scope.irrCorrectValue = true;
        } else {
            $scope.irrCorrectValue = false;
        }
    }

    $scope.tenureValueStatus = function() {
        if($scope.loanTerm >=12 && $scope.loanTerm <=60) {
            $scope.tenureCorrectValue = true;
        } else {
            $scope.tenureCorrectValue = false;
        }
    }


    $scope.calculateEmi = function(isvalid) {
        $scope.submitted = true;
        $scope.irrCorrectValue = false;
        $scope.tenureCorrectValue = false;
        $scope.irrValueStatus();
        $scope.tenureValueStatus();
        if(isvalid && $scope.irrCorrectValue && $scope.tenureCorrectValue) {
            var loanAmt = parseFloat($scope.loanAmtVal),
            loanTerm = parseFloat($scope.loanTerm),
            irrValue = parseFloat($scope.irrVal);
            $scope.calculatedValue = Math.round(((loanAmt * ((irrValue / 100) / 12)) *
                (Math.pow((1 + ((irrValue / 100) / 12)), loanTerm))) /
            ((Math.pow((1 + ((irrValue / 100) / 12)), loanTerm)) - 1),
                2);
        }
    }
}]);

app.controller('reportsController', ['$scope', function ($scope) {
    $scope.title="Reports";

    $scope.toggleReports = function($event) {
        event.preventDefault();

        $(event.target).tab('show');
    }

    var graphColors = ['#FF0000', '#F1F10F', '#0EA9EF', '#15EC15', '#FFA500', '#EC40D1', '#4047EC'];

    $scope.stageData = [
    {
        value: 10,
        label: "Lead"
    },
    {
        value: 5,
        label: "Opportunity"
    },
    {
        value: 7,
        label: "Sent To RSPM"
    },
    {
        value: 14,
        label: "Quote Generated"
    },
    {
        value: 6,
        label: "Sent To LOS"
    },
    {
        value: 1,
        label: "Booked"
    },
    {
        value: 4,
        label: "Settled"
    }

    ];

    var totalstageDataValue = 0;
    angular.forEach($scope.stageData, function (value, index) {
        totalstageDataValue += value.value;
    });

    angular.forEach($scope.stageData, function (value, index) {
        value.percentage = Math.round(((value.value)/totalstageDataValue)*100);
        value.color = graphColors[index];
    });

    $scope.productData = [
    {
        value: 10,
        label: "ACE"
    },
    {
        value: 5,
        label: "INDIGO"
    },
    {
        value: 2,
        label: "NANO"
    },
    {
        value: 14,
        label: "207"
    },
    {
        value: 12,
        label: "ZEST"
    },
    {
        value: 1,
        label: "TIAGO"
    }

    ];

    var totalproductDataValue = 0;
    angular.forEach($scope.productData, function (value, index) {
        totalproductDataValue += value.value;
    });

    angular.forEach($scope.productData, function (value, index) {
        value.percentage = Math.round(((value.value)/totalproductDataValue)*100);
        value.color = graphColors[index];
    });

    $scope.toggleDataDisplay = function(type) {
        var selectedType;
        if(type == 'stage') {
            selectedType = $scope.selectedStageType;
        } else {
            selectedType = $scope.selectedProductType;
        }
        if(selectedType == ('show-' + type + '-percentage')) {
            $('.reports-wrapper .show-' + type + '-count').hide();
            $('.reports-wrapper .show-' + type + '-percentage').show();
        } else {
            $('.reports-wrapper .show-' + type + '-percentage').hide();
            $('.reports-wrapper .show-' + type + '-count').show();
        }
    };


    $( document ).ready(function() {
        var ctx1 = new Chart(document.getElementById("chart-area1").getContext("2d")).Pie($scope.stageData);

        var ctx2 = new Chart(document.getElementById("chart-area2").getContext("2d")).Pie($scope.productData);
    });

}]);

app.controller('pocketGuideController', ['$scope','$http','GetCurrentDateTime', function ($scope,$http,GetCurrentDateTime) {
    $scope.title="Pocket Guide";
            
        
    $scope.refreshTime= localStorage.getItem("refreshTime");
            
    var pockData = JSON.parse(localStorage.getItem('pocketData'));
                            
    if(pockData){
        $scope.schemes=pockData;
    }

    $scope.showSchemeDetails = function($event) {
        $('.pocket-guide-wrapper .scheme-details').slideUp();
        if($(event.target).siblings('.scheme-details').css('display') == 'block') {
            $(event.target).siblings('.scheme-details').slideUp();
        } else {
            $(event.target).siblings('.scheme-details').slideDown();
        }
            
    }

    $scope.clearInput = function() {
        $scope.schemeName = "";
    }

    $scope.pocketGuideUpdate = function(){
        $scope.loading = true;
        var  allocObject={
            "UserId": "99010969",
            "Token_Id": "123213sdjjfksjf"
        }
        GenerateJsonForSync();
        var allocURL="http://rocUAT.tmf.co.in/SageAppProj/resources/genericResource/pocketGuideData";
        $http.post(allocURL,allocObject).
        success(function (data) {
            deleteFromPocket();
            insertIntoPocketguide(data);
            displayDataPocketGuide();
            $scope.loading = false;
            var refrTime=GetCurrentDateTime.getCurrDate() + " " + GetCurrentDateTime.getCurrTime();
            localStorage.setItem("refreshTime", refrTime);
                  
                  
                  
        })
    }
}]);

app.controller('myProfileController', ['$scope', '$window', function ($scope, $window) {
    $scope.title="My Profile";

    var setPagePreference = $window.localStorage['pagePreference'];

    if(setPagePreference !== 'undefined') {
        $scope.pagePreference = setPagePreference;
    }

    var setColorPreference = $window.localStorage['colorPreference'];

    if(setColorPreference !== 'undefined') {
        $scope.colorPreference = setColorPreference;
    }

    $scope.setPreference = function() {
    
        if($scope.pagePreference) {
            $window.localStorage['pagePreference'] = $scope.pagePreference;
        }

        if($scope.colorPreference) {
            $window.localStorage['colorPreference'] = $scope.colorPreference;
        }

        $window.location.href = '#/home';
    }
}]);

app.controller('headerController', ['$scope', '$window', '$http','GetCurrentDateTime', function ($scope, $window, $http, GetCurrentDateTime) {
    $scope.submitData = function(){

        if (navigator.connection == null) {
            // alert('Connection Error');
            var networkState="unknown";
        //console.log(networkState);
        }
        else{
            var networkState = navigator.connection.type;
            console.log(networkState);
        }


        GenerateJsonForSync(localStorage.getItem('username'));
        $scope.loading = true;
        //console.log("Sync Input : "+localStorage.getItem('finalobject1'));
        //webservice call for data sync
        var syncURL= "http://rocUAT.tmf.co.in/SageAppProj/resources/genericResource/syncAppData";
        if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi"|| networkState == "unknown") {
            window.setTimeout(function () {
                $scope.loading = true;
                if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi"|| networkState == "unknown"){
                    console.log("Sync Input : "+localStorage.getItem('finalobject1'));
                    $http.post(syncURL, localStorage.getItem('finalobject1')).
                    success(function (data) {
                        console.log("Sync Output : " +JSON.stringify(data));
                        //$scope.loading = false;
                        if (data.syncOutput != "") {
                            //console.log(JSON.stringify(data.SyncOutput));
                            updateEntryStatus(data, localStorage.getItem('username'));
                            $window.localStorage['reloadFlag'] = "true";
                            if($window.location.hash == "#/home"){
                                window.setTimeout(function() {
                                    window.location.reload();
                                    $scope.loading = false;
                                }, 5000);
                            }
                            else{
                                // window.setTimeout(function() {
                                $scope.loading = false;
                            //}, 7000);
                            }
                        }
                        if(data.key=="F")
                        {
                            $scope.loading = false;
                            alert(data.message);
                            $('#syncFailAlert').css('opacity', 1).slideDown();
                            startTimeout('#syncFailAlert');
                        }
                        function startTimeout(id) {
                            window.setTimeout(function() {
                                $(id).fadeTo(500, 0).slideUp(500, function(){
                                    //$(id).toggle();
                                    });
                            }, 5000);
                        }
                    })
                }
                else if(networkState == "none" || networkState == "unknown")
                {
                    $scope.loading = false;
                    alert('Please check your internet connection and try again');
                }
            }, 100);

            // webservice call for reverse sync
            checkEntryStatusOnServer(localStorage.getItem('username'));
            console.log("rsync input: "+localStorage.getItem('primaryObject'));
            var RSyncURL="http://rocUAT.tmf.co.in/SageAppProj/resources/genericResource/reverseSyncData";
            window.setTimeout(function () {
                if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi"|| networkState == "unknown") {
                    $http.post(RSyncURL,localStorage.getItem('primaryObject')).
                    success(function (data) {
                        console.log("RSync Output : " +JSON.stringify(data));
                        $scope.loading = false;
                        if(data.Mobile_PK="")
                        {
                            $scope.loading = false;
                            //alert("RSync Failed : "+JSON.stringify(data));
                            $('#syncFailAlert').css('opacity', 1).slideDown();
                            startTimeout('#syncFailAlert');
                        }
                        function startTimeout(id) {
                            window.setTimeout(function() {
                                $(id).fadeTo(500, 0).slideUp(500, function(){
                                    //$(id).toggle();
                                    });
                            }, 5000);
                        }
                    })
                }
                else if(networkState == "none" || networkState == "unknown")
                {
                    $scope.loading = false;
                    alert('Please check your internet connection and try again');
                }
            }, 3000);
            // console.log("alloc input : "+localStorage.getItem('allocObject'));
            var allocURL="http://rocUAT.tmf.co.in/SageAppProj/resources/genericResource/allocationData";
            var  allocObject={
                // "UserId": results.rows.item(i).UserId,
                "UserId": localStorage.getItem('username'),
                "Token_Id": "123213sdjjfksjf"
            }
            console.log("allocObject "+JSON.stringify(allocObject));
            window.setTimeout(function () {
                if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi"|| networkState == "unknown") {
                    $http.post(allocURL, allocObject).
                    success(function (data) {
                        for(var i=0; i<data.AllocationList.length;i++){
                            var newMob_PK=GetCurrentDateTime.getMobilePK()+data.AllocationList[i].Lead.MobileNo;
                            data.AllocationList[i].MetaData.Mobile_PK=newMob_PK;
                            data.AllocationList[i].Lead.MeetingTime="2016-05-26 02:02";             
                        }
                        console.log("allocOutput "+JSON.stringify(data));
                        insertAllocatedData(data);
                        $scope.loading = false;
                        function startTimeout(id) {
                            window.setTimeout(function() {
                                $(id).fadeTo(500, 0).slideUp(500, function(){
                                    });
                            }, 5000);
                        }
                    })
                }
                else if(networkState == "none" || networkState == "unknown")
                {
                    $scope.loading = false;
                    alert('Please check your internet connection and try again');
                }
            }, 3000);
        }
        
        else if(networkState == "none" || networkState == "unknown")
        {
            $scope.loading = false;
            alert('Please check your internet connection and try again');
        }
    }
}]);


app.controller('registerController', ['$scope', function ($scope) {
    $scope.title="Register";
}]);

app.controller('forgotPasswordController', ['$scope', function ($scope) {
    $scope.title="Forgot Password";
}]);

app.service('FavoritesService', function (getFavorites) {
    var favArray = [];
    this.addFav = function (id) {
        favArray = getFavorites.get();

        var index = favArray.indexOf(id);
        if(index == -1) {
            favArray.push(id);
        } else {
            favArray.splice(index, 1);
        }
        window.localStorage['favorites'] = angular.toJson(favArray);
    }
});

app.service('getFavorites', function() {
    this.get = function() {
        var data = window.localStorage['favorites'];
        if(data) {
            return angular.fromJson("" + data + "");
        }
        return [];
    }
});

app.service('removeUniqueLeadData', function() {
    this.remove = function(arr) {
        var newArr = [];
        angular.forEach(arr, function(value, key) {
            var exists = false;
            angular.forEach(newArr, function(val2, key) {
                if(angular.equals(value.MetaData.Mobile_PK, val2.MetaData.Mobile_PK) || (angular.equals(value.Lead.Product, val2.Lead.Product) && angular.equals(value.Lead.MobileNo, val2.Lead.MobileNo))) {
                    exists = true
                };
            });
            if(exists == false) {
                newArr.push(value);
            }
        });
        return newArr;
    }
});

app.service('GetCurrentDateTime', function() {
    this.getCurrDate = function() {

        var currentdate = new Date();

        var day, month, year;
        day = ((currentdate.getDate()).toString().length == 1)? '0' + (currentdate.getDate()) : (currentdate.getDate());
        month = ((currentdate.getMonth()+1).toString().length < 2)? ('0' + (currentdate.getMonth()+1)) : (currentdate.getMonth()+1);
        year = currentdate.getFullYear();
        var datetime = year + "-" + month  + "-"
        + day;
        return datetime;
    }

    this.getCurrTime = function() {

        var currentdate = new Date();
        //console.log((currentdate.getHours()).toString().length);
        var time;
        var hours = ((currentdate.getHours()).toString().length == 1)? '0' + (currentdate.getHours()) : (currentdate.getHours());
        var minutes = ((currentdate.getMinutes()).toString().length == 1)? '0' + (currentdate.getMinutes()) : (currentdate.getMinutes());
        time = hours + ":" + minutes;

        return time;
    }

    this.getFormatedTime = function(time) {

        var currentdate = new Date(time);

        var time;
        time = currentdate.getHours() + ":"
        + currentdate.getMinutes() ;

        return time;
    }

    this.getMobilePK = function() {

        var mbPK = new Date();
        var mobilePK = mbPK.getDate() + ""
        + (mbPK.getMonth()+1) + ""
        + mbPK.getFullYear() + ""
        + mbPK.getHours() + ""
        + mbPK.getMinutes() + ""
        + mbPK.getSeconds();

        return mobilePK;
    }
});

app.service('generateToken', function(){
    this.makeToken = function() {
        var token = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 20; i++ )
            token += possible.charAt(Math.floor(Math.random() * possible.length));

        return token;
    }
});

app.filter('setDateFormat', function() {
    var originalDate, dateArr = [], formatedDate;
    return function(number) {
        originalDate = number;
        dateArr = originalDate.split('-');
        formatedDate = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
        return formatedDate;
    }
});

app.directive("repeatComplete", function(){
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (scope.$last) {
                scope.$eval(attrs.repeatComplete);
            }
        }
    };
});

//autocomplete directive
app.directive('typeahead', ['$compile', '$timeout', function($compile, $timeout) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            ngModel: '=',
            typeahead: '=',
            typeaheadCallback: "="
        },
        link: function(scope, elem, attrs) {
            var template = '<div class="dropdown"><ul class="dropdown-menu" style="display:block;" ng-hide="!ngModel.length || !filitered.length || selected"><li ng-repeat="item in filitered = (typeahead | filter:{label:ngModel} | limitTo:5) track by $index" ng-click="click(item)" style="cursor:pointer" ng-class="{active:$index==active}" ng-mouseenter="mouseenter($index)"><a>{{item.label}}</a></li></ul></div>'

            elem.bind('blur', function() {
                $timeout(function() {
                    scope.selected = true
                }, 100)
            })

            elem.bind('focus', function() {
                $timeout(function() {
                    scope.selected = false
                }, 100)
            })

            elem.bind("keydown", function($event) {
                if($event.keyCode == 38 && scope.active > 0) { // arrow up
                    scope.active--
                    scope.$digest()
                } else if($event.keyCode == 40 && scope.active < scope.filitered.length - 1) { // arrow down
                    scope.active++
                    scope.$digest()
                } else if($event.keyCode == 13) { // enter
                    scope.$apply(function() {
                        scope.click(scope.filitered[scope.active])
                    })
                }
                
            })

            scope.click = function(item) {
                scope.ngModel = item.label
                scope.selected = item
                if(scope.typeaheadCallback) {
                    scope.typeaheadCallback(item)
                }
                elem[0].blur()
            }

            scope.mouseenter = function($index) {
                scope.active = $index
            }

            scope.$watch('ngModel', function(input) {
                if(scope.selected && scope.selected.label == input) {
                    return
                }

                scope.active = 0
                

                // if we have an exact match and there is only one item in the list, automatically select it
                if(input && scope.filitered.length == 1 && scope.filitered[0].label.toLowerCase() == input.toLowerCase()) {
                    scope.click(scope.filitered[0])
                }
            })

            scope.selected = true
            elem.after($compile(template)(scope))
        }
    }
}]);

//loader directive
app.directive('loading', function () {
    return {
        restrict: 'E',
        replace:true,
        template: '<div class="loading"><div class="loadingBg"><img src="images/gifLoader.gif" width="40" height="40"/><span>Please wait...</span></div></div>',
        link: function (scope, element, attr) {
            scope.$watch('loading', function (val) {
                if (val)
                    $(element).show();
                else
                    $(element).hide();
            });
        }
    }
});

app.filter('unique', function() {
    return function(collection, keyname) {
        var output = [],
        keys = [];

        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if(keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});

app.directive("forceMaxlength", [function() {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            var limit = parseInt(attrs.mdMaxlength);
            angular.element(elem).on("keydown", function() {
                if (this.value.length >= limit) {
                    this.value = this.value.substr(0,limit);
                    if (event.keyCode == 8 || event.keyCode == 9)
                        return true;
                    else{
                        return false;
                    }
                }
            });
        }
    }
}]);

document.addEventListener("backbutton", function(e){
    e.stopImmediatePropagation();
    e.preventDefault();
    var r = confirm("Are you sure you want to exit the app?");
    if (r == true) {
        navigator.app.exitApp();
    }
}, false);
