import { useState } from 'react'
import OrbitCamera from '@/examples/orbit-camera/OrbitCamera'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <OrbitCamera></OrbitCamera>
    </div>
  )
}

export default App
