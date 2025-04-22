/**
 * Converts Yoopta editor data to markdown
 * @param {Array} nodes - Yoopta editor nodes
 * @returns {string} - Markdown string
 */
export const yooptaToMarkdown = (nodes) => {
  if (!nodes || !Array.isArray(nodes)) {
    return '';
  }

  return nodes.map(node => nodeToMarkdown(node)).join('\n\n');
};

/**
 * Converts a single Yoopta node to markdown
 * @param {Object} node - Yoopta node
 * @returns {string} - Markdown string
 */
const nodeToMarkdown = (node) => {
  if (!node) return '';

  const { type, children } = node;

  // Get the text content from children
  const text = children
    ? children.map(child => {
        let textContent = child.text || '';
        
        // Apply marks
        if (child.bold) textContent = `**${textContent}**`;
        if (child.italic) textContent = `*${textContent}*`;
        if (child.underline) textContent = `<u>${textContent}</u>`;
        if (child.strikethrough) textContent = `~~${textContent}~~`;
        if (child.code) textContent = `\`${textContent}\``;
        
        return textContent;
      }).join('')
    : '';

  switch (type) {
    case 'paragraph':
      return text;
    
    case 'heading':
      const level = node.level || 1;
      return `${'#'.repeat(level)} ${text}`;
    
    case 'blockquote':
      return `> ${text}`;
    
    case 'bulleted-list':
      return children
        .map(item => `- ${nodeToMarkdown(item)}`)
        .join('\n');
    
    case 'numbered-list':
      return children
        .map((item, index) => `${index + 1}. ${nodeToMarkdown(item)}`)
        .join('\n');
    
    case 'list-item':
      return text;
    
    case 'code':
      const language = node.language || '';
      return `\`\`\`${language}\n${text}\n\`\`\``;
    
    default:
      return text;
  }
};

/**
 * Extracts plain text from Yoopta editor data
 * @param {Array} nodes - Yoopta editor nodes
 * @returns {string} - Plain text string
 */
export const extractPlainText = (nodes) => {
  if (!nodes || !Array.isArray(nodes)) {
    return '';
  }

  return nodes.map(node => nodeToPlainText(node)).join(' ');
};

/**
 * Converts a single Yoopta node to plain text
 * @param {Object} node - Yoopta node
 * @returns {string} - Plain text string
 */
const nodeToPlainText = (node) => {
  if (!node) return '';

  const { type, children } = node;

  // Get the text content from children
  const text = children
    ? children.map(child => child.text || '').join('')
    : '';

  switch (type) {
    case 'bulleted-list':
    case 'numbered-list':
      return children
        .map(item => nodeToPlainText(item))
        .join(' ');
    
    default:
      return text;
  }
};
