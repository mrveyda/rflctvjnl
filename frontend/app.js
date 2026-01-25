const API_BASE = 'http://localhost:5000/api';

// Set today's date as default
function initializeDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;
    loadEntriesForDate(today);
}

// Check backend health
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            document.getElementById('statusText').textContent = '✓ Connected';
            document.getElementById('statusText').classList.remove('text-amber-400');
            document.getElementById('statusText').classList.add('text-green-400');
        }
    } catch (error) {
        document.getElementById('statusText').textContent = '✗ Disconnected';
        document.getElementById('statusText').classList.add('text-red-400');
        console.error('Health check failed:', error);
    }
}

// Load entries for a specific date
async function loadEntriesForDate(date) {
    try {
        const response = await fetch(`${API_BASE}/entries/${date}`);
        const data = await response.json();
        
        displayEntries(data.entries || []);
        
        // Reset summary and insights when changing date
        document.getElementById('summaryContent').classList.add('hidden');
        document.getElementById('summaryPlaceholder').classList.remove('hidden');
        document.getElementById('insightsContent').classList.add('hidden');
        document.getElementById('insightsPlaceholder').classList.remove('hidden');
        
        // Clear input
        document.getElementById('reflectionInput').value = '';
    } catch (error) {
        console.error('Error loading entries:', error);
        document.getElementById('entriesList').innerHTML = '<p class="text-red-400">Error loading entries</p>';
    }
}

// Display entries in the list
function displayEntries(entries) {
    const entriesList = document.getElementById('entriesList');
    const entryCount = document.getElementById('entryCount');
    
    entryCount.textContent = entries.length;
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<p class="text-slate-400">No entries yet. Start by writing your first reflection.</p>';
        return;
    }
    
    entriesList.innerHTML = entries.map((entry, index) => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        return `
            <div class="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <p class="text-slate-300 text-sm">${entry.text}</p>
                <p class="text-slate-500 text-xs mt-2">📍 ${time}</p>
            </div>
        `;
    }).join('');
}

// Save new reflection entry
async function saveEntry() {
    const date = document.getElementById('dateInput').value;
    const reflection = document.getElementById('reflectionInput').value.trim();
    
    if (!reflection) {
        alert('Please write something before saving.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/entries/${date}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reflection })
        });
        
        if (response.ok) {
            const data = await response.json();
            displayEntries(data.entries);
            document.getElementById('reflectionInput').value = '';
        } else {
            alert('Error saving entry');
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        alert('Error saving entry');
    }
}

// Generate daily summary
async function generateSummary() {
    const date = document.getElementById('dateInput').value;
    
    try {
        const response = await fetch(`${API_BASE}/summary/${date}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('summaryPlaceholder').classList.add('hidden');
            document.getElementById('summaryContent').textContent = data.summary;
            document.getElementById('summaryContent').classList.remove('hidden');
        } else {
            alert(data.error || 'Error generating summary');
        }
    } catch (error) {
        console.error('Error generating summary:', error);
        alert('Error generating summary');
    }
}

// Generate insights
async function generateInsights() {
    const date = document.getElementById('dateInput').value;
    
    try {
        const response = await fetch(`${API_BASE}/insights/${date}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('insightsPlaceholder').classList.add('hidden');
            document.getElementById('insightsContent').textContent = data.insights;
            document.getElementById('insightsContent').classList.remove('hidden');
        } else {
            alert(data.error || 'Error generating insights');
        }
    } catch (error) {
        console.error('Error generating insights:', error);
        alert('Error generating insights');
    }
}

// Event listeners
document.getElementById('saveBtn').addEventListener('click', saveEntry);
document.getElementById('summaryBtn').addEventListener('click', generateSummary);
document.getElementById('insightsBtn').addEventListener('click', generateInsights);
document.getElementById('dateInput').addEventListener('change', (e) => {
    loadEntriesForDate(e.target.value);
});
document.getElementById('reflectionInput').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        saveEntry();
    }
});

// Initialize
checkHealth();
initializeDate();
