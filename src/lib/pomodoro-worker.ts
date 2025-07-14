let timerId: ReturnType<typeof setInterval> | undefined = undefined
let timeLeft: number = 0

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data

  switch (type) {
    case 'START':
      if (timerId !== undefined) clearInterval(timerId)
      timeLeft = payload.timeLeft
      
      timerId = setInterval(() => {
        timeLeft--
        self.postMessage({ type: 'TICK', payload: { timeLeft } })
        
        if (timeLeft <= 0) {
          if (timerId !== undefined) {
            clearInterval(timerId)
            timerId = undefined
          }
          self.postMessage({ type: 'COMPLETE' })
        }
      }, 1000)
      break

    case 'PAUSE':
      if (timerId !== undefined) {
        clearInterval(timerId)
        timerId = undefined
      }
      break

    case 'RESUME':
      if (timerId === undefined) {
        timerId = setInterval(() => {
          timeLeft--
          self.postMessage({ type: 'TICK', payload: { timeLeft } })
          
          if (timeLeft <= 0) {
            if (timerId !== undefined) {
              clearInterval(timerId)
              timerId = undefined
            }
            self.postMessage({ type: 'COMPLETE' })
          }
        }, 1000)
      }
      break

    case 'RESET':
      if (timerId !== undefined) {
        clearInterval(timerId)
        timerId = undefined
      }
      timeLeft = payload.timeLeft
      self.postMessage({ type: 'TICK', payload: { timeLeft } })
      break

    case 'SYNC':
      timeLeft = payload.timeLeft
      break
  }
} 