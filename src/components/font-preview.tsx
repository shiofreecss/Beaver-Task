'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const fontOptions = [
  {
    name: 'Plus Jakarta Sans',
    className: 'font-sans',
    description: 'Modern, clean, excellent readability'
  },
  {
    name: 'Poppins',
    className: 'font-poppins',
    description: 'Geometric, friendly, great for UI'
  },
  {
    name: 'Outfit',
    className: 'font-outfit',
    description: 'Contemporary, versatile, clean'
  },
  {
    name: 'Inter',
    className: 'font-inter',
    description: 'Classic, highly legible, system-like'
  }
]

export function FontPreview() {
  const [selectedFont, setSelectedFont] = useState('font-sans')

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Font Preview</h1>
        <p className="text-muted-foreground">Choose the best font for Beaver Task</p>
      </div>

      {/* Font Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {fontOptions.map((font) => (
          <Button
            key={font.name}
            variant={selectedFont === font.className ? "default" : "outline"}
            onClick={() => setSelectedFont(font.className)}
            className="min-w-[140px]"
          >
            {font.name}
          </Button>
        ))}
      </div>

      {/* Preview Content */}
      <div className={`${selectedFont} space-y-6`}>
        {/* Logo and Title */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🦫 Beaver Task</CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-4xl font-bold mb-2">Your productivity, amplified.</h2>
            <p className="text-lg text-muted-foreground">
              Privacy-first task management that helps you organize with confidence.
            </p>
          </CardContent>
        </Card>

        {/* Form Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Login Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 bg-muted border rounded-md"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 bg-muted border rounded-md"
                disabled
              />
            </div>
            <Button className="w-full">Continue with email</Button>
          </CardContent>
        </Card>

        {/* Typography Scale */}
        <Card>
          <CardHeader>
            <CardTitle>Typography Scale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <h1 className="text-4xl font-bold">Heading 1 - Large Title</h1>
            <h2 className="text-3xl font-semibold">Heading 2 - Section Title</h2>
            <h3 className="text-2xl font-medium">Heading 3 - Subsection</h3>
            <h4 className="text-xl font-medium">Heading 4 - Card Title</h4>
            <p className="text-base">Body text - This is the main content that users will read most often.</p>
            <p className="text-sm text-muted-foreground">Small text - Used for captions, metadata, and secondary information.</p>
            <p className="text-xs text-muted-foreground">Extra small - For very fine details like timestamps or labels.</p>
          </CardContent>
        </Card>

        {/* Task Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Task Management Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <div className="w-4 h-4 border-2 border-primary rounded"></div>
                <span className="font-medium">Complete project documentation</span>
                <span className="text-sm text-muted-foreground ml-auto">High</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <div className="w-4 h-4 border-2 border-muted-foreground rounded"></div>
                <span>Review team performance metrics</span>
                <span className="text-sm text-muted-foreground ml-auto">Medium</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <div className="w-4 h-4 border-2 border-muted-foreground rounded"></div>
                <span>Schedule client meeting</span>
                <span className="text-sm text-muted-foreground ml-auto">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Font Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Font</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">
            {fontOptions.find(f => f.className === selectedFont)?.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {fontOptions.find(f => f.className === selectedFont)?.description}
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 