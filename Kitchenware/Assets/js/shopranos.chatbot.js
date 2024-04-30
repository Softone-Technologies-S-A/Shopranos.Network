// change this to keep more messages
const MAX_CHAT_HISTORY_LENGTHH = 30;
const SESSION_TTL = 2 * 60 * 60 * 1000;

const linkStylesheet = document.createElement('link');
linkStylesheet.rel = 'stylesheet';
linkStylesheet.href = '../css/shopranos.chatbot.css';
linkStylesheet.type = 'type="text/css"';

// Create the <meta> element for viewport
const metaViewport = document.createElement('meta');
metaViewport.name = 'viewport';
metaViewport.content = 'width=device-width, initial-scale=1.0';

// Create the Google Fonts links for icons
const linkGoogleFonts1 = document.createElement('link');
linkGoogleFonts1.rel = 'stylesheet';
linkGoogleFonts1.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0';

const linkGoogleFonts2 = document.createElement('link');
linkGoogleFonts2.rel = 'stylesheet';
linkGoogleFonts2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,1,0';

let assistantIcon;
let chatProfile;

async function getVirtualAssistant() {
    const API_URL = "/api/ai/chat/active/profile";
    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    }
    await fetch(API_URL, requestOptions).then(async res => {
        if (res.status === 200) {
            data = await res.json();
            if (data)
                chatProfile = data.id;
            if (data.mediaItem && data.mediaItem.link) {
                const icon = document.createElement('img');
                icon.src = data.mediaItem.link;
                icon.alt = "image";
                icon.style = "width: 34px; height: 34px;"
                assistantIcon = document.createElement('span');
                assistantIcon.className = "span-profile-icon";
                assistantIcon.appendChild(icon);
                li.appendChild(assistantIcon);
            }
            else {

                const span3 = document.createElement('span');
                span3.className = 'material-symbols-outlined';
                span3.textContent = 'smart_toy';
                assistantIcon = span3;
                li.appendChild(span3);
            }
            if (data && data.name) {
                const assistantName = document.createElement('h2');
                assistantName.textContent = data.name;
                assistantName.className = "mb-0";
                header.firstChild.remove();
                header.append(assistantName);
            }
            if (data && data.greetingsMessage) {
                p.innerHTML = data.greetingsMessage;
            }
            else
                p.innerHTML = 'Hi there 👋<br>How can I help you today?';
        }
        else {
            const span3 = document.createElement('span');
            span3.className = 'material-symbols-outlined';
            span3.textContent = 'smart_toy';
            assistantIcon = span3;
            li.appendChild(span3);
            p.innerHTML = 'Hi there 👋<br>How can I help you today?';
        }
    }).catch((err) => {
        console.error('Fetch error:', err);
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    })
}

// Get the <head> element of the existing HTML document
const head = document.head;
// Append the created elements to the <head> element
head.appendChild(linkStylesheet);
head.appendChild(metaViewport);
head.appendChild(linkGoogleFonts1);
head.appendChild(linkGoogleFonts2);
// head.appendChild(chatcss);

// Create a <button> element with class "chatbot-toggler"
const chatbotButton = document.createElement('button');
chatbotButton.className = 'chatbot-toggler';

// Create the first <span> element with class "material-symbols-rounded"
const span1 = document.createElement('span');
span1.className = 'material-symbols-rounded';
span1.textContent = 'mode_comment';

// Create the second <span> element with class "material-symbols-outlined"
const span2 = document.createElement('span');
span2.className = 'material-symbols-outlined';
span2.textContent = 'close';

// Retrieve history
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

// Append the spans to the button
chatbotButton.appendChild(span1);
chatbotButton.appendChild(span2);

// Create a <div> element with class "chatbot"
const chatbotDiv = document.createElement('div');
chatbotDiv.className = 'chatbot';
//chatbotDiv.className = this._company.name;


// Create the header
const header = document.createElement('header');

// Create an <h2> element with the text "Chatbot"
const h2 = document.createElement('h2');
//h2.textContent = 'Chatbot';
h2.textContent = app.config.globalProperties._company.name;


// Create a <span> element with class "close-btn material-symbols-outlined"
const closeBtn = document.createElement('span');
closeBtn.className = 'close-btn material-symbols-outlined';
closeBtn.textContent = 'close';

// Append the elements to the header
header.appendChild(h2);
header.appendChild(closeBtn);

// Create a <ul> element with class "chatbox"
const ul = document.createElement('ul');
ul.className = 'chatbox';

// Create a <li> element with class "chat incoming"
const li = document.createElement('li');
li.className = 'chat incoming';

// Create a <span> element with class "material-symbols-outlined"


// Create a <p> element with the text content
const p = document.createElement('p');

// Append the elements to the <li>
let chatbotToggler;
let chatbox;
let chatInput;
let sendChatBtn;
let inputInitHeight;


let userMessage = null; // Variable to store user's message

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    //let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    let chatContent;
    if (className === "outgoing") {
        chatContent = `<p></p>`;
        chatLi.innerHTML = chatContent;
    }
    else {
        chatContent = assistantIcon;
        chatLi.innerHTML = chatContent.outerHTML + "<p></p>";
    }

    const test = chatLi.querySelector("p")
    test.textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = (chatElement) => {

    if (localStorage.sessionToken) {
        // var object = {value: uuidv4(), timestamp: new Date().getTime()}
        // localStorage.setItem("sessionToken", JSON.stringify(object));
        var object = JSON.parse(localStorage.getItem("sessionToken")),
            dateString = object.timestamp.toString(),
            now = new Date().getTime().toString();
        if (dateString < now) {
            var object = { value: uuidv4(), timestamp: new Date().getTime() + SESSION_TTL }
            localStorage.setItem("sessionToken", JSON.stringify(object));
        }
    }
    else {
        var object = { value: uuidv4(), timestamp: new Date().getTime() + SESSION_TTL }
        localStorage.setItem("sessionToken", JSON.stringify(object));
    }

    const API_URL = "/api/ai/chat?sessionToken=";
    const messageElement = chatElement.querySelector("p");
    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            question: userMessage,
            chatHistory: chatHistory?.slice(-6) || [],
            chatProfileId: chatProfile
        })
    }
    chatHistory.push({ "type": "user", "message": userMessage });

    var token = JSON.parse(localStorage.getItem("sessionToken"));
    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL + token.value, requestOptions).then(async res => {
        data = await res.json();
        messageElement.textContent = data.chatResponse.trim();
        var lastUserMessage = chatHistory.pop();
        chatHistory.push({ ...lastUserMessage, "translatedMessage": data.translatedQuestion });
        chatHistory.push({ "type": "assistant", "message": data.chatResponse.trim(), "translatedMessage": data.translatedResponse });
    }).catch(() => {
        chatHistory.pop();
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => {
        if (chatHistory.length > MAX_CHAT_HISTORY_LENGTHH) {
            chatHistory = chatHistory.slice(-MAX_CHAT_HISTORY_LENGTHH);
        }
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        chatbox.scrollTo(0, chatbox.scrollHeight)
    });
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if (!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

const loadChatHistory = () => {
    if (chatHistory && chatHistory.length > 0) {
        chatHistory.forEach((message) => {
            if (message.type == "assistant") {
                const chatLi = createChatLi(message.message, "incoming");
                chatbox.appendChild(chatLi);
            }
            else {
                chatbox.appendChild(createChatLi(message.message, "outgoing"));
            }
        });
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

getVirtualAssistant().then(() => {

    //li.appendChild(span3);
    li.appendChild(p);
    ul.appendChild(li);
    const chatInputDiv = document.createElement('div');
    chatInputDiv.className = 'chat-input';

    // Create a <textarea> element with placeholder and attributes
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Enter a message...';
    textarea.spellcheck = false;
    textarea.required = true;

    // Create a <span> element with id "send-btn" and class "material-symbols-rounded"
    const sendBtnSpan = document.createElement('span');
    sendBtnSpan.id = 'send-btn';
    sendBtnSpan.className = 'material-symbols-rounded';
    sendBtnSpan.textContent = 'send';

    // Append the textarea and send button to the chat input div
    chatInputDiv.appendChild(textarea);
    chatInputDiv.appendChild(sendBtnSpan);

    // Append the header, ul, and chat input div to the chatbot div
    chatbotDiv.appendChild(header);
    chatbotDiv.appendChild(ul);
    chatbotDiv.appendChild(chatInputDiv);

    // Get the existing <body> element
    const body = document.body;

    // Append the button and chatbot div to the body
    body.appendChild(chatbotButton);
    body.appendChild(chatbotDiv);

    chatbotToggler = document.querySelector(".chatbot-toggler");
    //const closeBtn = document.querySelector(".close-btn");
    chatbox = document.querySelector(".chatbox");
    chatInput = document.querySelector(".chat-input textarea");
    sendChatBtn = document.querySelector(".chat-input span");
    inputInitHeight = chatInput.scrollHeight;
    loadChatHistory();
    chatInput.addEventListener("input", () => {
        // Adjust the height of the input textarea based on its content
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        // If Enter key is pressed without Shift key and the window 
        // width is greater than 800px, handle the chat
        if (e.key === "Enter" && !e.shiftKey) { //&& window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });
    sendChatBtn.addEventListener("click", () => { handleChat(); });
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

}
)