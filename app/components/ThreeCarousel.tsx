'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface CarouselItem {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  name?: string;
}

export interface ThreeCarouselProps {
  items: CarouselItem[];
  radius?: number;
  cameraDistance?: number;
  backgroundColor?: number;
  width?: string;
  height?: string;
}

export default function ThreeCarousel({
  items,
  radius = 6,
  cameraDistance = 14,
  backgroundColor = 0x1a1a1a,
  width = '100%',
  height = '600px'
}: ThreeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    // Camera с увеличенным FOV для лучшего обзора
    const camera = new THREE.PerspectiveCamera(
      45, // Увеличенный FOV (было 45) для большего обзора
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, cameraDistance);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(5, 10, 5);
    scene.add(light);

    // Create models
    const models: THREE.Mesh[] = [];
    const angleStep = (Math.PI * 2) / items.length;
    
    items.forEach((item, index) => {
      const mesh = new THREE.Mesh(item.geometry, item.material);
      const angle = angleStep * index;
      mesh.position.x = Math.sin(angle) * radius;
      mesh.position.z = Math.cos(angle) * radius;
      
      // Включаем прозрачность для материалов
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => {
          mat.transparent = true;
          mat.opacity = index === 0 ? 1.0 : 0.3; // Первая модель видна полностью
        });
      } else {
        mesh.material.transparent = true;
        mesh.material.opacity = index === 0 ? 1.0 : 0.3;
      }
      
      // Сохраняем начальный угол
      mesh.userData.currentAngle = angle;
      mesh.userData.targetAngle = angle;
      mesh.userData.currentScale = index === 0 ? 0.7 : 0.5; // Первая модель больше
      mesh.userData.targetScale = index === 0 ? 0.7 : 0.5;
      
      scene.add(mesh);
      models.push(mesh);
    });

    // Камера смотрит на центр
    camera.lookAt(0, 0, 0);
    
    // Управление: мышь + touch (мобильные)
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isSwipeZone = false; // Определяем, начался ли drag в зоне свайпа
    
    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'none'; // Блокируем стандартные touch жесты
    
    // Универсальные функции для мыши и touch
    const onDragStart = (x: number, y: number) => {
      isDragging = true;
      previousX = x;
      previousY = y;
      startX = x;
      startY = y;
      startTime = Date.now();
      canvas.style.cursor = 'grabbing';
      
      // Определяем зону свайпа: 25% от краёв экрана
      const canvasWidth = canvas.clientWidth;
      const edgeZone = canvasWidth * 0.25;
      isSwipeZone = x < edgeZone || x > canvasWidth - edgeZone;
    };
    
    const onDragMove = (x: number, y: number) => {
      if (!isDragging) return;
      
      const deltaX = x - previousX;
      const deltaY = y - previousY;
      
      // Вращаем модель ТОЛЬКО если НЕ в зоне свайпа
      if (!isSwipeZone) {
        const activeModel = models[activeIndexRef.current];
        if (activeModel) {
          // Увеличенная чувствительность вращения (0.02 вместо 0.01)
          activeModel.rotation.y += deltaX * 0.02;
          activeModel.rotation.x += deltaY * 0.02;
        }
      }
      
      previousX = x;
      previousY = y;
    };
    
    const onDragEnd = (x: number, y: number) => {
      if (!isDragging) return;
      
      const deltaX = x - startX;
      const deltaY = y - startY;
      const deltaTime = Date.now() - startTime;
      const velocity = Math.abs(deltaX) / deltaTime;
      
      // Свайп срабатывает только если начался в зоне свайпа
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 1.5;
      const isSignificantSwipe = Math.abs(deltaX) > 50 || velocity > 0.5;
      
      if (isSwipeZone && isHorizontalSwipe && isSignificantSwipe) {
        if ((window as any).carouselChangeModel) {
          const direction = deltaX > 0 ? -1 : 1;
          const newIndex = (activeIndexRef.current + direction + items.length) % items.length;
          (window as any).carouselChangeModel(newIndex);
        }
      }
      
      isDragging = false;
      isSwipeZone = false;
      canvas.style.cursor = 'grab';
    };
    
    // Mouse events
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      onDragStart(e.clientX, e.clientY);
    });
    
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      onDragMove(e.clientX, e.clientY);
    });
    
    canvas.addEventListener('mouseup', (e: MouseEvent) => {
      onDragEnd(e.clientX, e.clientY);
    });
    
    canvas.addEventListener('mouseleave', (e: MouseEvent) => {
      onDragEnd(e.clientX, e.clientY);
    });
    
    // Touch events для мобильных устройств
    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        onDragStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e: TouchEvent) => {
      e.preventDefault();
      if (e.changedTouches.length > 0) {
        onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }, { passive: false });

    setIsLoaded(true);

    // Animation loop с плавными переходами
    const animate = () => {
      requestAnimationFrame(animate);
      
      models.forEach((model, index) => {
        const isActive = index === activeIndexRef.current;
        
        // Плавное изменение позиции (вращение карусели)
        let currentAngle = model.userData.currentAngle;
        let targetAngle = model.userData.targetAngle;
        
        // ИСПРАВЛЕНИЕ: выбираем кратчайший путь вращения
        let angleDiff = targetAngle - currentAngle;
        
        // Нормализуем разницу углов в диапазон [-π, π]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        model.userData.currentAngle += angleDiff * 0.05; // Плавность 0.05 (медленнее)
        
        model.position.x = Math.sin(model.userData.currentAngle) * radius;
        model.position.z = Math.cos(model.userData.currentAngle) * radius;
        
        // Плавное изменение размера
        model.userData.targetScale = isActive ? 0.7 : 0.5;
        const scaleDiff = model.userData.targetScale - model.userData.currentScale;
        model.userData.currentScale += scaleDiff * 0.05; // Плавнее
        model.scale.setScalar(model.userData.currentScale);
        
        // Плавное изменение прозрачности
        const targetOpacity = isActive ? 1.0 : 0.3;
        if (Array.isArray(model.material)) {
          model.material.forEach(mat => {
            const diff = targetOpacity - mat.opacity;
            mat.opacity += diff * 0.05; // Плавнее
          });
        } else {
          const diff = targetOpacity - model.material.opacity;
          model.material.opacity += diff * 0.05; // Плавнее
        }
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Функция смены активной модели
    const changeModel = (newIndex: number) => {
      // НЕ сбрасываем rotation - модель сохраняет свою ориентацию
      activeIndexRef.current = newIndex;
      
      // Вычисляем новые целевые углы для всех моделей
      // Карусель должна повернуться так, чтобы новая активная модель была спереди
      const angleStep = (Math.PI * 2) / items.length;
      const rotationOffset = -angleStep * newIndex;
      
      models.forEach((model, index) => {
        const baseAngle = angleStep * index;
        model.userData.targetAngle = baseAngle + rotationOffset;
      });
    };

    // Навешиваем на window для доступа из UI
    (window as any).carouselChangeModel = changeModel;

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      delete (window as any).carouselChangeModel;
    };
  }, [items, radius, cameraDistance, backgroundColor]);

  const changeModel = (direction: number) => {
    const newIndex = (activeIndexRef.current + direction + items.length) % items.length;
    if ((window as any).carouselChangeModel) {
      (window as any).carouselChangeModel(newIndex);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        position: 'relative',
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      )}
      
      {isLoaded && (
        <>
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '14px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '10px 20px',
            borderRadius: '20px',
            pointerEvents: 'none'
          }}>
           {isMobile ? 'Drag to rotate • Swipe edges to switch' : 'Drag to rotate • Swipe edges or click arrows'}
          </div>
          
          {!isMobile && (
            <>
              <div
                onClick={() => changeModel(-1)}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  fontSize: '40px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                ‹
              </div>
              
              <div
                onClick={() => changeModel(1)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  fontSize: '40px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                ›
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
