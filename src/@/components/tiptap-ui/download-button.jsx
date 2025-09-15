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

  const handleClick = React.useCallback(async (e) => {
    e.preventDefault()
    
    if (!editor) return

    // 获取编辑器内容
    const htmlContent = editor.getHTML()
    
    try {
      // 直接下载PDF格式
      await downloadEditorContent(htmlContent, 'pdf')
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
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
