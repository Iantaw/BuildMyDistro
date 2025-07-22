import './App.css'
import GradientText from './GradientText.tsx'

function App() {
  return (
    <>
      <GradientText
        colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
        animationSpeed={3}
        showBorder={false}
        className="custom-class"
      >
        BuildMyDistro
      </GradientText>
      <p className='description'>A simple way to customize your own Distro!</p>
    </>
  )
}

export default App
