import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Image as ImageIcon, Settings2, ArrowRight, 
  Zap, Palette, Lock, Wand2, Download, Lightbulb, Frame, ChevronDown 
} from 'lucide-react';
import './Home.css';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Custom Dropdown State
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();

  // Closes custom dropdowns if you click anywhere else on the screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const token = localStorage.getItem('token');
    
    // The Bouncer: Checks for guest free pass
    if (!token) {
      const hasUsedFreeTurn = localStorage.getItem('guestGenerated');
      if (hasUsedFreeTurn === 'true') {
        navigate('/login', { state: { message: 'Sign in to generate more masterpieces!' } });
        return;
      }
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt, style, aspectRatio })
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const data = await response.json();
      setPreviewImage(data.imageUrl || data.url);

      // Marks the guest pass as used
      if (!token) localStorage.setItem('guestGenerated', 'true');
      
    } catch (err) {
      alert("Failed to generate. If you are a guest, sign in first!");
      navigate('/login');
    } finally {
      setIsGenerating(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="home-wrapper">
      {/* ================= HEADER BAR ================= */}
      <header className="home-header">
        <div className="logo">✨ AI Gallery</div>
        <nav className="header-links">
          <a href="#how-to-use">How to Use</a>
          <a href="#features">Features</a>
          <a href="#examples">Examples</a>
        </nav>
        <div className="header-actions">
          <button className="btn-text" onClick={() => navigate('/login')}>Log in</button>
          <button className="btn-primary" onClick={() => navigate('/register')}>Sign Up</button>
        </div>
      </header>

      {/* ================= MAIN HERO SECTION ================= */}
      <main className="home-main">
        <div className="hero-content">
          <h1 className="hero-title">What can I imagine for you?</h1>
          
          {/* THE NEW SPLIT LAYOUT CONTAINER */}
          <div className="workspace-container">
            
            {/* --- LEFT SIDE: The Form --- */}
            <div className="workspace-left">
              <form onSubmit={handleGenerate} className="generation-form-stacked">
                
                {/* PROMPT TEXT AREA */}
                <div className="input-group-stacked">
                  <label className="input-label">YOUR PROMPT</label>
                  <textarea 
                    placeholder="A serene mountain landscape with a crystal-clear lake at sunset..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="prompt-textarea"
                    rows="4"
                  />
                  <small className="input-hint">Be descriptive for best results</small>
                </div>

                {/* THE DROPDOWNS ROW */}
                <div className="options-row-stacked" ref={dropdownRef}>
                  
                  {/* 1. Style Dropdown */}
                  <div className="input-group-stacked">
                    <label className="input-label">ART STYLE</label>
                    <div className="custom-dropdown">
                      <div 
                        className={`dropdown-trigger ${openDropdown === 'style' ? 'active' : ''}`}
                        onClick={() => setOpenDropdown(openDropdown === 'style' ? null : 'style')}
                      >
                        <ImageIcon size={16} />
                        <span>{style}</span>
                        <ChevronDown size={14} className="chevron" />
                      </div>
                      {openDropdown === 'style' && (
                        <div className="dropdown-menu">
                          {['Realistic', 'Anime', 'Cinematic', 'Watercolor'].map((opt) => (
                            <div 
                              key={opt} 
                              className={`dropdown-item ${style === opt ? 'selected' : ''}`}
                              onClick={() => { setStyle(opt); setOpenDropdown(null); }}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div> 
                  </div> 

                  {/* 2. Aspect Ratio Dropdown */}
                  <div className="input-group-stacked">
                    <label className="input-label">ASPECT RATIO</label>
                    <div className="custom-dropdown">
                      <div 
                        className={`dropdown-trigger ${openDropdown === 'ratio' ? 'active' : ''}`}
                        onClick={() => setOpenDropdown(openDropdown === 'ratio' ? null : 'ratio')}
                      >
                        <Settings2 size={16} />
                        <span>
                          {aspectRatio === '1:1' ? '1:1 (Square)' : aspectRatio === '16:9' ? '16:9 (Landscape)' : '9:16 (Portrait)'}
                        </span>
                        <ChevronDown size={14} className="chevron" />
                      </div>
                      {openDropdown === 'ratio' && (
                        <div className="dropdown-menu">
                          {[
                            { val: '1:1', label: '1:1 (Square)' },
                            { val: '16:9', label: '16:9 (Landscape)' },
                            { val: '9:16', label: '9:16 (Portrait)' }
                          ].map((opt) => (
                            <div 
                              key={opt.val} 
                              className={`dropdown-item ${aspectRatio === opt.val ? 'selected' : ''}`}
                              onClick={() => { setAspectRatio(opt.val); setOpenDropdown(null); }}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div> 
                  </div> 

                </div>

                {/* SUBMIT BUTTON */}
                <button type="submit" className="generate-btn-large" disabled={isGenerating || !prompt}>
                  {isGenerating ? <div className="mini-spinner"></div> : "✨ Generate Image"}
                </button>

              </form> 
            </div> 

            {/* --- RIGHT SIDE: The Image Display --- */}
            <div className="workspace-right">
              {previewImage ? (
                <div className="preview-container fade-in">
                  <img src={previewImage} alt="Generated masterpiece" className="preview-image" />
                  
                  {/* The Guest Banner Condition */}
                  {!localStorage.getItem('token') && (
                    <div className="guest-banner">
                      <p>Incredible prompt! To save this and generate more, create a free account.</p>
                      <button onClick={() => navigate('/register')}>Join Now</button>
                    </div>
                  )}
                </div> 
              ) : (
                <div className="empty-state-box">
                  <span className="empty-state-icon">🎨</span>
                  <p>Your generated image will appear here</p>
                </div>
              )} 
            </div> 

          </div> 
        </div>
      </main>

      {/* ================= HOW TO USE SECTION ================= */}
      <section id="how-to-use" className="info-section alt-bg">
        <div className="section-content layout-left">
          <h2 className="section-title">How to generate AI Image?</h2>
          <div className="grid-2x2">
            <div className="bento-card">
              <h3>1. Enter Your Prompt</h3>
              <p>Write a description of what you'd like to see—this can be as simple as "sunset over the ocean" or as detailed as a highly specific scene. The more specific you are, the more accurate the result.</p>
            </div>
            <div className="bento-card">
              <h3>2. Choose a Style</h3>
              <p>Select from a variety of artistic styles such as realistic photography, anime, 3D render, watercolor, and more. Styles help shape the mood and look of your image.</p>
            </div>
            <div className="bento-card">
              <h3>3. Pick an Aspect Ratio</h3>
              <p>Decide the format that fits your needs. For example: 1:1 (Square) – Perfect for profile pictures. 9:16 (Vertical) – Ideal for mobile content and stories.</p>
            </div>
            <div className="bento-card">
              <h3>4. Click Generate</h3>
              <p>Hit the "Generate Image" button and let the AI do the magic. In just a few seconds, your image will appear—ready to view, download, and use however you like.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="info-section">
        <div className="section-content layout-left">
          <div className="section-header-row">
            <h2 className="section-title">Key features of the Image Generator</h2>
            <button className="btn-outline" onClick={scrollToTop}>Generate Image</button>
          </div>
          
          <div className="grid-3x2">
            <div className="bento-card">
              <Zap className="card-icon" size={28} />
              <h3>Free to use</h3>
              <p>Generate your first image instantly with no cost and no registration required.</p>
            </div>
            <div className="bento-card">
              <ImageIcon className="card-icon" size={28} />
              <h3>High-Quality</h3>
              <p>Every image is generated in crisp, detailed resolution, ready to use in projects, posts, or designs.</p>
            </div>
            <div className="bento-card">
              <Wand2 className="card-icon" size={28} />
              <h3>Fast & Easy to Use</h3>
              <p>No design skills required—just type, click, and get stunning results in seconds.</p>
            </div>
            <div className="bento-card">
              <Palette className="card-icon" size={28} />
              <h3>Custom Styles</h3>
              <p>Users can select from multiple artistic styles to achieve their desired visual outcome.</p>
            </div>
            <div className="bento-card">
              <Lightbulb className="card-icon" size={28} />
              <h3>Prompt Suggestions</h3>
              <p>Get inspiration with ready-made prompts and examples to kickstart your creativity.</p>
            </div>
            <div className="bento-card">
              <Frame className="card-icon" size={28} />
              <h3>Flexible Aspect Ratios</h3>
              <p>Generate images in different formats, from square posts to cinematic widescreen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXAMPLES SECTION ================= */}
      <section id="examples" className="info-section alt-bg">
        <div className="section-content layout-left">
          <h2 className="section-title">Examples with prompts</h2>
          
          <div className="grid-3x2">
            <div className="example-bento-card">
              <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop" alt="Cinematic Example" className="example-image" />
              <div className="example-content">
                <h3>Cinematic</h3>
                <div className="prompt-box">
                  A vintage 1990s cinematic shot, beautiful chiffon saree, golden hour lighting, highly detailed film grain
                </div>
              </div>
            </div>
            
            <div className="example-bento-card">
              <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop" alt="Anime Example" className="example-image" />
              <div className="example-content">
                <h3>Anime</h3>
                <div className="prompt-box">
                  anime key visual of a sky city at dusk, studio quality, clean line art, cel shading, background bokeh
                </div>
              </div>
            </div>
            
            <div className="example-bento-card">
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop" alt="Realistic Example" className="example-image" />
              <div className="example-content">
                <h3>Photorealistic</h3>
                <div className="prompt-box">
                  ultra-detailed 35mm portrait of a red fox, shallow depth of field, soft natural lighting, realistic textures
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ================= FOOTER ================= */}
      <footer className="home-footer">
        <p>© 2026 AI Gallery. Built for creators.</p>
      </footer>
    </div>
  );
}