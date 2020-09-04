const socket = io();

const inboxPeople = document.querySelector(".inboxPeople");
const inputField = document.querySelector(".messageFormInput");
const messageForm = document.querySelector(".messageForm");
const messageBox = document.querySelector(".messagesHistory");
const typing = document.querySelector(".typing");

let userName = "";

const newUserConnected = (user) => {
    userName = user || `User${Math.floor(Math.random() * 1000)}`;
    socket.emit("new user", userName);
    addToUsersBox(userName);
};

const addToUsersBox = (userName) => {
    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    }

    const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
    inboxPeople.innerHTML += userBox;
};

const addNewMessage = ({
    user,
    message
}) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("fr-FR", {
        hour: "numeric",
        minute: "numeric"
    });

    const receivedMsg = `
  <div class="incomingMessage messageShown">
    <div class="receivedMessage">
      <span class="messageAuthor">${user}</span>
      <p>${message}</p>
      <div class="messageInfo">
      
        <span class="timeDate">${formattedTime}</span>
      </div>
    </div>
    <div class="empty"></div>
  </div>`;

    const myMsg = `
  <div class="outgoingMessage messageShown">
  <div class="empty"></div>

    <div class="sentMessage">
    <span class="messageAuthor">${user}</span>

      <p>${message}</p>
      <div class="messageInfo">
      
        <span class="timeDate">${formattedTime}</span>
      </div>
    </div>
  </div>`;

    messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
    messageBox.lastChild.scrollIntoView();

};

// new user is created so we generate nickname and emit event
newUserConnected();

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputField.value) {
        return;
    }

    socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
    });

    inputField.value = "";
});

inputField.addEventListener("keyup", () => {
    socket.emit("typing", {
        isTyping: inputField.value.length > 0,
        nick: userName,
    });
});

socket.on("new user", function(data) {
    data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function(userName) {
    document.querySelector(`.${userName}-userlist`).remove();
});

socket.on("chat message", function(data) {
    addNewMessage({
        user: data.nick,
        message: data.message
    });
});


socket.on("typing", function(data) {
    const {
        isTyping,
        nick
    } = data;

    if (!isTyping) {
        typing.innerHTML = "";
        return;
    }
    typing.innerHTML = `<p>${nick} is typing...</p>`;
});