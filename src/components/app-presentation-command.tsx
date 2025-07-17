'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { BeaverLogo } from '@/components/ui/beaver-logo'

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
      { icon: "🔵", text: "Smart task organization with Kanban boards", color: "text-blue-400" },
      { icon: "🟣", text: "Time tracking with Pomodoro technique", color: "text-purple-400" },
      { icon: "🟢", text: "Habit building and progress tracking", color: "text-green-400" }
    ]
  },
  {
    id: 2,
    command: "Beaver Task, set up a daily routine with morning habits and evening reflection tasks.",
    features: [
      { icon: "🌅", text: "Daily habit tracking and streaks", color: "text-orange-400" },
      { icon: "📊", text: "Progress visualization and analytics", color: "text-cyan-400" },
      { icon: "🎯", text: "Goal setting and milestone tracking", color: "text-pink-400" }
    ]
  },
  {
    id: 3,
    command: "Beaver Task, organize my team's workflow with project hierarchies and collaborative task management.",
    features: [
      { icon: "👥", text: "Team collaboration and task assignment", color: "text-indigo-400" },
      { icon: "📋", text: "Project hierarchies and subtasks", color: "text-emerald-400" },
      { icon: "⚡", text: "Real-time updates and notifications", color: "text-yellow-400" }
    ]
  },
  {
    id: 4,
    command: "Beaver Task, help me focus with timed work sessions and break reminders.",
    features: [
      { icon: "⏱️", text: "Customizable Pomodoro timers", color: "text-red-400" },
      { icon: "🎵", text: "Ambient sounds and focus music", color: "text-violet-400" },
      { icon: "📈", text: "Productivity insights and reports", color: "text-teal-400" }
    ]
  }
]

export function AppPresentationCommand() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl w-full">
        {/* Command Bubble */}
        <div className="mb-12">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Beaver Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-brown-600 flex items-center justify-center">
                    <BeaverLogo className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                {/* Command Text */}
                <div className="flex-1">
                  <p className="text-white text-lg leading-relaxed">
                    "{slides[currentSlide].command}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="mb-12">
          <div className="space-y-4">
            {slides[currentSlide].features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 text-lg">
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleAutoPlay}
            className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
          >
            {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
          >
            Start Using Beaver Task
          </Button>
        </div>
      </div>
    </div>
  )
} 