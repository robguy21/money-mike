import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import LandingPage from "./pages/LandingPage.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
      <div>
          <LandingPage />
      </div>
  )
}

export default App
