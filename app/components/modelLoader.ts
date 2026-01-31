import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';
import type { CarouselItem } from './ThreeCarousel';

/**
 * Загрузка GLB/GLTF модели для карусели
 * @param url - Путь к GLB/GLTF файлу
 * @param targetSize - Желаемый размер модели (по умолчанию 2.0)
 */
export async function loadGLBModel(
  url: string,
  targetSize: number = 2.0,
  yOffset: number = 0
): Promise<CarouselItem> {
  const loader = new GLTFLoader();

  // Если в модели есть внешние текстуры/ресурсы с относительными путями,
  // GLTFLoader должен знать базовую папку.
  // (testmug.glb может быть "самодостаточным", а V1_2/V2_2 — ссылаться на внешние файлы)
  const basePath = url.includes('/') ? url.slice(0, url.lastIndexOf('/') + 1) : '';
  loader.setResourcePath(basePath);
  loader.setPath('');
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        
        try {
          const json = (gltf as any).parser?.json;
          const used = json?.extensionsUsed ?? [];
          const required = json?.extensionsRequired ?? [];

          console.groupCollapsed(`[GLB] ${url}`);
          console.log('extensionsUsed:', used);
          console.log('extensionsRequired:', required);

          const textureInfo: Array<{ mesh: string; material: string; slot: string; imageSrc?: string }> = [];
          scene.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat: any) => {
              if (!mat) return;
              const slots = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'];
              slots.forEach((slot) => {
                const tex = mat[slot];
                if (!tex) return;
                const imageSrc = tex?.image?.src;
                textureInfo.push({
                  mesh: child.name || '(unnamed-mesh)',
                  material: mat.name || mat.type || '(material)',
                  slot,
                  imageSrc
                });
              });
            });
          });

          console.log('texturesFound:', textureInfo);
          console.groupEnd();
        } catch (e) {
          console.warn('GLB debug failed:', e);
        }
        
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
          geometry.translate(
            -center.x * scale,
            -center.y * scale + yOffset,
            -center.z * scale
          );
        };  

        const cloneMaterialDeep = (material: THREE.Material) => {
          const mat: any = material.clone();
          // Клонируем текстуры, чтобы избежать шаринга одного WebGLTexture между разными слотами/материалами
          // (это может приводить к ошибкам WebGL вида "glTexStorage2D: Texture is immutable")
          const textureSlots = [
            'map',
            'normalMap',
            'roughnessMap',
            'metalnessMap',
            'aoMap',
            'emissiveMap',
            'alphaMap',
            'bumpMap',
            'displacementMap',
            'lightMap',
            'envMap'
          ];
          textureSlots.forEach((slot) => {
            const tex: THREE.Texture | undefined = mat[slot];
            if (tex) {
              mat[slot] = tex.clone();
              mat[slot].needsUpdate = true;
            }
          });
          return mat as THREE.Material;
        };
        
        if (meshes.length === 1) {
          const mesh = meshes[0];
          const geometry = mesh.geometry.clone();
          applyTransformations(geometry);
          
          resolve({
            name: url,
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
          
          // Важно: не шарим материалы/текстуры между копиями
          clonedMesh.material = Array.isArray(mesh.material)
            ? mesh.material.map(m => cloneMaterialDeep(m))
            : cloneMaterialDeep(mesh.material);
          group.add(clonedMesh);
        });
        
        resolve({
          name: url,
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
  targetSize: number = 2.0,
  getTargetSizeForPath?: (path: string) => number,
  getYOffsetForPath?: (path: string) => number
): Promise<CarouselItem[]> {
  const loadPromises = modelPaths.map((path) => {
    const size = getTargetSizeForPath ? getTargetSizeForPath(path) : targetSize;
    const yOffset = getYOffsetForPath ? getYOffsetForPath(path) : 0;
    return loadGLBModel(path, size, yOffset);
  });
  return Promise.all(loadPromises);
}

