import './App.css'
import GradientText from './GradientText.tsx'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { GoogleGenAI } from '@google/genai'
import { CopyBlock, github } from 'react-code-blocks';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [selectedOS, setSelectedOS] = useState<string | undefined>(undefined)
  const osOptions = ['Debian', 'Arch', 'Ubuntu']
  const [isClicked, setIsClicked] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedSecurity, setSelectedSecurity] = useState<string[]>([])
  const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>([])
  const [selectedSocial, setSelectedSocial] = useState<string[]>([])
  const [selectedHyprland, setSelectedHyprland] = useState<string[]>([])
  const [selectedMultimedia, setSelectedMultimedia] = useState<string[]>([])
  const [selectedProductivity, setSelectedProductivity] = useState<string[]>([])
  const [selectedDevtools, setSelectedDevtools] = useState<string[]>([])
  const [selectedGaming, setSelectedGaming] = useState<string[]>([])

  const toggleSelection = (
    item: string,
    selected: string[],
    setSelected: (val: string[]) => void
  ) => {
    setSelected(selected.includes(item) ? selected.filter(i => i !== item) : [...selected, item])
  }

  const createButtonGroup = (
    items: string[],
    selected: string[],
    setSelected: (val: string[]) => void,
    className: string
  ) => (
    <div className={className}>
      {items.map(item => (
        <button
          key={item}
          type="button"
          className={`btn btn-outline-primary ${selected.includes(item) ? 'active' : ''}`}
          data-bs-toggle="button"
          onClick={() => toggleSelection(item, selected, setSelected)}
        >
          {item}
        </button>
      ))}
    </div>
  )

  useEffect(() => {
    async function loadApiKey() {
      const { data, error } = await supabase
        .from('secrets')
        .select('key')
        .eq('name', 'VITE_GEMINI_API_KEY')
        .single()

      if (data?.key) {
        setApiKey(data.key)
      } else {
        console.error('Error loading Gemini API key:', error)
      }
    }
    loadApiKey()
  }, [])

  async function handleSubmit() {
    setIsClicked(true);
    if (!apiKey) {
      console.log('API key not loaded yet')
      alert('Sorry! We encountered an error, please try again later.');
      return
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
      })

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Explain how AI works in a few words',
      })

      console.log('AI response:', response.text)
      setAiResponse(response.text ?? 'No response');
      setIsDone(true);
    } catch (error) {
      console.error('Error generating content:', error)
    }
  }

  return (
    <>
      <div className="main-container">
        <GradientText
          colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
          animationSpeed={3}
          showBorder={false}
          className="custom-class"
        >
          BuildMyDistro
        </GradientText>
        <p className="title-description">A simple way to customize your own Distro!</p>
        <p className="os-description">Operating System</p>
        <div className="os-selector d-flex justify-content-center gap-2">
          {osOptions.map(os => (
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
        <p className="security-description">Security</p>
        {createButtonGroup(
          ['ufw', 'ClamAV', 'KeepassXC', 'Tor Browser', 'WireGuard'],
          selectedSecurity,
          setSelectedSecurity,
          'security-selector'
        )}
        <p className="browser-description">Browser</p>
        {createButtonGroup(
          ['Firefox', 'Brave', 'Chromium'],
          selectedBrowsers,
          setSelectedBrowsers,
          'browsers-selector'
        )}
        <p className="social-description">Social</p>
        {createButtonGroup(
          ['Discord', 'Telegram', 'Element'],
          selectedSocial,
          setSelectedSocial,
          'social-selector'
        )}
        {selectedOS === 'Arch' && (
          <>
            <p className="hyprland-description">Hyprland Customization</p>
            {createButtonGroup(
              ['Hyprland', 'Waybar, Wofi, Rofi', 'Pywal', 'Kitty', 'LXAppearance'],
              selectedHyprland,
              setSelectedHyprland,
              'hyprland-customization-selector'
            )}
          </>
        )}
        <p className="multimedia-description">Multimedia</p>
        {createButtonGroup(
          ['VLC', 'MPV', 'Pavucontrol', 'Spotify'],
          selectedMultimedia,
          setSelectedMultimedia,
          'multimedia-selector'
        )}
        <p className="productivity-description">Productivity</p>
        {createButtonGroup(
          ['LibreOffice', 'Evince', 'OnlyOffice', 'Zettlr'],
          selectedProductivity,
          setSelectedProductivity,
          'productivity-selector'
        )}
        <p className="devtools-description">Devtools</p>
        {createButtonGroup(
          ['VS Code', 'Neovim', 'Git', 'Kitty', 'Flatpak'],
          selectedDevtools,
          setSelectedDevtools,
          'devtools-selector'
        )}
        <p className="gaming-description">Gaming</p>
        {createButtonGroup(
          ['Steam', 'Lutris', 'MangoHUD', 'GameMode'],
          selectedGaming,
          setSelectedGaming,
          'gaming-selector'
        )}
        <p className="disclaimer">
          How this works: This will generate a .sh file for you to execute to install the above.
          ISO file generation coming in future iteration!
        </p>
        <div className='submit-button'>
          {isDone ? (
            <div className='code-output'>
              <CopyBlock
                text={aiResponse || ''}
                language="text"
                showLineNumbers={false}
                theme={github}
                wrapLongLines
              />
            </div>
          ) : isClicked ? (
            <div className="spinner-border" role="status">
              <span className="sr-only"></span>
            </div>
          ) : (
            <div>
              <button className="btn btn-success mt-4" onClick={handleSubmit}>
                Generate Build
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App
