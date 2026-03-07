window.onload = async () => {
    await getProfilePicture();
}

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
            
    if (savedTheme === 'dark') 
    {
        document.body.classList.add('dark-mode');
    }
});

function toggleTheme() 
{
    document.body.classList.toggle('dark-mode');

    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

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

const profileImage = document.getElementById("imageSelector");
const fileNameSpan = document.querySelector(".file-name");
let selectedImageData = null;

profileImage.addEventListener("change", (e) => {
    const files = e.target.files;

    if(files && files[0])
    {
        const file = files[0];
        
        fileNameSpan.textContent = file.name;
        
        const fileReader = new FileReader();

        fileReader.onload = function(e) {
            selectedImageData = e.target.result;
            
            const avatar = document.getElementById("userAvatar");
            avatar.style.backgroundImage = `url(${e.target.result})`;
            avatar.classList.remove("user-avatar");
            avatar.classList.add("background-photo");
        }

        fileReader.readAsDataURL(file);
    }
});

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

async function changeUserProfile()
{
    const newUsername = document.getElementById("register-username").value;
    const newEmail = document.getElementById("register-email").value;
    const newPassword = document.getElementById("register-password").value;

    if(newUsername != "")
    {
        localStorage.setItem("username", newUsername);
    }

    const res = await apiFetch("http://localhost:5000/UserProfile/ChangeUserProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: newUsername,
            email: newEmail,
            password: newPassword,
            profilePicture: selectedImageData || ""
        })
    });

    if(res.ok)
    {
        await getProfilePicture();
        
        document.getElementById("register-username").value = "";
        document.getElementById("register-email").value = "";
        document.getElementById("register-password").value = "";
        selectedImageData = null;
        fileNameSpan.textContent = "No file chosen";
    }
    else
    {
        const err = await res.text();
        console.log(err);
    }
}

async function deleteUserProfile()
{
    const res = await apiFetch("http://localhost:5000/UserProfile/DeleteUserProfile", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"}
    });
    
    if(res.ok)
    {
        closeModal();
            
        document.getElementById('successMessage').classList.add('show');
        
        localStorage.removeItem("jwt_token");
        window.location.href = "login.html";
    }
    else
    {
        err = await res.text();

        console.log(err);
    }
}

function openModal() 
{
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) 
    {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') 
    {
        closeModal();
    }
});