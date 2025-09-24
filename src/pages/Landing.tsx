import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, Lock, Search, Tag } from 'lucide-react'

const Landing = () => {
  const { user, signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await signUp(email, password)
    } catch (error) {
      console.error('Sign up error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Welcome to Personal Notes Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Capture Your Thoughts. Organize your ideas with a clean, powerful notes app 
            that grows with you. Create, search, and organize your personal knowledge base.
          </p>
          
          {/* Feature highlights */}
          <div className="grid md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4">
              <BookOpen className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Rich Text Editor</h3>
              <p className="text-sm text-muted-foreground text-center">Format your notes with bold, italic, lists, and more</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Tag className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Smart Organization</h3>
              <p className="text-sm text-muted-foreground text-center">Tag and categorize notes for easy retrieval</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Search className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Powerful Search</h3>
              <p className="text-sm text-muted-foreground text-center">Find any note instantly with full-text search</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Lock className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-muted-foreground text-center">Your notes are completely private and secure</p>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Get Started</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-muted-foreground">
          <p>Privacy-focused notes app • Your thoughts, your data, your control</p>
        </footer>
      </div>
    </div>
  )
}

export default Landing