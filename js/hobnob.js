// Initialize your app
var myApp = new Framework7();
var access_token;
var pushNotification;

var options = {};
var just_logged_in = false;

var server_url = 'http://hobnobapp.herokuapp.com';
//var server_url = 'http://0.0.0.0:3000';

// Export selectors engine
var $$ = Framework7.$;

var mainView = myApp.addView('.main-view', {
	dynamicNavbar: true
});

// Device ready handler
$(document).on('deviceready', function() {
	database.init();
	checkAccessToken();
	checkOptions();
	FastClick.attach(document.body);
});

// Page init handlers
$$(document).on('pageInit', function (e) {

  var page = e.detail.page;

  if (page.name == 'login') {
    initLoginPage();
  }
  if (page.name == 'home') {
    initHomePage();
  }
  if (page.name == 'contacts') {
    loadContacts();
  }
  if (page.name == 'chat') {
    initChat(page.query['linkedin_id']);
  }
  if (page.name == 'profile') {
    initProfile();
  }
  if (page.name == "settings") {
	initSettings();
	loadProfileHeading();
  }
});

function checkAccessToken() {
	database.sql_query("SELECT value FROM OPTIONS WHERE key = 'access_token'", setAccessTokenAndHello, wrongAccessToken);
}

function checkOptions() {
	database.fetch_option('distance', 10);
	database.fetch_option('selected_tag', '');
}

function setAccessTokenAndHello(tx, res) {
	access_token = res.rows.item(0).value;
	$.get(server_url + "/hello?access_token=" + access_token).done(function(res) {
		options['user_picture_url'] = res['user']['picture_url'];
		options['user_name'] = res['user']['first_name'] + " " + res['user']['last_name'];
		registerPushNotification();
		initHomePage();
	}).fail(function(res, textStatus, errorThrown) {
		mainView.loadPage('login.html');
	});
}

function initLoginPage() {
	var $loginButton = $('#login a');
    var $loginStatus = $('#status');

    $loginButton.on('click', function() {
		linkedinapi.authorize().done(function(data) {
			access_token = data.access_token;
			database.save_option('access_token', access_token);
			checkAccessToken();
			mainView.loadPage('index.html');
			just_logged_in = true;
		}).fail(function(data) {
			$loginStatus.html(data);
		});
	});	
}

function wrongAccessToken() {
	mainView.loadPage("login.html");
}

function startPreload(page, text) {
	$('div[data-page=' + page + ']').children().hide();
	$('div[data-page=' + page + ']').prepend('<div class="loader"> <div class="spinner2"><div class="double-bounce1"></div><div class="double-bounce2"></div></div><span>' + text + '</span></div>');
}

function stopPreload(page) {
	$('div[data-page=' + page + ']').children().show();
	$('div[data-page=' + page + ']').find('.loader').remove();
}
