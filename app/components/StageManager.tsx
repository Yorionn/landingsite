'use client';

import React, { useState, useEffect, useRef } from 'react';
import ThreeCarousel from './ThreeCarousel';
import { loadMultipleModels } from './modelLoader';
import type { CarouselItem } from './ThreeCarousel';
import type { ProductData } from './types';
import ProductInfoPanel from './ProductInfoPanel';
import ProductCard from './ProductCard';

// Тестовые данные для товаров
const PRODUCTS_DATA: ProductData[] = [
  {
    id: '1',
    name: 'Premium Ceramic Mug',
    subtitle: 'Handcrafted excellence',
    price: '$24.99',
    description: 'Experience the perfect blend of form and function with our Premium Ceramic Mug. Crafted from high-quality ceramic, this mug is designed to keep your beverages at the ideal temperature while adding a touch of elegance to your daily routine.',
    features: [
      'High-quality ceramic construction',
      'Ergonomic handle design',
      'Dishwasher and microwave safe',
      'Capacity: 350ml',
      'Heat-resistant coating'
    ],
    specifications: [
      { label: 'Material', value: 'Premium Ceramic' },
      { label: 'Capacity', value: '350ml / 12oz' },
      { label: 'Dimensions', value: '10cm x 8cm' },
      { label: 'Weight', value: '320g' },
      { label: 'Care', value: 'Dishwasher safe' }
    ],
    modelPath: '/models/testmug.glb'
  },
  {
    id: '2',
    name: 'Classic Ceramic Mug',
    subtitle: 'Timeless design',
    price: '$19.99',
    description: 'A classic design that never goes out of style. Perfect for your morning coffee or evening tea, this mug combines durability with aesthetic appeal.',
    features: [
      'Traditional ceramic craftsmanship',
      'Comfortable grip handle',
      'Easy to clean',
      'Capacity: 300ml',
      'Versatile use'
    ],
    specifications: [
      { label: 'Material', value: 'Ceramic' },
      { label: 'Capacity', value: '300ml / 10oz' },
      { label: 'Dimensions', value: '9cm x 7.5cm' },
      { label: 'Weight', value: '280g' },
      { label: 'Care', value: 'Hand wash recommended' }
    ],
    modelPath: '/models/testmug.glb'
  },
  {
    id: '3',
    name: 'Modern Ceramic Mug',
    subtitle: 'Contemporary style',
    price: '$22.99',
    description: 'Embrace modern minimalism with this sleek ceramic mug. Its contemporary design makes it a perfect addition to any modern kitchen or office space.',
    features: [
      'Minimalist design',
      'Sturdy construction',
      'Heat retention technology',
      'Capacity: 320ml',
      'Scratch-resistant surface'
    ],
    specifications: [
      { label: 'Material', value: 'Advanced Ceramic' },
      { label: 'Capacity', value: '320ml / 11oz' },
      { label: 'Dimensions', value: '9.5cm x 8cm' },
      { label: 'Weight', value: '300g' },
      { label: 'Care', value: 'Dishwasher safe' }
    ],
    modelPath: '/models/testmug.glb'
  }
];

export default function StageManager() {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [models, setModels] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Загрузка моделей
  useEffect(() => {
    async function loadModels() {
      try {
        setLoading(true);
        const modelPaths = PRODUCTS_DATA.map(p => p.modelPath);
        const loadedModels = await loadMultipleModels(modelPaths);
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

  // Обработка скролла для переключения этапов
  useEffect(() => {
    const element = containerRef.current;
    if (!element || isTransitioning) return;

    let scrollTimeout: NodeJS.Timeout;
    let accumulatedDelta = 0;
    const SCROLL_THRESHOLD = 100;

    const handleWheel = (e: WheelEvent) => {
      // Игнорируем горизонтальный скролл
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      accumulatedDelta += e.deltaY;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        accumulatedDelta = 0;
      }, 200);

      if (Math.abs(accumulatedDelta) > SCROLL_THRESHOLD) {
        if (accumulatedDelta > 0 && stage < 3) {
          // Скролл вниз - следующий этап
          e.preventDefault();
          changeStage((stage + 1) as 1 | 2 | 3);
          accumulatedDelta = 0;
        } else if (accumulatedDelta < 0 && stage > 1) {
          // Скролл вверх - предыдущий этап
          e.preventDefault();
          changeStage((stage - 1) as 1 | 2 | 3);
          accumulatedDelta = 0;
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      (window as any).touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!(window as any).touchStartY) return;

      const deltaY = (window as any).touchStartY - e.touches[0].clientY;
      const isVertical = Math.abs(deltaY) > 50;

      if (isVertical) {
        if (deltaY > 0 && stage < 3) {
          e.preventDefault();
          changeStage((stage + 1) as 1 | 2 | 3);
          delete (window as any).touchStartY;
        } else if (deltaY < 0 && stage > 1) {
          e.preventDefault();
          changeStage((stage - 1) as 1 | 2 | 3);
          delete (window as any).touchStartY;
        }
      }
    };

    const handleTouchEnd = () => {
      delete (window as any).touchStartY;
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(scrollTimeout);
    };
  }, [stage, isTransitioning, models.length]);

  const changeStage = (newStage: 1 | 2 | 3) => {
    if (newStage === stage || isTransitioning) return;
    setIsTransitioning(true);
    setStage(newStage);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleChangeProduct = (direction: number) => {
    const newIndex = (activeIndex + direction + models.length) % models.length;
    setActiveIndex(newIndex);
    if ((window as any).carouselChangeModel) {
      (window as any).carouselChangeModel(newIndex);
    }
  };

  // Экспортируем функцию изменения активного элемента для карусели
  useEffect(() => {
    (window as any).onCarouselIndexChange = (index: number) => {
      // Синхронизируем activeIndex независимо от этапа
      setActiveIndex(index);
    };
    return () => {
      delete (window as any).onCarouselIndexChange;
    };
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
            Loading {PRODUCTS_DATA.length} products
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

  const currentProduct = PRODUCTS_DATA[activeIndex];

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Этап 1: Карусель на 90% экрана */}
      <div
        style={{
          position: 'absolute',
          top: stage === 1 ? '0' : stage === 2 ? '-20vh' : '-50vh',
          left: 0,
          width: '100%',
          height: '90vh',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          opacity: stage === 3 ? 0 : 1,
          pointerEvents: stage === 3 ? 'none' : 'auto',
          zIndex: 2
        }}
      >
        <ThreeCarousel
          items={models}
          radius={4}
          cameraDistance={12}
          backgroundColor={0x0a0a0a}
          width="100%"
          height="100%"
          rotationLocked={stage === 2}
          onIndexChange={setActiveIndex}
        />

        {/* Всплывающие названия под активным элементом (Этап 1) */}
        {stage === 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              color: 'white',
              animation: 'fadeIn 0.5s ease-in-out',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                textShadow: '0 4px 12px rgba(0,0,0,0.8)',
                letterSpacing: '0.02em'
              }}
            >
              {currentProduct.name}
            </div>
            <div
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                color: '#aaa',
                fontWeight: '300',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)'
              }}
            >
              {currentProduct.subtitle}
            </div>
          </div>
        )}
      </div>

      {/* Этап 2: Информационная панель */}
      <ProductInfoPanel
        product={currentProduct}
        visible={stage === 2}
        slideOut={stage === 3}
        onChangeProduct={handleChangeProduct}
      />

      {/* Этап 3: Полная карточка товара */}
      {stage === 3 && (
        <ProductCard
          product={currentProduct}
          onChangeProduct={handleChangeProduct}
        />
      )}

      {/* Стрелочка для перехода вперед */}
      {stage < 3 && (
        <button
          onClick={() => changeStage((stage + 1) as 1 | 2 | 3)}
          disabled={isTransitioning}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: '24px',
            cursor: isTransitioning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            zIndex: 100,
            opacity: isTransitioning ? 0.5 : 1,
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            if (!isTransitioning) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'translateX(-50%) translateY(-5px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateX(-50%) translateY(0)';
          }}
        >
          ↓
        </button>
      )}


      {/* Индикатор этапов */}
      <div
        style={{
          position: 'absolute',
          right: '30px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          zIndex: 100
        }}
      >
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => changeStage(s as 1 | 2 | 3)}
            disabled={isTransitioning}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.5)',
              backgroundColor: stage === s ? 'white' : 'transparent',
              cursor: isTransitioning ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              padding: 0
            }}
            aria-label={`Go to stage ${s}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
