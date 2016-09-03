//Enter both players
//in console do rps.gameLogic('rock', 'paper')
//game works, just needed to figure out how to display the information
//differently for each player

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
	
	//Used for gameLogic
	this.choices = ['rock', 'paper', 'scissors'];
	this.player1Choice = '';
	this.player1ChoiceState = false;
	this.player2Choice = '';
	this.player2ChoiceState = false;

	//Saves message on form submit
	this.chatSubmit.addEventListener('click', this.saveMessage.bind(this));
	this.nameSubmit.addEventListener('click', this.setUser.bind(this));

	//Toggle for the button.
	var buttonTogglingHandler = this.toggleButton.bind(this);
	this.messageInput.addEventListener('keyup', buttonTogglingHandler);
	this.messageInput.addEventListener('change', buttonTogglingHandler);

	//Load database
	this.initFirebase();
	//Show messages in database to chat box
	this.loadMessages();
	
	//Don't really need this
	// this.connectedRef = this.database.ref(".info/connected");
	// this.connectedRef.on("value", function(snapshot) {
	// }.bind(this));

	//Current player record
	this.player_set_num = 1;
	this.wins = 0;
	this.losses = 0;
	this.ties = 0;

	//Opponent record
	this.other_player_num = 2;
	this.player2wins = 0;
	this.player2losses = 0;
	this.player2ties = 0;

	//Use players ref for record of each player
	this.playersRef = this.database.ref("/players");
	
	this.playersRef.on("value", function(snapshot) {
		console.log('player set num for getting wins and losses: ' + this.player_set_num);
		//check if player 1 or 2 exist
		this.player1ref = snapshot.child('1');
		this.player2ref = snapshot.child('2');
		this.player1set = this.player1ref.exists();
		this.player2set = this.player2ref.exists();

		this.current_player_ref = snapshot.child(this.player_set_num);
		this.opponent_player_ref = snapshot.child(this.other_player_num);
		//Set name, wins, losses, and ties from database
		this.name = this.current_player_ref.child('name').val();
		this.player1Choice = this.current_player_ref.child('choice').val();
		this.wins = this.current_player_ref.child('wins').val();
		this.losses = this.current_player_ref.child('losses').val();
		this.ties = this.current_player_ref.child('ties').val();
		console.log(this.name + ' record: wins-' + this.wins + ' losses-' + this.losses + ' ties-' + this.ties);

		//Set opponent name, wins, losses, and ties from database
		this.other_player_name = this.opponent_player_ref.child('name').val();
		this.player2Choice = this.opponent_player_ref.child('choice').val();
		this.player2wins = this.opponent_player_ref.child('wins').val();
		this.player2losses = this.opponent_player_ref.child('losses').val();
		this.player2ties = this.opponent_player_ref.child('ties').val();
		console.log(this.other_player_name + ' record: wins-' + this.player2wins + ' losses-' + this.player2losses + ' ties-' + this.player2ties);
	
		var player1col = document.getElementById('player1_column');
		var player2col = document.getElementById('player2_column');

		if (this.player1set && this.player2set) {
			console.log("Player 1 and Player 2 set.");
			player1col.innerHTML = snapshot.child('1').child('name').val();
			player2col.innerHTML = snapshot.child('2').child('name').val();
			if (!this.player1ChoiceState) {
				if(this.player_set_num === 1) {
					this.createBtns(player1col);
				}
			} else if (!this.player2ChoiceState) {
				if(this.player_set_num === 2) {
					this.createBtns(player2col);
				}
			}
		} else if (!this.player1set || !this.player2set) {
			console.log("This is working");
			if (!this.player1set) {
				$('#player1_column').html('Waiting for Player 1');
			} else {
				$('#player1_column').html(snapshot.child(1).child('name').val());
			}

			if (!this.player2set) {
				$('#player2_column').html('Waiting for Player 2');
			} else {
				$('#player2_column').html(snapshot.child(2).child('name').val());
			}
		}

	}.bind(this));

	//When current player is removed from onDisconnect
	this.playersRef.on('child_removed', function(snapshot) {
		//Display current user has disconnected in chat box
		this.messagesRef.push({
			name: snapshot.val().name,
			text: snapshot.val().name + ' has disconnected.'
		});
	}.bind(this));
}

RPS.prototype.createBtns = function (div) {
	for (var i = 0; i < this.choices.length; i++) {
		var btn = document.createElement('button');
		btn.setAttribute('value', this.choices[i]);
		btn.innerHTML = '<br>' + this.choices[i];

		btn.onclick = function(event) {
			// this.playerRef = this.database.ref("/players/" + this.player_set_num);
			var attribute = this.getAttribute('value');
			this.playerRef.set({
				choice: this.getAttribute('value')
			}).bind(rps);

			if (this.player_set_num === 1) {
				this.player1Choice = this.getAttribute('value');
				this.player1Choicestate = true;
			} else {
				this.player2Choice = this.getAttribute('value');
				this.player2Choicestate = true;
			}
				
			if(this.player1ChoiceState && this.player2ChoiceState) {
				this.gameLogic(this.player1Choice, this.player2Choice);
				this.player1ChoiceState = false;
				this.player2ChoiceState = false;
			}
		}
		div.appendChild(btn);
	}
}

// When no one is signed in, say waiting for players
// when one signs in, say waiting for other players
// when other player signs in, give player 1 choices, player 2 waits
// when player 1 picks choice, player 2 picks, cannot see player 1s choice
// when player 2 picks choice, show both choices, and outcome in middle
RPS.prototype.display = function() {
	var column = document.getElementById('player1_column');
	var column2 = document.getElementById('player2_column');
	var div = document.createElement('div');
	var div2 = document.createElement('div');
	var p = document.createElement('p');
	var p2 =document.createElement('p');
	p.innerHTML = this.name;
	p2.innerHTML = this.other_player_name;
	div.appendChild(p);
	this.createBtns(div);
	div2.appendChild(p2);
	this.createBtns(div2);
	
	
	column.appendChild(div);
	column2.appendChild(div2);
}


RPS.prototype.gameLogic = function(player1, player2) {
	//Rock, paper, scissors
	var player1choice = this.choices.indexOf(player1);
	var player2choice = this.choices.indexOf(player2);

	//Get opponent database reference to update record
	// this.other_player_ref = this.database.ref("/players/" + this.other_player_num);

	//Using choices array, if opponent choice is +1 in array index, then you lose
	if (player2choice == (player1choice+1)%this.choices.length) {
		console.log("You lose");
		this.playerRef.update({
			losses: ++this.losses
		});
		other_player_ref.update({
			wins: ++this.player2wins
		});
	} 
	//Using choices array, if opponent choice is -1 in array index, then you win
	else if (player2choice == (player1choice-1+this.choices.length)%this.choices.length) {
		console.log('reverse modulus math: ' + (player1choice-1+this.choices.length)%this.choices.length);
		console.log("You win!");
		this.playerRef.update({
			wins: ++this.wins
		});
		other_player_ref.update({
			losses: ++this.player2losses
		});
	} 
	//Using choices array, if opponent choice and your choice are ==, then tie
	else if (player1choice == player2choice) {
		console.log("Tie!");
		this.playerRef.update({
			ties: ++this.ties
		});
		other_player_ref.update({
			ties: ++this.player2ties
		});
	} 
	//Crazy outlier event, added this for no reason
	else {
		console.log("I don't know what happened");
	}
}

RPS.prototype.setUser = function(e) {
	//Prevent refresh on submit click
	e.preventDefault();

	//Get reference of current player
	if (this.player1set && this.player2set) {
		console.log("Cannot set up a reference. Two at a time.");
	} else {
		//If player 1 does not exist, set player as player 1
		if (!this.player1set) {
			this.player_set_num = 1;
			this.other_player_num = 2;
		} else {
			//If player 1 does exist, set player as player 2
			this.player_set_num = 2;
			this.other_player_num = 1;
		}
		
		//If they entered a name in textfield, initialize record in database
		if(this.nameInput.value) {
			this.playerRef = this.database.ref("/players/" + this.player_set_num);
			this.other_player_ref = this.database.ref("/players/" + this.other_player_num);
			//When the current player record initializes in database, set name for chat box
			this.playerRef.set({
				name: this.nameInput.value,
				choice: '',
				wins: 0,
				losses: 0,
				ties: 0
			});
			//onDisconnect, remove player record from database
			this.playerRef.onDisconnect().remove();
		}
		this.playerRef.on("value", function(snapshot) {
			console.log('getting name');
			this.name = snapshot.val().name;
			console.log(this.name);
		}.bind(this));
	}
}

//Sets up shortcuts to Firebase features and initiate firebase auth.
RPS.prototype.initFirebase = function() {
	//Shortcuts to Firebase SDK features.
	this.database = firebase.database();
}

//Loads messages in database, and sets message to be displayed
RPS.prototype.loadMessages = function() {
	//Reference to the /messages/ database path.
	this.messagesRef = this.database.ref('chat');
	//Make sure we remove all previous listeners.
	this.messagesRef.off();

	//Gets the name and text to show
	//key isn't used
	var setMessage =  function(snapshot) {
		var val = snapshot.val();
		//Shows message in chat box
		this.displayMessage(snapshot.key, val.name, val.text);
	}.bind(this);

	//Whenever child_added or child_changed to chat database
	//which means on load or when someone enters a message in chat
	//display last 12 messages in chat box
	this.messagesRef.limitToLast(30).on('child_added', setMessage);
	this.messagesRef.limitToLast(30).on('child_changed', setMessage);
}

//Enters message into database
RPS.prototype.saveMessage = function(e) {
	e.preventDefault();
	//If a message is entered in message box
	if(this.messageInput.value) {
		//Add a new message entry to the Firebase Database.
		if(!this.name)
			this.name = "Random User"
		this.messagesRef.push({
			name: this.name,
			text: this.messageInput.value,
		}).then(function() {
			//Clear message text field.
			this.messageInput.value = '';
			//Disable send button
			this.toggleButton();
		}.bind(this)).catch(function(error) {
			console.error('Error Error');
		})
	}
}

//Display message with specific format in chat box
RPS.prototype.displayMessage = function(key, name, text) {
	if (text) {
		this.chatDisplay.innerHTML += name + ": " + text + "\r"
		var textarea = document.getElementById('chat_display');
		textarea.scrollTop = textarea.scrollHeight;
	}
}

//Disable or enable button depending on if text is inside message box
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