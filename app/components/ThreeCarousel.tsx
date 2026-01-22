'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface CarouselItem {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  name?: string;
  // Опциональная группа объектов для сложных моделей с несколькими мешами
  group?: THREE.Group;
}

export interface ThreeCarouselProps {
  items: CarouselItem[];
  radius?: number;
  cameraDistance?: number;
  backgroundColor?: number;
  width?: string;
  height?: string;
  rotationLocked?: boolean;
  onIndexChange?: (index: number) => void;
}

export default function ThreeCarousel({
  items,
  radius = 6,
  cameraDistance = 14,
  backgroundColor = 0x1a1a1a,
  width = '100%',
  height = '600px',
  rotationLocked = false,
  onIndexChange
}: ThreeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef<number>(0);
  const isMobileRef = useRef<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство ТОЛЬКО ПО ШИРИНЕ ЭКРАНА
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      isMobileRef.current = mobile;
      setIsMobile(mobile);
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

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
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
    const models: THREE.Object3D[] = [];
    const angleStep = (Math.PI * 2) / items.length;
    
    items.forEach((item, index) => {
      // Используем group если есть, иначе создаём обычный mesh
      let model: THREE.Object3D;
      
      if (item.group) {
        model = item.group.clone();
      } else {
        model = new THREE.Mesh(item.geometry, item.material);
      }
      
      const angle = angleStep * index;
      model.position.x = Math.sin(angle) * radius;
      model.position.z = Math.cos(angle) * radius;
      model.position.y = 0;
      
      // Включаем прозрачность для материалов
      const setOpacity = (obj: THREE.Object3D, opacity: number) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = true;
                mat.opacity = opacity;
              });
            } else {
              child.material.transparent = true;
              child.material.opacity = opacity;
            }
          }
        });
      };
      
      setOpacity(model, index === 0 ? 1.0 : 0.3);
      
      // Сохраняем начальный угол
      model.userData.currentAngle = angle;
      model.userData.targetAngle = angle;
      model.userData.currentScale = index === 0 ? 0.7 : 0.5; // Первая модель больше
      model.userData.targetScale = index === 0 ? 0.7 : 0.5;
      
      scene.add(model);
      models.push(model);
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
    let isEdgeZone = false; // Началось ли движение в зоне свайпа (по краям)
    let isCenterZone = false; // Началось ли движение в центральной зоне (вращение)
    let gestureDirection: 'vertical' | 'horizontal' | 'rotation' = 'rotation'; // По умолчанию вращение
    let totalDeltaY = 0;
    let shouldPreventDefault = false;
    
    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'pan-y';
    
    // Универсальные функции для мыши и touch
    const onDragStart = (x: number, y: number) => {
      isDragging = true;
      previousX = x;
      previousY = y;
      startX = x;
      startY = y;
      startTime = Date.now();
      totalDeltaY = 0;
      shouldPreventDefault = false;
      canvas.style.cursor = 'grabbing';
      
      // Определяем зону начала жеста (только на мобильных)
      if (isMobileRef.current) {
        const canvasWidth = canvas.clientWidth;
        const edgeZoneWidth = canvasWidth * 0.2; // 20% с каждой стороны
        
        isEdgeZone = x < edgeZoneWidth || x > canvasWidth - edgeZoneWidth;
        isCenterZone = !isEdgeZone;
        
        // В центре - вращение по умолчанию, по краям - свайп
        gestureDirection = isCenterZone ? 'rotation' : 'horizontal';
      } else {
        // На ПК всегда вращение
        isEdgeZone = false;
        isCenterZone = true;
        gestureDirection = 'rotation';
      }
    };
    
    const onDragMove = (x: number, y: number) => {
      if (!isDragging) return;
      
      const deltaX = x - previousX;
      const deltaY = y - previousY;
      
      // Проверяем явное вертикальное намерение для скролла (только мобильные в центре)
      if (isMobileRef.current && isCenterZone && gestureDirection === 'rotation') {
        totalDeltaY += Math.abs(deltaY);
        const totalDeltaX = Math.abs(x - startX);
        const verticalRatio = totalDeltaY / (totalDeltaX + 1);
        
        if (totalDeltaY > 150 && verticalRatio > 6.0) {
          gestureDirection = 'vertical';
          isDragging = false;
          shouldPreventDefault = false;
          return;
        }
      }
      
      // Вращаем модель если жест rotation (центральная зона или ПК) И вращение не заблокировано
      if (gestureDirection === 'rotation' && !rotationLocked) {
        const activeModel = models[activeIndexRef.current];
        if (activeModel) {
          activeModel.rotation.y += deltaX * 0.02;
          activeModel.rotation.x += deltaY * 0.02;
          
          if (isMobileRef.current) {
            shouldPreventDefault = true;
          }
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
      const velocity = Math.abs(deltaX) / deltaTime; // px/ms
      
      const isHorizontalDominant = Math.abs(deltaX) > Math.abs(deltaY) * 1.3;
      const isFastSwipe = velocity > 0.5 && deltaTime < 400;
      const isSignificantDistance = Math.abs(deltaX) > 60;
      
      const shouldSwipe = isMobileRef.current 
        ? (isEdgeZone && gestureDirection === 'horizontal' && isHorizontalDominant && (isFastSwipe || isSignificantDistance))
        : (isHorizontalDominant && isFastSwipe);
      
      if (shouldSwipe && (window as any).carouselChangeModel) {
        const direction = deltaX > 0 ? -1 : 1;
        const newIndex = (activeIndexRef.current + direction + items.length) % items.length;
        (window as any).carouselChangeModel(newIndex);
      }
      
      isDragging = false;
      isEdgeZone = false;
      isCenterZone = false;
      gestureDirection = 'rotation';
      shouldPreventDefault = false;
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
    
    // Touch events
    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onDragStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
        if (shouldPreventDefault && gestureDirection !== 'vertical') {
          e.preventDefault();
        }
      }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }, { passive: false });

    setIsLoaded(true);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      models.forEach((model, index) => {
        const isActive = index === activeIndexRef.current;
        
        // Плавное изменение позиции
        let currentAngle = model.userData.currentAngle;
        let targetAngle = model.userData.targetAngle;
        let angleDiff = targetAngle - currentAngle;
        
        // Нормализуем разницу углов в диапазон [-π, π]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        model.userData.currentAngle += angleDiff * 0.05;
        model.position.x = Math.sin(model.userData.currentAngle) * radius;
        model.position.z = Math.cos(model.userData.currentAngle) * radius;
        
        // Плавное изменение размера
        model.userData.targetScale = isActive ? 0.7 : 0.5;
        const scaleDiff = model.userData.targetScale - model.userData.currentScale;
        model.userData.currentScale += scaleDiff * 0.05;
        model.scale.setScalar(model.userData.currentScale);
        
        // Плавное изменение прозрачности
        const targetOpacity = isActive ? 1.0 : 0.3;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                const diff = targetOpacity - mat.opacity;
                mat.opacity += diff * 0.05;
              });
            } else {
              const diff = targetOpacity - child.material.opacity;
              child.material.opacity += diff * 0.05;
            }
          }
        });
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

    const changeModel = (newIndex: number) => {
      // Проверяем, действительно ли индекс изменился
      if (activeIndexRef.current === newIndex) return;
      
      activeIndexRef.current = newIndex;
      
      const angleStep = (Math.PI * 2) / items.length;
      const rotationOffset = -angleStep * newIndex;
      
      models.forEach((model, index) => {
        const baseAngle = angleStep * index;
        model.userData.targetAngle = baseAngle + rotationOffset;
      });
      
      // Вызываем callback если он есть
      if (onIndexChange) {
        onIndexChange(newIndex);
      }
    };

    (window as any).carouselChangeModel = changeModel;
    
    // Инициализируем начальный индекс
    if (onIndexChange) {
      onIndexChange(activeIndexRef.current);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      delete (window as any).carouselChangeModel;
    };
  }, [items, radius, cameraDistance, backgroundColor, onIndexChange]);
  
  // Отдельный эффект для синхронизации rotationLocked без пересоздания карусели
  useEffect(() => {
    // rotationLocked обрабатывается в обработчиках событий, не требует пересоздания
  }, [rotationLocked]);

  const handleChangeModel = (direction: number) => {
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
           {isMobile ? 'Center: drag to rotate • Edges: swipe to switch' : 'Drag to rotate • Click arrows to switch'}
          </div>
          
          {!isMobile && (
            <>
              <div
                onClick={() => handleChangeModel(-1)}
                style={{
                  position: 'absolute',
                  left: '10px',
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
                  zIndex: 10,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'}
              >
                ‹
              </div>
              
              <div
                onClick={() => handleChangeModel(1)}
                style={{
                  position: 'absolute',
                  right: '10px',
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
                  zIndex: 10,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)'}
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
