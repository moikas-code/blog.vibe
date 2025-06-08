'use client'

import { BlockNoteEditor as BlockNoteEditorType } from '@blocknote/core'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import { useEffect, useState } from 'react'

interface BlockNoteEditorProps {
  content?: string
  onChange?: (content: string) => void
  editable?: boolean
}

export function BlockNoteEditor({ content, onChange, editable = true }: BlockNoteEditorProps) {
  const [initialContent, setInitialContent] = useState<any>(undefined)

  useEffect(() => {
    if (content) {
      try {
        // Try to parse as JSON first (for stored block data)
        const parsed = JSON.parse(content)
        setInitialContent(parsed)
      } catch {
        // If not JSON, treat as HTML and convert to blocks
        setInitialContent(undefined)
      }
    }
  }, [content])

  const editor: BlockNoteEditorType = useCreateBlockNote({
    initialContent: initialContent,
  })

  const handleChange = async () => {
    if (onChange && editable) {
      const html = await editor.blocksToHTMLLossy()
      onChange(html)
    }
  }

  return (
    <BlockNoteView
      editor={editor}
      editable={editable}
      onChange={handleChange}
      theme="light"
    />
  )
}