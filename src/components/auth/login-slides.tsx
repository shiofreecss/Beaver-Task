'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface Slide {
  id: number
  command: string
  features: Array<{
    icon: string
    text: string
    color: string
  }>
}

const slides: Slide[] = [
  {
    id: 1,
    command: "Beaver Task, create a project for our new mobile app with tasks for design, development, and testing phases.",
    features: [
      { icon: "🔵", text: "Smart task organization with Kanban boards", color: "bg-blue-500" },
      { icon: "🟣", text: "Time tracking with Pomodoro technique", color: "bg-purple-500" },
      { icon: "🟢", text: "Habit building and progress tracking", color: "bg-green-500" }
    ]
  },
  {
    id: 2,
    command: "Beaver Task, set up a daily routine with morning habits and evening reflection tasks.",
    features: [
      { icon: "🌅", text: "Daily habit tracking and streaks", color: "bg-orange-500" },
      { icon: "📊", text: "Progress visualization and analytics", color: "bg-cyan-500" },
      { icon: "🎯", text: "Goal setting and milestone tracking", color: "bg-pink-500" }
    ]
  },
  {
    id: 3,
    command: "Beaver Task, organize my team's workflow with project hierarchies and collaborative task management.",
    features: [
      { icon: "👥", text: "Team collaboration and task assignment", color: "bg-indigo-500" },
      { icon: "📋", text: "Project hierarchies and subtasks", color: "bg-emerald-500" },
      { icon: "⚡", text: "Real-time updates and notifications", color: "bg-yellow-500" }
    ]
  },
  {
    id: 4,
    command: "Beaver Task, help me focus with timed work sessions and break reminders.",
    features: [
      { icon: "⏱️", text: "Customizable Pomodoro timers", color: "bg-red-500" },
      { icon: "🎵", text: "Ambient sounds and focus music", color: "bg-violet-500" },
      { icon: "📈", text: "Productivity insights and reports", color: "bg-teal-500" }
    ]
  }
]

export function LoginSlides() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 15000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="max-w-md mx-auto px-8 h-full flex flex-col justify-center">
      {/* Command Bubble */}
      <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-brown-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🦫</span>
          </div>
          <div className="flex-1">
            <p className="text-card-foreground text-sm leading-relaxed">
              "{slides[currentSlide].command}"
            </p>
          </div>
        </div>
      </Card>

      {/* Feature Highlights */}
      <div className="space-y-4 mb-8">
        {slides[currentSlide].features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-2 h-2 ${feature.color} rounded-full flex-shrink-0`}></div>
            <span className="text-muted-foreground text-sm">{feature.text}</span>
          </div>
        ))}
      </div>



      {/* Pagination Dots */}
      <div className="flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-muted-foreground'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
} 