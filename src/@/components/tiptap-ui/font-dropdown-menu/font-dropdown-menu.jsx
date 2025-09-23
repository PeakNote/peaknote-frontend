import * as React from "react"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"

// --- Styles ---
import "./font-dropdown-menu.scss"

// 8种主流英文字体选项 - 使用双引号包裹的字体名称
const FONT_OPTIONS = [
  { value: "Arial", label: "Arial", fontFamily: "Arial" },
  { value: "Times New Roman", label: "Times New Roman", fontFamily: '"Times New Roman"' },
  { value: "Helvetica", label: "Helvetica", fontFamily: "Helvetica" },
  { value: "Georgia", label: "Georgia", fontFamily: "Georgia" },
  { value: "Verdana", label: "Verdana", fontFamily: "Verdana" },
  { value: "Courier New", label: "Courier New", fontFamily: '"Courier New"' },
  { value: "Calibri", label: "Calibri", fontFamily: "Calibri" },
  { value: "Trebuchet MS", label: "Trebuchet MS", fontFamily: '"Trebuchet MS"' },
]



/**
 * 字体选择下拉菜单组件
 */
export const FontDropdownMenu = React.forwardRef((
  {
    editor: providedEditor,
    portal = true,
    onOpenChange,
    ...buttonProps
  },
  ref
) => {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentFont, setCurrentFont] = React.useState("Arial")

  const handleOpenChange = React.useCallback((open) => {
    console.log('Font dropdown open change:', open, 'editor:', !!editor)
    if (!editor) return
    setIsOpen(open)
    onOpenChange?.(open)
  }, [editor, onOpenChange])

  const handleFontSelect = React.useCallback((fontValue) => {
    if (!editor) {
      console.error('Font dropdown: No editor available')
      return
    }
    
    const fontOption = FONT_OPTIONS.find(font => font.value === fontValue)
    if (!fontOption) {
      console.error('Font dropdown: Font option not found:', fontValue)
      return
    }

    console.log('Attempting to apply font:', fontOption.fontFamily)
    
    try {
      // 检查是否有选中的文本
      const { from, to } = editor.state.selection
      const hasSelection = from !== to
      
      if (!hasSelection) {
        // 如果没有选中文本，先选中当前段落
        const { $from } = editor.state.selection
        const start = $from.start()
        const end = $from.end()
        
        // 选中当前段落
        editor.commands.setTextSelection({ from: start, to: end })
        
        // 等待选择完成后再应用字体
        setTimeout(() => {
          try {
            editor.commands.setFontFamily(fontOption.fontFamily)
            setCurrentFont(fontValue)
            setIsOpen(false)
            console.log('Font applied successfully (delayed):', fontOption.fontFamily)
          } catch (delayedError) {
            console.error('Font dropdown: Delayed font application failed:', delayedError)
            // 如果延迟应用也失败，至少更新UI状态
            setCurrentFont(fontValue)
            setIsOpen(false)
          }
        }, 10)
        return
      }
      
      // 有选中文本时直接应用字体
      editor.commands.setFontFamily(fontOption.fontFamily)
      setCurrentFont(fontValue)
      setIsOpen(false)
      console.log('Font applied successfully:', fontOption.fontFamily)
    } catch (error) {
      console.error('Font dropdown: Error applying font:', error)
      // 如果失败，尝试使用chain方法
      try {
        const { from, to } = editor.state.selection
        const hasSelection = from !== to
        
        if (!hasSelection) {
          // 选中当前段落
          const { $from } = editor.state.selection
          const start = $from.start()
          const end = $from.end()
          editor.commands.setTextSelection({ from: start, to: end })
        }
        
        editor.chain().focus().setFontFamily(fontOption.fontFamily).run()
        setCurrentFont(fontValue)
        setIsOpen(false)
        console.log('Font applied with chain method:', fontOption.fontFamily)
      } catch (chainError) {
        console.error('Font dropdown: Chain method also failed:', chainError)
        // 如果还是失败，尝试直接设置文档样式
        try {
          // 设置整个文档的默认字体
          editor.commands.updateAttributes('textStyle', { fontFamily: fontOption.fontFamily })
          setCurrentFont(fontValue)
          setIsOpen(false)
          console.log('Font applied with updateAttributes:', fontOption.fontFamily)
        } catch (updateError) {
          console.error('Font dropdown: All methods failed:', updateError)
          // 最后至少更新UI状态
          setCurrentFont(fontValue)
          setIsOpen(false)
        }
      }
    }
  }, [editor])

  // 检查当前选择的字体
  React.useEffect(() => {
    if (!editor) return

    const updateCurrentFont = () => {
      try {
        const { fontFamily } = editor.getAttributes('textStyle')
        if (fontFamily) {
          const matchedFont = FONT_OPTIONS.find(font => 
            fontFamily.includes(font.value) || fontFamily.includes(font.value.replace(/'/g, ''))
          )
          if (matchedFont) {
            setCurrentFont(matchedFont.value)
          } else {
            // 如果没有匹配的字体，设置为默认字体
            setCurrentFont("Arial")
          }
        } else {
          setCurrentFont("Arial")
        }
      } catch (error) {
        console.error('Font dropdown: Error updating current font:', error)
        setCurrentFont("Arial")
      }
    }

    editor.on('selectionUpdate', updateCurrentFont)
    editor.on('transaction', updateCurrentFont)
    
    return () => {
      editor.off('selectionUpdate', updateCurrentFont)
      editor.off('transaction', updateCurrentFont)
    }
  }, [editor])

  // 如果编辑器不可用，不渲染组件
  if (!editor) {
    console.log('Font dropdown: No editor available')
    return null
  }

  return (
    <div className="font-dropdown-menu">
      <DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            role="button"
            tabIndex={-1}
            aria-label="选择字体"
            tooltip="字体"
            className="font-trigger-button"
            onClick={() => console.log('Font button clicked, editor:', !!editor)}
            {...buttonProps}
            ref={ref}>
            <span 
              className="font-name"
              style={{ fontFamily: FONT_OPTIONS.find(f => f.value === currentFont)?.fontFamily }}
            >
              {currentFont}
            </span>
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          portal={true}
          side="bottom"
          sideOffset={4}
          avoidCollisions={true}
          collisionPadding={8}
        >
          <Card>
            <CardBody>
              {FONT_OPTIONS.map((font) => (
                <DropdownMenuItem 
                  key={font.value} 
                  asChild
                  onClick={() => handleFontSelect(font.value)}
                >
                  <Button
                    type="button"
                    data-style="ghost"
                    className="font-option-button"
                    style={{ 
                      fontFamily: font.fontFamily
                    }}
                  >
                    {font.label}
                  </Button>
                </DropdownMenuItem>
              ))}
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
})

FontDropdownMenu.displayName = "FontDropdownMenu"

export default FontDropdownMenu
