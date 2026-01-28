'use client';

import React, { useState, useEffect, useRef } from 'react';
import ThreeCarousel from './ThreeCarousel';
import { loadMultipleModels } from './modelLoader';
import type { CarouselItem } from './ThreeCarousel';
import type { ProductData } from './types';
import ProductInfoPanel from './ProductInfoPanel';

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
  const [stage, setStage] = useState<1 | 2>(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [models, setModels] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [panelState, setPanelState] = useState<'hidden' | 'visible' | 'hiding'>('hidden');
  const [showHint, setShowHint] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introAnimating, setIntroAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout>();

  // Определение размера экрана для адаптивных параметров карусели
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Подсказка при бездействии
  useEffect(() => {
    if (stage !== 1) {
      setShowHint(false);
      return;
    }

    // Показываем подсказку через 5 секунд бездействия
    const showHintTimer = setTimeout(() => {
      setShowHint(true);
    }, 5000);

    const handleUserActivity = () => {
      // Скрываем подсказку при активности
      setShowHint(false);
      // Сбрасываем таймер
      clearTimeout(showHintTimer);
      clearTimeout(inactivityTimerRef.current);
      
      // Запускаем новый таймер для повторного показа
      inactivityTimerRef.current = setTimeout(() => {
        setShowHint(true);
      }, 5000);
    };

    // Отслеживаем активность пользователя (без mousemove для плавности)
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('wheel', handleUserActivity);

    return () => {
      clearTimeout(showHintTimer);
      clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('wheel', handleUserActivity);
    };
  }, [stage]);

  // Адаптивные параметры карусели
  const carouselRadius = isMobile ? 2.5 : 4;
  const carouselCameraDistance = isMobile ? 8 : 12;

  // Загрузка моделей с отслеживанием времени
  useEffect(() => {
    const startTime = Date.now();
    
    async function loadModels() {
      try {
        setLoading(true);
        const modelPaths = PRODUCTS_DATA.map(p => p.modelPath);
        const loadedModels = await loadMultipleModels(modelPaths);
        setModels(loadedModels);
        
        // Вычисляем, сколько времени прошло
        const elapsedTime = Date.now() - startTime;
        const minIntroTime = 2000; // Минимум 2 секунды для интро
        
        // Если прошло меньше 2 секунд, ждем оставшееся время
        if (elapsedTime < minIntroTime) {
          setTimeout(() => {
            setLoading(false);
          }, minIntroTime - elapsedTime);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load models:', err);
        setError('Failed to load 3D models');
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  // Анимация интро после загрузки
  useEffect(() => {
    if (!loading && showIntro && !error) {
      // Ждем 500ms после загрузки, затем начинаем анимацию
      const timer = setTimeout(() => {
        setIntroAnimating(true);
        // Скрываем интро через 1 секунду (длительность анимации)
        setTimeout(() => {
          setShowIntro(false);
        }, 1000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, showIntro, error]);

  // Обработка скролла для переключения этапов
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let scrollTimeout: NodeJS.Timeout;
    let accumulatedDelta = 0;
    const SCROLL_THRESHOLD = 100;

    const handleWheel = (e: WheelEvent) => {
      if (stage === 1) {
        // Этап 1: скролл вниз переводит на этап 2
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

        accumulatedDelta += e.deltaY;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          accumulatedDelta = 0;
        }, 200);

        if (Math.abs(accumulatedDelta) > SCROLL_THRESHOLD) {
          if (accumulatedDelta > 0 && !isTransitioning) {
            e.preventDefault();
            changeStage(2);
            accumulatedDelta = 0;
          }
        }
      } else if (stage === 2) {
        // Этап 2: скролл вверх в начале страницы переводит на этап 1
        const scrollContainer = scrollContainerRef.current;
        const isAtTop = scrollContainer ? scrollContainer.scrollTop === 0 : false;
        
        if (isAtTop && e.deltaY < 0) {
          accumulatedDelta += e.deltaY;

          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            accumulatedDelta = 0;
          }, 200);

          if (Math.abs(accumulatedDelta) > SCROLL_THRESHOLD && !isTransitioning) {
            e.preventDefault();
            changeStage(1);
            accumulatedDelta = 0;
          }
        } else {
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

      if (stage === 1 && isVertical && deltaY > 0 && !isTransitioning) {
        e.preventDefault();
        changeStage(2);
        delete (window as any).touchStartY;
      } else if (stage === 2 && isVertical && deltaY < 0 && !isTransitioning) {
        const scrollContainer = scrollContainerRef.current;
        const isAtTop = scrollContainer ? scrollContainer.scrollTop === 0 : false;
        if (isAtTop) {
          e.preventDefault();
          changeStage(1);
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

  const changeStage = (newStage: 1 | 2) => {
    if (newStage === stage || isTransitioning) return;
    setIsTransitioning(true);
    
    if (newStage === 2) {
      // Переход на этап 2: показываем панель, затем анимируем
      setShowPanel(true);
      setPanelState('hidden');
      setTimeout(() => setPanelState('visible'), 50);
      // Задержка перед завершением transition для плавности
      setTimeout(() => setIsTransitioning(false), 850);
    } else {
      // Переход на этап 1: анимируем уход, затем скрываем
      setPanelState('hiding');
      setTimeout(() => {
        setShowPanel(false);
        setPanelState('hidden');
        setIsTransitioning(false);
      }, 800);
    }
    
    setStage(newStage);
  };

  const handleChangeProduct = (direction: number) => {
    const newIndex = (activeIndex + direction + models.length) % models.length;
    setActiveIndex(newIndex);
    if ((window as any).carouselChangeModel) {
      (window as any).carouselChangeModel(newIndex);
    }
  };

  const handleLogoClick = () => {
    if (stage !== 1) {
      changeStage(1);
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

  // Не показываем сообщение о загрузке, только интро

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
      {/* Черный фон интро */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: '#000',
          zIndex: 9998,
          transition: 'opacity 1s ease',
          opacity: (showIntro && !introAnimating) ? 1 : 0,
          pointerEvents: (showIntro && !introAnimating) ? 'auto' : 'none'
        }}
      />

      {/* Градиент шапки */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '120px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
          zIndex: 199,
          transition: 'opacity 0.5s ease',
          opacity: !showIntro ? 1 : 0,
          pointerEvents: 'none'
        }}
      />

      {/* Логотип DeepInside - единый элемент для интро и шапки */}
      <div
        onClick={handleLogoClick}
        style={{
          position: 'fixed',
          top: introAnimating || !showIntro ? '30px' : '50%',
          left: '50%',
          transform: introAnimating || !showIntro 
            ? 'translate(-50%, 0) scale(1)' 
            : 'translate(-50%, -50%) scale(1)',
          fontSize: introAnimating || !showIntro 
            ? 'clamp(1.2rem, 3vw, 1.8rem)' 
            : 'clamp(3rem, 10vw, 6rem)',
          fontWeight: 'bold',
          color: 'white',
          fontFamily: 'Arial, sans-serif', // Здесь можно настроить шрифт
          letterSpacing: '0.05em',
          cursor: !showIntro ? 'pointer' : 'default',
          transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 9999,
          pointerEvents: !showIntro ? 'auto' : 'none',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          if (!showIntro) {
            e.currentTarget.style.transform = 'translate(-50%, 0) scale(1.05)';
            e.currentTarget.style.textShadow = '0 0 20px rgba(255,255,255,0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (!showIntro) {
            e.currentTarget.style.transform = 'translate(-50%, 0) scale(1)';
            e.currentTarget.style.textShadow = 'none';
          }
        }}
      >
        DeepInside
      </div>

      {/* Обертка для скроллируемого контента на этапе 2 */}
      <div
        ref={scrollContainerRef}
        style={{
          width: '100%',
          height: '100vh',
          overflowY: stage === 2 ? 'auto' : 'hidden',
          overflowX: 'hidden'
        }}
      >
        {/* Карусель - всегда в DOM для плавной анимации */}
        <div
          style={{
            position: stage === 1 ? 'absolute' : 'relative',
            top: stage === 1 ? '0' : undefined,
            left: isMobile ? '-10%' : 0,
            width: isMobile ? '120%' : '100%',
            height: stage === 1 ? '90vh' : '60vh',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'visible',
            transform: stage === 2 ? 'translateY(-10vh) scale(0.9)' : 'translateY(-8vh) scale(1)',
            transformOrigin: 'top center',
            backgroundColor: '#0a0a0a'
          }}
        >
        <ThreeCarousel
          items={models}
          radius={carouselRadius}
          cameraDistance={carouselCameraDistance}
          backgroundColor={0x0a0a0a}
          width="100%"
          height="100%"
          rotationLocked={stage === 2}
          onIndexChange={setActiveIndex}
          showUI={stage === 1}
        />

        {/* Всплывающие названия под активным элементом (Этап 1) */}
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            color: 'white',
            pointerEvents: 'none',
            zIndex: 10,
            opacity: stage === 1 ? 1 : 0,
            transition: 'opacity 0.3s ease'
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
        </div>

        {/* Информационная панель с контролируемой анимацией */}
        {showPanel && (
          <div
            style={{
              position: panelState === 'visible' && !isTransitioning ? 'relative' : 'absolute',
              top: panelState === 'visible' && !isTransitioning ? undefined : '50vh',
              left: 0,
              width: '100%',
              marginTop: panelState === 'visible' && !isTransitioning ? '-10vh' : 0,
              transform: panelState === 'visible' ? 'translateY(0)' : 'translateY(calc(50vh + 10vh))',
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: panelState === 'visible' ? 'auto' : 'none'
            }}
          >
            <ProductInfoPanel
              product={currentProduct}
              visible={true}
              onChangeProduct={handleChangeProduct}
            />
          </div>
        )}
      </div>

      {/* Единые стрелки навигации */}
      {!isMobile && (
        <>
          <button
            onClick={() => handleChangeProduct(-1)}
            style={{
              position: 'fixed',
              left: stage === 1 ? '120px' : '80px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 90,
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'translateY(-50%) translateX(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
            }}
          >
            ‹
          </button>

          <button
            onClick={() => handleChangeProduct(1)}
            style={{
              position: 'fixed',
              right: stage === 1 ? '120px' : '80px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 90,
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'translateY(-50%) translateX(5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(-50%) translateX(0)';
            }}
          >
            ›
          </button>
        </>
      )}

      {/* Индикатор этапов */}
      <div
        style={{
          position: 'fixed',
          right: '30px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          zIndex: 100
        }}
      >
        {[1, 2].map((s) => (
          <button
            key={s}
            onClick={() => changeStage(s as 1 | 2)}
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

      {/* Подсказка при бездействии */}
      {stage === 1 && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '12px 24px',
            borderRadius: '25px',
            pointerEvents: 'none',
            zIndex: 95,
            opacity: showHint ? 1 : 0,
            transition: 'opacity 1.5s ease',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}
        >
          Зажмите, чтобы вращать • Свайп для смены модели • Листайте вниз
        </div>
      )}

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
