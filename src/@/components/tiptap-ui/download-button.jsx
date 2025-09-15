import * as React from "react"

// --- Icons ---
import { DownloadIcon } from "@/components/tiptap-icons/download-icon"

// --- Tiptap UI Primitive ---
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Utils ---
import { downloadEditorContent } from "@/lib/export-utils"

export const DownloadButton = React.forwardRef(({ editor: providedEditor, ...props }, ref) => {
  const { editor } = useTiptapEditor(providedEditor)

  const handleClick = React.useCallback((e) => {
    e.preventDefault()
    
    if (!editor) return

    // 获取编辑器内容
    const htmlContent = editor.getHTML()
    
    // 显示格式选择对话框
    const format = prompt('选择下载格式:\n1. HTML\n2. Markdown\n3. 纯文本\n\n请输入数字 (1-3):', '1')
    
    if (format) {
      let selectedFormat = 'html'
      switch (format.trim()) {
        case '1':
          selectedFormat = 'html'
          break
        case '2':
          selectedFormat = 'markdown'
          break
        case '3':
          selectedFormat = 'txt'
          break
        default:
          alert('无效选择，将下载为HTML格式')
          selectedFormat = 'html'
      }
      
      try {
        downloadEditorContent(htmlContent, selectedFormat)
      } catch (error) {
        console.error('下载失败:', error)
        alert('下载失败，请重试')
      }
    }
  }, [editor])

  return (
    <Button
      ref={ref}
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Download document"
      tooltip="Download"
      onClick={handleClick}
      {...props}>
      <DownloadIcon className="tiptap-button-icon" />
    </Button>
  )
})

DownloadButton.displayName = "DownloadButton"

export default DownloadButton
