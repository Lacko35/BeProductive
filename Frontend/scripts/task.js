const priorities = ['low', 'medium', 'high'];
const priorityLabels = ['Nizak', 'Srednji', 'Visok'];

let tasks = [];

let currentFilter = "";
let deleteTargetID = 0;

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

window.addEventListener('DOMContentLoaded', async () => {
    await getTasks();
});

function toggleTheme() 
{
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

function setFilter(filter, btn) 
{
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    renderTasks();
}

function getFiltered() 
{
    switch (currentFilter) 
    {
        case 'active':    return tasks.filter(t => !t.isCompleted);
        case 'completed': return tasks.filter(t => t.isCompleted);
        case 'high':      return tasks.filter(t => t.priority === 2);
        default:          return tasks;
    }
}

function renderTasks() 
{
    const grid = document.getElementById('tasksGrid');
    const filtered = getFiltered();

    document.getElementById('countAll').textContent       = tasks.length;
    document.getElementById('countActive').textContent    = tasks.filter(t => !t.isCompleted).length;
    document.getElementById('countCompleted').textContent = tasks.filter(t => t.isCompleted).length;
    document.getElementById('countHigh').textContent      = tasks.filter(t => t.priority === 2).length;

    if (filtered.length === 0) 
    {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🗒️</div><p>Nema taskova za prikaz.</p></div>`;
        return;
    }

    grid.innerHTML = filtered.map((task, i) => {
        const p = priorities[task.priority];
        const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString('sr-Latn-RS', { day:'2-digit', month:'short', year:'numeric' }) : null;
        const created = new Date(task.createdAt).toLocaleDateString('sr-Latn-RS', { day:'2-digit', month:'short' });
        const overdue = task.dueDate && !task.isCompleted && new Date(task.dueDate) < new Date();

        return `
            <div class="task-card priority-${p} ${task.isCompleted ? 'completed' : ''}" style="animation-delay:${i * 0.05}s">
                <div class="task-card-header">
                    <div class="task-title" style="text-decoration: ${task.isCompleted ? "line-through" : "none"};">${escHtml(task.title)}</div>
                </div>
                ${task.description ? `<div class="task-description">${escHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span>📅 ${created}</span>
                    ${due ? `<span style="${overdue ? 'color:var(--high-color);font-weight:700' : ''}">⏰ ${due}${overdue ? ' ⚠️' : ''}</span>` : ''}
                    ${task.isCompleted ? `<span style="color:var(--low-color);font-weight:700">✔ Završen</span>` : ''}
                </div>
                <div class="task-actions">
                    <button class="action-btn complete ${task.isCompleted ? 'active' : ''}" onclick="toggleComplete(${task.taskID})" title="${task.isCompleted ? 'Označi kao aktivan' : 'Označi kao završen'}">
                        ✔ <span>${task.isCompleted ? 'Aktiviraj' : 'Završi'}</span>
                    </button>
                    <button class="action-btn edit" onclick="openEditModal(${task.taskID})" title="Izmeni">
                        ✏️
                    </button>
                    <button class="action-btn delete" onclick="openConfirm(${task.taskID})" title="Obriši">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function escHtml(str) 
{
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function addTask() 
{
    const task_title = document.getElementById("newTitle").value;
    const task_description = document.getElementById("newDescription").value;
    const until = document.getElementById("newDueDate").value;
    const priority_ = parseInt(document.getElementById("newPriority").value);

    const res = await apiFetch("http://localhost:5000/TaskItem/AddTask", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title: task_title,
            description: task_description,
            dueDate: new Date(until).toISOString(),
            priority: priority_
        })
    });

    if(res.ok)
    {
        const data = await res.json();

        tasks.push(data);
    }
    else 
    {
        const err = await res.text();

        console.log(err);
    }

    renderTasks();

    document.getElementById("newTitle").value = "";
    document.getElementById("newDescription").value = "";
    document.getElementById("newDueDate").value = "";
    document.getElementById("newPriority").value = "";
}

async function toggleComplete(taskID)
{
    const res = await apiFetch(`http://localhost:5000/TaskItem/FinishTask/${encodeURIComponent(parseInt(taskID))}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
    });

    if(res.ok)
    {
        await getTasks();
    }
    else
    {
        const err = await res.text();

        console.log(err);
    }
}

function openEditModal(id) 
{
    document.getElementById('editTaskId').value = id;
    document.getElementById('editModal').classList.add('show');
}
    
function closeEditModal() 
{
    document.getElementById('editModal').classList.remove('show'); 
}
    
async function saveEdit() 
{
    const id = parseInt(document.getElementById('editTaskId').value);

    let priority_ = parseInt(document.getElementById('editPriority').value);
    let dueDate_ = document.getElementById('editDueDate').value || null;
        
        const res = await apiFetch(`http://localhost:5000/TaskItem/ChangeTask/${encodeURIComponent(parseInt(id))}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                dueDate: dueDate_,
                priority: priority_
            })
        });        
        
        if(res.ok)
        {
            closeEditModal();
            getTasks();            
        }
        else
        {
            const err = await res.text();

            console.log(err);
        }    
}

function openConfirm(id) 
{ 
    deleteTargetID = id; 
    document.getElementById('confirmOverlay').classList.add('show'); 
}

function closeConfirm() 
{ 
    deleteTargetID = 0; 
    document.getElementById('confirmOverlay').classList.remove('show'); 
}

async function confirmDelete() 
{
    if (deleteTargetID !== 0) 
    {
        const res = await apiFetch(`http://localhost:5000/TaskItem/DeleteTask/${encodeURIComponent(parseInt(deleteTargetID))}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
        });        
        
        if(res.ok)
        {
            closeConfirm();
            getTasks();            
        }
        else
        {
            const err = await res.text();

            console.log(err);
        }
    }
}

async function getTasks()
{
    const res = await apiFetch("http://localhost:5000/TaskItem/GetTasks");

    if(res.ok)
    {
        const data = await res.json();
        tasks = [];

        for(let i = 0; i < data.length; i++)
        {
            tasks.push(data[i]);
        }

        renderTasks();
    }
    else
    {
        const err = await res.text();

        console.log(err);
    }    
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

window.onload = async () => {
    await getProfilePicture();
}

document.getElementById('editModal').addEventListener('click', e => { 
    if (e.target === document.getElementById('editModal')) closeEditModal(); 
});

document.getElementById('confirmOverlay').addEventListener('click', e => { 
    if (e.target === document.getElementById('confirmOverlay')) closeConfirm(); 
});

document.getElementById('newTitle').addEventListener('keydown', e => { 
    if (e.key === 'Enter') addTask(); 
});

renderTasks();