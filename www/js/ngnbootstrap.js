/*
 * Licensed Materials - Property of IBM
 * 5725-I43 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

var ngn = {};

// JZ: replace the "WL.Logger" reference with an interface
/////////////////////// hack start
var WL = {};
WL.Logger = {
    error: function(arg1, arg2) {
        console.error(arg1, arg2);
    },
    debug: function(arg1, arg2) {
        console.debug(arg1, arg2);
    }
};
/////////////////////// hack end


var vars = window.location.search.substring(1).split('&');
for(var i = 0; i < vars.length; i++){
    var pair = vars[i].split('=');
   
    switch(pair[0]){
       case 'app':
           ngn.app = decodeURIComponent(pair[1]);
           break;
    }
}

ngn.app = ngn.app || './application.json';

var mixinArray = function(arrayHolder, anotherArrayHolder, arrayName) {
	var i = 0, length = 0;
	var id = null;
	var ids = {};
	if (!arrayHolder || !anotherArrayHolder) {
		return;
	}
	
	if (!arrayHolder[arrayName]) {
		arrayHolder[arrayName] = [];
	}
	var array = arrayHolder[arrayName];
	var anotherArray = anotherArrayHolder[arrayName];
		
	if (!anotherArray) {
		return;
	}
	
	length = array.length;
	for (i = 0; i < length; i++) {
		id = array[i].id;
		if (!id) {
			continue;
		}
		if (ids[id]) {
			console.warn("duplicate elements discovered for id " + id);
		}
		ids[id] = true;		
	}
	
	length = anotherArray.length;
	for (i = 0; i < length; i++) {	
		array.push(anotherArray[i]);
		
		id = anotherArray[i].id;
		if (!id) {
			continue;
		}
		if (ids[id]) {
			console.warn("collision of mixin with id " + id);
		}
		ids[id] = true;
	}
	
};

var mixinApp = function(app, anotherApp) {
	mixinArray(app.application, anotherApp.application, 'headingActions');
	mixinArray(app, anotherApp, 'events');
	mixinArray(app, anotherApp, 'data');
	mixinArray(app, anotherApp, 'views');
};


var dojoConfig = (function(){
    var base = location.href.split('/');
    base.pop();
    base = base.join('/');
    
    var mblUserAgent = undefined;
    if(location.pathname.indexOf('/android/') > -1){
        mblUserAgent = 'Android';
    }
    else{
        var ua = navigator.userAgent;
        if(ua.match(new RegExp('Android 3')) || ua.match(new RegExp('Android 4'))){
            mblUserAgent = 'Android'; // override holodark theme
        }
    }
    
    return{
        baseUrl: base,
        async: true,
        parseOnLoad: false,
        isDebug: true,
        mblUserAgent: mblUserAgent,
        locale: "en-us",
        packages: [
            { name: 'ngn', location: 'js/ngn'},
            { name: 'dojo', location: 'js/dojo'}
        ]
    };
})();

function ngnInit() {
    require(['dojo/has', 'ngn/util/UtilsFactory!', 'dojo/dom-class', 'dojo/_base/window'], function(has, util, domClass, win) {
        var isAndroid = util.isAndroid();
        var isMobilePhone = util.isMobilePhone();
        has.add('isAndroidPhone', isAndroid && isMobilePhone);
        has.add('isiPhone', !isAndroid && isMobilePhone);
        has.add('isngnDesktop', !isMobilePhone);

        if(!isAndroid){
            domClass.add(win.doc.documentElement, 'ios_theme');
        }
        
        domClass.add(win.doc.documentElement, 'nitrogen');

        if (!isMobilePhone) {
            domClass.add(win.doc.body, 'dbootstrap');
        }

        cssInit();
    });
}

function cssInit() {
    require(
        [
            'dojo/has!isAndroidPhone?ngn/controller/androidCssLoader',
            'dojo/has!isiPhone?ngn/controller/iosCssLoader',
            'dojo/has!isngnDesktop?ngn/controller/desktopCssLoader',
            'ngn/controller/defs',
            'ngn/nitrogen'
        ],
        function() {
            dojoInit();
        })    
}

function dojoInit(){
    require(
        [
            'dojox/mobile',
            'dojo/json',
            'dojo/_base/window',
            'ngn/controller/main',
            'ngn/view/ViewFetcher',
            'dojo/text!'+ngn.app,
            'dojo/text!./application_system.json',
            'dojo/text!./view_system.html',
            'ngn/base',
            'dojo/domReady!'
        ],
        function(mobile, json, win, Controller, ViewFetcher, appJson, systemAppJson, systemHTML){
            try{
                var app = json.parse(appJson);
                var systemApp = json.parse(systemAppJson);
                mixinApp(app, systemApp);
                app.url = ngn.app;
                
                var controller = new Controller();
                var viewFetcher = new ViewFetcher(app.url, systemHTML);
                viewFetcher.fetch(function(response) {
                    var status = response.status;
                    var message = response.message;
                    if(status) {                   
                        controller.init(app, response.html, function(result){
                            status = result.status;
                            message = result.message;
                            if(status){
                                controller.startup();
                            }
                        });
                    }
                    if(!status){
                        console.log('Error: '+ message);
                        alert('Error: '+ message);
                    }                        
                });
            }
            catch(err){
                console.log('Error: '+err.message);
                alert('Error: '+err.message);
            }
        }
    );
}
