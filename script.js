let highestZ = 100;
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
    setTimeout(applyUrlPreferences, 100);
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

let currentProjectRoleDetails = []; 

function injectProjectData(project) {
    const info = project.detailedInfo;
    if (!info) return;

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

    const roleContainer = document.getElementById('role-buttons-container');
    
    if (project.roleDetails && project.roleDetails.length > 0) {
        currentProjectRoleDetails = project.roleDetails; // Store for access
        
        roleContainer.style.display = 'flex';
        roleContainer.innerHTML = project.roleDetails.map((role, index) => `
            <button class="btn-role-window" onclick="openRoleWindow(${index})">
                [ Open ${role.role} Data ]
            </button>
        `).join('');
    } else {
        roleContainer.style.display = 'none';
    }

    if (info.gallery && info.gallery.length > 0) {
        const mainDisplay = document.getElementById('gallery-main-display');
        const thumbsContainer = document.getElementById('detail-gallery-thumbs');
        
        mainDisplay.src = info.gallery[0];
        thumbsContainer.innerHTML = info.gallery.map((src, index) => `
            <img class="gallery-thumb pixel-border ${index === 0 ? 'active' : ''}" 
                 src="${src}" data-src="${src}">
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

function openRoleWindow(index) {
    const data = currentProjectRoleDetails[index];
    const windowEl = document.getElementById('role-detail-window');
    
    if (data && windowEl) {
        document.getElementById('role-window-title').textContent = data.windowTitle || `[ ${data.role}.txt ]`;
        document.getElementById('role-window-content').innerHTML = `
            <h2 style="color: var(--color-accent); margin-top:0;">${data.role} Report</h2>
            <hr style="border: 1px solid var(--color-border); margin-bottom: 20px;">
            ${data.content}
        `;

        highestZ++;
        windowEl.style.zIndex = highestZ;

        windowEl.style.display = 'flex';
        windowEl.style.transform = 'none'; 
        windowEl.setAttribute('data-x', 0); 
        windowEl.setAttribute('data-y', 0); 

        document.getElementById('role-window-close').onclick = function() {
            windowEl.style.display = 'none';
        };

        initDraggableWindows();
    }
}

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
    
    allWindows.forEach(windowEl => {
        const titleBar = windowEl.querySelector('.window-titlebar');
        if (!titleBar) return;
        
        if (windowEl.classList.contains('js-drag-enabled')) return;
        windowEl.classList.add('js-drag-enabled');

        if (!windowEl.classList.contains('draggable-role-window')) {
            windowEl.style.position = 'relative'; 
        }

        windowEl.style.zIndex = highestZ;
        let isDragging = false;
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
            
            const currentX = parseFloat(windowEl.getAttribute('data-x')) || 0;
            const currentY = parseFloat(windowEl.getAttribute('data-y')) || 0;

            windowEl.style.transform = `translate(${currentX + dx}px, ${currentY + dy}px)`;
        }

        function dragEnd(e) {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
            titleBar.style.cursor = 'grab';
            document.body.style.cursor = 'default';
            
            const currentX = parseFloat(windowEl.getAttribute('data-x')) || 0;
            const currentY = parseFloat(windowEl.getAttribute('data-y')) || 0;
            
            const newX = currentX + (e.clientX - initialMouseX);
            const newY = currentY + (e.clientY - initialMouseY);

            windowEl.setAttribute('data-x', newX);
            windowEl.setAttribute('data-y', newY);
            windowEl.style.transform = `translate(${newX}px, ${newY}px)`;
        }

        const resizeHandle = windowEl.querySelector('.resize-handle');
        if (resizeHandle) {
            let isResizing = false;
            let initialWidth, initialHeight;

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
                if (newWidth < 300) newWidth = 300;
                if (newHeight < 250) newHeight = 250;
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
    const headerWrapper = document.querySelector('.carousel-header-wrapper');
    
    if (carouselContainer) {
        const track = carouselContainer.querySelector('.carousel-track');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        if (!track || !prevBtn || !nextBtn) return;

        let cards = Array.from(track.children);
        if (cards.length === 0) return; 

        let cardWidth = 0;
        let currentIndex = 0;

        const updateCarouselSizing = () => {
            const containerWidth = carouselContainer.getBoundingClientRect().width;
            const firstCard = cards[0];
            if (!firstCard) return;
            
            const cardStyle = window.getComputedStyle(firstCard);
            const cardMargin = parseFloat(cardStyle.marginLeft) + parseFloat(cardStyle.marginRight);
            cardWidth = firstCard.getBoundingClientRect().width + cardMargin;
    
            const totalContentWidth = cardWidth * cards.length;

            if (totalContentWidth <= containerWidth + 5) {
                track.classList.add('center-content');
                if(headerWrapper) headerWrapper.classList.add('hide-nav');
                track.style.transform = 'translateX(0px)';
            } 
            else {
                track.classList.remove('center-content');
                if(headerWrapper) headerWrapper.classList.remove('hide-nav');
            }
        };

        const moveToSlide = (targetIndex) => {
            if (track.classList.contains('center-content')) return;

            const containerWidth = carouselContainer.getBoundingClientRect().width;
            const visibleSlides = Math.floor(containerWidth / cardWidth);

            if (targetIndex < 0) targetIndex = 0;
            if (targetIndex > cards.length - visibleSlides) targetIndex = cards.length - visibleSlides;
            
            track.style.transform = 'translateX(-' + (cardWidth * targetIndex) + 'px)';
            currentIndex = targetIndex;
        };

        const newPrev = prevBtn.cloneNode(true);
        const newNext = nextBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);

        newNext.addEventListener('click', () => moveToSlide(currentIndex + 1));
        newPrev.addEventListener('click', () => moveToSlide(currentIndex - 1));
        
        window.addEventListener('resize', () => {
            updateCarouselSizing();
            moveToSlide(currentIndex);
        });

        setTimeout(() => {
            updateCarouselSizing();
            moveToSlide(0);
        }, 50);
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

function applyUrlPreferences() {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role'); 
    const filterParam = urlParams.get('filter'); 

    if (filterParam) {
        const targetBtn = document.querySelector(`.filter-btn[data-filter="${filterParam}"]`);
        setTimeout(() => { if (targetBtn) targetBtn.click(); }, 100);
    }

    if (roleParam) {
        const profileRole = document.getElementById('profile-role');
        const profileCore = document.getElementById('profile-core-skills');
        const skillsContainer = document.getElementById('skills-container');

        if (profileRole && profileCore && skillsContainer) {
            let roleDescription = "";
            let coreSkillsList = "";
            let skillsHTML = "";

            if (roleParam === 'software') {
                roleDescription = "";
                coreSkillsList = "";
                
                skillsHTML = `
                    <div class="skill-list-container">
                        <h4>[ Core Competencies ]</h4>
                        <ul>
                            <li>Object-Oriented Programming (OOP)</li>
                            <li>Database Design & Normalization</li>
                            <li>Backend Architecture (MVC)</li>
                            <li>Agile / Scrum Management</li>
                        </ul>
                    </div>
                    <div class="skill-list-container">
                        <h4>[ Languages ]</h4>
                        <ul>
                            <li>Python <span class="primary">(Advanced)</span></li>
                            <li>Java <span class="primary">(Intermediate)</span></li>
                            <li>PHP & SQL</li>
                            <li>HTML / CSS / JavaScript</li>
                        </ul>
                    </div>
                    <div class="skill-list-container">
                        <h4>[ Frameworks & Tools ]</h4>
                        <ul>
                            <li>Java Swing / GSON</li>
                            <li>Pygame / CustomTkinter</li>
                            <li>Git / GitHub</li>
                            <li>VS Code / IntelliJ / XAMPP</li>
                        </ul>
                    </div>`;
            } 
            else if (roleParam === 'data') { 
                roleDescription = "";
                coreSkillsList = "";
                
                skillsHTML = `
                    <div class="skill-list-container">
                        <h4>[ Analysis Competencies ]</h4>
                        <ul>
                            <li>Statistical Modeling (Regression)</li>
                            <li>Hypothesis Testing</li>
                            <li>Data Cleaning & Wrangling</li>
                            <li>Exploratory Data Analysis (EDA)</li>
                        </ul>
                    </div>
                    <div class="skill-list-container">
                        <h4>[ Languages & Libraries ]</h4>
                        <ul>
                            <li>R <span class="primary">(Tidyverse, ggplot2)</span></li>
                            <li>Python <span class="primary">(Pandas, Matplotlib)</span></li>
                            <li>SQL <span class="primary">(MySQL)</span></li>
                        </ul>
                    </div>
                    <div class="skill-list-container">
                        <h4>[ Tools ]</h4>
                        <ul>
                            <li>RStudio</li>
                            <li>Jupyter Notebooks</li>
                            <li>Excel (Pivot Tables)</li>
                            <li>Tableau (Basics)</li>
                        </ul>
                    </div>`;
            }
            else if (roleParam === 'gamedev') { 
                roleDescription = ".";
                coreSkillsList = "";
                
                skillsHTML = `
                    <div class="skill-list-container">
                        <h4>[ Core Competencies ]</h4>
                        <ul>
                            <li>Gameplay Programming</li>
                            <li>3D & 2D Level Design</li>
                            <li>Game Feel & Polish</li>
                            <li>Rapid Prototyping</li>
                        </ul>
                    </div>
                    <div class="skill-list-container">
                        <h4>[ Engines ]</h4>
                        <ul>
                            <li>Unity <span class="primary">(Unity 6, 2022 LTS)</span></li>
                            <li>Unreal Engine 5 <span class="primary">(Blueprints, C++)</span></li>
                        </ul>
                    </div>
                    <div class="skill-list-container">
                        <h4>[ Languages ]</h4>
                        <ul>
                            <li>C# <span class="primary">(Primary)</span></li>
                            <li>C++</li>
                            <li>Python</li>
                        </ul>
                    </div>
                    <div class="skill-list-container">
                        <h4>[ Creative Tools ]</h4>
                        <ul>
                            <li>Blender</li>
                            <li>Aseprite</li>
                            <li>Photoshop</li>
                        </ul>
                    </div>`;
            }

            if (roleDescription) profileRole.textContent = roleDescription;
            if (coreSkillsList) profileCore.textContent = coreSkillsList;
            if (skillsHTML) skillsContainer.innerHTML = skillsHTML;
        }

        let newTitle = "";
        let newWindowName = "";
        let targetFilter = "all"; 
        let newFocus = "";
        let newSpecialty = "";
        let newTools = "";

        switch(roleParam) {
            case 'software':
                newTitle = "I'm a <span style='color: var(--color-accent)'>Software Engineer</span> | Python, Java, PHP, SQL & Full-Stack Development";
                newWindowName = "[ software_engineer.txt ]";
                targetFilter = "software"; 
                newFocus = `I build robust, user-centric software solutions. I specialize in <span style="color: #00ff00;">Backend Development</span> and <span style="color: #00ff00;">Database Management</span>, utilizing Python, Java, and SQL to create efficient applications.`;
                newSpecialty = `Translating complex business requirements into clean, maintainable code for desktop and web environments.`;
                newTools = `[ "Python", "Java", "PHP", "MySQL", "HTML/CSS", "JavaScript", "Git", "CustomTkinter" ]`;
                break;
            
            case 'gamedev':
                newTitle = "I'm a <span style='color: var(--color-accent)'>Gameplay Programmer</span> | Unity (C#), Unreal (C++) & Technical Design";
                newWindowName = "[ gameplay_prog.cpp ]";
                targetFilter = "academic"; 
                newFocus = `I bring worlds to life through code. I specialize in <span style="color: #00ff00;">Gameplay Systems</span>, <span style="color: #00ff00;">Character Mechanics</span>, and <span style="color: #00ff00;">AI Behavior</span> using Unity and Unreal Engine.`;
                newSpecialty = `Bridging the gap between Game Design and Engineering to create responsive, "juicy", and bug-free gameplay experiences.`;
                newTools = `[ "Unity (C#)", "Unreal (Blueprints/C++)", "Blender", "Aseprite", "PlasticSCM", "Jira" ]`;
                break;

            case 'data':
                newTitle = "I'm a <span style='color: var(--color-accent)'>Data Analyst</span> | R, Python, Visualization & Statistical Modeling";
                newWindowName = "[ data_analysis.R ]";
                targetFilter = "others"; 
                newFocus = `I turn raw numbers into actionable insights. I specialize in <span style="color: #00ff00;">Statistical Analysis</span> and <span style="color: #00ff00;">Data Visualization</span> to uncover trends in user behavior and market data.`;
                newSpecialty = `Using data science methodologies (Logistic Regression, Hypothesis Testing) to solve real-world problems.`;
                newTools = `[ "RStudio", "Python (Pandas, Matplotlib)", "SQL", "Excel", "Tableau" ]`;
                break;
        }

        const heroSubtitle = document.querySelector('.hero-section h2');
        const heroWindowName = document.querySelector('.hero-section .window-titlebar span');
        const aboutFocus = document.getElementById('about-focus');
        const aboutSpecialty = document.getElementById('about-specialty');
        const aboutTools = document.getElementById('about-tools');

        if (heroSubtitle && newTitle) heroSubtitle.innerHTML = newTitle;
        if (heroWindowName && newWindowName) heroWindowName.textContent = newWindowName;
        if (aboutFocus && newFocus) aboutFocus.innerHTML = newFocus;
        if (aboutSpecialty && newSpecialty) aboutSpecialty.innerHTML = newSpecialty;
        if (aboutTools && newTools) aboutTools.textContent = newTools;

        updateNavLinks(roleParam, targetFilter);
    }

    if (roleParam) {
        loadHomeCarousel(roleParam);
    } else {
        loadHomeCarousel('default');
    }
}

function updateNavLinks(role, filter) {
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (!href || href.startsWith('http')) return;

        if (href.includes('index.html')) {
            link.href = `index.html?role=${role}`;
        } 
        else if (href.includes('about.html')) {
            link.href = `about.html?role=${role}`;
        }
        else if (href.includes('projects.html')) {
            link.href = `projects.html?filter=${filter}&role=${role}`;
        }
        else if (href.includes('contact.html')) {
            link.href = `contact.html?role=${role}`;
        }
    });

    const carouselLink = document.querySelector('.projects-link');
    if (carouselLink) {
        carouselLink.setAttribute('href', `projects.html?filter=${filter}&role=${role}`);
    }
}

function loadHomeCarousel(role) {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    fetch('projects.json')
        .then(response => response.json())
        .then(projects => {
            let filteredProjects = [];

            if (role === 'software') {
                filteredProjects = projects.filter(p => p.category === 'software' || p.tags.includes('Python'));
            } 
            else if (role === 'gamedev') {
                filteredProjects = projects.filter(p => p.category === 'academic' || p.category === 'gamejam');
            } 
            else if (role === 'data') {
                filteredProjects = projects.filter(p => p.id === 'retail-analysis' || p.tags.includes('Data Analyst'));
            } 
            else {
                const featuredIds = ['gasing-guardian', 'super-nasi-odyssey', 'retail-analysis', 'quizzard', 'midnight-arcade'];
                filteredProjects = projects.filter(p => featuredIds.includes(p.id));
                
                if (filteredProjects.length === 0) filteredProjects = projects.slice(0, 6);
            }

            track.innerHTML = filteredProjects.map(createProjectCard).join('');

            setupProjectInteractions(); 
            initCarousel(); 
        })
        .catch(err => console.error('Error loading carousel:', err));
}