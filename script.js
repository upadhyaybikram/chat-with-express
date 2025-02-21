const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const messageInput = document.querySelector(".message-input");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel")
const chatBody = document.querySelector(".chat-body");
const sendMessage = document.querySelector("#send-message");


const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null,
    }
}

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

//this will create a dynamic container with class message and return it 
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;

}

//create or generate bot response using Gemini API
const createBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    try {
        const response = await fetch("http://localhost:5001/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userData.message, file: userData.file.data ? userData.file: null }),
        })

        const data = await response.json();
        if(!response.ok) throw new Error(data.error || "Error fetching response");

        const apiResponseText = data.candidates[0].content.parts[0].text;
        messageElement.innerText = apiResponseText;
    } catch (error) {
        messageElement.innerText = error.message; 
        messageElement.style.color = "#ff0000";

    } finally {
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});


    }



    // chatHistory.push({
    //     role: "user",
    //     parts: [{ text: userData.message}, ...(userData.file.data ? [{ inline_data: userData.file }]: [])],
    // });

    // const requestOptions = {
    //     method: "POST", 
    //     headers: { "Content-type": "application/json" },
    //     body: JSON.stringify({
    //         contents: chatHistory,
    //     })
    // }

    // //create an api request
    // try {
    //     const response = await fetch (API_URL, requestOptions); 
    //     const data = await response.json();
    //     if(!response.ok) throw new Error(data.error.message);
    //    // console.log("data", data);
       
    
    //     const apiResponseText = data.candidates[0].content.parts[0].text;
    //     messageElement.innerText = apiResponseText;
    
    //     //add bot response to chat history 
    //     chatHistory.push({
    //         role: "model",
    //         parts: [ { text: apiResponseText }],
    //     })
    // } catch (error) {
    //     console.log("Error",error);; 
    //     messageElement.innerText = error.message; 
    //     messageElement.style.color = "#ff0000";

    // } finally {
    //     //resest user's file data, remove thinking indicator and scroll chat to bottom 
    //     userData.file = {};
    //     incomingMessageDiv.classList.remove("thinking");
    //     chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});
    // }
   

}



//get the message input 
const handleInputMessage = (e) => {
    e.preventDefault();
    //add message input to userData message 
    userData.message = messageInput.value.trim();
    messageInput.value = "";

    messageInput.dispatchEvent(new Event("input")); //triggers an input event to update the UI 
    fileUploadWrapper.classList.remove("file-uploaded");

    const messageContent = `<div class="message-text"></div>
    ${userData.file.data ? `<img src = "data:${userData.file.mime_type};base64, ${userData.file.data}" class ="attachment"  />`:""}`;

    //create a message element with dynamic classes and return it 
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").innerHTML = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});

    setTimeout(() => {
        const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50"
                    viewBox="0 0 1024 1024">
                    <path
                        d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z">
                    </path>
                </svg>

                <div class="message-text">
                    <div class="thinking-indicator">
                       <div class="dot"></div>
                       <div class="dot"></div>
                       <div class="dot"></div>
                    </div>
                </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv); 
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});  
         //function to call gemini api  
         createBotResponse(incomingMessageDiv);

    }, 600)
}


//handle enter key for sending message 
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && !e.shiftKey && userMessage && window.innerWidth > 768 ) {
        console.log(userMessage);
        handleInputMessage(e);
    }
})


fileInput.addEventListener("change", () => {
    console.log("File selected", fileInput.files);
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    console.log(reader, "Reader");

    reader.onload = (e) => {
        fileInput.value = "";
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        //extract the base64 encoded string and add it to userData's data 
        const base64String = e.target.result.split(",")[1];

        //now store this base64string in userData
        userData.file = {
            data: base64String,
            mime_type: file.type,
        }
    };

    reader.readAsDataURL(file);

})

fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
})

//adjust input field height dynamically 
messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
})


//Initialise emoji picker and handle emoji selection 
const picker = new EmojiMart.Picker ({
    theme: "light",
    previewPosition: "none",
    skinTonePosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end} = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if (e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }
})

document.querySelector(".chat-form").appendChild(picker);
//add event listener on attach file icon which on click makes the file input clickable 

document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
sendMessage.addEventListener("click", (e) => handleInputMessage(e));
// Toggler event listener 
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

//keyboard arrwon down event listener 
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));





