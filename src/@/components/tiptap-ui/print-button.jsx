import * as React from "react"

// --- Icons ---
import { PrinterIcon } from "@/components/tiptap-icons/printer-icon"

// --- Tiptap UI Primitive ---
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Utils ---
import { printEditorContent } from "@/lib/export-utils"

export const PrintButton = React.forwardRef(({ editor: providedEditor, ...props }, ref) => {
  const { editor } = useTiptapEditor(providedEditor)

  const handleClick = React.useCallback((e) => {
    e.preventDefault()
    
    if (!editor) return

    // 获取编辑器内容
    const htmlContent = editor.getHTML()
    
    try {
      printEditorContent(htmlContent)
    } catch (error) {
      console.error('打印失败:', error)
      alert('打印失败，请重试')
    }
  }, [editor])

  return (
    <Button
      ref={ref}
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Print document"
      tooltip="Print"
      onClick={handleClick}
      {...props}>
      <PrinterIcon className="tiptap-button-icon" />
    </Button>
  )
})

PrintButton.displayName = "PrintButton"

export default PrintButton
