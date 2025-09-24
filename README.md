# Personal Notes Hub

A clean, powerful notes application built with React, TypeScript, and Supabase. Organize your thoughts with rich text editing, tagging, and full-text search - inspired by Notion's clean design.

## Features

- 🔐 **Secure Authentication** - Email/password signup and login with Supabase Auth
- 📝 **Rich Text Editor** - Format your notes with bold, italic, lists, headings, and more using TipTap
- 🏷️ **Smart Organization** - Tag your notes with categories like Work, Personal, Learning, Ideas
- 🔍 **Powerful Search** - Find any note instantly with full-text search across titles and content
- 📱 **Responsive Design** - Beautiful on desktop and mobile with a collapsible sidebar
- 💾 **Auto-save** - Your changes are automatically saved as you type (2-second debounce)
- 🔒 **Privacy First** - Your notes are completely private with row-level security
- ⚡ **Real-time Updates** - See your changes instantly across all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Rich Text**: TipTap Editor with extensions
- **Backend**: Supabase (Authentication, Database, Real-time)
- **Styling**: Custom design system with semantic tokens
- **State Management**: React Context + Hooks
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd personal-notes-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Set up the database:
- Go to your Supabase dashboard
- Open the SQL Editor
- Run the contents of `database-setup.sql`

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Database Schema

### Notes Table
- `id` - UUID primary key
- `user_id` - UUID foreign key to auth.users
- `title` - Text (default: "Untitled Note")
- `content` - Text (HTML from rich text editor)
- `tags` - Text array (Work, Personal, Learning, Ideas, Other)
- `created_at` - Timestamp
- `updated_at` - Timestamp (auto-updated)

### Security
Row Level Security (RLS) is enabled with policies ensuring users can only access their own notes.

## Usage

### Creating Notes
1. Click "New Note" in the top bar
2. Add a title and start writing
3. Use the toolbar for rich text formatting
4. Add tags for organization
5. Changes are auto-saved every 2 seconds

### Organizing Notes
- **Tags**: Categorize notes with predefined tags
- **Search**: Use the search bar to find notes by title or content
- **Filter**: Use the sidebar dropdown to filter by tag
- **Sort**: Notes are automatically sorted by last updated

### Rich Text Features
- **Headings**: H1, H2, H3 for document structure
- **Text Formatting**: Bold, italic, code
- **Lists**: Bullet points and numbered lists
- **Quotes**: Blockquotes for important text
- **Colors**: Text color support

## Project Structure

```
src/
├── components/
│   ├── ui/               # Shadcn UI components
│   └── RichTextEditor.tsx # Main editor component
├── contexts/
│   └── AuthContext.tsx   # Authentication state management
├── hooks/
│   └── use-toast.ts      # Toast notifications
├── lib/
│   ├── supabase.ts       # Supabase client and types
│   └── utils.ts          # Utility functions
├── pages/
│   ├── Landing.tsx       # Home/authentication page
│   ├── Dashboard.tsx     # Main notes interface
│   └── NotFound.tsx      # 404 error page
├── index.css             # Design system and global styles
└── App.tsx               # Main app with routing
```

## Design System

The app uses a custom design system built with Tailwind CSS:

- **Colors**: Semantic color tokens defined in `index.css`
- **Typography**: Inter font family with consistent sizing
- **Components**: Customized Shadcn UI components
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions and micro-interactions

## Deployment

### Lovable Platform
Click the "Publish" button in Lovable to deploy instantly.

### Manual Deployment
1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting platform of choice (Vercel, Netlify, etc.)

3. Set environment variables in your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Roadmap (Phase 2)

- [ ] File uploads (PDF, Word documents)
- [ ] AI-powered question answering on note content
- [ ] Export notes to PDF/Markdown
- [ ] Note sharing and collaboration
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Note templates
- [ ] Advanced search with filters

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open a GitHub issue or contact the development team.