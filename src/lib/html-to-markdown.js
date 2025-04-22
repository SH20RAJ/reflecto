/**
 * Converts HTML to Markdown
 * @param {string} html - HTML string
 * @returns {string} - Markdown string
 */
export const htmlToMarkdown = (html) => {
  if (!html) return '';
  
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Convert the DOM to markdown
  return parseNode(tempDiv);
};

/**
 * Parses a DOM node and its children to markdown
 * @param {Node} node - DOM node
 * @returns {string} - Markdown string
 */
const parseNode = (node) => {
  if (!node) return '';
  
  let markdown = '';
  
  // Process each child node
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      markdown += child.textContent;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tagName = child.tagName.toLowerCase();
      
      switch (tagName) {
        case 'h1':
          markdown += `# ${parseNode(child)}\n\n`;
          break;
        case 'h2':
          markdown += `## ${parseNode(child)}\n\n`;
          break;
        case 'h3':
          markdown += `### ${parseNode(child)}\n\n`;
          break;
        case 'h4':
          markdown += `#### ${parseNode(child)}\n\n`;
          break;
        case 'h5':
          markdown += `##### ${parseNode(child)}\n\n`;
          break;
        case 'h6':
          markdown += `###### ${parseNode(child)}\n\n`;
          break;
        case 'p':
          markdown += `${parseNode(child)}\n\n`;
          break;
        case 'strong':
        case 'b':
          markdown += `**${parseNode(child)}**`;
          break;
        case 'em':
        case 'i':
          markdown += `*${parseNode(child)}*`;
          break;
        case 'u':
          markdown += `<u>${parseNode(child)}</u>`;
          break;
        case 'code':
          markdown += `\`${parseNode(child)}\``;
          break;
        case 'pre':
          markdown += `\`\`\`\n${parseNode(child)}\n\`\`\`\n\n`;
          break;
        case 'blockquote':
          markdown += `> ${parseNode(child)}\n\n`;
          break;
        case 'a':
          markdown += `[${parseNode(child)}](${child.getAttribute('href')})`;
          break;
        case 'img':
          markdown += `![${child.getAttribute('alt') || ''}](${child.getAttribute('src')})`;
          break;
        case 'ul':
          markdown += parseListItems(child, '*');
          break;
        case 'ol':
          markdown += parseListItems(child, '1.');
          break;
        case 'br':
          markdown += '\n';
          break;
        case 'div':
          markdown += `${parseNode(child)}\n\n`;
          break;
        default:
          markdown += parseNode(child);
      }
    }
  }
  
  return markdown.trim();
};

/**
 * Parses list items to markdown
 * @param {Node} listNode - List DOM node
 * @param {string} marker - List marker (* or 1.)
 * @returns {string} - Markdown string
 */
const parseListItems = (listNode, marker) => {
  let markdown = '';
  
  for (const child of listNode.childNodes) {
    if (child.tagName && child.tagName.toLowerCase() === 'li') {
      markdown += `${marker} ${parseNode(child)}\n`;
    }
  }
  
  return markdown + '\n';
};

/**
 * Extracts plain text from HTML
 * @param {string} html - HTML string
 * @returns {string} - Plain text string
 */
export const extractPlainText = (html) => {
  if (!html) return '';
  
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get the text content
  return tempDiv.textContent || tempDiv.innerText || '';
};
