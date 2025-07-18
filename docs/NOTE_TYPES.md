# Note Types Documentation

## Overview

The Beaver Task Manager now supports three different types of notes, each designed for specific use cases:

1. **Simple Notes** - Basic note-taking functionality
2. **Meeting Minutes** - Structured meeting documentation
3. **Document Notes** - Document management and collaboration

## Note Types

### 1. Simple Notes

**Purpose**: Basic note-taking for general use

**Features**:
- Title and content
- Tags for organization
- Project and task linking
- Standard note display

**Use Cases**:
- General note-taking
- Quick ideas and thoughts
- Project-related notes
- Task documentation

### 2. Meeting Minutes

**Purpose**: Structured documentation for meetings

**Features**:
- Meeting date
- Meeting category (Standup, Retro, Planning, Review, Presentation, etc.)
- Attendees list with add/remove functionality
- AI summary field for meeting summaries
- Color-coded category badges
- Calendar icon for easy identification

**Use Cases**:
- Team meetings
- Client meetings
- Standup meetings
- Retrospectives
- Planning sessions
- Presentations

**Meeting Categories**:
- Standup
- Retro
- Planning
- Review
- Presentation
- Brainstorming
- Client Meeting
- Team Sync
- One-on-One

### 3. Document Notes

**Purpose**: Document management and collaboration

**Features**:
- Document category
- Last edited by tracking
- Last edited time tracking
- Document icon for easy identification
- Color-coded category badges

**Use Cases**:
- Strategy documents
- Proposals
- Technical specifications
- User guides
- API documentation
- Project plans

**Document Categories**:
- Strategy doc
- Proposal
- Customer research
- Technical spec
- User guide
- API docs
- Meeting notes
- Project plan

## User Interface

### Note Creation

When creating a new note, users can choose from three tabs:
1. **Simple Note** - Basic note creation
2. **Meeting Minutes** - Meeting-specific fields
3. **Document** - Document-specific fields

### Note Display

Each note type is displayed with:
- **Type-specific icons**: Calendar for meetings, FileText for documents and simple notes
- **Color-coded badges**: Different colors for different categories
- **Type-specific information**: Meeting details, document metadata
- **Filtering**: Users can filter by note type using the tab buttons

### View Modes

Notes can be displayed in three view modes:
1. **Grid View** - Card-based layout
2. **List View** - Compact list layout
3. **Table View** - Detailed table with columns for type, category, tags, etc.

## Database Schema

The notes table has been extended with the following fields:

```typescript
notes: defineTable({
  title: v.string(),
  content: v.string(),
  tags: v.string(),
  type: v.string(), // 'simple', 'meeting', 'document'
  projectId: v.optional(v.id("projects")),
  taskId: v.optional(v.id("tasks")),
  userId: v.id("users"),
  // Meeting-specific fields
  meetingDate: v.optional(v.number()),
  meetingCategory: v.optional(v.string()),
  attendees: v.optional(v.array(v.string())),
  summaryAI: v.optional(v.string()),
  // Document-specific fields
  documentCategory: v.optional(v.string()),
  lastEditedBy: v.optional(v.string()),
  lastEditedTime: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

## API Endpoints

The API has been updated to handle the new note types:

- `POST /api/notes-convex` - Create note with type-specific fields
- `PUT /api/notes-convex` - Update note with type-specific fields
- `GET /api/notes-convex` - Fetch notes with type-specific data
- `DELETE /api/notes-convex` - Delete notes

## Migration

Existing notes will be automatically converted to "simple" type notes. The migration preserves all existing data while adding the new type field.

## Future Enhancements

Potential future improvements:
- AI-powered meeting summaries
- Document versioning
- Collaborative editing
- File attachments
- Rich text editing
- Export functionality
- Advanced filtering and search 