import { use, useState } from 'react';
import { deleteConversation } from '../utils/api';

function groupConversationsByDate(conversations) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = {
        today: [],
        yesterday: [],
        week: [],
        older: []
    };

    conversations.forEach(conv => {
        const convDate = new Date(conv.created_at);
        if (convDate >= today) {
            groups.today.push(conv);
        } else if (convDate >= yesterday) {
            groups.yesterday.push(conv);
        } else if (convDate >= weekAgo) {
            groups.week.push(conv);
        } else {
            groups.older.push(conv);
        }
    });

    return groups;
}

export default function Sidebar({ 
    isOpen, 
    onClose, 
    onSelectConversation, 
    onNewChat,
    currentConversationId,
    conversationsPromise
}) {
    // React 19: use() hook reads the promise and suspends until resolved
    const initialConversations = use(conversationsPromise);
    const [conversations, setConversations] = useState(initialConversations);

    const handleDelete = async (e, conversationId) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this conversation?')) return;
        
        try {
            await deleteConversation(conversationId);
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            if (currentConversationId === conversationId) {
                onNewChat();
            }
        } catch (err) {
            console.error('Error deleting conversation:', err);
        }
    };

    const groupedConversations = groupConversationsByDate(conversations);

    const renderGroup = (title, items) => {
        if (items.length === 0) return null;
        
        return (
            <div className="sidebar-group">
                <h3 className="sidebar-group-title">{title}</h3>
                <ul className="sidebar-list">
                    {items.map(conv => (
                        <li 
                            key={conv.id}
                            className={`sidebar-item ${currentConversationId === conv.id ? 'active' : ''}`}
                            onClick={() => onSelectConversation(conv.id)}
                        >
                            <span className="sidebar-item-title">{conv.title}</span>
                            <button 
                                className="sidebar-item-menu"
                                onClick={(e) => handleDelete(e, conv.id)}
                                title="Delete conversation"
                            >
                                ⋮
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
            
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="new-chat-button" onClick={onNewChat}>
                        <span className="new-chat-icon">+</span>
                        <span>New Chat</span>
                    </button>
                    <button className="sidebar-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                
                <div className="sidebar-content">
                    {conversations.length === 0 ? (
                        <div className="sidebar-empty">
                            <span>No conversations yet</span>
                            <p>Start a new chat to begin!</p>
                        </div>
                    ) : (
                        <>
                            {renderGroup('Today', groupedConversations.today)}
                            {renderGroup('Yesterday', groupedConversations.yesterday)}
                            {renderGroup('Previous 7 Days', groupedConversations.week)}
                            {renderGroup('Older', groupedConversations.older)}
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}

