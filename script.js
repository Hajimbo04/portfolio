document.addEventListener('DOMContentLoaded', () => {

    //   PARTICLE BACKGROUND   //
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

        // function to draw the particles
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

    //    DRAGGABLE WINDOWS    //
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
            highestZ++; // Increment global z-index
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

        //   RESIZABLE WINDOW LOGIC     //
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
    
    //     THEME TOGGLE        //
    const themeToggleBtn = document.getElementById('theme-toggle');
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            themeToggleBtn.textContent = 'Dark Mode';
        } else {
            themeToggleBtn.textContent = 'Light Mode';
        }
    });

    //   CAROUSEL LOGIC   //
    const carouselContainer = document.querySelector('.all-projects-carousel .carousel-container');
    if (carouselContainer) {
        const track = carouselContainer.querySelector('.carousel-track');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
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

        // Function to move the carousel
        const moveToSlide = (targetIndex) => {
            if (targetIndex < 0) {
                targetIndex = 0;
            } else if (targetIndex > cards.length - visibleSlides) { 
                targetIndex = cards.length - visibleSlides;
            }
            if (targetIndex < 0) targetIndex = 0;
            track.style.transform = 'translateX(-' + (cardWidth * targetIndex) + 'px)';
            currentIndex = targetIndex;
        };
        updateCarouselSizing();
        moveToSlide(0);

        nextBtn.addEventListener('click', () => {
            moveToSlide(currentIndex + 1);
        });
        prevBtn.addEventListener('click', () => {
            moveToSlide(currentIndex - 1);
        });
        window.addEventListener('resize', () => {
            updateCarouselSizing();
            moveToSlide(currentIndex);
        });
    }

    //   CARD HOVER PREVIEW    //
    const allProjectCards = document.querySelectorAll('.project-card');
    let hoverTimer = null; 
    allProjectCards.forEach(card => {
        const video = card.querySelector('video');
        if (!video) {
            return; 
        }

        card.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                video.play()
                    .catch(e => {
                    });
            }, 400); // 2-second delay
        });
        card.addEventListener('mouseleave', () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            video.pause();
            video.currentTime = 0;
            video.load(); 
        });
    });


    //   PROJECT MODAL LOGIC   //
    const modal = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const allCards = document.querySelectorAll('.project-card'); 
    if (modal && modalCloseBtn && allCards.length > 0) {
        allCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.dataset.title;
                const mediaUrl = card.dataset.media;
                const description = card.dataset.description;
                const tags = card.dataset.tags.split(',');
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
                    mediaContainer.innerHTML = `
                        <video controls autoplay muted loop playsinline src="${mediaUrl}" alt="${title} media">
                    `;
                } else {
                    mediaContainer.innerHTML = `
                        <img src="${mediaUrl}" alt="${title} media">
                    `;
                }
                
                // tags
                const tagsContainer = document.getElementById('modal-tags');
                tagsContainer.innerHTML = ''; 
                tags.forEach(tag => {
                    let tagClass = '';
                    if (tag.toLowerCase().includes('programmer')) tagClass = 'tag-prog';
                    else if (tag.toLowerCase().includes('manager')) tagClass = 'tag-pm';
                    else if (tag.toLowerCase().includes('artist')) tagClass = 'tag-art';
                    else if (tag.toLowerCase().includes('designer')) tagClass = 'tag-design';
                    else if (tag.toLowerCase().includes('java')) tagClass = 'tag-java';
                    else if (tag.toLowerCase().includes('backend')) tagClass = 'tag-web';
                    else if (tag.toLowerCase().includes('marketing')) tagClass = 'tag-market';
                    else if (tag.toLowerCase().includes('actor')) tagClass = 'tag-actor';
                    else if (tag.toLowerCase().includes('vr')) tagClass = 'tag-art'; 

                    const tagElement = document.createElement('span');
                    tagElement.textContent = tag;
                    tagElement.className = tagClass;
                    tagsContainer.appendChild(tagElement);
                });
                modal.style.display = 'flex';
            });
        });
        const closeModal = () => {
            modal.style.display = 'none';
            const modalVideo = modal.querySelector('video');
            if (modalVideo) {
                modalVideo.pause();
                modalVideo.src = ''; 
            }
        };
        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    //  PROJECT FILTER LOGIC   //
    const filterContainer = document.querySelector('.filter-buttons');
    if (filterContainer) {
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const projectGrid = document.querySelector('.project-grid');
        const allProjectCards = projectGrid.querySelectorAll('.project-card');
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

    //   GALLERY LOGIC     //
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

        if (thumbnails.length > 0) {
            thumbnails[0].classList.add('active');
            mainDisplay.src = thumbnails[0].getAttribute('data-src');
        }
    } 
    else {
        console.log('New gallery not found on this page.');
    }
    
});