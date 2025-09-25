import React, { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Save, 
  Edit3, 
  X, 
  ArrowLeft,
  Type,
  Palette
} from 'lucide-react'

const availableTags = ['Work', 'Personal', 'Learning', 'Ideas', 'Other']

interface RichTextEditorProps {
  note: Note
  isEditing: boolean
  onSave: (note: Note) => void
  onEdit: () => void
  onCancel: () => void
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  note,
  isEditing,
  onSave,
  onEdit,
  onCancel,
}) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [title, setTitle] = useState(note.title)
  const [selectedTags, setSelectedTags] = useState<string[]>(note.tags)
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: note.content,
    editable: isEditing,
    onCreate: ({ editor }) => {
      editor.commands.setContent(note.content)
    },
  })

  // Debounced autosave
  const autosave = useCallback(
    debounce(async (noteData: Partial<Note>) => {
      if (!user || !isEditing) return
      
      try {
        const { error } = await supabase
          .from('notes')
          .update({
            ...noteData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', note.id)

        if (error) throw error
      } catch (error) {
        console.error('Autosave error:', error)
      }
    }, 2000),
    [user, note.id, isEditing]
  )

  useEffect(() => {
    if (editor && isEditing) {
      const content = editor.getHTML()
      autosave({
        title,
        content,
        tags: selectedTags,
      })
    }
  }, [title, selectedTags, editor?.getHTML(), autosave])

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing)
      if (isEditing) {
        editor.commands.focus()
      }
    }
  }, [editor, isEditing])

  const handleSave = async () => {
    if (!editor || !user) return

    setSaving(true)
    try {
      const content = editor.getHTML()
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: title.trim() || 'Untitled Note',
          content,
          tags: selectedTags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', note.id)
        .select()
        .single()

      if (error) throw error

      onSave(data as Note)
      toast({
        title: "Note saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Save failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 7) {
      return date.toLocaleDateString()
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  if (!editor) {
    return <div className="flex-1 flex items-center justify-center">Loading editor...</div>
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Editor Header */}
      <div className="border-b border-sidebar-border p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {isEditing ? 'Editing' : 'Viewing'} • Updated {formatTime(note.updated_at)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button onClick={onEdit}>
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-2xl font-bold border-none px-0 py-2 h-auto focus-visible:ring-0"
            />
          ) : (
            <h1 className="text-2xl font-bold text-foreground py-2">
              {note.title}
            </h1>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              {isEditing && (
                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          
          {isEditing && (
            <Select onValueChange={addTag}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Add tag" />
              </SelectTrigger>
              <SelectContent>
                {availableTags
                  .filter(tag => !selectedTags.includes(tag))
                  .map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Toolbar */}
        {isEditing && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-muted rounded-md">
            <Button
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
            >
              <Type className="h-4 w-4" />
              <span className="ml-1 text-xs">H1</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
            >
              <Type className="h-4 w-4" />
              <span className="ml-1 text-xs">H2</span>
            </Button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <EditorContent 
            editor={editor} 
            className={`min-h-[400px] prose prose-sm max-w-none focus:outline-none ${
              isEditing ? 'prose-blue' : ''
            }`}
          />
        </div>
      </div>
    </div>
  )
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default RichTextEditor