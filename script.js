// functions for project generations
function getTagClass(tag) {
    const t = tag.toLowerCase();
    if (t.includes('programmer') || t.includes('developer') || t.includes('co-developer')) return 'tag-prog';
    if (t.includes('manager')) return 'tag-pm';
    if (t.includes('artist') || t.includes('pixel')) return 'tag-art';
    if (t.includes('design') || t.includes('ux')) return 'tag-design';
    if (t.includes('web') || t.includes('backend')) return 'tag-web';
    if (t.includes('java')) return 'tag-java';
    if (t.includes('python') || t.includes('data')) return 'tag-python';
    if (t.includes('market')) return 'tag-market';
    if (t.includes('actor')) return 'tag-actor';
    if (t.includes('writing') || t.includes('writer')) return 'tag-writing';
    if (t.includes('vr')) return 'tag-art';
    return 'tag-prog'; 
}

function createProjectCard(project) {
    const tagsHtml = project.tags.map(tag => `<span class="${getTagClass(tag)}">${tag}</span>`).join('');
    const dataTags = project.tags.join(',');
    const itchAttribute = project.itchUrl ? `data-itch-url="${project.itchUrl}"` : '';

    return `
    <div class="project-card" 
        data-category="${project.category}"
        data-title="${project.title}"
        data-media="${project.mediaSource}"
        data-description="${project.description}"
        data-tags="${dataTags}"
        data-details-page="${project.detailsPage}"
        ${itchAttribute}>
        <video disablePictureInPicture muted loop playsinline poster="${project.poster}" src="${project.mediaSource}"></video>
        <h3>${project.title}</h3>
        <div class="project-tags">${tagsHtml}</div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {

    initParticles();
    initDraggableWindows();
    initThemeToggle();
    initCarousel(); 

    const gridContainer = document.getElementById('project-grid-container');
    if (gridContainer) {
        loadProjectsGrid(gridContainer);
    } 

    const detailTitle = document.getElementById('detail-title');
    if (detailTitle) {
        loadProjectDetails();
    }

    if (!gridContainer && !detailTitle) {
        setupProjectInteractions();
    }
});

function loadProjectsGrid(container) {
    fetch('projects.json')
        .then(response => response.json())
        .then(projects => {
            container.innerHTML = projects.map(createProjectCard).join('');
            setupProjectInteractions();
            setupFilters();
        })
        .catch(err => console.error('Error loading projects grid:', err));
}

function loadProjectDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        document.getElementById('loading-message').textContent = "[ Error: No Project ID Specified ]";
        return;
    }

    const jsonPath = '../projects.json';

    fetch(jsonPath)
        .then(res => res.json())
        .then(projects => {
            const project = projects.find(p => p.id === projectId);
            
            if (!project) {
                document.getElementById('loading-message').textContent = "[ Error: Project Not Found ]";
                return;
            }

            injectProjectData(project);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('loading-message').textContent = "[ Error: Could not load project data ]";
        });
}

function injectProjectData(project) {
    const info = project.detailedInfo;
    if (!info) {
        document.getElementById('loading-message').textContent = "[ Error: Detailed info missing for this project ]";
        return;
    }

    document.title = `Hazim's Portfolio - ${project.title}`;
    document.getElementById('detail-window-title').textContent = info.windowTitle || `[ ${project.id}.exe ]`;
    document.getElementById('detail-title').textContent = project.title;
    document.getElementById('detail-overview').innerHTML = info.overview;
    document.getElementById('detail-contributions').innerHTML = info.contributions;
    document.getElementById('detail-hero-image').src = info.heroImage;

    const tagsContainer = document.getElementById('detail-tags');
    tagsContainer.innerHTML = project.tags.map(tag => 
        `<span class="${getTagClass(tag)}">${tag}</span>`
    ).join('');

    const factsList = document.getElementById('detail-facts-list');
    factsList.innerHTML = info.fastFacts.map(fact => 
        `<li><strong>${fact.label}:</strong> ${fact.value}</li>`
    ).join('');

    const playLink = document.getElementById('detail-play-link');
    if (info.playLink) {
        playLink.href = info.playLink;
        playLink.style.display = 'block';
    } else {
        playLink.style.display = 'none';
    }

    if (info.gallery && info.gallery.length > 0) {
        const mainDisplay = document.getElementById('gallery-main-display');
        const thumbsContainer = document.getElementById('detail-gallery-thumbs');
        
        mainDisplay.src = info.gallery[0];

        thumbsContainer.innerHTML = info.gallery.map((src, index) => `
            <img class="gallery-thumb pixel-border ${index === 0 ? 'active' : ''}" 
                 src="${src}" 
                 data-src="${src}" 
                 alt="Gallery Image ${index + 1}">
        `).join('');

        initGallery(); 
    } else {
        document.querySelector('.project-gallery-window').style.display = 'none';
    }

    document.getElementById('loading-message').style.display = 'none';
    document.getElementById('project-content').style.display = 'grid'; 

    if(window.innerWidth < 1024) {
         document.getElementById('project-content').style.display = 'block';
    }
}

// interactive features
function setupProjectInteractions() {
    const allProjectCards = document.querySelectorAll('.project-card');
    let hoverTimer = null; 

    allProjectCards.forEach(card => {
        const video = card.querySelector('video');
        if (!video) return; 
        
        card.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                video.play().catch(e => {});
            }, 400); 
        });
        
        card.addEventListener('mouseleave', () => {
            if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
            video.pause();
            video.currentTime = 0;
            video.load(); 
        });
    });

    // Modal Logic
    const modal = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    
    if (modal && modalCloseBtn && allProjectCards.length > 0) {
        allProjectCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.dataset.title;
                const mediaUrl = card.dataset.media;
                const description = card.dataset.description;
                const tagsRaw = card.dataset.tags || "";
                const tags = tagsRaw.split(',');
                const detailsPage = card.dataset.detailsPage; 
                const itchUrl = card.dataset.itchUrl || ''; 

                document.getElementById('modal-title').textContent = `[ ${title}.exe ]`;
                document.getElementById('modal-description').textContent = description;
                document.getElementById('modal-details-link').href = detailsPage;

                const itchLink = document.getElementById('modal-itch-link');
                if (itchUrl) {
                    itchLink.href = itchUrl;
                    itchLink.style.display = 'inline-flex'; 
                } else {
                    itchLink.href = '#';
                    itchLink.style.display = 'none';
                }

                const mediaContainer = document.getElementById('modal-media');
                if (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm')) {
                    mediaContainer.innerHTML = `<video disablePictureInPicture controls autoplay muted loop playsinline src="${mediaUrl}"></video>`;
                } else {
                    mediaContainer.innerHTML = `<img src="${mediaUrl}">`;
                }

                const tagsContainer = document.getElementById('modal-tags');
                tagsContainer.innerHTML = ''; 
                tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.textContent = tag;
                    tagElement.className = getTagClass(tag);
                    tagsContainer.appendChild(tagElement);
                });

                modal.style.display = 'flex';
            });
        });

        const closeModal = () => {
            modal.style.display = 'none';
            const modalVideo = modal.querySelector('video');
            if (modalVideo) { modalVideo.pause(); modalVideo.src = ''; }
        };

        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
}

function setupFilters() {
    const filterContainer = document.querySelector('.filter-buttons');
    if (filterContainer) {
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const allProjectCards = document.querySelectorAll('.project-card');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterValue = button.dataset.filter;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                allProjectCards.forEach(card => {
                    if (filterValue === 'all' || card.dataset.category === filterValue) {
                        card.style.display = 'block'; 
                    } else {
                        card.style.display = 'none'; 
                    }
                });
            });
        });
    }
}

function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 200; 
        const particleSize = 2; 
        const particleColor = 'rgba(138, 138, 138, 0.4)'; 
        
        const setup = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height, 
                    speed: (Math.random() * 0.3) + 0.1 
                });
            }
        };
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = particleColor;
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.y -= p.speed;
                if (p.y < 0) {
                    p.y = canvas.height + particleSize;
                    p.x = Math.random() * canvas.width; 
                }
                ctx.fillRect(p.x, p.y, particleSize, particleSize);
            }
            requestAnimationFrame(animate);
        };
        setup(); 
        animate(); 
        window.addEventListener('resize', setup);
    }
}

function initDraggableWindows() {
    const allWindows = document.querySelectorAll('main .window');
    let highestZ = 10; 
    
    allWindows.forEach(windowEl => {
        const titleBar = windowEl.querySelector('.window-titlebar');
        if (!titleBar) return;
        
        windowEl.style.position = 'relative'; 
        windowEl.style.zIndex = highestZ;
        let isDragging = false;
        let xOffset = 0, yOffset = 0;
        let initialMouseX, initialMouseY;

        windowEl.addEventListener('mousedown', () => {
            highestZ++; 
            windowEl.style.zIndex = highestZ;
        }, { capture: true }); 

        titleBar.addEventListener('mousedown', (e) => {
            e.preventDefault(); 
            isDragging = true;
            initialMouseX = e.clientX;
            initialMouseY = e.clientY;
            titleBar.style.cursor = 'grabbing';
            document.body.style.cursor = 'grabbing';
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });

        function drag(e) {
            if (!isDragging) return;
            const dx = e.clientX - initialMouseX;
            const dy = e.clientY - initialMouseY;
            windowEl.style.transform = `translate(${xOffset + dx}px, ${yOffset + dy}px)`;
        }

        function dragEnd(e) {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
            titleBar.style.cursor = 'grab';
            document.body.style.cursor = 'default';
            xOffset = xOffset + (e.clientX - initialMouseX);
            yOffset = yOffset + (e.clientY - initialMouseY);
        }

        const resizeHandle = windowEl.querySelector('.resize-handle');
        const minWidth = 300;
        const minHeight = 250;
        let isResizing = false;
        let initialWidth, initialHeight;
        
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation(); 
                isResizing = true;
                initialWidth = windowEl.offsetWidth;
                initialHeight = windowEl.offsetHeight;
                initialMouseX = e.clientX;
                initialMouseY = e.clientY;
                document.body.style.cursor = 'se-resize';
                document.addEventListener('mousemove', resizeWindow);
                document.addEventListener('mouseup', stopResize);
            });

            function resizeWindow(e) {
                if (!isResizing) return;
                const dx = e.clientX - initialMouseX;
                const dy = e.clientY - initialMouseY;
                let newWidth = initialWidth + dx;
                let newHeight = initialHeight + dy;
                if (newWidth < minWidth) newWidth = minWidth;
                if (newHeight < minHeight) newHeight = minHeight;
                windowEl.style.width = newWidth + 'px';
                windowEl.style.height = newHeight + 'px';
            }

            function stopResize() {
                isResizing = false;
                document.body.style.cursor = 'default';
                document.removeEventListener('mousemove', resizeWindow);
                document.removeEventListener('mouseup', stopResize);
            }
        }
    });
}

function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            themeToggleBtn.textContent = 'Dark Mode';
        } else {
            document.body.classList.remove('light-mode');
            themeToggleBtn.textContent = 'Light Mode';
        }
    };
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    themeToggleBtn.addEventListener('click', () => {
        const isCurrentlyLight = document.body.classList.contains('light-mode');
        const newTheme = isCurrentlyLight ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function initCarousel() {
    const carouselContainer = document.querySelector('.all-projects-carousel .carousel-container');
    if (carouselContainer) {
        const track = carouselContainer.querySelector('.carousel-track');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        if (!track || !prevBtn || !nextBtn) return;

        let cards = Array.from(track.children);
        let cardWidth = 0;
        let visibleSlides = 1;
        let currentIndex = 0;

        const updateCarouselSizing = () => {
            const containerWidth = carouselContainer.getBoundingClientRect().width;
            const firstCard = cards[0];
            if (!firstCard) return; 
            const cardStyle = window.getComputedStyle(firstCard);
            const cardMarginWidth = parseFloat(cardStyle.marginLeft) + parseFloat(cardStyle.marginRight);
            cardWidth = firstCard.getBoundingClientRect().width + cardMarginWidth;
            visibleSlides = Math.floor(containerWidth / cardWidth);
            if (visibleSlides < 1) visibleSlides = 1; 
        };

        const moveToSlide = (targetIndex) => {
            if (targetIndex < 0) targetIndex = 0;
            if (targetIndex > cards.length - visibleSlides) targetIndex = cards.length - visibleSlides;
            if (targetIndex < 0) targetIndex = 0;
            track.style.transform = 'translateX(-' + (cardWidth * targetIndex) + 'px)';
            currentIndex = targetIndex;
        };

        updateCarouselSizing();
        moveToSlide(0);

        nextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
        prevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));
        
        window.addEventListener('resize', () => {
            updateCarouselSizing();
            moveToSlide(currentIndex);
        });
    }
}

function initGallery() {
    const galleryContainer = document.querySelector('.gallery-container-new');
    if (galleryContainer) {
        const mainDisplay = document.getElementById('gallery-main-display');
        const thumbnails = galleryContainer.querySelectorAll('.gallery-thumb');
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const newSrc = thumb.getAttribute('data-src');
                mainDisplay.src = newSrc;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });

        if (thumbnails.length > 0 && mainDisplay) {
            thumbnails[0].classList.add('active');
            mainDisplay.src = thumbnails[0].getAttribute('data-src');
        }
    } 
}