/**
 * Convert markdown text to HTML
 * Handles: bold, italic, bullet lists, line breaks, paragraphs
 */
export function markdownToHTML(text) {
    if (!text) return '';
    
    // Escape HTML to prevent XSS
    const div = document.createElement('div');
    div.textContent = text;
    let html = div.innerHTML;
    
    // Split by double line breaks for paragraphs
    const paragraphs = html.split(/\n\n+/);
    const processedParagraphs = paragraphs.map(para => {
        if (!para.trim()) return '';
        
        // Process bullet lists first (lines starting with * or - at the beginning)
        const lines = para.split('\n');
        const processedLines = [];
        let inList = false;
        let listItems = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Match bullet points: * or - at start of line (with optional whitespace)
            const listMatch = line.match(/^[\s]*[\*\-]\s+(.+)$/);
            
            if (listMatch) {
                if (!inList) {
                    inList = true;
                    listItems = [];
                }
                listItems.push(listMatch[1].trim());
            } else {
                if (inList) {
                    // Process list items for formatting
                    const formattedList = listItems.map(item => {
                        let formatted = item;
                        // Convert **bold** in list items
                        formatted = formatted.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
                        // Convert _italic_ in list items
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
        
        // Handle list at end of paragraph
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
        
        // Convert **bold** to <strong> (double asterisks)
        result = result.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *text* to <strong> (single asterisk, but not if it's part of a list marker)
        result = result.replace(/(?<!^[\s]*)\*([^*\n<]+?)\*(?![\s]*$)/g, '<strong>$1</strong>');
        
        // Convert _italic_ to <em>
        result = result.replace(/_([^_<]+?)_/g, '<em>$1</em>');
        
        // Convert single line breaks to <br> (but preserve list structure)
        result = result.replace(/\n(?!<[uol])/g, '<br>');
        
        return result;
    });
    
    // Wrap paragraphs in <p> tags, but don't wrap if it starts with <ul>
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

