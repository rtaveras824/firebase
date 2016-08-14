// Initialize Firebase
var config = {
	apiKey: "AIzaSyAzmJGpa-Fp2Z4cO3f26TSknz3vhqNVDxM",
	authDomain: "rock-paper-scissors-game-b79e6.firebaseapp.com",
	databaseURL: "https://rock-paper-scissors-game-b79e6.firebaseio.com",
	storageBucket: "rock-paper-scissors-game-b79e6.appspot.com",
};

firebase.initializeApp(config);

function RPS() {

	//Shortcuts to DOM Elements
	this.nameInput = document.getElementById('name');
	this.nameSubmit = document.getElementById('name_submit');
	this.player1column = document.getElementById('player1column');
	this.centerColumn = document.getElementById('center_column');
	this.player2column = document.getElementById('player2column');
	this.chatDisplay = document.getElementById('chat_display');
	this.messageInput = document.getElementById('message');
	this.chatSubmit = document.getElementById('chat_submit');

	//Saves message on form submit
	this.chatSubmit.addEventListener('click', this.saveMessage.bind(this));
	this.nameSubmit.addEventListener('click', this.setUser.bind(this));

	//Toggle for the button.
	var buttonTogglingHandler = this.toggleButton.bind(this);
	this.messageInput.addEventListener('keyup', buttonTogglingHandler);
	this.messageInput.addEventListener('change', buttonTogglingHandler);

	this.initFirebase();
	this.loadMessages();

	this.connectionsRef = this.database.ref("/connections");
	this.connectedRef = this.database.ref(".info/connected");
	this.connectedRef.on("value", function(snapshot) {
		var con = this.connectionsRef.push(true);
		if(snapshot.val()) {
			con.onDisconnect().remove();
		}
	}.bind(this));

	this.num = 1;

	this.count = this.database.ref("/count");
	this.count.on("value", function(snapshot) {
		this.num = snapshot.val().num;
	}.bind(this));
}

RPS.prototype.setUser = function(e) {
	e.preventDefault();
	
	if(this.num < 3) {
		this.playersRef = this.database.ref("/players/" + this.num);
		if(this.nameInput.value) {
			this.playersRef.set({
				name: this.nameInput.value,
				wins: 0,
				losses: 0
			});
		}
		this.playersRef.on("value", function(snapshot) {
			this.name = snapshot.val().name;
		}.bind(this));
		console.log(this.num);
		this.count.set({
			num: ++this.num
		})
	}
}

//Sets up shortcuts to Firebase features and initiate firebase auth.
RPS.prototype.initFirebase = function() {
	//Shortcuts to Firebase SDK features.
	this.database = firebase.database();
}

RPS.prototype.loadMessages = function() {
	//Reference to the /messages/ database path.
	this.messagesRef = this.database.ref('chat');
	//Make sure we remove all previous listeners.
	this.messagesRef.off();

	var setMessage =  function(snapshot) {
		var val = snapshot.val();
		this.displayMessage(snapshot.key, val.name, val.text);
	}.bind(this);

	this.messagesRef.limitToLast(12).on('child_added', setMessage);
	this.messagesRef.limitToLast(12).on('child_changed', setMessage);
}

RPS.prototype.saveMessage = function(e) {
	console.log("help");
	e.preventDefault();
	if(this.messageInput.value) {
		console.log("me");
		// var user = //current user
		//Add a new message entry to the Firebase Database.
		if(!this.name)
			this.name = "Random User"
		this.messagesRef.push({
			name: this.name,
			text: this.messageInput.value,
		}).then(function() {
			console.log("please");
			//Clear message text field and SEND button state.
			this.messageInput.value = '';
			this.toggleButton();
		}.bind(this)).catch(function(error) {
			console.error('Error Error');
		})
	}
}

RPS.prototype.displayMessage = function(key, name, text) {
	if (text) {
		this.chatDisplay.innerHTML += name + ": " + text + "\r"
	}
}


RPS.prototype.toggleButton = function() {
	console.log('ok');
	if (this.messageInput.value) {
		this.chatSubmit.removeAttribute('disabled');
	} else {
		this.chatSubmit.setAttribute('disabled', 'true');
	}
}

window.onload = function() {
	window.rps = new RPS();
}