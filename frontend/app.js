const API_BASE = 'http://localhost:5000/api';

// Check backend health on page load
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        document.getElementById('statusText').textContent = '✓ Connected';
        document.getElementById('statusText').classList.remove('text-amber-400');
        document.getElementById('statusText').classList.add('text-green-400');
    } catch (error) {
        document.getElementById('statusText').textContent = '✗ Disconnected';
        document.getElementById('statusText').classList.remove('text-amber-400');
        document.getElementById('statusText').classList.add('text-red-400');
        console.error('Health check failed:', error);
    }
}

// Send message to backend
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;

    try {
        const response = await fetch(`${API_BASE}/echo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        const responseDiv = document.getElementById('response');
        document.getElementById('responseText').textContent = data.message;
        responseDiv.classList.remove('hidden');
        
        input.value = '';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('responseText').textContent = 'Error: Could not reach backend';
        document.getElementById('response').classList.remove('hidden');
    }
}

// Event listeners
document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Initialize
checkHealth();
