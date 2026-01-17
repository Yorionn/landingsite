import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';
import type { CarouselItem } from './ThreeCarousel';

/**
 * Загрузка GLB/GLTF модели для карусели
 */
export async function loadGLBModel(url: string): Promise<CarouselItem> {
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        
        // Находим первый mesh в модели
        let foundMesh: THREE.Mesh | undefined;
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && !foundMesh) {
            foundMesh = child;
          }
        });
        
        if (!foundMesh) {
          reject(new Error('No mesh found in the model'));
          return;
        }
        
        // Масштабируем и центрируем модель
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 0.2 / maxDim;
        
        scene.scale.multiplyScalar(scale);
        scene.position.sub(center.multiplyScalar(scale));
        
        // Возвращаем клонированную геометрию и материал
        resolve({
          geometry: foundMesh.geometry.clone(),
          material: foundMesh.material
        });
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        reject(error);
      }
    );
  });
}

/**
 * Загрузить массив РАЗНЫХ моделей из разных путей
 * Каждая модель будет независимой
 */
export async function loadMultipleModels(modelPaths: string[]): Promise<CarouselItem[]> {
  const loadPromises = modelPaths.map(path => loadGLBModel(path));
  return Promise.all(loadPromises);
}

