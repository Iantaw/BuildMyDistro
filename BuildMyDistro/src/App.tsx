import './App.css';
import GradientText from './GradientText.tsx';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { GoogleGenAI } from '@google/genai';
import CodeBlockDemo from './CodeBlockDemo';
import promptText from './assets/iso-prompt-template.txt?raw';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const debianEnvironmentOptions = ['Debian', 'Arch', 'Ubuntu'];
  const [selectedDebianEnvironment, setSelectedDebianEnvironment] = useState<string>(debianEnvironmentOptions[1]);;
  const osOptions = ['Debian', 'Arch', 'Ubuntu'];
  const [selectedOS, setSelectedOS] = useState<string>(osOptions[1]);;
  const [isClicked, setIsClicked] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const [selectedSecurity, setSelectedSecurity] = useState<string[]>([]);
  const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>([]);
  const [selectedSocial, setSelectedSocial] = useState<string[]>([]);
  const [selectedHyprland, setSelectedHyprland] = useState<string[]>([]);
  const [selectedMultimedia, setSelectedMultimedia] = useState<string[]>([]);
  const [selectedProductivity, setSelectedProductivity] = useState<string[]>([]);
  const [selectedDevtools, setSelectedDevtools] = useState<string[]>([]);
  const [selectedGaming, setSelectedGaming] = useState<string[]>([]);

  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isGeneratingISO, setIsGeneratingISO] = useState(false);
  const [downloadType, setDownloadType] = useState<'sh' | 'iso' | null>(null);
  const [showShButton, setShowShButton] = useState(true);
  const [showIsoButton, setShowIsoButton] = useState(true);

  const SERVER_URL = 'https://fluent-model-earwig.ngrok-free.app';

  const toggleSelection = (
    item: string,
    selected: string[],
    setSelected: (val: string[]) => void
  ) => {
    setSelected(
      selected.includes(item)
        ? selected.filter(i => i !== item)
        : [...selected, item]
    );
  };

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
  );

  useEffect(() => {
    async function loadApiKey() {
      const { data, error } = await supabase
        .from('secrets')
        .select('key')
        .eq('name', 'VITE_GEMINI_API_KEY')
        .single();

      if (data?.key) {
        setApiKey(data.key);
      } else {
        console.error('Error loading Gemini API key:', error);
      }
    }

    loadApiKey();
  }, []);

  async function handleSubmit(type: 'sh' | 'iso') {
    setIsClicked(true);
    setDownloadType(type);

    if (type === 'sh') {
      setShowIsoButton(false);
      await generateScriptOnly();
    } else {
      setShowShButton(false);
      setIsGeneratingISO(true);
      await generateISOFile();
    }
  }

  async function generateScriptOnly() {
    if (!apiKey) {
      alert('Sorry! We encountered an error, please try again later.');
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptScript(),
      });

      setAiResponse(response.text ?? 'No response');
      setIsDone(true);
      setIsClicked(false);
    } catch (error) {
      console.error('Error generating content:', error);
      setIsClicked(false);
    }
  }

  async function generateISOFile() {
    if (!apiKey) {
      alert('Sorry! We encountered an error, please try again later.');
      setIsClicked(false);
      setIsGeneratingISO(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptISO(),
      });

      const generatedScript = response.text ?? '';

      if (!generatedScript) {
        throw new Error('Failed to generate script');
      }

      const result = await fetch(`${SERVER_URL}/generate-iso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' },
        body: JSON.stringify({
          script: generatedScript,
          os: selectedOS,
          filename: `custom-${selectedOS?.toLowerCase()}-${Date.now()}.sh`,
        }),
      });

      const json = await result.json();

      if (json.success) {
        setJobId(json.jobId);
        pollJobStatus(json.jobId);
      } else {
        throw new Error(json.message || 'Failed to start ISO generation');
      }
    } catch (error: any) {
      console.error('Error generating ISO:', error);
      alert(`Failed to generate ISO: ${error.message}`);
      setIsClicked(false);
      setIsGeneratingISO(false);
    }
  }

  async function pollJobStatus(jobId: string) {
    const pollInterval = 5000;
    const maxPolls = 360;
    let polls = 0;

    const poll = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/job/${jobId}/status`, {
          headers: {
            'ngrok-skip-browser-warning': '1'
          }
        });
        const status = await response.json();
        setJobStatus(status);

        if (status.status === 'completed') {
          setDownloadUrl(`${SERVER_URL}/download/${jobId}`);
          setIsClicked(false);
          setIsGeneratingISO(false);
          setIsDone(true);
          return;
        } else if (status.status === 'failed' || status.status === 'cancelled') {
          setIsClicked(false);
          setIsGeneratingISO(false);
          return;
        }

        polls++;
        if (polls < maxPolls) {
          setTimeout(poll, pollInterval);
        } else {
          alert('ISO generation is taking longer than expected. Please check back later.');
          setIsClicked(false);
          setIsGeneratingISO(false);
        }
      } catch {
        polls++;
        if (polls < maxPolls) setTimeout(poll, pollInterval);
        else {
          alert('Lost connection to server. Please refresh and try again.');
          setIsClicked(false);
          setIsGeneratingISO(false);
        }
      }
    };

    setTimeout(poll, 2000);
  }

  async function cancelJob() {
    if (!jobId) return;
    try {
      const response = await fetch(`${SERVER_URL}/job/${jobId}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': '1'
        }
      });
      if (response.ok) {
        setIsClicked(false);
        setIsGeneratingISO(false);
        setJobStatus(null);
        setJobId(null);
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  }

  function downloadISO() {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `custom-${selectedOS?.toLowerCase()}.iso`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function handleDownload() {
    const blob = new Blob([aiResponse || ''], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-custom-distro.sh';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function renderSubmitSection() {
    if (isDone && downloadType === 'sh') {
      return (
        <div>
          <CodeBlockDemo code={aiResponse || ''} language="bash" />
          <button className="download-button" onClick={handleDownload}>Download my distro!</button>
          <p className="instructions">Run this .sh file in your selected distro to add these tools!</p>
        </div>
      );
    } else if (isDone && downloadType === 'iso' && downloadUrl) {
      return (
        <div>
          <div className="alert alert-success">
            <h4>🎉 Your Custom ISO is Ready!</h4>
            {jobStatus?.isoFile && (
              <small>File size: {(jobStatus.isoFile.size / 1024 / 1024).toFixed(2)} MB</small>
            )}
          </div>
          <button className="download-button" onClick={downloadISO}>Download Custom ISO</button>
        </div>
      );
    } else if (isGeneratingISO && jobStatus) {
      return (
        <div className="progress-container">
          <h4>🏗️ Building Your Custom ISO</h4>
          <div className="progress mb-3">
            <div className="progress-bar progress-bar-striped progress-bar-animated"
              style={{ width: `${jobStatus.progress}%` }}>
              {jobStatus.progress}%
            </div>
          </div>
          <p><strong>Status:</strong> {jobStatus.phase || jobStatus.status}</p>
          <button className="btn btn-outline-danger btn-sm mt-2" onClick={cancelJob}>Cancel</button>
        </div>
      );
    } else if (isClicked) {
      return (
        <div className="d-flex flex-column align-items-center">
          <div className="spinner-border" role="status" />
          <small className="mt-2">{downloadType === 'iso' ? 'Preparing ISO generation...' : 'Generating script...'}</small>
        </div>
      );
    } else {
      return (
        <div className="d-flex gap-2">
          {showShButton && (
            <button className="btn btn-primary" onClick={() => handleSubmit('sh')} disabled={!selectedOS}>
              Generate .sh File
            </button>
          )}
          {showIsoButton && (
            <button className="btn btn-success" onClick={() => handleSubmit('iso')} disabled={!selectedOS}>
              Generate ISO File
            </button>
          )}
        </div>
      );
    }
  }

  function promptScript() {
    return `
        Create a .sh file with the following properties that wil create them using the methods linked.
        Make sure NOT to write anything apart from the .sh file. You should not accnoledge this message or write anything else than the .sh file.
        You should create prints in the terminal explaining what you are doing with the user at every step, you may use emojis in these comments.
        Please create an .sh file with the following:

        This .sh file will be made for ${selectedOS}.

        Here is a table to inform you on how to install each tool for the respectable OS. Please only use the one written for ${selectedOS}.
        Make sure to only install the requested ones, which would be selected from the list of tools to be put in the .sh file.

        Table:

        Arch:

        (Browsers, make sure to only install ${selectedBrowsers})
        Firefox: sudo pacman -S --noconfirm firefox
        Brave: yay -S --noconfirm brave-bin
        Chromium: sudo pacman -S --noconfirm chromium

        (Social, make sure to only install ${selectedSocial})
        Discord: sudo pacman -S --noconfirm discord
        Telegram: sudo pacman -S --noconfirm telegram-desktop
        Element: sudo pacman -S --noconfirm element-desktop

        (Security, make sure to only install ${selectedSecurity})
        ufw: sudo pacman -S --noconfirm ufw
        ClamAV: sudo pacman -S --noconfirm clamav
        KeepassXC: sudo pacman -S --noconfirm keepassxc
        Tor Browser: yay -S --noconfirm tor-browser
        WireGuard: sudo pacman -S --noconfirm wireguard-tools

        (Multimedia, make sure to only install ${selectedMultimedia})
        VLC: sudo pacman -S --noconfirm vlc
        MPV: sudo pacman -S --noconfirm mpv
        Pavucontrol: sudo pacman -S --noconfirm pavucontrol
        Spotify: yay -S --noconfirm spotify

        (Productivity, make sure to only install ${selectedProductivity})
        LibreOffice: sudo pacman -S --noconfirm libreoffice-fresh
        Evince: sudo pacman -S --noconfirm evince
        OnlyOffice: yay -S --noconfirm onlyoffice-bin
        Zettlr: yay -S --noconfirm zettlr-bin

        (Devtools, make sure to only install ${selectedDevtools})
        VS Code: yay -S --noconfirm visual-studio-code-bin
        Neovim: sudo pacman -S --noconfirm neovim
        Git: sudo pacman -S --noconfirm git
        Kitty: sudo pacman -S --noconfirm kitty
        Flatpak: sudo pacman -S --noconfirm flatpak

        (Gaming, make sure to only install ${selectedGaming})
        Steam: sudo pacman -S --noconfirm steam
        Lutris: sudo pacman -S --noconfirm lutris
        MangoHUD: sudo pacman -S --noconfirm mangohud
        GameMode: sudo pacman -S --noconfirm gamemode

        (Hyprland Customization, make sure to only install ${selectedHyprland})
        Hyprland: sudo pacman -S --noconfirm hyprland
        Waybar, Wofi, Rofi: sudo pacman -S --noconfirm waybar wofi rofi
        Pywal: sudo pacman -S --noconfirm python-pywal
        Kitty: sudo pacman -S --noconfirm kitty
        LXAppearance: sudo pacman -S --noconfirm lxappearance

        Ubuntu:

        (Browsers, make sure to only install ${selectedBrowsers})
        Firefox: sudo apt install -y firefox
        Brave: sudo apt install -y curl && sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave.com/static-assets/images/brave-browser-archive-keyring.gpg && echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list && sudo apt update && sudo apt install -y brave-browser
        Chromium: sudo apt install -y chromium-browser

        (Social, make sure to only install ${selectedSocial})
        Discord: wget -O discord.deb "https://discord.com/api/download?platform=linux&format=deb" && sudo apt install -y ./discord.deb
        Telegram: sudo apt install -y telegram-desktop
        Element: sudo apt install -y element-desktop

        (Security, make sure to only install ${selectedSecurity})
        ufw: sudo apt install -y ufw
        ClamAV: sudo apt install -y clamav
        KeepassXC: sudo apt install -y keepassxc
        Tor Browser: sudo add-apt-repository -y ppa:micahflee/ppa && sudo apt update && sudo apt install -y torbrowser-launcher
        WireGuard: sudo apt install -y wireguard

        (Multimedia, make sure to only install ${selectedMultimedia})
        VLC: sudo apt install -y vlc
        MPV: sudo apt install -y mpv
        Pavucontrol: sudo apt install -y pavucontrol
        Spotify: curl -sS https://download.spotify.com/debian/pubkey_0D811D58.gpg | sudo gpg --dearmor -o /usr/share/keyrings/spotify-archive-keyring.gpg && echo "deb [signed-by=/usr/share/keyrings/spotify-archive-keyring.gpg] http://repository.spotify.com stable non-free" | sudo tee /etc/apt/sources.list.d/spotify.list && sudo apt update && sudo apt install -y spotify-client

        (Productivity, make sure to only install ${selectedProductivity})
        LibreOffice: sudo apt install -y libreoffice
        Evince: sudo apt install -y evince
        OnlyOffice: wget https://download.onlyoffice.com/install/desktop/editors/linux/onlyoffice-desktopeditors_amd64.deb && sudo apt install -y ./onlyoffice-desktopeditors_amd64.deb
        Zettlr: wget https://github.com/Zettlr/Zettlr/releases/latest/download/Zettlr.deb && sudo apt install -y ./Zettlr.deb

        (Devtools, make sure to only install ${selectedDevtools})
        VS Code: wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg && sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/ && sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" > /etc/apt/sources.list.d/vscode.list' && sudo apt update && sudo apt install -y code
        Neovim: sudo apt install -y neovim
        Git: sudo apt install -y git
        Kitty: sudo apt install -y kitty
        Flatpak: sudo apt install -y flatpak

        (Gaming, make sure to only install ${selectedGaming})
        Steam: sudo apt install -y steam
        Lutris: sudo add-apt-repository -y ppa:lutris-team/lutris && sudo apt update && sudo apt install -y lutris
        MangoHUD: sudo apt install -y mangohud
        GameMode: sudo apt install -y gamemode

        Debian:

        (Browsers, make sure to only install ${selectedBrowsers})
        Firefox: sudo apt install -y firefox-esr
        Brave: sudo apt install -y curl && sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave.com/static-assets/images/brave-browser-archive-keyring.gpg && echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list && sudo apt update && sudo apt install -y brave-browser
        Chromium: sudo apt install -y chromium

        (Social, make sure to only install ${selectedSocial})
        Discord: wget -O discord.deb "https://discord.com/api/download?platform=linux&format=deb" && sudo apt install -y ./discord.deb
        Telegram: sudo apt install -y telegram-desktop
        Element: sudo apt install -y element-desktop

        (Security, make sure to only install ${selectedSecurity})
        ufw: sudo apt install -y ufw
        ClamAV: sudo apt install -y clamav
        KeepassXC: sudo apt install -y keepassxc
        Tor Browser: sudo apt install -y torbrowser-launcher
        WireGuard: sudo apt install -y wireguard

        (Multimedia, make sure to only install ${selectedMultimedia})
        VLC: sudo apt install -y vlc
        MPV: sudo apt install -y mpv
        Pavucontrol: sudo apt install -y pavucontrol
        Spotify: curl -sS https://download.spotify.com/debian/pubkey_0D811D58.gpg | sudo gpg --dearmor -o /usr/share/keyrings/spotify-archive-keyring.gpg && echo "deb [signed-by=/usr/share/keyrings/spotify-archive-keyring.gpg] http://repository.spotify.com stable non-free" | sudo tee /etc/apt/sources.list.d/spotify.list && sudo apt update && sudo apt install -y spotify-client

        (Productivity, make sure to only install ${selectedProductivity})
        LibreOffice: sudo apt install -y libreoffice
        Evince: sudo apt install -y evince
        OnlyOffice: wget https://download.onlyoffice.com/install/desktop/editors/linux/onlyoffice-desktopeditors_amd64.deb && sudo apt install -y ./onlyoffice-desktopeditors_amd64.deb
        Zettlr: wget https://github.com/Zettlr/Zettlr/releases/latest/download/Zettlr.deb && sudo apt install -y ./Zettlr.deb

        (Devtools, make sure to only install ${selectedDevtools})
        VS Code: wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg && sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/ && sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" > /etc/apt/sources.list.d/vscode.list' && sudo apt update && sudo apt install -y code
        Neovim: sudo apt install -y neovim
        Git: sudo apt install -y git
        Kitty: sudo apt install -y kitty
        Flatpak: sudo apt install -y flatpak

        (Gaming, make sure to only install ${selectedGaming})
        Steam: sudo apt install -y steam
        Lutris: sudo add-apt-repository -y ppa:lutris-team/lutris && sudo apt update && sudo apt install -y lutris
        MangoHUD: sudo apt install -y mangohud
        GameMode: sudo apt install -y gamemode
        `;
  }

  function promptISO() {
    return promptText
      .replace(/\${selectedOS}/g, selectedOS || '')
      .replace(/\${selectedBrowsers}/g, selectedBrowsers.join(', '))
      .replace(/\${selectedSocial}/g, selectedSocial.join(', '))
      .replace(/\${selectedSecurity}/g, selectedSecurity.join(', '))
      .replace(/\${selectedMultimedia}/g, selectedMultimedia.join(', '))
      .replace(/\${selectedProductivity}/g, selectedProductivity.join(', '))
      .replace(/\${selectedDevtools}/g, selectedDevtools.join(', '))
      .replace(/\${selectedGaming}/g, selectedGaming.join(', '))
      .replace(/\${selectedHyprland}/g, selectedHyprland.join(', '));
  }

  return (
    <>
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
            onClick={() => setSelectedOS(os)}
          >
            {os}
          </button>
        ))}
      </div>

      <p className="security-description">Security</p>
      {createButtonGroup(['ufw', 'ClamAV', 'KeepassXC', 'Tor Browser', 'WireGuard'], selectedSecurity, setSelectedSecurity, 'security-selector')}

      <p className="browser-description">Browser</p>
      {createButtonGroup(['Firefox', 'Brave', 'Chromium'], selectedBrowsers, setSelectedBrowsers, 'browsers-selector')}

      <p className="social-description">Social</p>
      {createButtonGroup(['Discord', 'Telegram', 'Element'], selectedSocial, setSelectedSocial, 'social-selector')}

      {selectedOS === 'Arch' && (
        <>
          <p className="hyprland-description">Hyprland Customization</p>
          {createButtonGroup(['Hyprland', 'Waybar, Wofi, Rofi', 'Pywal', 'Kitty', 'LXAppearance'], selectedHyprland, setSelectedHyprland, 'hyprland-customization-selector')}
        </>
      )}

      <p className="multimedia-description">Multimedia</p>
      {createButtonGroup(['VLC', 'MPV', 'Pavucontrol', 'Spotify'], selectedMultimedia, setSelectedMultimedia, 'multimedia-selector')}

      <p className="productivity-description">Productivity</p>
      {createButtonGroup(['LibreOffice', 'Evince', 'OnlyOffice', 'Zettlr'], selectedProductivity, setSelectedProductivity, 'productivity-selector')}

      <p className="devtools-description">Devtools</p>
      {createButtonGroup(['VS Code', 'Neovim', 'Git', 'Kitty', 'Flatpak'], selectedDevtools, setSelectedDevtools, 'devtools-selector')}

      <p className="gaming-description">Gaming</p>
      {createButtonGroup(['Steam', 'Lutris', 'MangoHUD', 'GameMode'], selectedGaming, setSelectedGaming, 'gaming-selector')}

      <p className="disclaimer">How this works: This will generate a .sh file or ISO for your system!</p>

      <div className="submit-button">{renderSubmitSection()}</div>
    </>
  );
}

export default App;
