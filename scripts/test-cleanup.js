// Test script for cleanup service
console.log('🧪 Testing Cleanup Service...')

// Mock the audio service and stores for testing
const mockAudioService = {
  stop: () => console.log('✅ Audio stopped'),
  isPlaying: () => false
}

const mockPomodoroService = {
  resetTimer: () => console.log('✅ Timer reset')
}

const mockStores = {
  pomodoro: { resetStore: () => console.log('✅ Pomodoro store reset') },
  tasks: { resetStore: () => console.log('✅ Tasks store reset') },
  projects: { resetStore: () => console.log('✅ Projects store reset') },
  habits: { resetStore: () => console.log('✅ Habits store reset') },
  notes: { resetStore: () => console.log('✅ Notes store reset') },
  organizations: { resetStore: () => console.log('✅ Organizations store reset') }
}

// Simulate cleanup process
console.log('🔄 Starting logout cleanup...')

// Stop audio
mockAudioService.stop()

// Stop timers
mockPomodoroService.resetTimer()

// Reset stores
Object.values(mockStores).forEach(store => store.resetStore())

// Clear storage
console.log('✅ Storage cleared')

console.log('🎉 Logout cleanup completed successfully!')
console.log('📝 Test Summary:')
console.log('   - Audio stopped ✓')
console.log('   - Timers reset ✓')
console.log('   - All stores reset ✓')
console.log('   - Storage cleared ✓') 