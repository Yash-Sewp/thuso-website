var firebaseConfig = {
	apiKey: "AIzaSyB6Q2vob1ZRGkqHRADaalb9z_FkUo4Isuk",
	authDomain: "thuso-chat.firebaseapp.com",
	databaseURL: "https://thuso-chat-default-rtdb.firebaseio.com",
	projectId: "thuso-chat",
	storageBucket: "thuso-chat.appspot.com",
	messagingSenderId: "845581224715",
	appId: "1:845581224715:web:b3f21fe386f894e325300e",
	measurementId: "G-HW2QD5TRD2"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

$(document).ready(function () {

	var $status = $('.slider-dots');
	var $slider = $('.partner-slider');

	$slider.on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
		//currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
		var i = (currentSlide ? currentSlide : 0) + 1;
		$status.text(i + '/' + slick.slideCount);
	});

	$slider.slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		infinite: false,
		prevArrow: '<button class="slide-arrow prev-arrow"></button>',
		nextArrow: '<button class="slide-arrow next-arrow"></button>',
		responsive: [
			{
				breakpoint: 480,
				settings: {
					dots: true,
					arrows: false,
				}
			}
		]
	});

	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			var uid = user.uid;
			if (uid !== null) {
				$('#loginModal').modal('hide');
				// getChatUsers();
			} else {
				$('#loginModal').modal();
			}
		}
	});

	var db = firebase.database();
	var ref = db.ref('users');
	// let email = 'admin@gmail.com';
	// let password = 'admin123';

	if ($(location).attr('href') === '/thuso-conversations.html') {
		let user = firebase.auth().currentUser;
		if (user !== null) {
		} else {
			$('#loginModal').modal();
		}
	}

	$('.start-conversation-btn').on('click', function (e) {
		e.preventDefault();
		let username = $('#username-input').val();
		if (username !== '') {
			console.log('Close this modal and jump to convo modal');
			sessionStorage.setItem('username', username)
			$('#usernameInput input').val('');
			$('#usernameInput').modal('hide');
			$('#conversationBox').modal();
		} else {
			console.log('Enter something');
			$('#usernameInput .text-muted').css('display', 'block');
		}
		setTimeout(() => {
			$('#usernameInput .text-muted').css('display', 'none');
		}, 2000);
	});

	$('.send-btn').on('click', function (e) {
		e.preventDefault();
		let userMsg = $('#conversationBox textarea').val();
		let userName = sessionStorage.getItem('username');
		if (userMsg !== '') {
			console.log('Post this message and append it above');
			const msg = {
				userName,
				userMsg
			};
			sendMessage(msg);
			// getStartConvoMsg(msg);
			$('#conversationBox textarea').val('');
		} else {
			console.log('You can\'t send a blank message.');
		}
	});

	$('.login-btn').on('click', function () {
		let email = $('#userEmail').val();
		let password = $('#userPassword').val();

		if (email !== '' && password !== '') {
			userCreds = { email, password };
			signInWithEmail(userCreds);
		}
	});

	$('.admin-send-btn').on('click', function (e) {
		e.preventDefault();
		let selectUser = $('.user-row-container').find('.active').attr('data-id');
		if (selectUser !== undefined) {
			let adminMessage = $('textarea#adminMessage').val();
			if (adminMessage !== '') {
				firebase.database().ref('users/' + selectUser + '/reply').push({
					message: adminMessage
				});
				$('.previous-chat-container').append('<div class="message-container admin-message">' + adminMessage + '</div>')
				$('textarea#adminMessage').val('');
			} else {
				alert('Can\'t send blank message.')
			}
		} else {
			$('.user-message-container .text-muted').css('display', 'block');
		}
	});

	$('#loginModal').on('hidden.bs.modal', function (e) {
		let user = firebase.auth().currentUser;
		if (user !== null) { } else { window.location.href = 'index.html'; }
	});

	function sendMessage(msg) {
		var msgRef = ref.child(msg.userName);
		var newMessageRef = msgRef.push();
		newMessageRef.set({ message: msg.userMsg });
	}

	function getChatUsers() {
		$('.user-row-container ul li').remove();
		var users = firebase.database().ref();
		users.once('value', function (snapshot) {
			if (snapshot.exists()) {
				const data = snapshot.val();
				console.log(data.users);
				_.each(data.users, function (item, index) {
					$('.user-row-container ul').append('<li onClick="showChat($(this))" data-id="' + index + '" >' + index + '</li>');
				});
			} else {
				console.log('No data');
				$('.user-message-container .empty-chats').css('display', 'block');
			}
		});
	}

	function signInWithEmail(userCreds) {
		firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
			.then(() => {
				return firebase.auth().signInWithEmailAndPassword(userCreds.email, userCreds.password);
			})
			.catch((error) => {
				var errorCode = error.code;
				var errorMessage = error.message;
				console.log('Your creds is incorrect');
			});
	};

	var checkChange = firebase.database().ref();
	checkChange.on('value', function(snapshot) {
		if (snapshot.exists()) {
			getChatUsers();
			updateStartConvo();
		}
	});

});

// outside Jquery 
function updateStartConvo() {
	$('#conversationBox .modal-body div').remove();
	var currentuser = firebase.database().ref('users/' + sessionStorage.getItem('username'));
	currentuser.on('value', (snapshot) => {
		const userMessages = snapshot.val();
		_.each(userMessages, function (item, index) {
			if (index !== 'reply') {
				$('#conversationBox .modal-body').append('<div class="message-container user-message">' + item.message + '</div>');
			} else {
				_.each(item, function (admsg, index) {
					$('#conversationBox .modal-body').append('<div class="message-container admin-message">' + admsg.message + '</div>')
				})
			}
		});
	});
}

function showChat(data) {
	if (data.hasClass('active')) { data.addClass('active') } else { $('.user-row-container ul li').removeClass('active'); data.addClass('active'); }
	$('.previous-chat-container div').remove();
	let selectedChat = data.attr('data-id');
	var users = firebase.database().ref();
	users.once('value', (snapshot) => {
		const userMessages = snapshot.val();
		_.each(userMessages.users, function (item, index) {
			if (selectedChat === index) {
				_.each(item, function (msg, index) {
					if (index !== 'reply') {
						$('.previous-chat-container').append('<div class="message-container user-message">' + msg.message + '</div>')
					} else {
						_.each(msg, function (admsg, index) {
							$('.previous-chat-container').append('<div class="message-container admin-message">' + admsg.message + '</div>')
						})
					}
				})
			}
		});
	});
}
