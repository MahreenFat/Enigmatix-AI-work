const API = "http://127.0.0.1:8000";

async function registerStudent() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    if (!name || !email || !password || !confirmPassword) {
        message.style.color = "yellow";
        message.innerHTML = "Please fill all fields.";
        return;
    }

    if (password !== confirmPassword) {
        message.style.color = "yellow";
        message.innerHTML = "Passwords do not match.";
        return;
    }

    const response = await fetch(`${API}/students/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    const data = await response.json();

    if (response.ok) {

        message.style.color = "#7CFC00";
        message.innerHTML = "✅ Registration Successful";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } else {

        message.style.color = "yellow";
        message.innerHTML = data.detail || "Registration failed.";

    }
}