function apiFetch(url, options = {})
{
    const token = localStorage.getItem("jwt_token");

    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`
    }

    return fetch(url, options).then(res => {
        if(res.status === 401)
        {
            localStorage.removeItem("jwt_token");
            window.location.href = "login.html";
        }

        return res;
    })
}

async function register() 
{
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });

    const name = document.getElementById("register-name");
    const email = document.getElementById("register-email");
    const username = document.getElementById("register-username");
    const password = document.getElementById("register-password");
    const confirmPassword = document.getElementById("register-confirm");

    let notValidFormat = 0;

    const firstname_regex = /^[A-Z]{1}[a-z]{1,14}$/;
    const lastname_regex = /^[A-Z]{1}[a-z]{1,24}$/;
    const email_regex = /^([a-z]|[0-9])+(\.|\_)?([a-z]|[0-9])+\@(gmail|yahoo)\.com$/;
    const username_regex = /^[a-zA-Z]([a-zA-Z]|[0-9]|\.)+$/;
    const password_regex = /^[a-z0-9._]{8,20}$/;

    const parts = name.value.split(' ');

    if(parts.length < 2) {
        notValidFormat++;
        document.getElementById("name-error").textContent = "Unesite ime i prezime";
        document.getElementById("name-error").style.display = "block";
    }
    else {
        if(!firstname_regex.test(parts[0])) {
            notValidFormat++;
            document.getElementById("name-error").textContent = "Ime nije u validnom formatu";
            document.getElementById("name-error").style.display = "block";
        }

        if(!lastname_regex.test(parts[1])) {
            notValidFormat++;
            document.getElementById("name-error").textContent = "Prezime nije u validnom formatu";
            document.getElementById("name-error").style.display = "block";
        }
    }

    if(!email_regex.test(email.value))
    {
        notValidFormat++;
        document.getElementById("email-error").textContent = "Email nije u validnom formatu";
        document.getElementById("email-error").style.display = "block";
    }

    if(!username_regex.test(username.value))
    {
        notValidFormat++;
        document.getElementById("username-error").textContent = "Korisnicko ime nije u validnom formatu";
        document.getElementById("username-error").style.display = "block";
    }

    if(!password_regex.test(password.value))
    {
        notValidFormat++;
        document.getElementById("password-error").textContent = "Lozinka nije u validnom formatu";
        document.getElementById("password-error").style.display = "block";
    }

    if(password.value !== confirmPassword.value) {
        notValidFormat++;
        document.getElementById("confirm-error").textContent = "Lozinke se ne poklapaju";
        document.getElementById("confirm-error").style.display = "block";
    }

    if(notValidFormat == 1)
    {
        name.value = "";
        email.value = "";
        username.value = "";
        password.value = "";
        confirmPassword.value = "";
        
        return;
    }

    const res = await apiFetch("http://localhost:5000/Auth/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: parts[0],
            lastName: parts[1],
            username: username.value,
            email: email.value,
            password: password.value,
            role: "User"
        })
    });

    if(res.ok)
    {
        const data = await res.json();

        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("username", data.username);
        
        window.location.href = "login.html";
    }
    else
    {
        const greska = await res.text();     
    }

    name.value = "";
    email.value = "";
    username.value = "";
    password.value = "";
    confirmPassword.value = "";
}

async function login()
{
    const email = document.getElementById("login-email").value;
    const lozinka = document.getElementById("login-password").value;

    const res = await apiFetch("http://localhost:5000/Auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
            { 
                email: email, 
                password: lozinka 
            }
        )
    });

    if(res.ok) 
    {
        const data = await res.json();

        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("username", data.username);

        document.getElementById('modalOverlay').style.display = "block";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
    }
    else 
    {
        const error = await res.text();         
    }

    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
}

async function getTopUsers() 
{
    const res = await apiFetch("http://localhost:5000/UserProfile/GetTopUsers");
    
    if(res.ok)
    {
        const usernames = document.getElementsByClassName("username-cell");
        const points = document.getElementsByClassName("task-badge");
        const ranks = document.getElementsByClassName("rank_class");
        const users = await res.json();

        for(let i = 0; i < users.length; i++)
        {
            usernames[i].textContent = users[i].username;
            points[i].textContent = users[i].completedTasks;
            ranks[i].style.visibility = "visible";
        }
    }
    else
    {
        const error = await res.text();

        console.error(error);
    }
}

function switchTab(tab) 
{
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
            
    document.querySelectorAll('.form-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
}

window.onload = async () => {
    await getTopUsers();
}