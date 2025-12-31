export default function Header() {
    return (
        <header className="chat-header">
            <div className="header-content">
                <h1 className="app-title">AI Health Assistant</h1>
                <div 
                    className="disclaimer-icon" 
                    title="This information is for educational purposes only. Please consult a healthcare professional for medical advice."
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 4V8M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </div>
            </div>
        </header>
    );
}

