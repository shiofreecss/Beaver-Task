'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { BeaverLogo } from '@/components/ui/beaver-logo'

interface Slide {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Smart Task Organization",
    description: "Organize your tasks with intuitive Kanban boards. Drag and drop tasks between columns, create subtasks, and track progress with visual clarity.",
    icon: "📋",
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Time Management",
    description: "Boost productivity with the Pomodoro technique. Track focus sessions, manage breaks, and analyze your time patterns for better efficiency.",
    icon: "⏱️",
    color: "bg-purple-500"
  },
  {
    id: 3,
    title: "Habit Building",
    description: "Build lasting habits with daily tracking and progress visualization. Set goals, track streaks, and celebrate your consistency milestones.",
    icon: "🎯",
    color: "bg-green-500"
  },
  {
    id: 4,
    title: "Project Management",
    description: "Manage complex projects with ease. Create project hierarchies, assign tasks, set deadlines, and collaborate with team members seamlessly.",
    icon: "🚀",
    color: "bg-orange-500"
  }
]

export function AppPresentationSlides() {
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
    }, 3000)

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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BeaverLogo className="h-12 w-12 mr-3" />
            <h1 className="text-4xl font-bold text-white">Beaver Task</h1>
          </div>
          <p className="text-gray-300 text-lg">Your Ultimate Productivity Companion</p>
        </div>

        {/* Main Slide */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center">
              {/* Slide Number */}
              <div className="mb-6">
                <span className="text-6xl font-bold text-gray-600">
                  {slides[currentSlide].id}
                </span>
              </div>

              {/* Slide Icon */}
              <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${slides[currentSlide].color} text-white text-3xl`}>
                  {slides[currentSlide].icon}
                </div>
              </div>

              {/* Slide Content */}
              <h2 className="text-3xl font-bold text-white mb-4">
                {slides[currentSlide].title}
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                {slides[currentSlide].description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center mt-8 space-x-4">
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
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
} 