function login(){

let pin = document.getElementById("pin").value;


if(pin === "1234"){

localStorage.setItem(
"adminLogin",
"true"
);


window.location.href="dashboard.html";


}
else{

document.getElementById("message")
.innerHTML="Wrong PIN";

}

}