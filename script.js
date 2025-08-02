// 导入BellaAI核心模块
import { BellaAI } from './core.js';
import { ChatInterface } from './chatInterface.js';
import { AdvancedFeatures } from './advancedFeatures.js';

// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Global variables
let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initAnimations();
    initNavigation();
    initSmoothScrolling();
    initParallax();
    initContactForm();
});

// Three.js Setup for Hero Background
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create particle system
    createParticleSystem();

    // Create floating geometries
    createFloatingGeometries();

    // Position camera
    camera.position.z = 5;

    // Mouse move event
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Start animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function createParticleSystem() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Positions
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;

        // Colors (gradient from blue to purple)
        const color = new THREE.Color();
        color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createFloatingGeometries() {
    const geometries = [
        new THREE.TetrahedronGeometry(0.3),
        new THREE.OctahedronGeometry(0.3),
        new THREE.IcosahedronGeometry(0.3)
    ];

    const material = new THREE.MeshBasicMaterial({
        color: 0x667eea,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    for (let i = 0; i < 5; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.x = (Math.random() - 0.5) * 10;
        mesh.position.y = (Math.random() - 0.5) * 10;
        mesh.position.z = (Math.random() - 0.5) * 5;
        
        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;
        
        // Store original position for animation
        mesh.userData = {
            originalX: mesh.position.x,
            originalY: mesh.position.y,
            originalZ: mesh.position.z,
            floatSpeed: 0.01 + Math.random() * 0.02
        };
        
        scene.add(mesh);
    }
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate particles
    if (particles) {
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;
    }

    // Animate floating geometries
    scene.children.forEach(child => {
        if (child.userData && child.userData.floatSpeed) {
            child.rotation.x += child.userData.floatSpeed;
            child.rotation.y += child.userData.floatSpeed * 0.5;
            
            // Floating motion
            child.position.y = child.userData.originalY + Math.sin(Date.now() * 0.001 * child.userData.floatSpeed * 50) * 0.5;
        }
    });

    // Mouse interaction
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// GSAP Animations
function initAnimations() {
    // Hero section animations
    gsap.timeline()
        .from('.hero-title', { 
            duration: 1.2, 
            y: 100, 
            opacity: 0, 
            ease: "power3.out" 
        })
        .from('.hero-subtitle', { 
            duration: 1, 
            y: 50, 
            opacity: 0, 
            ease: "power3.out" 
        }, "-=0.8")
        .from('.hero-description', { 
            duration: 1, 
            y: 30, 
            opacity: 0, 
            ease: "power3.out" 
        }, "-=0.6")
        .from('.hero-buttons .btn', { 
            duration: 0.8, 
            y: 30, 
            opacity: 0, 
            stagger: 0.2, 
            ease: "power3.out" 
        }, "-=0.4")
        .from('.profile-image', { 
            duration: 1.5, 
            scale: 0, 
            rotation: 180, 
            ease: "elastic.out(1, 0.5)" 
        }, "-=1");

    // Navbar animation
    gsap.from('.navbar', {
        duration: 1,
        y: -100,
        opacity: 0,
        ease: "power3.out",
        delay: 0.5
    });

    // Section animations with ScrollTrigger
    gsap.utils.toArray('section').forEach((section, i) => {
        if (section.id === 'home') return;

        ScrollTrigger.create({
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            onEnter: () => animateSection(section),
        });
    });

    // Stats counter animation
    ScrollTrigger.create({
        trigger: '.stats-grid',
        start: "top 80%",
        onEnter: () => animateCounters()
    });

    // Cards animations
    gsap.utils.toArray('.cert-card, .project-card, .stat-card').forEach(card => {
        gsap.set(card, { y: 50, opacity: 0 });
        
        ScrollTrigger.create({
            trigger: card,
            start: "top 90%",
            onEnter: () => {
                gsap.to(card, {
                    duration: 0.8,
                    y: 0,
                    opacity: 1,
                    ease: "power3.out"
                });
            }
        });
    });

    // Parallax effect for sections
    gsap.utils.toArray('.about, .certifications, .projects, .contact').forEach(section => {
        gsap.to(section, {
            backgroundPosition: "50% 100%",
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
}

function animateSection(section) {
    const title = section.querySelector('.section-title');
    const content = section.querySelectorAll('.about-content, .cert-categories, .projects-grid, .contact-content');

    if (title) {
        gsap.from(title, {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: "power3.out"
        });
    }

    if (content.length > 0) {
        gsap.from(content, {
            duration: 1.2,
            y: 30,
            opacity: 0,
            stagger: 0.2,
            ease: "power3.out",
            delay: 0.2
        });
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const isPlus = counter.textContent.includes('+');
        
        gsap.to(counter, {
            duration: 2,
            textContent: target,
            roundProps: "textContent",
            ease: "power2.out",
            onUpdate: function() {
                counter.textContent = Math.round(this.targets()[0].textContent) + (isPlus ? '+' : '');
            }
        });
    });
}

// Navigation
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Active navigation link
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.9)';
        }
    });
}

// Smooth scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: {
                        y: targetElement,
                        offsetY: 80
                    },
                    ease: "power3.inOut"
                });
            }
        });
    });
}

// Parallax effects
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const heroBackground = document.querySelector('.hero-bg');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Contact form
function initContactForm() {
    const form = document.querySelector('.contact-form form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Animate button
            const button = form.querySelector('.btn-primary');
            const originalText = button.textContent;
            
            button.textContent = 'Sending...';
            button.style.transform = 'scale(0.95)';
            
            // Simulate sending (replace with actual form submission)
            setTimeout(() => {
                button.textContent = 'Message Sent!';
                button.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    button.style.transform = 'scale(1)';
                    form.reset();
                }, 2000);
            }, 1500);
        });
    }
}

// Add hover effects to cards
document.addEventListener('DOMContentLoaded', () => {
    // Project cards hover effect
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                duration: 0.3,
                y: -10,
                scale: 1.02,
                boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                y: 0,
                scale: 1,
                boxShadow: "0 10px 30px rgba(102, 126, 234, 0.1)",
                ease: "power2.out"
            });
        });
    });

    // Skill category hover effects
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach(category => {
        category.addEventListener('mouseenter', () => {
            gsap.to(category, {
                duration: 0.3,
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                ease: "power2.out"
            });
        });
        
        category.addEventListener('mouseleave', () => {
            gsap.to(category, {
                duration: 0.3,
                scale: 1,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                ease: "power2.out"
            });
        });
    });
});

// Loading animation
window.addEventListener('load', () => {
    const body = document.body;
    body.style.overflow = 'hidden';
    
    setTimeout(() => {
        body.style.overflow = 'auto';
        
        // Trigger initial animations
        gsap.from('body', {
            duration: 0.8,
            opacity: 0,
            ease: "power2.out"
        });
    }, 500);
});

// Add some interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Add tilt effect to hero image
    const heroImage = document.querySelector('.profile-image');
    if (heroImage) {
        heroImage.addEventListener('mousemove', (e) => {
            const rect = heroImage.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const tiltX = (y / rect.height) * 10;
            const tiltY = (x / rect.width) * -10;
            
            gsap.to(heroImage, {
                duration: 0.3,
                rotationX: tiltX,
                rotationY: tiltY,
                transformPerspective: 1000,
                ease: "power2.out"
            });
        });
        
        heroImage.addEventListener('mouseleave', () => {
            gsap.to(heroImage, {
                duration: 0.5,
                rotationX: 0,
                rotationY: 0,
                ease: "power2.out"
            });
        });
    }
    
    // Add floating animation to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach((link, index) => {
        gsap.to(link, {
            duration: 2 + index * 0.1,
            y: -5,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut",
            delay: index * 0.2
        });
    });
});

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        // Trigger special animation
        const allCards = document.querySelectorAll('.project-card, .cert-card');
        allCards.forEach((card, index) => {
            gsap.to(card, {
                duration: 0.5,
                rotation: 360,
                scale: 1.1,
                delay: index * 0.1,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(card, {
                        duration: 0.3,
                        rotation: 0,
                        scale: 1,
                        ease: "power2.out"
                    });
                }
            });
        });
        
        konamiCode = [];
    }
});