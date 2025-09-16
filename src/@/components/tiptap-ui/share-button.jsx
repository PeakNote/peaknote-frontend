import * as React from "react"

// --- Icons ---
import { ShareIcon } from "@/components/tiptap-icons/share-icon"

// --- Tiptap UI Primitive ---
import { Button } from "@/components/tiptap-ui-primitive/button"

export const ShareButton = React.forwardRef(({ onClick, ...props }, ref) => {
  const handleClick = React.useCallback((e) => {
    e.preventDefault()
    console.log('Share button clicked');
    onClick?.(e)
  }, [onClick])

  return (
    <Button
      ref={ref}
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Share document"
      tooltip="Share"
      onClick={handleClick}
      {...props}>
      <ShareIcon className="tiptap-button-icon" />
    </Button>
  )
})

ShareButton.displayName = "ShareButton"

export default ShareButton



