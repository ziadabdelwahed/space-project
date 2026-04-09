import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

export function createBlackHole(scene) {
    const group = new THREE.Group();
    group.position.set(-15, 0, 0);
    
    // --- أفق الحدث (Event Horizon) ---
    const horizonGeo = new THREE.SphereGeometry(2.8, 64, 64);
    const horizonMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.1,
        emissive: new THREE.Color(0x110022),
        emissiveIntensity: 0.8
    });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    group.add(horizon);

    // --- قرص التراكم (Accretion Disk) - نظام جسيمات حلزوني ---
    const diskParticlesGeo = new THREE.BufferGeometry();
    const particleCount = 15000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        // توزيع قطبي: نصف قطر بين 4.5 و 9.0
        const radius = 4.5 + Math.random() * 4.5;
        const angle = Math.random() * Math.PI * 2;
        // إضافة تشتت عمودي خفيف (سماكة القرص)
        const yOffset = (Math.random() - 0.5) * 0.8 * (radius / 6.0);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        positions[i*3] = x;
        positions[i*3+1] = yOffset;
        positions[i*3+2] = z;
        
        // تدرج لوني من الأزرق/الأبيض في الداخل إلى الأحمر في الخارج
        const mixFactor = (radius - 4.5) / 4.5;
        const color = new THREE.Color().lerpColors(
            new THREE.Color(0x88ccff), 
            new THREE.Color(0xff5500), 
            mixFactor
        );
        
        colors[i*3] = color.r;
        colors[i*3+1] = color.g;
        colors[i*3+2] = color.b;
    }
    
    diskParticlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    diskParticlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const diskMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: true,
        transparent: true
    });
    
    const disk = new THREE.Points(diskParticlesGeo, diskMaterial);
    group.add(disk);

    // --- حلقة الفوتون (Photon Ring) - تأثير شفاف ---
    const ringGeo = new THREE.TorusGeometry(3.5, 0.08, 32, 200);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffaa33,
        emissive: new THREE.Color(0xff5500),
        emissiveIntensity: 2.5,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    
    const ring2 = ring.clone();
    ring2.material = ringMat.clone();
    ring2.material.emissiveIntensity = 1.5;
    ring2.material.opacity = 0.4;
    ring2.scale.setScalar(1.3);
    ring2.rotation.z = 0.3;
    group.add(ring2);

    // --- تأثير عدسة الجاذبية (تشويه بصري بسيط عبر Shader على كرة خارجية) ---
    // محاكاة للتشوه: كرة شفافة ذات معامل انكسار عالي
    const lensGeo = new THREE.SphereGeometry(3.0, 48, 48);
    const lensMat = new THREE.MeshPhongMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.15,
        emissive: new THREE.Color(0x331144),
        side: THREE.BackSide // عرض الداخل فقط لمحاكاة الانحناء
    });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    group.add(lens);

    scene.add(group);

    // --- منطق الحركة (Animation Logic) ---
    group.userData.update = () => {
        // دوران القرص بسرعة عالية
        disk.rotation.y += 0.015;
        ring.rotation.z += 0.005;
        ring2.rotation.x += 0.002;
        // تمايل خفيف للمجموعة بأكملها
        group.rotation.y += 0.002;
    };

    // معلومات للوحة التفاعل
    group.userData.info = {
        name: 'Cygnus X-1 Rift',
        desc: 'ثقب أسود نجمي. كتلة: 15 شمس. أفق الحدث: 45 كم. قرص التراكم تصل حرارته إلى ملايين الدرجات.'
    };

    return group;
      }
