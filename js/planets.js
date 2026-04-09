import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

class Planet {
    constructor(radius, color, distance, speed, hasRing = false, ringColor = 0xaaaaaa) {
        this.radius = radius;
        this.distance = distance;
        this.speed = speed;
        this.angle = Math.random() * Math.PI * 2;
        
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            new THREE.MeshStandardMaterial({ 
                color: color, 
                roughness: 0.5, 
                metalness: 0.1,
                emissive: new THREE.Color(color).multiplyScalar(0.1)
            })
        );
        
        if (hasRing) {
            const ringGeo = new THREE.TorusGeometry(radius * 1.8, radius * 0.4, 16, 100);
            const ringMat = new THREE.MeshStandardMaterial({ 
                color: ringColor, 
                transparent: true, 
                opacity: 0.7, 
                side: THREE.DoubleSide 
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.z = 0.3;
            this.mesh.add(ring);
        }

        // إضافة غيوم/غلاف جوي (Sphere شفاف أكبر قليلاً)
        const atmosGeo = new THREE.SphereGeometry(radius * 1.05, 32, 32);
        const atmosMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const atmos = new THREE.Mesh(atmosGeo, atmosMat);
        this.mesh.add(atmos);
        
        this.updatePosition();
    }
    
    updatePosition() {
        this.mesh.position.x = Math.cos(this.angle) * this.distance;
        this.mesh.position.z = Math.sin(this.angle) * this.distance;
    }
    
    update() {
        this.angle += this.speed;
        this.updatePosition();
        this.mesh.rotation.y += 0.01;
    }
}

export function createSolarSystem(scene) {
    const planets = [];
    
    // النجم المركزي
    const sunGeo = new THREE.SphereGeometry(3.5, 64, 64);
    const sunMat = new THREE.MeshStandardMaterial({
        color: 0xffaa33,
        emissive: new THREE.Color(0xff5500),
        emissiveIntensity: 2.0,
        roughness: 0.4
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);
    
    // إضاءة نقطية في مركز الشمس
    const sunLight = new THREE.PointLight(0xffaa66, 2, 0, 0);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    // إضاءة محيطية
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 5);
    scene.add(dirLight);

    // تعريف الكواكب (نصف قطر، لون، مسافة، سرعة، حلقة؟)
    const specs = [
        { r: 0.8, c: 0xaaaaaa, d: 6, s: 0.015 },  // عطارد
        { r: 1.0, c: 0xe6b800, d: 9, s: 0.01 },   // زهرة
        { r: 1.1, c: 0x2277ff, d: 12, s: 0.008 }, // أرض
        { r: 0.9, c: 0xff4422, d: 15, s: 0.007 }, // مريخ
        { r: 2.2, c: 0xffaa66, d: 20, s: 0.005 }, // مشتري
        { r: 1.9, c: 0xeeddbb, d: 26, s: 0.004, ring: true, ringCol: 0xc2b280 }, // زحل
        { r: 1.6, c: 0x88ccff, d: 32, s: 0.003 }, // أورانوس
        { r: 1.6, c: 0x3366cc, d: 38, s: 0.002 }  // نبتون
    ];
    
    specs.forEach(spec => {
        const planet = new Planet(spec.r, spec.c, spec.d, spec.s, spec.ring || false, spec.ringCol);
        scene.add(planet.mesh);
        planets.push(planet);
        
        // إضافة مسار مداري (خط دائري)
        const orbitPoints = [];
        const radius = spec.d;
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            orbitPoints.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0x446688 });
        const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
        scene.add(orbitLine);
    });

    // معلومات للوحة التفاعل (سيتم تمريرها للـ Raycaster)
    planets[2].mesh.userData.info = { name: 'الأرض', desc: 'كوكب أزرق. مؤهل للحياة سابقاً. الآن أرشيف تاريخي.' };
    planets[5].mesh.userData.info = { name: 'زحل', desc: 'عملاق غازي بحلقات جليدية. مصدر رئيسي لمواد البناء في 2049.' };
    planets[0].mesh.userData.info = { name: 'كوكب صخري', desc: 'سطح منصهر. غير صالح للاستيطان.' };
    
    // ربط دالة التحديث
    return planets;
    }
