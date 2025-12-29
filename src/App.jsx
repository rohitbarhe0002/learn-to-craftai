import { useRef, useState } from 'react';
import Header from './components/Header';
import Chat from './components/Chat';
import ChatInput from './components/ChatInput';

function App() {
    const chatRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSend = async (message) => {
        setIsLoading(true);
        try {
            await chatRef.current?.handleSend(message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="app-container">
            <Header />
            <Chat ref={chatRef} />
            <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
    );
}

export default App;

