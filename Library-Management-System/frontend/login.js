const API = "http://127.0.0.1:8000";

const toggle=document.getElementById("togglePassword");

toggle.addEventListener("click",()=>{

const password=document.getElementById("password");

if(password.type==="password"){

password.type="text";

toggle.innerHTML='<i class="fa-solid fa-eye-slash"></i>';

}else{

password.type="password";

toggle.innerHTML='<i class="fa-solid fa-eye"></i>';

}

});

async function login(){

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

const response=await fetch(`${API}/students/login`,{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

email,

password

})

});

const data=await response.json();

const message=document.getElementById("message");

if(response.ok){

message.style.color="#7CFC00";

message.innerHTML="✅ Login Successful";

setTimeout(()=>{

window.location.href="index.html";

},1000);

}else{

message.style.color="yellow";

message.innerHTML=data.detail;

}

}