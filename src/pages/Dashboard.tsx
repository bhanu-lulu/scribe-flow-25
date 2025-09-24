import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Note } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  User, 
  LogOut, 
  Edit, 
  Trash2, 
  FileText,
  Menu,
  X
} from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

const availableTags = ['Work', 'Personal', 'Learning', 'Ideas', 'Other']

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('All')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    fetchNotes()
  }, [user])

  useEffect(() => {
    filterNotes()
  }, [notes, searchQuery, selectedTag])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by tag
    if (selectedTag !== 'All') {
      filtered = filtered.filter(note => note.tags.includes(selectedTag))
    }

    setFilteredNotes(filtered)
  }

  const createNewNote = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            user_id: user.id,
            title: 'Untitled Note',
            content: '',
            tags: [],
          }
        ])
        .select()
        .single()

      if (error) throw error

      const newNote = data as Note
      setNotes([newNote, ...notes])
      setSelectedNote(newNote)
      setIsEditing(true)
      
      toast({
        title: "New note created",
        description: "Start writing your thoughts!",
      })
    } catch (error) {
      console.error('Error creating note:', error)
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      })
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      setNotes(notes.filter(note => note.id !== noteId))
      if (selectedNote?.id === noteId) {
        setSelectedNote(null)
        setIsEditing(false)
      }
      
      toast({
        title: "Note deleted",
        description: "The note has been removed.",
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
  }

  const extractTextFromHtml = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-card border-r border-sidebar-border transition-all duration-300 overflow-hidden flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sidebar-foreground">Notes</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Tags Filter */}
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Notes</SelectItem>
              {availableTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground">
              {searchQuery || selectedTag !== 'All' ? 'No matching notes' : 'No notes yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotes.map(note => (
                <Card 
                  key={note.id} 
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedNote?.id === note.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => {
                    setSelectedNote(note)
                    setIsEditing(false)
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm truncate flex-1">
                        {truncateTitle(note.title)}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedNote(note)
                            setIsEditing(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {note.content && (
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {extractTextFromHtml(note.content).substring(0, 50)}...
                      </p>
                    )}
                    
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            +{note.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-card border-b border-sidebar-border flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={createNewNote} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm">{user.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {notes.length} notes
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 overflow-hidden">
          {selectedNote ? (
            <RichTextEditor
              note={selectedNote}
              isEditing={isEditing}
              onSave={(updatedNote) => {
                setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n))
                setSelectedNote(updatedNote)
                setIsEditing(false)
              }}
              onEdit={() => setIsEditing(true)}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Select a note to get started
                </h3>
                <p className="text-muted-foreground mb-4">
                  Choose a note from the sidebar or create a new one to begin writing.
                </p>
                <Button onClick={createNewNote} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create your first note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard