"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"
import { Selection } from "@tiptap/extensions"
import { FontFamily } from "@tiptap/extension-font-family"
import { TextStyle } from "@tiptap/extension-text-style"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { FontDropdownMenu } from "@/components/tiptap-ui/font-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import { ShareButton } from "@/components/tiptap-ui/share-button"
import { DownloadButton } from "@/components/tiptap-ui/download-button"
import { PrintButton } from "@/components/tiptap-ui/print-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Components ---
// ThemeToggle removed - using default dark mode

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import content from "@/components/tiptap-templates/simple/data/content.json"

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  onShareClick
}) => {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} portal={isMobile} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton />
        <FontDropdownMenu portal={isMobile} />
      </ToolbarGroup>
      <Spacer />
      <ToolbarGroup>
        <ShareButton onClick={onShareClick} />
        <DownloadButton />
        <PrintButton />
      </ToolbarGroup>
    </>
  );
}

const MobileToolbarContent = ({
  type,
  onBack
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({ content, onChange, onShareClick }) {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState("main")
  const [isToolbarFloating, setIsToolbarFloating] = React.useState(false)
  const toolbarRef = React.useRef(null)
  const editorWrapperRef = React.useRef(null)

  // 设置默认夜间模式
  React.useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  // 监听滚动，实现工具栏悬浮效果
  React.useEffect(() => {
    const handleScroll = () => {
      if (!editorWrapperRef.current || !toolbarRef.current) return

      const wrapperRect = editorWrapperRef.current.getBoundingClientRect()
      const toolbarRect = toolbarRef.current.getBoundingClientRect()
      
      // 当编辑器容器顶部超出视窗时，激活悬浮状态
      const shouldFloat = wrapperRect.top < -50 // 给一些缓冲距离
      
      if (shouldFloat !== isToolbarFloating) {
        setIsToolbarFloating(shouldFloat)
      }
    }

    // 使用节流优化性能
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [isToolbarFloating])

  const editor = useEditor({
    immediatelyRender: true,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ 
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left'
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Underline,
      Selection,
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: content || content,
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  // 使用ref来跟踪是否是用户输入导致的内容变化
  const isUserInputRef = React.useRef(false);
  const lastContentRef = React.useRef(null);

  // Update editor content when content prop changes
  React.useEffect(() => {
    if (editor && content) {
      // 如果是用户输入导致的变化，跳过重新设置
      if (isUserInputRef.current) {
        isUserInputRef.current = false;
        return;
      }

      // 检查内容是否真的发生了变化
      const currentContent = editor.getJSON();
      const isContentDifferent = JSON.stringify(currentContent) !== JSON.stringify(content);
      
      if (isContentDifferent) {
        console.log('SimpleEditor: Updating editor content with:', content);
        try {
          // 保存当前光标位置
          const { from, to } = editor.state.selection;
          
          // 设置新内容
          editor.commands.setContent(content);
          
          // 尝试恢复光标位置
          try {
            editor.commands.setTextSelection({ from, to });
          } catch (e) {
            // 如果恢复光标位置失败，将光标移到末尾
            editor.commands.setTextSelection(editor.state.doc.content.size);
          }
          
          console.log('SimpleEditor: Content set successfully');
        } catch (error) {
          console.error('SimpleEditor: Error setting content:', error);
          // Fallback: try to set as plain text
          if (typeof content === 'string') {
            editor.commands.setContent(content);
          } else if (content && content.content) {
            editor.commands.setContent(content.content);
          }
        }
      }
    }
  }, [editor, content])

  // 防抖处理，减少频繁更新
  const debouncedOnChange = React.useCallback(
    React.useMemo(() => {
      let timeoutId;
      return (json) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onChange(json);
        }, 100); // 100ms防抖
      };
    }, [onChange]),
    [onChange]
  );

  // Handle content changes
  React.useEffect(() => {
    if (editor && onChange) {
      const handleUpdate = () => {
        // 标记这是用户输入导致的变化
        isUserInputRef.current = true;
        const json = editor.getJSON()
        debouncedOnChange(json)
      }
      
      editor.on('update', handleUpdate)
      return () => {
        editor.off('update', handleUpdate)
      }
    }
  }, [editor, onChange, debouncedOnChange])

  return (
    <div className="simple-editor-wrapper" ref={editorWrapperRef}>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          className={isToolbarFloating ? 'toolbar-floating' : ''}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}>
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              onShareClick={onShareClick} />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")} />
          )}
        </Toolbar>

        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
      </EditorContext.Provider>
    </div>
  );
}
