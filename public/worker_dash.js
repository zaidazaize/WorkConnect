const socket = io()

const form = document.getElementById("message-form")
// const message = document.getElementById("message")
const messagecontainer = document.getElementById("message-container")
const messageinp = document.getElementById("messageinp")

function appendMessage(message, position, color){
        messageelement = document.createElement('div')
        messageelement.innerText = message
        messageelement.classList.add("message")
        messageelement.classList.add(position)
        messageelement.style.background = color
        
        messagecontainer.append(messageelement)
        // element.scrollTop = element.scrollHeight
        messagecontainer.scrollTop = messagecontainer.scrollHeight
}

form.addEventListener("submit", (e)=>{
    e.preventDefault()
    if(messageinp.value != ""){
        appendMessage(`You: ${messageinp.value}`, "right", "lightblue")
        socket.emit('send', messageinp.value)
        messageinp.value = ""
    }
})

const username = prompt("Enter your name: ");

socket.emit("new-user-joined", username)

socket.on("recieve", data =>{
    appendMessage(`${data.name}: ${data.message}`, "left", "cyan")
})
socket.on("user-joined", name =>{
    appendMessage(`${name} joined the chat`, "left", "lightgreen")
})
socket.on("user-left", name =>{
    appendMessage(`${name} left the chat`, "left", "orangered")
})