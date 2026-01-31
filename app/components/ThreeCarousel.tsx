'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

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
  /** Масштаб активной модели (по умолчанию 0.7) */
  activeScale?: number;
  /** Масштаб неактивных моделей (по умолчанию 0.5) */
  /** Изначальный поворот всех моделей по оси X (в радианах) */
  initialRotationX?: number;
  /** Изначальный поворот всех моделей по оси Y (в радианах) */
  initialRotationY?: number;
  /** Автовозврат активной модели в исходный поворот по бездействию */
  autoResetOnIdle?: boolean;
  /** Задержка (мс) перед автовозвратом активной модели */
  autoResetDelayMs?: number;
  inactiveScale?: number;
  rotationLocked?: boolean;
  onIndexChange?: (index: number) => void;
  showUI?: boolean;
}

export default function ThreeCarousel({
  items,
  radius = 10,
  cameraDistance = 14,
  backgroundColor = 0x1a1a1a,
  width = '100%',
  height = '600px',
  activeScale = 1.3,
  inactiveScale = 1.2,
  initialRotationX = 0,
  initialRotationY = Math.PI * 0.75,
  autoResetOnIdle = true,
  autoResetDelayMs = 5000,
  rotationLocked = false,
  onIndexChange,
  showUI = true
}: ThreeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftSwipeZoneRef = useRef<HTMLDivElement>(null);
  const rightSwipeZoneRef = useRef<HTMLDivElement>(null);
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
    // Корректный рендер PBR/текстур из glTF (иначе материалы могут выглядеть "без текстур")
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    // Совместимость с разными версиями three: свойство могло переехать/быть удалено из типов
    (renderer as any).physicallyCorrectLights = true;

    // Environment (нужно для "блеска"/отражений PBR материалов)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
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

      const isPlaceholder = (item.name ?? '').includes('plh');

      // Затемняем плейсхолдеры (без изменения прозрачности)
      if (isPlaceholder) {
        const makeGrayscale = (material: THREE.Material) => {
          const mat: any = material.clone();
          mat.onBeforeCompile = (shader: any) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <dithering_fragment>',
              [
                '  // placeholder grayscale',
                '  float luma = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));',
                '  gl_FragColor.rgb = vec3(luma);',
                '  #include <dithering_fragment>'
              ].join('\n')
            );
          };
          mat.needsUpdate = true;
          return mat as THREE.Material;
        };
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.material = Array.isArray(child.material)
            ? child.material.map((m) => makeGrayscale(m))
            : makeGrayscale(child.material);
        });
      }
      
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
      model.userData.currentScale = index === 0 ? activeScale : inactiveScale; // Первая модель больше
      model.userData.targetScale = index === 0 ? activeScale : inactiveScale;
      
      // Изначальный поворот модели (и точка возврата для автосброса)
      model.rotation.x = initialRotationX;
      model.rotation.y = initialRotationY;

      // Для автоматического возврата вращения в исходное положение
      model.userData.initialRotationY = initialRotationY; // Исходное вращение по Y
      model.userData.initialRotationX = initialRotationX; // Исходное вращение по X
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

    // Если пользователь ещё не делал drag, targetRotationX/Y остаются 0.
    // Это может вызвать "дёргание" к (0,0) перед автосбросом в initialRotation.
    const initialActiveModel = models[activeIndexRef.current];
    if (initialActiveModel) {
      targetRotationY = initialActiveModel.rotation.y;
      targetRotationX = initialActiveModel.rotation.x;
    }
    
    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
   
    // Разрешаем вертикальный пан и манипуляции браузера (включая pull-to-refresh)
    canvas.style.touchAction = 'pan-y manipulation';
    // Важно: канвас добавляется в DOM ПОСЛЕ React-элементов контейнера,
    // поэтому фиксируем слои через z-index, чтобы "зоны свайпа" были сверху.
    // НЕ делаем canvas absolute, чтобы он не влиял на расчёт размеров контейнера.
    canvas.style.position = 'relative';
    canvas.style.zIndex = '0';

    const swipeZones = [leftSwipeZoneRef.current, rightSwipeZoneRef.current].filter(Boolean) as HTMLDivElement[];

    const onZoneTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onDragStart(e.touches[0].clientX, e.touches[0].clientY);
        
        // В боковых зонах приоритет — свайп карусели: отключаем pull-to-refresh
        // и сразу переводим жест в режим horizontal.
        allowPullToRefresh = false;
        gestureDirection = 'horizontal';

        // Блокируем системные жесты.
        e.preventDefault();
      }
    };

    const onZoneTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
        // Если уже определили горизонтальный жест — не даём странице скроллиться.
        if (gestureDirection === 'horizontal') {
          e.preventDefault();
        }
      }
    };

    const onZoneTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY, false);
      } else {
        onDragEnd(0, 0, true);
      }
    };

    swipeZones.forEach((zone) => {
      zone.addEventListener('touchstart', onZoneTouchStart, { passive: false });
      zone.addEventListener('touchmove', onZoneTouchMove, { passive: false });
      zone.addEventListener('touchend', onZoneTouchEnd, { passive: false });
    });
    
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
    
    // Переменная для отслеживания возможности pull-to-refresh
    let allowPullToRefresh = false;
    
    // Универсальные функции для мыши и touch
    const onDragStart = (clientX: number, clientY: number) => {
      const coords = getCanvasRelativeCoords(clientX, clientY);
      const x = coords.x;
      const y = coords.y;
      // По умолчанию считаем, что вращение НЕ идёт (станет true, когда реально начнём canRotate)
      (window as any).carouselIsRotating = false;
      
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
      
      // Проверяем возможность pull-to-refresh (только на мобильных)
      // Разрешаем, если страница находится в самом верху
      if (isMobileRef.current) {
        const isAtTop = window.scrollY === 0 || window.pageYOffset === 0;
        allowPullToRefresh = isAtTop;
      } else {
        allowPullToRefresh = false;
      }
      
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
      
      // В edge-зонах pull-to-refresh и вертикальные эвристики мешают распознаванию свайпа
      if (isEdgeZone) {
        allowPullToRefresh = false;
      }
      
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
      
      // ПРИОРИТЕТ: Разрешаем pull-to-refresh на мобильных
      // Если пользователь тянет вниз от верха страницы (deltaY > 0 = движение вниз по экрану)
      if (isMobileRef.current && allowPullToRefresh && !hasRotated) {
        const pullDownDistance = y - startY;
        // Если движение вниз больше 10px - это явное намерение обновить страницу
        if (pullDownDistance > 10) {
          // Не блокируем событие, разрешаем браузеру обработать pull-to-refresh
          shouldPreventDefault = false;
          gestureDirection = 'vertical';
          return;
        }
      }
      
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
      
      
        // Если в центре начали явный горизонтальный жест — считаем это свайпом карусели
        // (иначе на мобильных часто "не попадаешь" в edge-зону 20%)
        const horizontalDominant = totalDeltaX > 30 && totalDeltaX > totalDeltaY * 1.3;
        if (horizontalDominant) {
          gestureDirection = 'horizontal';
          shouldPreventDefault = true;
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
          (window as any).carouselIsRotating = true;
          // Отключаем pull-to-refresh если начали вращать модель
          allowPullToRefresh = false;
          
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
      const minSwipeDistance = isMobileRef.current ? 20 : 30; // На мобилках короче свайп
      const isSignificantDistance = Math.abs(deltaX) > minSwipeDistance;
      
      const shouldSwipe = (isEdgeZone || isMobileRef.current) 
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
      (window as any).carouselIsRotating = false;
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
        // Для свайпа (edge-зоны) на мобильных сразу блокируем системные жесты браузера
        // (например back/forward swipe) и возможный скролл.
        if (isMobileRef.current && isEdgeZone) {
          e.preventDefault();
        }
      }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
        // Блокируем событие если:
        // 1) началось вращение модели (shouldPreventDefault = true)
        // 2) ИЛИ это горизонтальный свайп в edge-зоне
        // При этом не мешаем pull-to-refresh и явному вертикальному скроллу.
        const isSwipeGesture = gestureDirection === 'horizontal' && isEdgeZone;
        if ((shouldPreventDefault || isSwipeGesture) && gestureDirection !== 'vertical' && !allowPullToRefresh) {
          e.preventDefault();
        }
      }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e: TouchEvent) => {
      // На быстрых свайпах touchmove может не успеть отработать,
      // поэтому для стабильности берём координаты из changedTouches.
      if (e.changedTouches.length > 0) {
        onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY, false);
      } else {
        onDragEnd(0, 0, true);
      }
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
          const shouldAutoReset = autoResetOnIdle && timeSinceInteraction > autoResetDelayMs;
          
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
        model.userData.targetScale = isActive ? activeScale : inactiveScale;
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
      swipeZones.forEach((zone) => {
        zone.removeEventListener('touchstart', onZoneTouchStart as any);
        zone.removeEventListener('touchmove', onZoneTouchMove as any);
        zone.removeEventListener('touchend', onZoneTouchEnd as any);
      });
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      pmremGenerator.dispose();
      envTexture.dispose();
      (window as any).carouselIsRotating = false;
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
      {/* Зоны свайпа поверх канваса (стабильнее на мобильных) */}
      <div
        ref={leftSwipeZoneRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '18%',
          zIndex: 2,
          pointerEvents: isMobile ? 'auto' : 'none',
          touchAction: 'pan-y'
        }}
      />
      <div
        ref={rightSwipeZoneRef}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '18%',
          zIndex: 2,
          pointerEvents: isMobile ? 'auto' : 'none',
          touchAction: 'pan-y'
        }}
      />  
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
