"use client";

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

/**
 * Renders markdown content to HTML with unified/remark pipeline
 * @param {string} markdown - The markdown content to convert
 * @returns {string} HTML string
 */
export function renderMarkdownToHTML(markdown) {
  try {
    // Safety check for invalid input
    if (!markdown || typeof markdown !== 'string') {
      console.warn('Invalid markdown input:', markdown);
      return '';
    }

    // Use a simple regex-based approach if the unified/remark libraries aren't available
    if (typeof unified !== 'function') {
      return simpleMarkdownToHTML(markdown);
    }
    
    // Process the markdown with unified/remark
    const result = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkBreaks)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSanitize)
      .use(rehypeRaw)
      .use(rehypeStringify)
      .processSync(markdown);
    
    return result.toString();
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Fallback to simple HTML escaping to avoid breaking the UI
    return simpleMarkdownToHTML(markdown);
  }
}

/**
 * Simple markdown to HTML converter as fallback
 * @param {string} markdown - The markdown content to convert
 * @returns {string} HTML string
 */
export function simpleMarkdownToHTML(markdown) {
  if (!markdown) return '';
  
  // Safety check - ensure it's a string
  if (typeof markdown !== 'string') {
    try {
      markdown = String(markdown);
    } catch (e) {
      console.error('Failed to convert markdown to string:', e);
      return '<p>Error displaying content</p>';
    }
  }
  
  // Escape HTML to prevent XSS
  const escapeHTML = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
    
  const escaped = escapeHTML(markdown);
  
  // Process markdown with improved regex patterns
  return escaped
    // Handle bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle links - ensure they're safe
    .replace(/\[([^\\[]+)\]\(([^\\)]+)\)/g, (match, text, url) => {
      // Basic URL validation
      if (url.startsWith('javascript:')) {
        return `[${text}](unsafe link)`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    // Handle headers (h3)
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Handle headers (h2)
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    // Handle headers (h1)
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Handle unordered lists
    .replace(/^\s*[\-\*] (.*$)/gm, '<li>$1</li>')
    // Handle ordered lists
    .replace(/^\s*(\d+)\. (.*$)/gm, '<li>$2</li>')
    // Wrap lists in ul/ol tags
    // .replace(/(<li>.*<\/li>)\n(?![<]li>)/g, '<ul>$1</ul>')
    // Handle code blocks with language support
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="language-${lang || 'text'}"><code>${code}</code></pre>`;
    })
    // Handle inline code
    .replace(/`([^`]*?)`/g, '<code>$1</code>')
    // Handle blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Handle horizontal rules
    .replace(/^\s*[\-_=]{3,}\s*$/gm, '<hr>')
    // Handle paragraphs - wrap text that isn't already wrapped
    .replace(/^([^<].*[^>])$/gm, '<p>$1</p>')
    // Handle paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Wrap in paragraph
    .replace(/^(.*)/, '<p>$1</p>');
}
