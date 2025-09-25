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
  tempContainer.style.width = '190mm'; // A4 width - 左右边距 (210mm - 20mm)
  tempContainer.style.minHeight = '267mm'; // A4 height - 上下边距 (297mm - 30mm)  
  tempContainer.style.padding = '15mm 10mm'; // 上下15mm，左右10mm
  tempContainer.style.color = '#000';
  tempContainer.style.backgroundColor = '#fff';
  tempContainer.style.boxSizing = 'border-box';
  tempContainer.style.wordBreak = 'break-word';
  tempContainer.style.hyphens = 'auto';
  
  // 应用打印样式
  const printStyles = document.createElement('style');
  printStyles.textContent = `
    /* 不强制覆盖字体，让编辑器中的字体设置生效 */
    h1 {
      color: #000 !important;
      font-size: 24pt !important;
      margin-top: 20px !important;
      margin-bottom: 10px !important;
      page-break-after: avoid !important;
      line-height: 1.2 !important;
      display: block !important;
      visibility: visible !important;
    }
    h2 {
      color: #000 !important;
      font-size: 20pt !important;
      margin-top: 18px !important;
      margin-bottom: 8px !important;
      page-break-after: avoid !important;
      line-height: 1.2 !important;
    }
    h3 {
      color: #000 !important;
      font-size: 16pt !important;
      margin-top: 16px !important;
      margin-bottom: 6px !important;
      page-break-after: avoid !important;
      line-height: 1.2 !important;
    }
    h4, h5, h6 {
      color: #000 !important;
      font-size: 14pt !important;
      margin-top: 14px !important;
      margin-bottom: 6px !important;
      page-break-after: avoid !important;
      line-height: 1.2 !important;
    }
    p {
      color: #000 !important;
      margin-bottom: 10px !important;
      orphans: 3 !important;
      widows: 3 !important;
      line-height: 1.6 !important;
    }
    ul, ol {
      color: #000 !important;
      margin-bottom: 10px !important;
      padding-left: 20px !important;
      line-height: 1.6 !important;
    }
    li {
      color: #000 !important;
      margin-bottom: 5px !important;
      line-height: 1.6 !important;
    }
    blockquote {
      color: #000 !important;
      border-left: 3px solid #ccc !important;
      padding-left: 15px !important;
      margin: 15px 0 !important;
      font-style: italic !important;
      line-height: 1.6 !important;
    }
    code {
      color: #000 !important;
      background-color: #f4f4f4 !important;
      padding: 2px 4px !important;
      border-radius: 3px !important;
      font-family: 'Courier New', monospace !important;
    }
    pre {
      color: #000 !important;
      background-color: #f4f4f4 !important;
      padding: 10px !important;
      border-radius: 5px !important;
      overflow-x: auto !important;
      page-break-inside: avoid !important;
      line-height: 1.4 !important;
    }
    pre code {
      font-family: 'Courier New', monospace !important;
    }
    a {
      color: #000 !important;
      text-decoration: underline !important;
    }
    /* 任务列表样式 - 复选框和文字在同一行 */
    ul[data-type="taskList"] {
      list-style: none !important;
      padding-left: 0 !important;
    }
    ul[data-type="taskList"] li {
      display: block !important;
      margin-bottom: 8px !important;
      line-height: 1.6 !important;
    }
    ul[data-type="taskList"] li input[type="checkbox"] {
      display: inline !important;
      margin-right: 4px !important;
      margin-top: 2px !important;
      vertical-align: top !important;
      width: 16px !important;
      height: 16px !important;
    }
    ul[data-type="taskList"] li > div {
      display: inline !important;
      text-align: left !important;
    }
    ul[data-type="taskList"] li p {
      display: inline !important;
      margin: 0 !important;
    }
    /* 普通列表项中的复选框 */
    li input[type="checkbox"] {
      display: inline !important;
      margin-right: 4px !important;
      margin-top: 2px !important;
      vertical-align: top !important;
      width: 16px !important;
      height: 16px !important;
    }
    /* 确保复选框和文字在同一行 */
    li {
      display: block !important;
    }
    li > *:not(input[type="checkbox"]) {
      display: inline !important;
    }
  `;
  
  // 将样式添加到临时容器的头部
  tempContainer.appendChild(printStyles);
  
  tempContainer.innerHTML = htmlContent;
  
  // 添加到DOM
  document.body.appendChild(tempContainer);
  
  try {
    // 使用html2canvas渲染为图片
    const canvas = await html2canvas(tempContainer, {
      scale: 3, // 提高清晰度，防止文字模糊
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: tempContainer.offsetWidth,
      height: tempContainer.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      // 改进文字渲染
      logging: false,
      // 确保字体正确加载
      onclone: function(clonedDoc) {
        // 确保字体样式正确应用，但不强制覆盖用户设置的字体
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }
          h1 {
            color: #000 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          h2, h3, h4, h5, h6 {
            color: #000 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
    
    // 创建PDF文档
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    
    // 计算图片在PDF中的尺寸
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
    // 如果内容超过一页，需要分页处理
    const topMargin = 15; // 顶部边距 (mm)
    const bottomMargin = 15; // 底部边距 (mm)
    const leftMargin = 10; // 左侧边距 (mm)
    const rightMargin = 10; // 右侧边距 (mm)
    const contentWidth = pageWidth - leftMargin - rightMargin; // 实际内容宽度 (mm)
    const contentHeight = pageHeight - topMargin - bottomMargin; // 实际内容高度 (mm)
    
    // 重新计算图片尺寸，考虑边距
    const adjustedImgWidth = contentWidth;
    const adjustedImgHeight = (canvas.height * contentWidth) / canvas.width;
    
    if (adjustedImgHeight <= contentHeight) {
      // 单页内容，添加边距
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', leftMargin, topMargin, adjustedImgWidth, adjustedImgHeight);
    } else {
      // 多页内容 - 改进的分页算法，考虑页面边距
      const canvasPageHeight = (contentHeight / adjustedImgWidth) * canvas.width; // 对应的canvas内容高度 (px)
      const totalPages = Math.ceil(canvas.height / canvasPageHeight);
      
      // 添加页面间距缓冲区，避免内容过于紧密
      const pageBuffer = 5; // 页面缓冲区 (px)，用于避免文字被截断
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // 计算当前页在原canvas中的位置和尺寸
        let sourceY = i * canvasPageHeight;
        let sourceHeight = Math.min(canvasPageHeight, canvas.height - sourceY);
        
        // 为非首页添加小的重叠缓冲区，确保文字不被截断
        if (i > 0) {
          sourceY = Math.max(0, sourceY - pageBuffer);
          sourceHeight = Math.min(canvasPageHeight + pageBuffer, canvas.height - sourceY);
        }
        
        // 为非最后一页减少一点高度，避免内容过于紧密
        if (i < totalPages - 1) {
          sourceHeight = Math.max(sourceHeight - pageBuffer, canvasPageHeight * 0.9);
        }
        
        // 创建临时canvas来裁剪当前页
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        if (!pageCtx) {
          console.error('无法创建canvas 2d context');
          continue;
        }
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        // 设置高质量渲染
        pageCtx.imageSmoothingEnabled = true;
        pageCtx.imageSmoothingQuality = 'high';
        
        // 填充白色背景
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        
        // 裁剪并绘制当前页内容
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight, // 源区域
          0, 0, canvas.width, sourceHeight        // 目标区域
        );
        
        // 计算在PDF中的实际高度
        const pdfImgHeight = (sourceHeight / canvas.width) * adjustedImgWidth;
        
        // 添加到PDF，保持页面边距
        pdf.addImage(
          pageCanvas.toDataURL('image/png', 0.95), 
          'PNG', 
          leftMargin, topMargin, // 添加左侧和顶部边距
          adjustedImgWidth, pdfImgHeight
        );
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
        /* 任务列表样式 - 复选框和文字在同一行 */
        ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        ul[data-type="taskList"] li {
          display: block;
          margin-bottom: 8px;
          line-height: 1.6;
        }
        ul[data-type="taskList"] li input[type="checkbox"] {
          display: inline;
          margin-right: 4px;
          margin-top: 2px;
          vertical-align: top;
          width: 16px;
          height: 16px;
        }
        ul[data-type="taskList"] li > div {
          display: inline;
          text-align: left;
        }
        ul[data-type="taskList"] li p {
          display: inline;
          margin: 0;
        }
        /* 普通列表项中的复选框 */
        li input[type="checkbox"] {
          display: inline;
          margin-right: 4px;
          margin-top: 2px;
          vertical-align: top;
          width: 16px;
          height: 16px;
        }
        /* 确保复选框和文字在同一行 */
        li {
          display: block;
        }
        li > *:not(input[type="checkbox"]) {
          display: inline;
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