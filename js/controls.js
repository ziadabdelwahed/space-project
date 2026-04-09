import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

export function setupRaycaster(camera, domElement, objects, updateUICallback) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // تجميع كل الأجسام القابلة للنقر (الكواكب والثقب الأسود)
    const clickableObjects = [];
    objects.forEach(obj => {
        if (obj.isMesh) {
            clickableObjects.push(obj);
        } else if (obj.children) {
            obj.children.forEach(child => {
                if (child.isMesh) clickableObjects.push(child);
            });
        }
        // إضافة المجموعة نفسها للثقب الأسود
        if (obj.userData.info) {
            obj.children.forEach(child => clickableObjects.push(child));
        }
    });

    function onClick(event) {
        // حساب إحداثيات الماوس المعيارية
     mouse.x = (event.clientX / domElement.clientWidth) * 2 - 1;
mouse.y = -(event.clientY / domElement.clientHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(clickableObjects, true); // true للبحث في الأعماق
        
        if (intersects.length > 0) {
            // البحث عن أقرب كائن له بيانات معلومات
            let hit = intersects[0].object;
            let foundInfo = null;
            
            // الصعود في شجرة العقد للعثور على userData.info
            while (hit && !foundInfo) {
                if (hit.userData && hit.userData.info) {
                    foundInfo = hit.userData.info;
                } else if (hit.parent && hit.parent.userData && hit.parent.userData.info) {
                    foundInfo = hit.parent.userData.info;
                } else {
                    hit = hit.parent;
                }
            }
            
            if (foundInfo) {
                updateUICallback(foundInfo.name, foundInfo.desc);
            } else {
                // في حالة النقر على نجم أو حلقة بدون معلومات
                updateUICallback('فضاء سحيق', 'لا توجد بيانات محددة لهذه النقطة.');
            }
        } else {
            updateUICallback('فضاء سحيق', 'لا توجد بيانات محددة لهذه النقطة.');
        }
    }
    
    domElement.addEventListener('click', onClick);
}
