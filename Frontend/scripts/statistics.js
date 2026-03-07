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
    await getStatisticInfo();
    await refreshWeeklyChart();
    await refreshMonthlyChart();
});

function toggleTheme() 
{
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        
    updateChartTheme();
}

if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

function getCssVar(name) 
{
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function isDark()
{ 
    return document.body.classList.contains('dark-mode'); 
}

function gridColor() 
{ 
    return isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; 
}

function tickColor() 
{ 
    return isDark() ? '#9ca3af' : '#6b7280'; 
}

async function getStatisticInfo()
{
    try 
    {
        const res = await apiFetch("http://localhost:5000/TaskItem/GetTasks");
        const stats = await res.json();

        document.getElementById('statTotal').textContent = stats.length;
        document.getElementById('statCompleted').textContent = stats.filter(t => t.isCompleted).length;
        document.getElementById('statPending').textContent = stats.filter(t => !t.isCompleted).length;
        document.getElementById('statHigh').textContent = stats.filter(t => t.priority === 2).length;
    } 
    catch (error) 
    {
        console.error('Greška pri učitavanju statistike:', error);

        document.getElementById('statTotal').textContent = '0';
        document.getElementById('statCompleted').textContent = '0';
        document.getElementById('statPending').textContent = '0';
        document.getElementById('statHigh').textContent = '0';
    }
}

const DAYS   = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];

let currentWeekOffset = 0; 

function getWeekKey(offset) 
{
    const now = new Date();

    now.setDate(now.getDate() + offset * 7);

    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

    return `${year}-${String(week).padStart(2, '0')}`;
}

function getWeekLabel(offset) 
{
    const now = new Date();
    const mon = new Date(now);

    mon.setDate(now.getDate() - now.getDay() + 1 + offset * 7);

    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const fmt = d => `${d.getDate()}.${d.getMonth()+1}.`;

    return `${fmt(mon)} – ${fmt(sun)}`;
}

const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');

let weeklyChart = new Chart(weeklyCtx, {
    type: 'bar',
    data: {
        labels: DAYS,
        datasets: [{
            label: 'Završeni taskovi',
            data: [],
            backgroundColor: 'rgba(102,126,234,0.15)',
            borderColor: '#667eea',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark() ? '#1a1a2e' : '#fff',
                titleColor: isDark() ? '#f0f0f8' : '#1a1a2e',
                bodyColor: '#667eea',
                borderColor: '#667eea',
                borderWidth: 1,
                callbacks: { label: ctx => ` ${ctx.parsed.y} taskova` }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: tickColor() },
                grid: { color: gridColor() },
                border: { display: false }
            },
            x: {
                ticks: { color: tickColor() },
                grid: { display: false },
                border: { display: false }
            }
        }
    }
});

async function refreshWeeklyChart() 
{
    const key = getWeekKey(currentWeekOffset);
    
    try 
    {
        const res = await apiFetch(`http://localhost:5000/Statistic/GetWeaklyStats/${encodeURIComponent(key)}`);
        const data = await res.json();
        
        const counts = DAYS.map((_, index) => {
            const dayNum = index + 1;
            const found = data.find(d => d.dayOfWeek === dayNum);
            return found ? found.count : 0;
        });

        weeklyChart.data.datasets[0].data = counts;
        weeklyChart.update();

        document.getElementById('weekLabel').textContent = getWeekLabel(currentWeekOffset);

        const total = counts.reduce((a, b) => a + b, 0);
        const maxVal = Math.max(...counts);
        const bestIdx = counts.indexOf(maxVal);
        
        document.getElementById('weekTotal').textContent = total;
        document.getElementById('weekBest').textContent = maxVal > 0 ? DAYS[bestIdx] : '–';
    } 
    catch (error) 
    {
        console.error('Greška pri učitavanju nedeljne statistike:', error);

        weeklyChart.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0];
        weeklyChart.update();

        document.getElementById('weekLabel').textContent = getWeekLabel(currentWeekOffset);
        document.getElementById('weekTotal').textContent = '0';
        document.getElementById('weekBest').textContent = '–';
    }
}

function changeWeek(dir) 
{
    currentWeekOffset += dir;

    refreshWeeklyChart();
}

let currentYear = new Date().getFullYear();

const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');

let monthlyChart = new Chart(monthlyCtx, {
    type: 'line',
    data: {
        labels: MONTHS,
        datasets: [{
            label: 'Završeni taskovi',
            data: [],
            fill: true,
            backgroundColor: 'rgba(16,185,129,0.08)',
            borderColor: '#10b981',
            borderWidth: 2.5,
            pointBackgroundColor: '#10b981',
            pointBorderColor: 'var(--card-bg)',
            pointBorderWidth: 2,
            pointRadius: 5,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark() ? '#1a1a2e' : '#fff',
                titleColor: isDark() ? '#f0f0f8' : '#1a1a2e',
                bodyColor: '#10b981',
                borderColor: '#10b981',
                borderWidth: 1,
                callbacks: { label: ctx => ` ${ctx.parsed.y} taskova` }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 2, color: tickColor() },
                grid: { color: gridColor() },
                border: { display: false }
            },
            x: {
                ticks: { color: tickColor() },
                grid: { display: false },
                border: { display: false }
            }
        }
    }
});

async function refreshMonthlyChart() 
{
    try 
    {
        const res = await apiFetch(`http://localhost:5000/Statistic/GetMontlyStats/${encodeURIComponent(currentYear)}`);
        const data = await res.json();
        
        const counts = Array(12).fill(0);
        data.forEach(d => {
            if (d.month >= 1 && d.month <= 12) 
            {
                counts[d.month - 1] = d.count;
            }
        });

        monthlyChart.data.datasets[0].data = counts;
        monthlyChart.update();

        document.getElementById('yearLabel').textContent = currentYear;
        
        const total = counts.reduce((a, b) => a + b, 0);
        const maxVal = Math.max(...counts);
        const bestIdx = counts.indexOf(maxVal);
        
        document.getElementById('yearTotal').textContent = total;
        document.getElementById('yearBest').textContent = maxVal > 0 ? MONTHS[bestIdx] : '–';
    } 
    catch (error) 
    {
        console.error('Greška pri učitavanju mesečne statistike:', error);

        monthlyChart.data.datasets[0].data = Array(12).fill(0);
        monthlyChart.update();
        
        document.getElementById('yearLabel').textContent = currentYear;
        document.getElementById('yearTotal').textContent = '0';
        document.getElementById('yearBest').textContent = '–';
    }
}

function changeYear(dir) 
{
    currentYear += dir;
    refreshMonthlyChart();
}

function updateChartTheme() 
{
    [weeklyChart, monthlyChart].forEach(chart => {
        chart.options.scales.x.ticks.color = tickColor();
        chart.options.scales.y.ticks.color = tickColor();
        chart.options.scales.y.grid.color = gridColor();
        chart.update();
    });
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