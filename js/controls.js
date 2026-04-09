import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

export function setupRaycaster(camera, domElement, objects, updateUICallback) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const clickableObjects = [];

    objects.forEach(obj => {
        if (!obj) return; // 🔥 أهم سطر

        if (obj.isMesh) {
            clickableObjects.push(obj);
        }

        if (obj.children && obj.children.length > 0) {
            obj.children.forEach(child => {
                if (child && child.isMesh) {
                    clickableObjects.push(child);
                }
            });
        }

        if (obj.userData && obj.userData.info && obj.children) {
            obj.children.forEach(child => {
                if (child) clickableObjects.push(child);
            });
        }
    });

    function onClick(event) {
        mouse.x = (event.clientX / domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / domElement.clientHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(clickableObjects, true);
        
        if (intersects.length > 0) {
            let hit = intersects[0].object;
            let foundInfo = null;
            
            while (hit && !foundInfo) {
                if (hit.userData && hit.userData.info) {
                    foundInfo = hit.userData.info;
                } else {
                    hit = hit.parent;
                }
            }
            
            if (foundInfo) {
                updateUICallback(foundInfo.name, foundInfo.desc);
            } else {
                updateUICallback('فضاء سحيق', 'لا توجد بيانات محددة لهذه النقطة.');
            }
        } else {
            updateUICallback('فضاء سحيق', 'لا توجد بيانات محددة لهذه النقطة.');
        }
    }
    
    domElement.addEventListener('click', onClick);
                                 }
