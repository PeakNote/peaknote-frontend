import * as React from "react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { SaveIcon } from "@/components/tiptap-icons/save-icon"
import { LoadingIcon } from "@/components/tiptap-icons/loading-icon"
import { useSave } from "./use-save"

export const SaveButton = React.forwardRef(({ 
  className, 
  variant = "ghost", 
  size = "sm",
  ...props 
}, ref) => {
  const { isSaving, handleSave, canSave } = useSave()

  return (
    <Button
      ref={ref}
      className={className}
      variant={variant}
      size={size}
      onClick={handleSave}
      disabled={!canSave || isSaving}
      title={isSaving ? "保存中..." : "保存 (Ctrl+S)"}
      {...props}
    >
      {isSaving ? <LoadingIcon className="tiptap-button-icon" /> : <SaveIcon className="tiptap-button-icon" />}
    </Button>
  )
})

SaveButton.displayName = "SaveButton"
