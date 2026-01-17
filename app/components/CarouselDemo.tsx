'use client';

import React, { useState, useEffect } from 'react';
import ThreeCarousel from './ThreeCarousel';
import { loadMultipleModels } from './modelLoader';
import type { CarouselItem } from './ThreeCarousel';


export default function CarouselDemo() {
  const [models, setModels] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Просто добавьте/уберите пути к моделям в массиве
  const MODEL_PATHS = [
    '/models/testmug.glb',
    '/models/testmug.glb',
    '/models/testmug.glb',
  
  ];
  
  useEffect(() => {
    async function loadModels() {
      try {
        setLoading(true);
        
      
        const loadedModels = await loadMultipleModels(MODEL_PATHS);
        
        setModels(loadedModels);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load models:', err);
        setError('Failed to load 3D models');
        setLoading(false);
      }
    }
    
    loadModels();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '1.2rem' }}>Loading 3D Models...</div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
            Loading {MODEL_PATHS.length} 3D models
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ fontSize: '1.5rem' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto'
      }}>
        <h1 style={{
          color: 'white',
          textAlign: 'center',
          fontSize: '3rem',
          marginBottom: '0.5rem',
          fontWeight: 'bold'
        }}>
          3D Carousel 
        </h1>
        
        <p style={{
          color: '#aaa',
          textAlign: 'center',
          fontSize: '1.2rem',
          marginBottom: '3rem',
          maxWidth: '600px',
          margin: '0 auto 3rem'
        }}>
          Interactive 3D carousel with {MODEL_PATHS.length} models
        </p>

        <ThreeCarousel
          items={models}
          radius={3}
          cameraDistance={10}
          backgroundColor={0x0a0a0a}
          width="100%"
          height="800px"
        />

        <div style={{
          marginTop: '3rem',
          color: 'white',
          textAlign: 'center'
        }}>
        </div>
      </div>
    </div>
  );
}
