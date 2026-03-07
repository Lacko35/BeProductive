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

window.onload = async () => {
    await getProfilePicture();
}

function toggleTheme() 
{
    document.body.classList.toggle('dark-mode');

    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
            
    if (savedTheme === 'dark') 
    {
        document.body.classList.add('dark-mode');
    }
});

function toggleUserMenu() 
{
    const userMenu = document.getElementById('userMenu');
    
    userMenu.classList.toggle('active');
}

function logout() 
{               
    localStorage.removeItem("jwt_token");

    window.location.href = 'login.html';
}

function openTasks()
{
    window.location.href = "task.html";
}

function openStatistic()
{
    window.location.href = "statistics.html";
}

async function getProfilePicture()
{
    const res = await apiFetch("http://localhost:5000/UserProfile/GetProfilePicture");

    if(res.ok)
    {
        const profilePicture = await res.text();

        if(profilePicture != "")
        {
            const avatar = document.getElementById("userAvatar");

            avatar.style.backgroundImage = `url(${profilePicture})`;
            avatar.classList.remove("user-avatar");
            avatar.classList.add("background-photo");

            const username = localStorage.getItem("username");
            
            document.getElementsByClassName("user-name")[0].textContent = username;
        }
        else
        {
            const username = localStorage.getItem("username");
            
            document.getElementById("userAvatar").textContent = username[0];
            document.getElementsByClassName("user-name")[0].textContent = username;            
        }
    }
    else
    {
        const username = localStorage.getItem("username");
            
        document.getElementById("userAvatar").textContent = username[0];
        document.getElementsByClassName("user-name")[0].textContent = username; 
    }
}