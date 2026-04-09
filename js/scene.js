import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

export function createGalaxyBackground(scene) {
    // 1. حقل نجوم بعيد (Particle System)
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 6000;
    const posArray = new Float32Array(starsCount * 3);
    const colorArray = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
        // توزيع كروي بقطر 500 وحدة
        const r = 400 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        posArray[i] = Math.sin(phi) * Math.cos(theta) * r;
        posArray[i+1] = Math.sin(phi) * Math.sin(theta) * r;
        posArray[i+2] = Math.cos(phi) * r;
        
        // تدرج لوني: أبيض، أزرق فاتح، أحمر خافت
        const color = new THREE.Color();
        if (Math.random() > 0.7) {
            color.setHSL(0.6, 0.9, 0.7); // أزرق
        } else if (Math.random() > 0.9) {
            color.setHSL(0.05, 0.9, 0.7); // أحمر
        } else {
            color.setHSL(0, 0, 0.9); // أبيض
        }
        colorArray[i] = color.r;
        colorArray[i+1] = color.g;
        colorArray[i+2] = color.b;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.35,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // 2. سحب غازية ملونة (Nebula Planes) - استخدام مستوى شفاف مع نسيج دائري
    const createNebulaPlane = (color, size, pos, rot) => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, `rgba(${color.r*255},${color.g*255},${color.b*255},0.8)`);
        gradient.addColorStop(0.5, `rgba(${color.r*255},${color.g*255},${color.b*255},0.2)`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture, 
            blending: THREE.AdditiveBlending, 
            depthTest: true,
            transparent: true 
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(pos.x, pos.y, pos.z);
        sprite.scale.set(size, size, 1);
        sprite.rotation.z = rot;
        scene.add(sprite);
    };

    // إضافة سدم متعددة حول المشهد
    createNebulaPlane(new THREE.Color(0.2, 0.0, 0.4), 80, new THREE.Vector3(-30, 10, -60), 0.3);
    createNebulaPlane(new THREE.Color(0.0, 0.3, 0.5), 100, new THREE.Vector3(40, -20, -80), -0.7);
    createNebulaPlane(new THREE.Color(0.5, 0.1, 0.2), 70, new THREE.Vector3(20, 30, 50), 1.2);
          }
