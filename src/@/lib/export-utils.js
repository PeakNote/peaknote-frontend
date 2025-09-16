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
 * 将HTML内容转换为矢量PDF
 * @param {string} htmlContent - HTML内容
 * @returns {Promise<Blob>} PDF Blob
 */
export async function htmlToPDF(htmlContent) {
  const jsPDF = await loadJsPDF();
  
  // 创建PDF文档
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // 设置页面参数，与打印格式保持一致
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 20; // 20mm margin，与打印样式一致
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;
  const lineHeight = 4.8; // 12pt * 1.6 = 4.8mm，与打印样式一致
  
  // 设置字体，与打印样式一致
  pdf.setFont('helvetica'); // jsPDF中helvetica最接近Arial
  pdf.setFontSize(12); // 12pt基础字体大小
  
  // 解析HTML内容并转换为PDF文本
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // 处理带格式的文本内容，支持文本对齐
  function processFormattedText(node, x = margin, maxWidth = contentWidth, alignment = 'left') {
    if (currentY > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text.trim()) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        for (const line of lines) {
          if (currentY > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          
          // 根据对齐方式设置文本位置
          let textX = x;
          if (alignment === 'center') {
            textX = x + maxWidth / 2;
          } else if (alignment === 'right') {
            textX = x + maxWidth;
          }
          
          pdf.text(line, textX, currentY, { align: alignment });
          currentY += lineHeight;
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      
      // 处理内联格式标签
      if (['strong', 'b'].includes(tagName)) {
        const originalFont = pdf.internal.getFont();
        pdf.setFont('helvetica', 'bold');
        for (const child of node.childNodes) {
          processFormattedText(child, x, maxWidth, alignment);
        }
        pdf.setFont(originalFont.fontName, originalFont.fontStyle);
      }
      else if (['em', 'i'].includes(tagName)) {
        const originalFont = pdf.internal.getFont();
        pdf.setFont('helvetica', 'italic');
        for (const child of node.childNodes) {
          processFormattedText(child, x, maxWidth, alignment);
        }
        pdf.setFont(originalFont.fontName, originalFont.fontStyle);
      }
      else if (['u'].includes(tagName)) {
        // 下划线处理（jsPDF不直接支持，用下划线字符模拟）
        for (const child of node.childNodes) {
          processFormattedText(child, x, maxWidth, alignment);
        }
      }
      else if (['s', 'strike'].includes(tagName)) {
        // 删除线处理（用横线字符模拟）
        for (const child of node.childNodes) {
          processFormattedText(child, x, maxWidth, alignment);
        }
      }
      else if (['code'].includes(tagName)) {
        const originalFont = pdf.internal.getFont();
        pdf.setFont('courier');
        for (const child of node.childNodes) {
          processFormattedText(child, x, maxWidth, alignment);
        }
        pdf.setFont(originalFont.fontName, originalFont.fontStyle);
      }
      else if (['sup'].includes(tagName)) {
        // 上标处理
        const originalFontSize = pdf.internal.getFontSize();
        pdf.setFontSize(originalFontSize * 0.7);
        for (const child of node.childNodes) {
          processFormattedText(child, x, maxWidth, alignment);
        }
        pdf.setFontSize(originalFontSize);
      }
      else if (['sub'].includes(tagName)) {
        // 下标处理
        const originalFontSize = pdf.internal.getFontSize();
        pdf.setFontSize(originalFontSize * 0.7);
        for (const child of node.childNodes) {
          processFormattedText(child, x, maxWidth, alignment);
        }
        pdf.setFontSize(originalFontSize);
      }
      else if (['mark', 'highlight'].includes(tagName)) {
        // 高亮处理（背景色）
        const originalFont = pdf.internal.getFont();
        const originalFontSize = pdf.internal.getFontSize();
        
        // 获取高亮颜色
        const highlightColor = node.getAttribute('data-color') || node.style?.backgroundColor || '#ffff00';
        
        // 设置背景色（jsPDF通过填充矩形实现）
        const text = node.textContent;
        if (text.trim()) {
          const lines = pdf.splitTextToSize(text, maxWidth);
          for (const line of lines) {
            if (currentY > pageHeight - margin) {
              pdf.addPage();
              currentY = margin;
            }
            
            // 计算文本宽度
            const textWidth = pdf.getTextWidth(line);
            const textHeight = originalFontSize * 0.4; // 高亮高度
            
            // 设置高亮颜色
            const rgb = hexToRgb(highlightColor);
            if (rgb) {
              pdf.setFillColor(rgb.r, rgb.g, rgb.b);
              pdf.rect(x, currentY - textHeight, textWidth, textHeight, 'F');
            }
            
            // 绘制文本
            let textX = x;
            if (alignment === 'center') {
              textX = x + maxWidth / 2;
            } else if (alignment === 'right') {
              textX = x + maxWidth;
            }
            
            pdf.text(line, textX, currentY, { align: alignment });
            currentY += lineHeight;
          }
        }
      }
      else if (['a'].includes(tagName)) {
        // 链接处理
        const originalFont = pdf.internal.getFont();
        const originalFontSize = pdf.internal.getFontSize();
        const href = node.getAttribute('href');
        
        // 设置链接样式（蓝色+下划线）
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(0, 0, 255); // 蓝色
        
        for (const child of node.childNodes) {
          processFormattedText(child, x, maxWidth, alignment);
        }
        
        // 恢复原始样式
        pdf.setFont(originalFont.fontName, originalFont.fontStyle);
        pdf.setTextColor(0, 0, 0); // 黑色
      }
      else {
        // 处理其他内联元素
        for (const child of node.childNodes) {
          processFormattedText(child, x, maxWidth, alignment);
        }
      }
    }
  }

  // 将十六进制颜色转换为RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // 获取文本对齐方式
  function getTextAlignment(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const style = node.getAttribute('style');
      if (style) {
        const textAlignMatch = style.match(/text-align:\s*(\w+)/);
        if (textAlignMatch) {
          return textAlignMatch[1];
        }
      }
      
      // 检查data-text-align属性（Tiptap编辑器使用）
      const dataAlign = node.getAttribute('data-text-align');
      if (dataAlign) {
        return dataAlign;
      }
    }
    return 'left'; // 默认左对齐
  }

  // 递归处理DOM节点
  function processNode(node, depth = 0) {
    if (currentY > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        // 处理文本内容
        const lines = pdf.splitTextToSize(text, contentWidth);
        for (const line of lines) {
          if (currentY > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += lineHeight;
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const alignment = getTextAlignment(node);
      
      // 处理标题，与打印格式保持一致
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        currentY += 8; // 标题前间距，与打印样式一致
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        const level = parseInt(tagName.charAt(1));
        // 调整字体大小，与打印样式更一致
        const fontSize = 16 - (level - 1) * 1.5; // h1=16, h2=14.5, h3=13, etc.
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'bold');
        
        // 使用格式化文本处理，支持对齐
        for (const child of node.childNodes) {
          processFormattedText(child, margin, contentWidth, alignment);
        }
        
        currentY += 4; // 标题后间距，与打印样式一致
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
      }
      // 处理段落，与打印格式保持一致
      else if (tagName === 'p') {
        currentY += 2; // 段落前间距，与打印样式一致
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        // 使用格式化文本处理，支持对齐
        for (const child of node.childNodes) {
          processFormattedText(child, margin, contentWidth, alignment);
        }
        
        currentY += 2; // 段落后间距，与打印样式一致
      }
      // 处理列表，与打印格式保持一致
      else if (['ul', 'ol'].includes(tagName)) {
        currentY += 2; // 列表前间距，与打印样式一致
        const isOrdered = tagName === 'ol';
        let itemNumber = 1;
        
        for (const child of node.children) {
          if (child.tagName.toLowerCase() === 'li') {
            if (currentY > pageHeight - margin) {
              pdf.addPage();
              currentY = margin;
            }
            
            const prefix = isOrdered ? `${itemNumber}. ` : '• ';
            pdf.text(prefix, margin + 10, currentY);
            
            // 处理列表项内容，支持格式
            for (const grandChild of child.childNodes) {
              processFormattedText(grandChild, margin + 20, contentWidth - 20);
            }
            itemNumber++;
          }
        }
        currentY += 2; // 列表后间距，与打印样式一致
      }
      // 处理引用，与打印格式保持一致
      else if (tagName === 'blockquote') {
        currentY += 4; // 引用前间距，与打印样式一致
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        // 绘制左边框，与打印样式一致
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY - 4, margin, currentY + 15);
        
        // 使用格式化文本处理
        for (const child of node.childNodes) {
          processFormattedText(child, margin + 10, contentWidth - 15);
        }
        currentY += 4; // 引用后间距，与打印样式一致
      }
      // 处理预格式化文本，与打印格式保持一致
      else if (tagName === 'pre') {
        currentY += 2; // 预格式化文本前间距，与打印样式一致
        pdf.setFont('courier');
        const text = node.textContent.trim();
        const lines = text.split('\n');
        for (const line of lines) {
          if (currentY > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += lineHeight;
        }
        currentY += 2; // 预格式化文本后间距，与打印样式一致
        pdf.setFont('helvetica');
      }
      // 处理图片
      else if (tagName === 'img') {
        currentY += 4; // 图片前间距
        if (currentY > pageHeight - margin - 20) {
          pdf.addPage();
          currentY = margin;
        }
        
        const src = node.getAttribute('src');
        const alt = node.getAttribute('alt') || 'Image';
        const width = parseInt(node.getAttribute('width')) || 100;
        const height = parseInt(node.getAttribute('height')) || 100;
        
        // 计算图片在PDF中的尺寸
        const maxWidth = contentWidth;
        const maxHeight = 50; // 最大高度50mm
        let imgWidth = width;
        let imgHeight = height;
        
        // 按比例缩放
        if (imgWidth > maxWidth) {
          imgHeight = (imgHeight * maxWidth) / imgWidth;
          imgWidth = maxWidth;
        }
        if (imgHeight > maxHeight) {
          imgWidth = (imgWidth * maxHeight) / imgHeight;
          imgHeight = maxHeight;
        }
        
        // 居中显示图片
        const imgX = margin + (contentWidth - imgWidth) / 2;
        
        try {
          // 尝试添加图片（如果是base64或URL）
          if (src.startsWith('data:') || src.startsWith('http')) {
            pdf.addImage(src, 'JPEG', imgX, currentY, imgWidth, imgHeight);
          } else {
            // 如果是相对路径，显示占位符
            pdf.setFillColor(240, 240, 240);
            pdf.rect(imgX, currentY, imgWidth, imgHeight, 'F');
            pdf.setTextColor(100, 100, 100);
            pdf.setFontSize(8);
            pdf.text(alt, imgX + imgWidth/2, currentY + imgHeight/2, { align: 'center' });
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(12);
          }
        } catch (error) {
          // 如果图片加载失败，显示占位符
          pdf.setFillColor(240, 240, 240);
          pdf.rect(imgX, currentY, imgWidth, imgHeight, 'F');
          pdf.setTextColor(100, 100, 100);
          pdf.setFontSize(8);
          pdf.text(alt, imgX + imgWidth/2, currentY + imgHeight/2, { align: 'center' });
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(12);
        }
        
        currentY += imgHeight + 4; // 图片后间距
      }
      // 处理水平线
      else if (tagName === 'hr') {
        currentY += 4; // 水平线前间距
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        // 绘制水平线
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, margin + contentWidth, currentY);
        
        currentY += 4; // 水平线后间距
      }
      // 处理任务列表项
      else if (tagName === 'li' && node.getAttribute('data-type') === 'taskItem') {
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        const isChecked = node.getAttribute('data-checked') === 'true';
        const checkbox = isChecked ? '☑' : '☐';
        const text = node.textContent.trim();
        
        // 绘制复选框和文本
        pdf.text(checkbox + ' ', margin + 10, currentY);
        
        // 处理任务项内容，支持格式
        for (const child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent.trim();
            if (text) {
              const lines = pdf.splitTextToSize(text, contentWidth - 30);
              for (const line of lines) {
                if (currentY > pageHeight - margin) {
                  pdf.addPage();
                  currentY = margin;
                }
                pdf.text(line, margin + 20, currentY);
                currentY += lineHeight;
              }
            }
          } else {
            processFormattedText(child, margin + 20, contentWidth - 20, alignment);
          }
        }
      }
      // 处理其他元素
      else {
        // 递归处理子节点
        for (const child of node.childNodes) {
          processNode(child, depth + 1);
        }
      }
    }
  }
  
  // 处理所有子节点
  for (const child of tempDiv.childNodes) {
    processNode(child);
  }
  
  return pdf.output('blob');
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
