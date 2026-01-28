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
  showUI?: boolean;
}

export default function ThreeCarousel({
  items,
  radius = 6,
  cameraDistance = 14,
  backgroundColor = 0x1a1a1a,
  width = '100%',
  height = '600px',
  rotationLocked = false,
  onIndexChange,
  showUI = true
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
      
      // Сохраняем начальные параметры модели
      model.userData.currentAngle = angle;
      model.userData.targetAngle = angle;
      model.userData.currentScale = index === 0 ? 0.7 : 0.5; // Первая модель больше
      model.userData.targetScale = index === 0 ? 0.7 : 0.5;
      
      // Для автоматического возврата вращения в исходное положение
      model.userData.initialRotationY = 0; // Исходное вращение по Y
      model.userData.initialRotationX = 0; // Исходное вращение по X
      model.userData.lastInteractionTime = Date.now(); // Время последнего взаимодействия
      model.userData.shouldResetAfterDelay = false; // Флаг для возврата после смены модели
      model.userData.resetStartTime = 0; // Время начала возврата
      
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
    let hasRotated = false; // Флаг: начал ли пользователь вращать модель (приоритет над свайпом)
    
    // Инерция и "ленивое" вращение модели
    let rotationVelocityY = 0; // Скорость вращения по оси Y для инерции после отпускания
    let rotationVelocityX = 0; // Скорость вращения по оси X для инерции после отпускания
    let targetRotationY = 0; // Целевое вращение по оси Y (к чему стремится модель)
    let targetRotationX = 0; // Целевое вращение по оси X (к чему стремится модель)
    let lastRotationTime = 0; // Время последнего кадра вращения
    
    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'pan-y';
    
    // Переменная для хранения последних координат (для touchend)
    let lastX = 0;
    let lastY = 0;
    
    // Функция для получения координат относительно canvas
    const getCanvasRelativeCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };
    
    // Универсальные функции для мыши и touch
    const onDragStart = (clientX: number, clientY: number) => {
      const coords = getCanvasRelativeCoords(clientX, clientY);
      const x = coords.x;
      const y = coords.y;
      
      isDragging = true;
      previousX = x;
      previousY = y;
      startX = x;
      startY = y;
      lastX = x;
      lastY = y;
      startTime = Date.now();
      totalDeltaY = 0;
      shouldPreventDefault = false;
      hasRotated = false; // Сбрасываем флаг вращения
      
      // Сбрасываем инерцию вращения при начале нового жеста
      rotationVelocityY = 0;
      rotationVelocityX = 0;
      
      // Инициализируем целевое вращение текущим вращением модели
      const activeModel = models[activeIndexRef.current];
      if (activeModel) {
        targetRotationY = activeModel.rotation.y;
        targetRotationX = activeModel.rotation.x;
      }
      
      canvas.style.cursor = 'grabbing';
      
      // Определяем зону начала жеста (для мобильных И ПК)
      const canvasWidth = canvas.clientWidth;
      const edgeZoneWidth = canvasWidth * 0.2; // 20% с каждой стороны
      
      isEdgeZone = x < edgeZoneWidth || x > canvasWidth - edgeZoneWidth;
      isCenterZone = !isEdgeZone;
      
      // Если началось в краевой зоне - потенциальный свайп
      // Если в центре - вращение
      gestureDirection = isEdgeZone ? 'horizontal' : 'rotation';
    };
    
    const onDragMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      
      const coords = getCanvasRelativeCoords(clientX, clientY);
      const x = coords.x;
      const y = coords.y;
      
      const deltaX = x - previousX;
      const deltaY = y - previousY;
      
      // Сохраняем последние координаты
      lastX = x;
      lastY = y;
      
      // ===== УНИВЕРСАЛЬНАЯ ЛОГИКА (мобила и ПК) =====
      
      // Проверяем явное вертикальное намерение для скролла (только мобильные в центре)
      if (isMobileRef.current && isCenterZone && gestureDirection === 'rotation' && !hasRotated) {
        totalDeltaY += Math.abs(deltaY);
        const totalDeltaX = Math.abs(x - startX);
        const verticalRatio = totalDeltaY / (totalDeltaX + 1);
        
        if (totalDeltaY > 150 && verticalRatio > 6.0) {
          gestureDirection = 'vertical';
          shouldPreventDefault = false;
          return;
        }
      }
      
      // Вращаем модель ТОЛЬКО если:
      // 1. Жест НЕ в краевой зоне свайпа (или уже начали вращать из центра)
      // 2. Вращение не заблокировано
      // 3. Жест определен как rotation
      const canRotate = !isEdgeZone 
        && !rotationLocked 
        && gestureDirection === 'rotation';
      
      if (canRotate) {
        const activeModel = models[activeIndexRef.current];
        if (activeModel) {
          // Обновляем целевое вращение (модель будет "тянуться" к нему с задержкой)
          const rotationDeltaY = deltaX * 0.02;
          const rotationDeltaX = deltaY * 0.02;
          
          targetRotationY += rotationDeltaY;
          targetRotationX += rotationDeltaX;
          
          // Ограничиваем вращение по оси X чтобы избежать инверсии (gimbal lock)
          // Максимум ±80° (≈1.4 радиан)
          const maxRotationX = Math.PI * 0.44; // ~80 градусов
          targetRotationX = Math.max(-maxRotationX, Math.min(maxRotationX, targetRotationX));
          
          // Сохраняем скорость вращения для инерции после отпускания
          rotationVelocityY = rotationDeltaY;
          rotationVelocityX = rotationDeltaX;
          lastRotationTime = Date.now();
          
          // Обновляем время последнего взаимодействия с моделью
          activeModel.userData.lastInteractionTime = Date.now();
          activeModel.userData.shouldResetAfterDelay = false; // Отменяем возврат если вращаем
          
          hasRotated = true; // Устанавливаем флаг - начали вращать
          
          if (isMobileRef.current) {
            shouldPreventDefault = true;
          }
        }
      }
      
      previousX = x;
      previousY = y;
    };
    
    const onDragEnd = (clientX: number, clientY: number, isTouch: boolean = false) => {
      if (!isDragging) return;
      
      // Для touch событий используем последние сохраненные координаты,
      // так как changedTouches может дать неточные значения
      let endX: number, endY: number;
      if (isTouch) {
        endX = lastX;
        endY = lastY;
      } else {
        const coords = getCanvasRelativeCoords(clientX, clientY);
        endX = coords.x;
        endY = coords.y;
      }
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;
      
      // ===== УНИВЕРСАЛЬНАЯ ЛОГИКА СВАЙПА =====
      // Свайп срабатывает если:
      // 1. Жест начался в краевой зоне свайпа (isEdgeZone)
      // 2. НЕ было вращения модели (hasRotated = false) - вращение в приоритете
      // 3. Движение было достаточно горизонтальным и длинным
      
      const isHorizontalDominant = Math.abs(deltaX) > Math.abs(deltaY) * 1.3;
      const isSignificantDistance = Math.abs(deltaX) > 30; // Минимальная дистанция для свайпа
      
      const shouldSwipe = isEdgeZone 
        && !hasRotated 
        && gestureDirection === 'horizontal' 
        && isHorizontalDominant 
        && isSignificantDistance;
      
      if (shouldSwipe && (window as any).carouselChangeModel) {
        const direction = deltaX > 0 ? -1 : 1;
        const newIndex = (activeIndexRef.current + direction + items.length) % items.length;
        (window as any).carouselChangeModel(newIndex, direction);
      }
      
      isDragging = false;
      isEdgeZone = false;
      isCenterZone = false;
      gestureDirection = 'rotation';
      shouldPreventDefault = false;
      hasRotated = false; // Сбрасываем флаг вращения
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
      onDragEnd(e.clientX, e.clientY, false);
    });
    
    canvas.addEventListener('mouseleave', (e: MouseEvent) => {
      onDragEnd(e.clientX, e.clientY, false);
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
      // Используем флаг isTouch для touchend, чтобы использовать lastX/lastY
      onDragEnd(0, 0, true);
    }, { passive: false });

    setIsLoaded(true);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Обработка вращения активной модели с инерцией и "ленивостью"
      const activeModel = models[activeIndexRef.current];
      if (activeModel) {
        if (isDragging) {
          // Во время драга: "ленивое" вращение - плавно тянется к целевому углу
          const diffY = targetRotationY - activeModel.rotation.y;
          const diffX = targetRotationX - activeModel.rotation.x;
          
          // Коэффициент "ленивости" (0.15 = медленное следование за курсором)
          activeModel.rotation.y += diffY * 0.15;
          activeModel.rotation.x += diffX * 0.15;
          
        } else if (Math.abs(rotationVelocityY) > 0.0001 || Math.abs(rotationVelocityX) > 0.0001) {
          // После отпускания: инерция с затуханием
          targetRotationY += rotationVelocityY;
          targetRotationX += rotationVelocityX;
          
          // Ограничиваем целевое вращение по оси X
          const maxRotationX = Math.PI * 0.44;
          targetRotationX = Math.max(-maxRotationX, Math.min(maxRotationX, targetRotationX));
          
          // Плавно двигаемся к целевому углу
          const diffY = targetRotationY - activeModel.rotation.y;
          const diffX = targetRotationX - activeModel.rotation.x;
          activeModel.rotation.y += diffY * 0.15;
          activeModel.rotation.x += diffX * 0.15;
          
          // Затухание инерции
          rotationVelocityY *= 0.95;
          rotationVelocityX *= 0.95;
          
          // Останавливаем инерцию когда скорость очень мала
          if (Math.abs(rotationVelocityY) < 0.0001) rotationVelocityY = 0;
          if (Math.abs(rotationVelocityX) < 0.0001) rotationVelocityX = 0;
          
        } else {
          // Проверяем автоматический возврат в исходное положение
          // Если прошло 5 секунд без взаимодействия
          const timeSinceInteraction = Date.now() - activeModel.userData.lastInteractionTime;
          const shouldAutoReset = timeSinceInteraction > 5000;
          
          if (shouldAutoReset) {
            const initialY = activeModel.userData.initialRotationY;
            const initialX = activeModel.userData.initialRotationX;
            
            // Нормализуем разницу углов для кратчайшего пути (как для карусели)
            let diffY = initialY - targetRotationY;
            let diffX = initialX - targetRotationX;
            
            // Нормализуем в диапазон [-π, π]
            while (diffY > Math.PI) diffY -= Math.PI * 2;
            while (diffY < -Math.PI) diffY += Math.PI * 2;
            while (diffX > Math.PI) diffX -= Math.PI * 2;
            while (diffX < -Math.PI) diffX += Math.PI * 2;
            
            // Плавно возвращаемся к исходному положению по кратчайшему пути
            targetRotationY += diffY * 0.02; // Медленный возврат
            targetRotationX += diffX * 0.02;
            
            const modelDiffY = targetRotationY - activeModel.rotation.y;
            const modelDiffX = targetRotationX - activeModel.rotation.x;
            activeModel.rotation.y += modelDiffY * 0.1;
            activeModel.rotation.x += modelDiffX * 0.1;
          }
        }
      }
      
      // Обработка неактивных моделей - возврат в исходное положение после смены
      models.forEach((model, index) => {
        if (index !== activeIndexRef.current && model.userData.shouldResetAfterDelay) {
          const timeSinceReset = Date.now() - model.userData.resetStartTime;
          
          // Ждем 2 секунды после смены модели
          if (timeSinceReset > 2000) {
            const initialY = model.userData.initialRotationY;
            const initialX = model.userData.initialRotationX;
            
            // Нормализуем разницу углов для кратчайшего пути
            let diffY = initialY - model.rotation.y;
            let diffX = initialX - model.rotation.x;
            
            // Нормализуем в диапазон [-π, π]
            while (diffY > Math.PI) diffY -= Math.PI * 2;
            while (diffY < -Math.PI) diffY += Math.PI * 2;
            while (diffX > Math.PI) diffX -= Math.PI * 2;
            while (diffX < -Math.PI) diffX += Math.PI * 2;
            
            // Плавно возвращаем в исходное положение по кратчайшему пути
            model.rotation.y += diffY * 0.05; // Плавный возврат
            model.rotation.x += diffX * 0.05;
            
            // Если почти вернулись - отключаем флаг
            if (Math.abs(diffY) < 0.01 && Math.abs(diffX) < 0.01) {
              model.userData.shouldResetAfterDelay = false;
              model.rotation.y = initialY;
              model.rotation.x = initialX;
            }
          }
        }
      });
      
      models.forEach((model, index) => {
        const isActive = index === activeIndexRef.current;
        
        // Плавное изменение позиции (замедлено с 0.05 до 0.03)
        let currentAngle = model.userData.currentAngle;
        let targetAngle = model.userData.targetAngle;
        let angleDiff = targetAngle - currentAngle;
        
        // Нормализуем разницу углов в диапазон [-π, π]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        model.userData.currentAngle += angleDiff * 0.03; // Замедлено
        model.position.x = Math.sin(model.userData.currentAngle) * radius;
        model.position.z = Math.cos(model.userData.currentAngle) * radius;
        
        // Плавное изменение размера (замедлено с 0.05 до 0.03)
        model.userData.targetScale = isActive ? 0.7 : 0.5;
        const scaleDiff = model.userData.targetScale - model.userData.currentScale;
        model.userData.currentScale += scaleDiff * 0.03; // Замедлено
        model.scale.setScalar(model.userData.currentScale);
        
        // Плавное изменение прозрачности (замедлено с 0.05 до 0.03)
        const targetOpacity = isActive ? 1.0 : 0.3;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                const diff = targetOpacity - mat.opacity;
                mat.opacity += diff * 0.03; // Замедлено
              });
            } else {
              const diff = targetOpacity - child.material.opacity;
              child.material.opacity += diff * 0.03; // Замедлено
            }
          }
        });
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Resize для изменения разрешения экрана
    // При изменении isMobile в StageManager изменятся radius/cameraDistance,
    // что приведет к полной перезагрузке карусели (допустимо)
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const changeModel = (newIndex: number, forceDirection?: number) => {
      // Проверяем, действительно ли индекс изменился
      if (activeIndexRef.current === newIndex) return;
      
      const oldIndex = activeIndexRef.current;
      
      // Вычисляем направление вращения
      let direction: number;
      if (forceDirection !== undefined) {
        // Если направление задано явно - используем его
        direction = forceDirection;
      } else {
        // Иначе выбираем кратчайший путь
        direction = newIndex - oldIndex;
        if (Math.abs(direction) > items.length / 2) {
          direction = direction > 0 ? direction - items.length : direction + items.length;
        }
      }
      
      // Для предыдущей активной модели устанавливаем флаг возврата
      const previousModel = models[oldIndex];
      if (previousModel) {
        previousModel.userData.shouldResetAfterDelay = true;
        previousModel.userData.resetStartTime = Date.now();
      }
      
      activeIndexRef.current = newIndex;
      
      // Инициализируем целевое вращение для новой активной модели
      const newActiveModel = models[newIndex];
      if (newActiveModel) {
        targetRotationY = newActiveModel.rotation.y;
        targetRotationX = newActiveModel.rotation.x;
        // Сбрасываем инерцию
        rotationVelocityY = 0;
        rotationVelocityX = 0;
      }
      
      const angleStep = (Math.PI * 2) / items.length;
      
      // Вращаем карусель в заданном направлении
      models.forEach((model) => {
        model.userData.targetAngle -= angleStep * direction;
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
      
    </div>
  );
}
