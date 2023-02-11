const signupform = document.getElementById("signup-form")
password1 = document.getElementById("password1")
password2 = document.getElementById("password2")
message = document.getElementById("danger-message")

signupform.addEventListener("submit", (e)=>{
    e.preventDefault()
    if(password1.value !== password2.value){
        message.innerText = "Passwords don't match!"
    }
    else{
        message.innerText = ""

        signupform.submit()
    }
})