/**
 * 导出工具函数
 */

// 动态导入jsPDF
let jsPDF = null;

const loadJsPDF = async () => {
  if (!jsPDF) {
    const { default: jsPDFModule } = await import('jspdf');
    jsPDF = jsPDFModule;
  }
  return jsPDF;
};

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
 * 将HTML内容转换为PDF（使用html2canvas保持字体）
 * @param {string} htmlContent - HTML内容
 * @returns {Promise<Blob>} PDF Blob
 */
export async function htmlToPDF(htmlContent) {
  const jsPDF = await loadJsPDF();
  
  // 动态导入html2canvas
  const { default: html2canvas } = await import('html2canvas');
  
  // 创建临时容器来渲染HTML内容
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '210mm'; // A4 width
  tempContainer.style.padding = '20mm';
  tempContainer.style.fontFamily = 'PublicSans, Arial, sans-serif';
  tempContainer.style.fontSize = '12pt';
  tempContainer.style.lineHeight = '1.6';
  tempContainer.style.color = '#000';
  tempContainer.style.backgroundColor = '#fff';
  tempContainer.innerHTML = htmlContent;
  
  // 添加到DOM
  document.body.appendChild(tempContainer);
  
  try {
    // 使用html2canvas渲染为图片
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // 提高清晰度
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: tempContainer.offsetWidth,
      height: tempContainer.offsetHeight,
      scrollX: 0,
      scrollY: 0
    });
    
    // 创建PDF文档
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    
    // 计算图片在PDF中的尺寸
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
    // 如果内容超过一页，需要分页处理
    if (imgHeight <= pageHeight) {
      // 单页内容
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // 多页内容
      const totalPages = Math.ceil(imgHeight / pageHeight);
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const sourceY = i * pageHeight * (canvas.height / imgHeight);
        const sourceHeight = Math.min(pageHeight * (canvas.height / imgHeight), canvas.height - sourceY);
        
        // 创建临时canvas来裁剪当前页
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );
        
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, pageHeight);
      }
    }
    
    return pdf.output('blob');
    
  } finally {
    // 清理临时容器
    document.body.removeChild(tempContainer);
  }
}

/**
 * 下载编辑器内容为不同格式
 * @param {string} htmlContent - HTML内容
 * @param {string} format - 格式 ('html', 'markdown', 'txt', 'pdf')
 */
export async function downloadEditorContent(htmlContent, format = 'html') {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  let content, filename, mimeType;

  switch (format) {
    case 'html':
      content = htmlContent;
      filename = `document-${timestamp}.html`;
      mimeType = 'text/html';
      downloadFile(content, filename, mimeType);
      break;
    case 'markdown':
      content = htmlToMarkdown(htmlContent);
      filename = `document-${timestamp}.md`;
      mimeType = 'text/markdown';
      downloadFile(content, filename, mimeType);
      break;
    case 'txt':
      content = htmlToText(htmlContent);
      filename = `document-${timestamp}.txt`;
      mimeType = 'text/plain';
      downloadFile(content, filename, mimeType);
      break;
    case 'pdf':
      try {
        const pdfBlob = await htmlToPDF(htmlContent);
        filename = `document-${timestamp}.pdf`;
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('PDF生成失败:', error);
        throw new Error('PDF生成失败，请重试');
      }
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
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