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
import { SaveButton } from "@/components/tiptap-ui/save-button"
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
        <SaveButton />
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
  const [, setEditorKey] = React.useState(0) // 用于强制重新创建编辑器
  const toolbarRef = React.useRef(null)
  const editorWrapperRef = React.useRef(null)
  const errorCountRef = React.useRef(0) // 错误计数器

  // 设置默认夜间模式
  React.useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  // 强制重新创建编辑器的函数
  const forceRecreateEditor = React.useCallback(() => {
    console.log('SimpleEditor: Force recreating editor due to errors');
    setEditorKey(prev => prev + 1);
    errorCountRef.current = 0;
  }, []);

  // 全局错误处理器 - 只屏蔽错误提示，不重建编辑器
  React.useEffect(() => {
    const handleGlobalError = (event) => {
      const msg = event && event.error && event.error.message ? String(event.error.message) : '';
      if (!msg) return;
      // 屏蔽与 ProseMirror 片段越界/位置计算相关的错误
      const shouldSuppress = (
        msg.includes('contentMatchAt') ||
        msg.includes('outside of fragment') ||
        msg.includes('Position -1') ||
        msg.includes('nodeAt') ||
        msg.includes('RangeError')
      );
      if (shouldSuppress) {
        event.preventDefault();
        event.stopPropagation && event.stopPropagation();
        console.warn('SimpleEditor: Suppressed editor runtime error (non-critical):', msg);
        // 不重建编辑器，只是阻止错误弹窗
      }
    };

    const handleUnhandledRejection = (event) => {
      const msg = event && event.reason && event.reason.message ? String(event.reason.message) : '';
      if (!msg) return;
      const shouldSuppress = (
        msg.includes('contentMatchAt') ||
        msg.includes('outside of fragment') ||
        msg.includes('Position -1') ||
        msg.includes('nodeAt') ||
        msg.includes('RangeError')
      );
      if (shouldSuppress) {
        event.preventDefault();
        console.warn('SimpleEditor: Suppressed unhandled rejection (non-critical):', msg);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 监听滚动，实现工具栏悬浮效果
  React.useEffect(() => {
    const handleScroll = () => {
      if (!editorWrapperRef.current || !toolbarRef.current) return

      const wrapperRect = editorWrapperRef.current.getBoundingClientRect()
      
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
    immediatelyRender: false, // 禁用立即渲染，避免初始化问题
    shouldRerenderOnTransaction: false, // 禁用事务重渲染
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleKeyDown: (view, event) => {
        try {
          // 拦截撤销/重做操作，防止访问无效历史记录
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
            const { state } = view;
            const { doc } = state;
            
            // 检查文档是否只有一个空段落（初始状态）
            if (doc.childCount === 1 && doc.firstChild.type.name === 'paragraph' && doc.firstChild.content.size === 0) {
              console.log('SimpleEditor: Prevented undo/redo on empty document');
              event.preventDefault();
              return true;
            }
            
            // 让TipTap处理撤销/重做
            return false;
          }
          
          // 拦截可能导致问题的键盘操作
          if (event.key === 'Backspace' || event.key === 'Delete') {
            try {
              const { state } = view;
              const { selection } = state;
              
              // 检查是否在列表中
              const { $from } = selection;
              const listNode = $from.node(-1);
              const isInList = listNode && (listNode.type.name === 'bulletList' || listNode.type.name === 'orderedList' || listNode.type.name === 'taskList');
              
              if (isInList) {
                // 在列表中时，特别小心处理删除操作
                if (selection.empty && $from.parentOffset === 0 && $from.parent.textContent === '') {
                  // 如果列表项为空，阻止删除操作
                  console.warn('SimpleEditor: Prevented deletion of empty list item');
                  event.preventDefault();
                  return true;
                }
              }
              
              if (selection.empty) {
                // 如果选择为空，允许默认行为
                return false;
              }
            } catch (error) {
              console.warn('SimpleEditor: Prevented potentially problematic key operation');
              event.preventDefault();
              return true;
            }
          }
        } catch (error) {
          console.warn('SimpleEditor: Error in handleKeyDown:', error);
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: false, // 禁用可能导致问题的功能
        },
        history: {
          depth: 100, // 历史记录深度
          newGroupDelay: 500, // 新历史组延迟（毫秒）
        },
        bulletList: {
          HTMLAttributes: {
            class: 'bullet-list',
          },
          keepMarks: false,
          keepAttributes: false,
        },
        orderedList: {
          HTMLAttributes: {
            class: 'ordered-list',
          },
          keepMarks: false,
          keepAttributes: false,
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
      }),
      HorizontalRule,
      TextAlign.configure({ 
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left'
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
        itemTypeName: 'taskItem',
        keepMarks: false,
        keepAttributes: false,
      }),
      TaskItem.configure({ 
        nested: true,
        HTMLAttributes: {
          class: 'task-list-item',
        },
      }),
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
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Start typing...' }]
        }
      ]
    },
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

  // 内容清理和验证函数
  const sanitizeContent = (content) => {
    if (!content) {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Start typing...' }]
          }
        ]
      };
    }

    // 如果是字符串，转换为基本结构
    if (typeof content === 'string') {
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: content }]
          }
        ]
      };
    }

    // 验证JSON结构
    if (!content.type || content.type !== 'doc') {
      console.warn('Invalid content type, wrapping in doc');
      return {
        type: 'doc',
        content: [content]
      };
    }

    // 验证content数组
    if (!Array.isArray(content.content)) {
      console.warn('Invalid content array, creating paragraph');
      return {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content loading...' }]
          }
        ]
      };
    }

    // 清理每个节点
    const sanitizedContent = content.content.map(node => {
      if (!node || typeof node !== 'object') {
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Invalid node' }]
        };
      }

      // 确保每个节点都有必要的属性
      if (!node.type) {
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Unknown content' }]
        };
      }

      // 验证文本节点
      if (node.type === 'text' && !node.text) {
        return { ...node, text: ' ' };
      }

      // 验证段落节点
      if (node.type === 'paragraph' && (!node.content || !Array.isArray(node.content))) {
        return {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Empty paragraph' }]
        };
      }

      // 特殊处理列表节点
      if (node.type === 'bulletList' || node.type === 'orderedList' || node.type === 'taskList') {
        if (!node.content || !Array.isArray(node.content)) {
          return {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Invalid list' }]
          };
        }
        
        // 清理列表项
        const sanitizedListItems = node.content.map(item => {
          if (!item || item.type !== 'listItem') {
            return {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Invalid list item' }]
                }
              ]
            };
          }
          
          if (!item.content || !Array.isArray(item.content)) {
            return {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Empty list item' }]
                }
              ]
            };
          }
          
          // 修复列表项结构：确保每个列表项都有paragraph包装
          const sanitizedItemContent = item.content.map(itemContent => {
            if (!itemContent || typeof itemContent !== 'object') {
              return {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Invalid content' }]
              };
            }
            
            // 如果直接是text节点，包装在paragraph中
            if (itemContent.type === 'text') {
              return {
                type: 'paragraph',
                content: [itemContent]
              };
            }
            
            // 如果已经是paragraph，确保内容有效
            if (itemContent.type === 'paragraph') {
              if (!itemContent.content || !Array.isArray(itemContent.content)) {
                return {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Empty paragraph' }]
                };
              }
              return itemContent;
            }
            
            // 其他类型保持原样
            return itemContent;
          }).filter(Boolean);
          
          return {
            ...item,
            content: sanitizedItemContent
          };
        }).filter(Boolean);
        
        return {
          ...node,
          content: sanitizedListItems
        };
      }

      // 验证列表项节点
      if (node.type === 'listItem') {
        if (!node.content || !Array.isArray(node.content)) {
          return {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Empty list item' }]
              }
            ]
          };
        }
        
        // 确保列表项内容有效
        const sanitizedItemContent = node.content.map(itemContent => {
          if (!itemContent || typeof itemContent !== 'object') {
            return {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Invalid content' }]
            };
          }
          
          // 如果直接是text节点，包装在paragraph中
          if (itemContent.type === 'text') {
            return {
              type: 'paragraph',
              content: [itemContent]
            };
          }
          
          if (itemContent.type === 'paragraph' && (!itemContent.content || !Array.isArray(itemContent.content))) {
            return {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Empty paragraph' }]
            };
          }
          
          return itemContent;
        }).filter(Boolean);
        
        return {
          ...node,
          content: sanitizedItemContent
        };
      }

      // 验证任务项节点
      if (node.type === 'taskItem') {
        if (!node.content || !Array.isArray(node.content)) {
          return {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Empty task item' }]
              }
            ]
          };
        }
        
        // 确保任务项内容有效
        const sanitizedTaskContent = node.content.map(taskContent => {
          if (!taskContent || typeof taskContent !== 'object') {
            return {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Invalid content' }]
            };
          }
          
          // 如果直接是text节点，包装在paragraph中
          if (taskContent.type === 'text') {
            return {
              type: 'paragraph',
              content: [taskContent]
            };
          }
          
          if (taskContent.type === 'paragraph' && (!taskContent.content || !Array.isArray(taskContent.content))) {
            return {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Empty paragraph' }]
            };
          }
          
          return taskContent;
        }).filter(Boolean);
        
        return {
          ...node,
          attrs: node.attrs || { checked: false },
          content: sanitizedTaskContent
        };
      }

      return node;
    }).filter(Boolean);

    return {
      type: 'doc',
      content: sanitizedContent
    };
  };

  // Update editor content when content prop changes
  React.useEffect(() => {
    if (!editor || !content) return;
    
    // 如果是用户输入导致的变化，跳过重新设置
    if (isUserInputRef.current) {
      isUserInputRef.current = false;
      return;
    }

    // 检查内容是否真的发生了变化
    const currentContent = editor.getJSON();
    const isContentDifferent = JSON.stringify(currentContent) !== JSON.stringify(content);
    
    if (!isContentDifferent) return;
    
    console.log('SimpleEditor: Updating editor content with:', content);
    
    // 使用最安全的方式设置内容 - 不添加到历史记录
    try {
      const sanitizedContent = sanitizeContent(content);
      
      // 使用事务直接设置内容，避免进入历史记录
      const { state } = editor;
      const { tr } = state;
      
      // 创建新的文档节点
      const newDoc = editor.schema.nodeFromJSON(sanitizedContent);
      
      // 替换整个文档，不添加到历史记录
      tr.replaceWith(0, state.doc.content.size, newDoc.content);
      tr.setMeta('addToHistory', false); // 关键：不添加到历史记录
      
      // 应用事务
      editor.view.dispatch(tr);
      console.log('SimpleEditor: Content set successfully (without history)');
      
    } catch (error) {
      console.error('SimpleEditor: Error in content update:', error);
      errorCountRef.current += 1;
      
      // 如果错误次数过多，重新创建编辑器
      if (errorCountRef.current > 3) {
        console.warn('SimpleEditor: Too many errors, recreating editor');
        forceRecreateEditor();
      }
    }
  }, [editor, content, forceRecreateEditor])

  // 防抖处理，减少频繁更新
  const debouncedOnChange = React.useMemo(() => {
    let timeoutId;
    return (json) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onChange(json);
      }, 100); // 100ms防抖
    };
  }, [onChange]);

  // Handle content changes
  React.useEffect(() => {
    if (editor && onChange) {
      const handleUpdate = () => {
        try {
          // 标记这是用户输入导致的变化
          isUserInputRef.current = true;
          const json = editor.getJSON()
          
          // 验证JSON结构是否有效
          if (json && json.type === 'doc') {
            debouncedOnChange(json)
          } else {
            console.warn('SimpleEditor: Invalid JSON structure, skipping update');
          }
        } catch (error) {
          console.error('SimpleEditor: Error in handleUpdate:', error);
        }
      }
      
      editor.on('update', handleUpdate)
      return () => {
        editor.off('update', handleUpdate)
      }
    }
  }, [editor, onChange, debouncedOnChange])

  // 如果错误次数过多，显示重置消息
  if (errorCountRef.current > 5) {
    console.log('SimpleEditor: Too many errors, showing reset message');
    return (
      <div className="simple-editor-wrapper" ref={editorWrapperRef}>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Editor is being reset due to errors...
        </div>
      </div>
    );
  }

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
