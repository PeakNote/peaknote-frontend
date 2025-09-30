import { useCallback, useState, useEffect } from "react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

export const useSave = () => {
  const { editor } = useTiptapEditor()
  const [isSaving, setIsSaving] = useState(false)

  // 监听自动保存状态
  useEffect(() => {
    const handleAutoSaveStatus = (event) => {
      setIsSaving(event.detail.isSaving)
    }

    window.addEventListener('auto-save-status', handleAutoSaveStatus)
    return () => window.removeEventListener('auto-save-status', handleAutoSaveStatus)
  }, [])

  const handleSave = useCallback(() => {
    if (!editor) return

    // 触发手动保存事件
    const saveEvent = new CustomEvent('tiptap-manual-save', {
      detail: { content: editor.getJSON() }
    })
    window.dispatchEvent(saveEvent)
  }, [editor])

  const canSave = !!editor

  return {
    handleSave,
    canSave,
    isSaving
  }
}
