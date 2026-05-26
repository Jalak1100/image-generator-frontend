import React, { useState } from 'react'
import { Wand2, Zap, AlertCircle } from 'lucide-react'
import './ImageGenerator.css'

export default function ImageGenerator({ onImageGenerated, credits, setCredits, onGoToGallery }) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedImage, setGeneratedImage] = useState(null)

  const styles = [
    { id: 'realistic', label: 'Realistic', description: 'Photorealistic images' },
    { id: 'cartoon', label: 'Cartoon', description: 'Colorful cartoon style' },
    { id: 'anime', label: 'Anime', description: 'Japanese anime style' },
    { id: '3d', label: '3D', description: '3D rendered images' },
  ]

  const aspectRatios = [
    { id: '1:1', label: '1:1 (Square)', ratio: '1:1' },
    { id: '4:3', label: '4:3 (Standard)', ratio: '4:3' },
    { id: '3:4', label: '3:4 (Portrait)', ratio: '3:4' },
    { id: '16:9', label: '16:9 (Widescreen)', ratio: '16:9' },
    { id: '9:16', label: '9:16 (Mobile)', ratio: '9:16' },
  ]

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend Credit Check
    if (credits <= 0) {
      setError('You are out of credits! Your balance will reset 24 hours after your last refill.');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://image-generator-backend-kiu4.onrender.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt: `${prompt}, ${style} style` })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image from server');
      }

      // Update the master credit balance on the Dashboard
      if (data.creditsRemaining !== undefined && setCredits) {
        setCredits(data.creditsRemaining);
      }
      
      setGeneratedImage(data);
      
      if (onImageGenerated) {
        onImageGenerated(data);
      }

    } catch (err) {
      setError(err.message || 'Failed to generate image');
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <div className="generator-header">
        <h1>Create Your Masterpiece</h1>
        <p>Describe what you imagine, and let AI bring it to life</p>
        
        {/* CREDIT BADGE */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px',
          background: credits > 0 ? 'rgba(79, 70, 229, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          color: credits > 0 ? '#4f46e5' : '#ef4444',
          padding: '6px 14px', 
          borderRadius: '20px', 
          fontWeight: '600',
          marginTop: '12px',
          fontSize: '14px'
        }}>
          <Zap size={16} fill="currentColor" />
          {credits > 0 ? `${credits} Credits Available` : 'Out of Credits'}
        </div>
      </div>

      <div className="generator-wrapper">
        <div className="generator-form-section">
          <form onSubmit={handleGenerate} className="generator-form">
            <div className="form-section">
              <label htmlFor="prompt" className="section-title">Your Prompt</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A serene mountain landscape with a crystal-clear lake at sunset..."
                className="prompt-input"
                rows="4"
                disabled={isLoading || credits <= 0}
              />
              <p className="input-hint">Be descriptive for best results</p>
            </div>

            <div className="form-row">
              <div className="form-section">
                <label className="section-title">Art Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="dropdown-select"
                  disabled={isLoading || credits <= 0}
                >
                  {styles.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <label className="section-title">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="dropdown-select"
                  disabled={isLoading || credits <= 0}
                >
                  {aspectRatios.map(ar => (
                    <option key={ar.id} value={ar.id}>
                      {ar.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                background: '#fef2f2', color: '#dc2626', 
                padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
                border: '1px solid #f87171'
              }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="generate-button"
              disabled={isLoading || credits <= 0}
              style={{
                opacity: (isLoading || credits <= 0) ? 0.7 : 1,
                cursor: (isLoading || credits <= 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Generate Image (1 Credit)
                </>
              )}
            </button>

            {/* GO TO GALLERY BUTTON (Only shows when credits hit 0) */}
            {credits <= 0 && (
              <button
                type="button"
                onClick={onGoToGallery}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  color: '#4f46e5',
                  border: '2px solid #4f46e5',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginTop: '12px' 
                }}
              >
                View My Previous Masterpieces ➔
              </button>
            )}
          </form>
        </div>

        {/* THE FIX: We ONLY render the preview box if an image has been generated */}
        {generatedImage && (
          <div className="generator-preview-section">
            <div className="preview-box glass">
              <div className="preview-image-container">
                <img src={generatedImage.url} alt="Generated" className="preview-image" />
                <div className="preview-info">
                  <p className="preview-prompt">{generatedImage.prompt}</p>
                  <p className="preview-style">{generatedImage.style}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}