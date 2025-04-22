/**
 * Convert Editor.js data to Markdown format
 * @param {Object} data - Editor.js data object
 * @returns {string} - Markdown formatted string
 */
export function editorJsToMarkdown(data) {
  if (!data || !data.blocks || !Array.isArray(data.blocks)) {
    return '';
  }

  return data.blocks.map(block => {
    switch (block.type) {
      case 'header':
        const headerLevel = block.data.level;
        const headerMarker = '#'.repeat(headerLevel);
        return `${headerMarker} ${block.data.text}\n`;

      case 'paragraph':
        return `${block.data.text}\n\n`;

      case 'list':
        const listItems = block.data.items;
        return listItems.map(item => {
          if (block.data.style === 'ordered') {
            return `1. ${item}\n`;
          } else {
            return `- ${item}\n`;
          }
        }).join('') + '\n';

      case 'checklist':
        return block.data.items.map(item => {
          const checkbox = item.checked ? '[x]' : '[ ]';
          return `${checkbox} ${item.text}\n`;
        }).join('') + '\n';

      case 'quote':
        let quoteText = `> ${block.data.text}\n`;
        if (block.data.caption) {
          quoteText += `> — ${block.data.caption}\n`;
        }
        return quoteText + '\n';

      case 'code':
        return `\`\`\`\n${block.data.code}\n\`\`\`\n\n`;

      case 'delimiter':
        return '---\n\n';

      case 'image':
        let imageText = `![${block.data.caption || 'image'}](${block.data.file?.url || block.data.url})`;
        if (block.data.caption) {
          imageText += `\n*${block.data.caption}*`;
        }
        return imageText + '\n\n';

      case 'table':
        if (!block.data.content || !block.data.content.length) {
          return '';
        }
        
        const tableRows = block.data.content;
        let markdownTable = '';
        
        // Create header row
        markdownTable += '| ' + tableRows[0].map(cell => cell || '').join(' | ') + ' |\n';
        
        // Create separator row
        markdownTable += '| ' + tableRows[0].map(() => '---').join(' | ') + ' |\n';
        
        // Create content rows (skip the first row as it's the header)
        for (let i = 1; i < tableRows.length; i++) {
          markdownTable += '| ' + tableRows[i].map(cell => cell || '').join(' | ') + ' |\n';
        }
        
        return markdownTable + '\n';

      case 'warning':
        return `> **Warning:** ${block.data.title}\n> ${block.data.message}\n\n`;

      case 'attaches':
        return `[${block.data.title || 'Attachment'}](${block.data.file?.url || block.data.url})\n\n`;

      default:
        return '';
    }
  }).join('');
}

/**
 * Extract plain text from Editor.js data (for search functionality)
 * @param {Object} data - Editor.js data object
 * @returns {string} - Plain text content
 */
export function extractPlainText(data) {
  if (!data || !data.blocks || !Array.isArray(data.blocks)) {
    return '';
  }

  return data.blocks.map(block => {
    switch (block.type) {
      case 'header':
      case 'paragraph':
        return block.data.text;
      
      case 'list':
        return block.data.items.join(' ');
      
      case 'checklist':
        return block.data.items.map(item => item.text).join(' ');
      
      case 'quote':
        return `${block.data.text} ${block.data.caption || ''}`;
      
      case 'code':
        return block.data.code;
      
      case 'image':
      case 'attaches':
        return block.data.caption || '';
      
      case 'table':
        if (!block.data.content || !block.data.content.length) {
          return '';
        }
        return block.data.content.flat().join(' ');
      
      case 'warning':
        return `${block.data.title} ${block.data.message}`;
      
      default:
        return '';
    }
  }).join(' ');
}
