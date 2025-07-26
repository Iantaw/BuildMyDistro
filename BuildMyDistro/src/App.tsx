import './App.css'
import GradientText from './GradientText.tsx'
import { useState } from 'react';

function App() {
  const [selectedOS, setSelectedOS] = useState<string | undefined>(undefined);
  const osOptions = ['Debian', 'Arch', 'Ubuntu'];

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
      <p className='title-description'>A simple way to customize your own Distro!</p>
      <p className='os-description'>Operating System</p>
      <div className="os-selector d-flex justify-content-center gap-2">
        {osOptions.map((os) => (
          <button
            key={os}
            type="button"
            className={`btn btn-outline-primary ${selectedOS === os ? 'active' : ''}`}
            data-bs-toggle="button"
            onClick={() => setSelectedOS(os)}
          >
            {os}
          </button>
        ))}
      </div>
      <p className='security-description'>Security</p>
      <div className="security-selector"> 
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">ufw</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">ClamAV</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">KeepassXC</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Tor Browser</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">WireGuard</button>
      </div>
      <p className='browser-description'>Browser</p>
      <div className="browsers-selector"> 
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Firefox</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Brave</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Chromium</button>
      </div>
      <p className='social-description'>Social</p>
      <div className="social-selector"> 
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Discord</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Telegram</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Element</button>
      </div>
      {selectedOS === 'Arch' && (
        <>
          <p className='hyprland-description'>Hyprland Customization</p>
          <div className="hyprland-customization-selector"> 
            <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Hyprland</button>
            <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Waybar, Wofi, Rofi</button>
            <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Pywal</button>
            <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Kitty</button>
            <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">LXAppearance</button>
          </div>
        </>
      )}
      <p className='multimedia-description'>Multimedia</p>
      <div className="multimedia-selector"> 
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">VLC</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">MPV</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Pavucontrol</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Spotify</button>
      </div>
      <p className='productivity-description'>Productivity</p>
      <div className="productivity-selector"> 
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">LibreOffice</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Evince</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">OnlyOffice</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Zettlr</button>
      </div>
      <p className='devtools-description'>Devtools</p>
      <div className="devtools-selector"> 
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">VS Code</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Neovim</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Git</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Kitty</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Flatpak</button>
      </div>
      <p className='gaming-description'>Gaming</p>
      <div className="gaming-selector"> 
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Steam</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">Lutris</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">MangoHUD</button>
        <button type="button" className="btn btn-outline-primary" data-bs-toggle="button">GameMode</button>
      </div>
    </>
  )
}

export default App
