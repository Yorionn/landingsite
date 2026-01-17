import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';
import type { CarouselItem } from './ThreeCarousel';

/**
 * Загрузка GLB/GLTF модели для карусели
 * @param url - Путь к GLB/GLTF файлу
 * @param targetSize - Желаемый размер модели (по умолчанию 2.0)
 */
export async function loadGLBModel(url: string, targetSize: number = 2.0): Promise<CarouselItem> {
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        
        const meshes: THREE.Mesh[] = [];
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshes.push(child);
          }
        });
        
        if (meshes.length === 0) {
          reject(new Error('No mesh found in the model'));
          return;
        }
        
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = targetSize / maxDim;
        
        const applyTransformations = (geometry: THREE.BufferGeometry) => {
          geometry.scale(scale, scale, scale);
          geometry.translate(-center.x * scale, -center.y * scale, -center.z * scale);
        };
        
        if (meshes.length === 1) {
          const mesh = meshes[0];
          const geometry = mesh.geometry.clone();
          applyTransformations(geometry);
          
          resolve({
            geometry: geometry,
            material: mesh.material
          });
          return;
        }
        
        // Несколько мешей - создаем группу
        const group = new THREE.Group();
        
        meshes.forEach(mesh => {
          const clonedMesh = mesh.clone();
          const geometry = clonedMesh.geometry.clone();
          applyTransformations(geometry);
          clonedMesh.geometry = geometry;
          group.add(clonedMesh);
        });
        
        resolve({
          geometry: new THREE.BoxGeometry(1, 1, 1),
          material: new THREE.MeshStandardMaterial(),
          group: group
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
 * @param modelPaths - Массив путей к моделям
 * @param targetSize - Желаемый размер моделей (по умолчанию 2.0)
 */
export async function loadMultipleModels(
  modelPaths: string[], 
  targetSize: number = 2.0
): Promise<CarouselItem[]> {
  const loadPromises = modelPaths.map(path => loadGLBModel(path, targetSize));
  return Promise.all(loadPromises);
}

