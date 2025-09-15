/**
 * 导出工具函数
 */

/**
 * 将HTML内容转换为纯文本
 * @param {string} html - HTML字符串
 * @returns {string} 纯文本
 */
export function htmlToText(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * 将HTML内容转换为Markdown格式
 * @param {string} html - HTML字符串
 * @returns {string} Markdown字符串
 */
export function htmlToMarkdown(html) {
  // 简单的HTML到Markdown转换
  let markdown = html
    // 标题
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    // 粗体
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // 斜体
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // 删除线
    .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~')
    // 下划线
    .replace(/<u[^>]*>(.*?)<\/u>/gi, '<u>$1</u>')
    // 代码
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n\n')
    // 引用
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    // 列表
    .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (items) {
        return items.map(item => 
          '- ' + item.replace(/<li[^>]*>(.*?)<\/li>/gi, '$1').trim()
        ).join('\n') + '\n\n';
      }
      return match;
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (items) {
        return items.map((item, index) => 
          `${index + 1}. ` + item.replace(/<li[^>]*>(.*?)<\/li>/gi, '$1').trim()
        ).join('\n') + '\n\n';
      }
      return match;
    })
    // 链接
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // 图片
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    // 换行
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    // 清理剩余的HTML标签
    .replace(/<[^>]*>/g, '')
    // 清理多余的空行
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return markdown;
}

/**
 * 下载文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} mimeType - MIME类型
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * 下载编辑器内容为不同格式
 * @param {string} htmlContent - HTML内容
 * @param {string} format - 格式 ('html', 'markdown', 'txt')
 */
export function downloadEditorContent(htmlContent, format = 'html') {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  let content, filename, mimeType;

  switch (format) {
    case 'html':
      content = htmlContent;
      filename = `document-${timestamp}.html`;
      mimeType = 'text/html';
      break;
    case 'markdown':
      content = htmlToMarkdown(htmlContent);
      filename = `document-${timestamp}.md`;
      mimeType = 'text/markdown';
      break;
    case 'txt':
      content = htmlToText(htmlContent);
      filename = `document-${timestamp}.txt`;
      mimeType = 'text/plain';
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  downloadFile(content, filename, mimeType);
}

/**
 * 打印编辑器内容
 * @param {string} htmlContent - HTML内容
 */
export function printEditorContent(htmlContent) {
  // 创建打印窗口
  const printWindow = window.open('', '_blank');
  
  // 创建打印样式
  const printStyles = `
    <style>
      @media print {
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #000;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        p {
          margin-bottom: 10px;
        }
        ul, ol {
          margin-bottom: 10px;
          padding-left: 20px;
        }
        blockquote {
          border-left: 3px solid #ccc;
          padding-left: 15px;
          margin: 15px 0;
          font-style: italic;
        }
        code {
          background-color: #f4f4f4;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        pre {
          background-color: #f4f4f4;
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      }
    </style>
  `;

  // 写入内容到打印窗口
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>打印文档</title>
      ${printStyles}
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `);

  printWindow.document.close();

  // 等待内容加载完成后打印
  printWindow.onload = function() {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}
