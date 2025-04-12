var CONTAINER_ELEMENT = "hlist avatar-cards"
var UNFRIEND_BUTTONCLASS = "icon-alert"

function UPDATE_AVATAR_CARDS() {
	var CURRENT_CONTAINER = document.getElementsByClassName(CONTAINER_ELEMENT) && document.getElementsByClassName(CONTAINER_ELEMENT)[0]
	
	if (CURRENT_CONTAINER && document.URL.includes("!/friends")) {
		var AVATAR_CARDS = CURRENT_CONTAINER.getElementsByTagName("li");
		
		for (var i = 0; i < AVATAR_CARDS.length; ++i) {
			let CURRENT_AVATAR_CARD = AVATAR_CARDS[i]
			
			if (CURRENT_AVATAR_CARD) {
				var CARD_CONTAINER = CURRENT_AVATAR_CARD.childNodes[0]
				let USER_ID = CURRENT_AVATAR_CARD.id
				let CURRENT_AVATAR_CONTENT = CARD_CONTAINER.childNodes[0]
				
				if (CURRENT_AVATAR_CONTENT && CURRENT_AVATAR_CONTENT.childNodes && CURRENT_AVATAR_CONTENT.childNodes[1] && CARD_CONTAINER.className != "avatar-card-container disabled") {
					
					if (!(CARD_CONTAINER.getElementsByClassName("icon-alert") && CARD_CONTAINER.getElementsByClassName("icon-alert")[0])) {
						
						var ALERT_BUTTON = document.createElement('span')
						ALERT_BUTTON.className = "icon-alert"
						ALERT_BUTTON.style = "position: absolute; top: 0; right: 0%"
						
						CARD_CONTAINER.appendChild(ALERT_BUTTON)
						
						ALERT_BUTTON.addEventListener("click", function(){ //I would advise not messing with this
							$.post("https://friends.roblox.com/v1/users/" + USER_ID.toString() + "/unfriend",
							{
								targetUserId:USER_ID.toString()
							})
						})
					}
					
				}
				
			}
			
		}
	}
	
	setTimeout(UPDATE_AVATAR_CARDS,100)
}

UPDATE_AVATAR_CARDS()