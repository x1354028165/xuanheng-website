'use client';

import { useMemo } from 'react';
import { getStrapiMedia } from '@/lib/strapi';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Basic markdown-to-HTML converter.
 * Handles: headings, bold, italic, links, images, paragraphs, line breaks,
 * unordered lists, ordered lists, inline code, and code blocks.
 */
function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (``` ... ```)
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.slice(3, -3).replace(/^\w*\n/, '');
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images: ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt: string, src: string) => {
    const resolvedSrc = getStrapiMedia(src);
    return `<img src="${resolvedSrc}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" style="max-width:100%;height:auto" />`;
  });

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Headings (must come before line-level processing)
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr />');

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Unordered lists
  html = html.replace(/^[*-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> that aren't inside <ul> into <ol>
  html = html.replace(/<\/ul>\s*<ul>/g, ''); // merge adjacent lists

  // Paragraphs: wrap lines not already in a block element
  const blockElements = /^<(h[1-6]|ul|ol|li|pre|hr|blockquote)/;
  const lines = html.split('\n');
  const processed: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) {
        processed.push('</p>');
        inParagraph = false;
      }
      continue;
    }
    if (blockElements.test(trimmed)) {
      if (inParagraph) {
        processed.push('</p>');
        inParagraph = false;
      }
      processed.push(trimmed);
    } else {
      if (!inParagraph) {
        processed.push('<p>');
        inParagraph = true;
      }
      processed.push(trimmed);
    }
  }
  if (inParagraph) {
    processed.push('</p>');
  }

  return processed.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = useMemo(() => markdownToHtml(content || ''), [content]);

  return (
    <div
      className={className || 'prose max-w-none'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
