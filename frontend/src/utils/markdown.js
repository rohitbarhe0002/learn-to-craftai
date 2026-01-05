function escapeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

export function markdownToHTML(text) {
    if (!text) return '';
    
    let html = escapeHTML(text);
    const paragraphs = html.split(/\n\n+/);
    const processedParagraphs = paragraphs.map(para => {
        if (!para.trim()) return '';
        
        const lines = para.split('\n');
        const processedLines = [];
        let inList = false;
        let listItems = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const listMatch = line.match(/^[\s]*[\*\-]\s+(.+)$/);
            
            if (listMatch) {
                if (!inList) {
                    inList = true;
                    listItems = [];
                }
                listItems.push(listMatch[1].trim());
            } else {
                if (inList) {
                    const formattedList = listItems.map(item => {
                        let formatted = item;
                        formatted = formatted.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
                        formatted = formatted.replace(/_([^_]+?)_/g, '<em>$1</em>');
                        return `<li>${formatted}</li>`;
                    }).join('');
                    processedLines.push(`<ul>${formattedList}</ul>`);
                    listItems = [];
                    inList = false;
                }
                if (line.trim()) {
                    processedLines.push(line.trim());
                }
            }
        }
        
        if (inList && listItems.length > 0) {
            const formattedList = listItems.map(item => {
                let formatted = item;
                formatted = formatted.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
                formatted = formatted.replace(/_([^_]+?)_/g, '<em>$1</em>');
                return `<li>${formatted}</li>`;
            }).join('');
            processedLines.push(`<ul>${formattedList}</ul>`);
        }
        
        let result = processedLines.join('\n');
        
        result = result.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
        result = result.replace(/(?<!^[\s]*)\*([^*\n<]+?)\*(?![\s]*$)/g, '<strong>$1</strong>');
        result = result.replace(/_([^_<]+?)_/g, '<em>$1</em>');
        result = result.replace(/\n(?!<[uol])/g, '<br>');
        
        return result;
    });
    
    html = processedParagraphs
        .filter(p => p.trim())
        .map(p => {
            if (p.trim().startsWith('<ul>')) {
                return p;
            }
            return `<p>${p}</p>`;
        })
        .join('');
    
    return html;
}

