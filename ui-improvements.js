// ui-improvements.js - Mejoras adicionales a la interfaz de usuario

// Función para inicializar las mejoras de UI
function initUIImprovements() {
    console.log("Inicializando mejoras de UI...");

    // Aplicar tema oscuro/claro basado en la preferencia del usuario
    setupThemeToggle();

    // Activar animaciones en tarjetas y elementos interactivos
    setupCardAnimations();

    // Hacer que los elementos de inventario muestren tooltips
    setupInventoryTooltips();

    // Añadir efectos de sonido a las acciones principales
    setupSoundEffects();

    console.log("Mejoras de UI inicializadas correctamente");
}

// Función para configurar el cambio de tema
function setupThemeToggle() {
    // Crear botón de cambio de tema en la barra de info
    const accountInfo = document.getElementById('account-info');
    if (accountInfo) {
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle-btn';
        themeToggle.innerHTML = '🌙'; // Luna para tema oscuro por defecto

        // Determinar tema inicial
        const currentTheme = localStorage.getItem('rpg_theme') || 'dark';
        document.body.setAttribute('data-theme', currentTheme);
        themeToggle.innerHTML = currentTheme === 'dark' ? '🌙' : '☀️';

        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.body.setAttribute('data-theme', newTheme);
            themeToggle.innerHTML = newTheme === 'dark' ? '🌙' : '☀️';

            // Guardar preferencia
            localStorage.setItem('rpg_theme', newTheme);
        });

        accountInfo.appendChild(themeToggle);
    }
}

// Función para añadir animaciones a las tarjetas
function setupCardAnimations() {
    // Añadir efectos de hover a todas las tarjetas de personajes y zonas
    document.addEventListener('mouseover', function(e) {
        const card = e.target.closest('.character-card, .zone-card, .inventory-item, .market-item, .shop-item');
        if (card && !card.classList.contains('disabled')) {
            card.classList.add('hover-effect');
        }
    }, true);

    document.addEventListener('mouseout', function(e) {
        const card = e.target.closest('.character-card, .zone-card, .inventory-item, .market-item, .shop-item');
        if (card) {
            card.classList.remove('hover-effect');
        }
    }, true);

    // Añadir efecto de clic a los botones
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('btn-disabled')) {
            e.target.classList.add('button-click');
            setTimeout(() => {
                e.target.classList.remove('button-click');
            }, 200);
        }
    });
}

// Función para añadir tooltips al inventario
function setupInventoryTooltips() {
    // Crear elemento para el tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'item-tooltip hidden';
    document.body.appendChild(tooltip);

    // Mostrar tooltip al pasar el ratón por items
    document.addEventListener('mouseover', function(e) {
        const item = e.target.closest('.inventory-item, .market-item, .item-card');
        if (item) {
            const itemId = item.getAttribute('data-id');
            if (itemId) {
                // Buscar información del item
                const playerData = getPlayerData();
                let itemInfo = null;

                // Buscar en inventario
                if (playerData && playerData.inventory) {
                    itemInfo = playerData.inventory.find(i => i.id === itemId);
                }

                // Si no se encuentra, buscar en listings de mercado
                if (!itemInfo && typeof marketListings !== 'undefined') {
                    const listing = marketListings.find(l => l.id === itemId);
                    if (listing) {
                        itemInfo = listing.item;
                    }
                }

                // Si tenemos información, mostrar tooltip
                if (itemInfo) {
                    // Determinar color según rareza
                    let rarityColor = '#aaaaaa'; // Por defecto (común)
                    if (itemInfo.rarity) {
                        switch(itemInfo.rarity) {
                            case 'Poco común': rarityColor = '#00aa00'; break;
                            case 'Raro': rarityColor = '#0000aa'; break;
                            case 'Épico': rarityColor = '#aa00aa'; break;
                            case 'Legendario': rarityColor = '#aaaa00'; break;
                        }
                    }

                    // Construir contenido del tooltip
                    let tooltipContent = `
                        <div class="tooltip-header" style="border-bottom-color: ${rarityColor}">
                            <h4>${itemInfo.name}</h4>
                            <span class="tooltip-type">${getItemTypeText(itemInfo.type)}</span>
                        </div>
                    `;

                    if (itemInfo.description) {
                        tooltipContent += `<p class="tooltip-description">${itemInfo.description}</p>`;
                    }

                    if (itemInfo.level) {
                        tooltipContent += `<p class="tooltip-level">Nivel: ${itemInfo.level}</p>`;
                    }

                    if (itemInfo.statBonus) {
                        tooltipContent += `<div class="tooltip-stats">`;
                        for (const stat in itemInfo.statBonus) {
                            tooltipContent += `<p>${getStatName(stat)}: +${itemInfo.statBonus[stat]}</p>`;
                        }
                        tooltipContent += `</div>`;
                    }

                    if (itemInfo.value) {
                        tooltipContent += `<p class="tooltip-value">Valor: ${itemInfo.value} oro</p>`;
                    }

                    tooltip.innerHTML = tooltipContent;

                    // Posicionar tooltip cerca del item
                    const itemRect = item.getBoundingClientRect();
                    tooltip.style.top = (itemRect.top + window.scrollY) + 'px';
                    tooltip.style.left = (itemRect.right + 10 + window.scrollX) + 'px';

                    // Asegurar que el tooltip no se salga de la pantalla
                    const tooltipRect = tooltip.getBoundingClientRect();
                    if (tooltipRect.right > window.innerWidth) {
                        tooltip.style.left = (itemRect.left - tooltipRect.width - 10 + window.scrollX) + 'px';
                    }

                    // Mostrar tooltip
                    tooltip.classList.remove('hidden');
                }
            }
        }
    });

    // Ocultar tooltip al salir del item
    document.addEventListener('mouseout', function(e) {
        const item = e.target.closest('.inventory-item, .market-item, .item-card');
        if (item) {
            tooltip.classList.add('hidden');
        }
    });
}

// Función para añadir efectos de sonido
function setupSoundEffects() {
    // Crear elementos de audio para diferentes acciones
    const sounds = {
        click: new Audio('data:audio/wav;base64,UklGRpQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAFAACAgICAgICAgICAgIB3d4iIiIiIiIiIiIh3d3d3iIiIiIiIiIh3d3d3d3d3d3d3eHiIiIiIiIh3d3d3d3d3d3d3d3d4eIiIiIiId3d3d3d3d3d3d3d3d3d3eIiIiIiAgICAeHh4eHh4eHh4eHh4eHh4eIiIiIiIeHh4eHh4eHh4eHh4eHh4eHh4iIiIiHh4eHh4eHh4eHh4eHh4eHh4eHh4iIiAgICAgICAgICAgICAgICAgICAgICAiIiIiIh4eHh4eHh4eHiAgICAgICAgICAiIiIiIh4eHh4eHh4eHiAgICAgICAgICAiIiIiHh4eHh4eHh4eHiAgIB5eXl5eHiAgICIeHh4eHh4eHh4eHl5eXl5eXl5eHiAgICAgICAgICAgICAgICAgICAgICAgICAiIiIiIh4eHh4eHh4eHh4eHh4eHh4eHh4iIiIiIh4eHh4eHh4eHh4eHh4eHh4eIiIiIiIeHh4eHh4eHh4eHh4eHh4eHiIiIiIiICAgHh4eHh4eHiIiIiIiIiIiIiIiIiIiICAgHh4eHh4eHiIiIiIiIiIiIiIiIiId3eIiIiIiIiIiIiIiIiIiIiIiIiIiIh3d3d3iIiIiIiIiIiIiIiIiIiIiIiId3d3d3d3d3d3d3eIiIiIiIiIiIiIiIiId3d3d3d3d3d3d3d3d3d3d3d3iIiIiIiIiHd3d3d3d3d3d3d3d3d3d3d3d3eIiIiIiIh3d3d3d3d3d3d3d3d3d3d3d3eIiIiId3d3d3d3d3d3d3d3d3d3d3d3d3d3iIiId3d3d3d3d3d3d3d3d3d3d3d3d3d3eIiAgICAgICAgHd3d3d3d3d3d3d3d3d3d4iIiIiIiHd3d3d3d3d3d3d3d3d3d3eIiIiIiIiAgHh4eHh4eHh4eHh4eHh4eHh4eIiIiIiAgICAeHh4eHh4eHh4eHh4eHh4eHiIiIiIgICAgICAeHh4eHh4eHh4eHh4eIiIiIiAgICAgICAgICAgICAgICAgICAgICAgIiIiICAgICAgICAgICAgICAgICAgICAgICAiIiAgICAgICAgICAgICAgICAgICAgICAgICAgICIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAeHh4eHh4eHh4eIiIiIh4eHh4eHh4eHh4iIiIiHh4eHh4eHh4eHh4iIiIeHh4eHh4eHh4eHh4iIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAeHh4eHh4eIiIiIiIiIiAgICAgICAgICAgHh4eHh4eIiIiIiIiIiAgICAgICAgICAgICB4eHh4iIiIiIiIiICAgICAgICAgICAgICAgICAiIiIiIiIgICAgICAgICAgICAgICAgICAgIiIiIiIgICAgICAgICAgICAgICAgICAgICIiIiIgICAgICAgICAgICAgICAgICAgICAgIiIiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA='),
        levelUp: new Audio('data:audio/wav;base64,UklGRiQDAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQADAACAgICAgICAgICAgICAgICAgIB5eYiIiIiIiIiIiIiIiIiIiIiIiHl5eYiIiIiIiIiIiIiIiIiIiIiIeXl5eXl5iIiIiIiIiIiIiIiIiIiIeHh5eXl5eXmIiIiIiIiIiIiIiIiIeHh4eHl5eXl5eYiIiIiIiIiIiIiIeHh4eHh4eXl5eXl5iIiIiIiIiIiIiHh4eHh4eHh4eXl5eXl5iIiIiIiIiIh4eHh4eHh4eHh4eXl5eXl5eYiIiIiIiHh4eHh4eHh4eHh4eHl5eXl5eXmIiIiIeHh4eHh4eHh4eHh4eHh4eXl5eXl5eYiIiHh4eHh4eHh4eHh4eHh4eHh4eXl5eXl5eYh4eHh4eHh4eHh4eHh4eHh4eHh4eXl5eXl5eHh4eHh4eHh4eHh4eHh4eHh4eHh4eXl5eXh4eHh4eHh4eHh4eHh4eHh4eHh4eHh5eXl5eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHl5eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eXh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHl4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh5eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh5eXh4eHh4eHh4eHh4eHh4eHh4eHh4eHl5eXl4eHh4eHh4eHh4eHh4eHh4eHh4eXl5eXl5eHh4eHh4eHh4eHh4eHh4eHh5eXl5eXl5eXh4eHh4eHh4eHh4eHh4eHl5eXl5eXl5eXl4eHh4eA=='),
        battle: new Audio('data:audio/wav;base64,UklGRpQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXAEAABmZmZmZmZmZmZmZnd3d3d3d3d3d3d3d2ZmZmZmZmZmZmZmZnd3d3d3d3d3d3d3d2ZmZmZmZmZmZmZmZnd3d3d3d3d3d3d3d2ZmZmZmZmZmZmZmZnd3d3d3d3d3d3d3Z2ZmZmZmZmZmZmZmZ3d3d3d3d3d3d3d3Z2ZmZmZmZmZmZmZmZ3d3d3d3d3d3d3dnZmZmZmZmZmZmZmZmZ3d3d3d3d3d3Z2ZmZmZmZmZmZmZmZmZnd3d3d3d3d2ZmZmZmZmZmZmZmZmZmZnd3d3d3d2ZmZmZmZmZmZmZmZmZmZnd3d3d3ZmZmZmZmZmZmZmZmZmZnZ3d3d2ZmZmZmZmZmZmZmZmZnZ2dnZ2ZmZmZmZmZmZmZmZmZnZ2dnZmZmZmZmZmZmZmZmZmdnZ2ZmZmZmZmZmZmZmZmZnZ2ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ')
    };

    // Añadir eventos para reproducir sonidos
    document.addEventListener('click', function(e) {
        // Reproducir sonido de clic
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('btn-disabled')) {
            sounds.click.currentTime = 0;
            sounds.click.play();
        }

        // Sonido de subir de nivel
        if (e.target.id === 'level-up-button' && !e.target.classList.contains('btn-disabled')) {
            sounds.levelUp.currentTime = 0;

            // Esperar a que se confirme la subida de nivel
            document.getElementById('confirm-button').addEventListener('click', function() {
                sounds.levelUp.play();
            }, {once: true});
        }

        // Sonido de exploración
        if (e.target.id === 'start-exploration' && !e.target.classList.contains('btn-disabled')) {
            sounds.battle.currentTime = 0;
            sounds.battle.play();
        }
    });
}

// Función para añadir componentes responsive
function setupResponsiveComponents() {
    // Verificar si la pantalla es pequeña
    const isMobile = window.innerWidth <= 768;

    // Añadir clase para dispositivos móviles
    document.body.classList.toggle('mobile-device', isMobile);

    // Crear botón de menú para móviles
    if (isMobile) {
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) {
            const mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.id = 'mobile-menu-toggle';
            mobileMenuBtn.innerHTML = '☰ Menú';
            mobileMenuBtn.className = 'mobile-menu-btn';

            mobileMenuBtn.addEventListener('click', function() {
                navMenu.classList.toggle('mobile-menu-expanded');
            });

            const gameContainer = document.getElementById('game-container');
            gameContainer.insertBefore(mobileMenuBtn, navMenu);
        }
    }

    // Escuchar cambios de tamaño de pantalla
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile-device', isMobile);
    });
}

// Inicializar mejoras cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initUIImprovements();
    setupResponsiveComponents();
});