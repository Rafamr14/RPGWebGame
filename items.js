// Items.js - Definición de objetos, equipamiento y consumibles

// Tipos de items
const ITEM_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    CONSUMABLE: 'consumable',
    MATERIAL: 'material'
};

// Constantes de rarezas de items
const ITEM_RARITIES = {
    COMMON: {
        name: 'Común',
        color: '#aaaaaa',
        statMultiplier: 1
    },
    UNCOMMON: {
        name: 'Poco común',
        color: '#00aa00',
        statMultiplier: 1.2
    },
    RARE: {
        name: 'Raro',
        color: '#0000aa',
        statMultiplier: 1.5
    },
    EPIC: {
        name: 'Épico',
        color: '#aa00aa',
        statMultiplier: 2
    },
    LEGENDARY: {
        name: 'Legendario',
        color: '#aaaa00',
        statMultiplier: 3
    }
};

// Inicialización del módulo de items
function initItems() {
    // Cargar pool de items
    loadItemPools();
}

// Pool de items por zonas
const ZONE_ITEM_POOLS = {
    // Los items específicos por zona se generarán dinámicamente
};

// Templates de items
const ITEM_TEMPLATES = {
    // Armas
    SWORD: {
        name: 'Espada',
        type: ITEM_TYPES.WEAPON,
        slot: 'weapon',
        equipable: true,
        baseStats: {
            attack: 10
        },
        description: 'Un arma afilada para combate cuerpo a cuerpo.'
    },
    BOW: {
        name: 'Arco',
        type: ITEM_TYPES.WEAPON,
        slot: 'weapon',
        equipable: true,
        baseStats: {
            attack: 8,
            speed: 2
        },
        description: 'Un arma de ataque a distancia.'
    },
    STAFF: {
        name: 'Bastón',
        type: ITEM_TYPES.WEAPON,
        slot: 'weapon',
        equipable: true,
        baseStats: {
            attack: 12
        },
        description: 'Un arma mágica que canaliza energía arcana.'
    },

    // Armaduras
    HELMET: {
        name: 'Casco',
        type: ITEM_TYPES.ARMOR,
        slot: 'head',
        equipable: true,
        baseStats: {
            defense: 5
        },
        description: 'Protege la cabeza de ataques enemigos.'
    },
    CHESTPLATE: {
        name: 'Coraza',
        type: ITEM_TYPES.ARMOR,
        slot: 'body',
        equipable: true,
        baseStats: {
            defense: 10,
            health: 15
        },
        description: 'Protege el torso de ataques enemigos.'
    },
    LEGGINGS: {
        name: 'Grebas',
        type: ITEM_TYPES.ARMOR,
        slot: 'legs',
        equipable: true,
        baseStats: {
            defense: 7,
            speed: 1
        },
        description: 'Protege las piernas de ataques enemigos.'
    },
    RING: {
        name: 'Anillo',
        type: ITEM_TYPES.ARMOR,
        slot: 'accessory',
        equipable: true,
        baseStats: {
            attack: 3,
            defense: 2,
            speed: 2
        },
        description: 'Un anillo mágico que otorga poderes especiales.'
    },

    // Consumibles
    HEALTH_POTION: {
        name: 'Poción de Salud',
        type: ITEM_TYPES.CONSUMABLE,
        equipable: false,
        effect: {
            type: 'heal',
            value: 50
        },
        description: 'Restaura 50 puntos de salud.'
    },
    STRENGTH_POTION: {
        name: 'Poción de Fuerza',
        type: ITEM_TYPES.CONSUMABLE,
        equipable: false,
        effect: {
            type: 'buff',
            stat: 'attack',
            value: 10,
            duration: 3
        },
        description: 'Aumenta el ataque en 10 puntos durante 3 turnos.'
    },

    // Materiales
    ORE: {
        name: 'Mineral',
        type: ITEM_TYPES.MATERIAL,
        equipable: false,
        description: 'Un mineral que puede ser utilizado para crafteo.'
    },
    HERB: {
        name: 'Hierba',
        type: ITEM_TYPES.MATERIAL,
        equipable: false,
        description: 'Una hierba que puede ser utilizada para alquimia.'
    }
};

// Función para cargar los pools de items por zona
function loadItemPools() {
    // Definir zonas y sus niveles
    const zones = [
        { id: 'forest', name: 'Bosque Encantado', level: 1 },
        { id: 'cave', name: 'Caverna Oscura', level: 3 },
        { id: 'mountain', name: 'Montaña Helada', level: 5 },
        { id: 'desert', name: 'Desierto Ardiente', level: 7 },
        { id: 'castle', name: 'Castillo Abandonado', level: 10 }
    ];

    // Generar pools de items por zona
    zones.forEach(zone => {
        const zoneLevel = zone.level;
        const itemPool = [];

        // Añadir algunas armas aleatorias a cada zona
        const weaponTemplates = [ITEM_TEMPLATES.SWORD, ITEM_TEMPLATES.BOW, ITEM_TEMPLATES.STAFF];

        weaponTemplates.forEach(template => {
            // Determinar rareza basada en nivel de zona
            let rarity;
            const rarityRoll = Math.random() * 100;

            if (zoneLevel >= 8 && rarityRoll < 10) {
                rarity = ITEM_RARITIES.LEGENDARY;
            } else if (zoneLevel >= 6 && rarityRoll < 20) {
                rarity = ITEM_RARITIES.EPIC;
            } else if (zoneLevel >= 4 && rarityRoll < 40) {
                rarity = ITEM_RARITIES.RARE;
            } else if (zoneLevel >= 2 && rarityRoll < 60) {
                rarity = ITEM_RARITIES.UNCOMMON;
            } else {
                rarity = ITEM_RARITIES.COMMON;
            }

            // Generar stats basadas en template, rareza y nivel de zona
            const statMultiplier = rarity.statMultiplier * (0.8 + (zoneLevel * 0.2));
            const statBonus = {};

            Object.keys(template.baseStats).forEach(stat => {
                statBonus[stat] = Math.floor(template.baseStats[stat] * statMultiplier);
            });

            // Crear nombre con modificador según rareza
            let itemName = template.name;
            if (rarity !== ITEM_RARITIES.COMMON) {
                const prefixes = ['Poderoso', 'Místico', 'Ancestral', 'Divino', 'Indomable'];
                const randomIndex = Math.floor(Math.random() * prefixes.length);
                itemName = `${prefixes[randomIndex]} ${itemName}`;
            }

            // Crear item para el pool
            const item = {
                id: `${template.name.toLowerCase()}_${zone.id}_${rarity.name.toLowerCase()}_${Date.now()}`,
                name: itemName,
                type: template.type,
                slot: template.slot,
                equipable: template.equipable,
                rarity: rarity.name,
                level: zoneLevel,
                statBonus: statBonus,
                description: template.description,
                value: Math.floor(50 * zoneLevel * rarity.statMultiplier)
            };

            itemPool.push(item);
        });

        // Añadir armaduras
        const armorTemplates = [ITEM_TEMPLATES.HELMET, ITEM_TEMPLATES.CHESTPLATE, ITEM_TEMPLATES.LEGGINGS, ITEM_TEMPLATES.RING];

        armorTemplates.forEach(template => {
            // Similar al proceso de armas pero con diferentes stats
            let rarity = ITEM_RARITIES.COMMON;
            if (zoneLevel >= 5 && Math.random() < 0.1) {
                rarity = ITEM_RARITIES.EPIC;
            } else if (zoneLevel >= 3 && Math.random() < 0.2) {
                rarity = ITEM_RARITIES.RARE;
            }

            const statMultiplier = rarity.statMultiplier * (0.8 + (zoneLevel * 0.2));
            const statBonus = {};

            Object.keys(template.baseStats).forEach(stat => {
                statBonus[stat] = Math.floor(template.baseStats[stat] * statMultiplier);
            });

            // Crear item para el pool
            const item = {
                id: `${template.name.toLowerCase()}_${zone.id}_${Date.now()}`,
                name: `${rarity.name !== 'Común' ? rarity.name + ' ' : ''}${template.name}`,
                type: template.type,
                slot: template.slot,
                equipable: template.equipable,
                rarity: rarity.name,
                level: zoneLevel,
                statBonus: statBonus,
                description: template.description,
                value: Math.floor(40 * zoneLevel * rarity.statMultiplier)
            };

            itemPool.push(item);
        });

        // Añadir consumibles
        const consumableTemplates = [ITEM_TEMPLATES.HEALTH_POTION, ITEM_TEMPLATES.STRENGTH_POTION];

        consumableTemplates.forEach(template => {
            const item = {
                id: `${template.name.toLowerCase().replace(' ', '_')}_${zone.id}_${Date.now()}`,
                name: template.name,
                type: template.type,
                equipable: false,
                effect: { ...template.effect },
                description: template.description,
                value: Math.floor(20 * zoneLevel)
            };

            // Escalar el efecto con el nivel de la zona
            if (item.effect.value) {
                item.effect.value = Math.floor(item.effect.value * (1 + (zoneLevel * 0.1)));
                item.description = `Restaura ${item.effect.value} puntos de salud.`;
            }

            itemPool.push(item);
        });

        // Añadir materiales
        const materialTemplates = [ITEM_TEMPLATES.ORE, ITEM_TEMPLATES.HERB];

        materialTemplates.forEach(template => {
            const item = {
                id: `${template.name.toLowerCase()}_${zone.id}_${Date.now()}`,
                name: `${template.name} de ${zone.name}`,
                type: template.type,
                equipable: false,
                description: template.description,
                value: Math.floor(10 * zoneLevel)
            };

            itemPool.push(item);
        });

        // Guardar pool para la zona
        ZONE_ITEM_POOLS[zone.id] = {
            zone: zone,
            items: itemPool
        };
    });
}

// Función para generar un drop aleatorio según la zona
function generateRandomDrop(zoneId, count = 1) {
    const zonePool = ZONE_ITEM_POOLS[zoneId];
    if (!zonePool || !zonePool.items || zonePool.items.length === 0) {
        return [];
    }

    const drops = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * zonePool.items.length);
        const itemTemplate = zonePool.items[randomIndex];

        // Clonar el item y asignar un nuevo ID para asegurar que sea único
        const item = JSON.parse(JSON.stringify(itemTemplate));
        item.id = `${item.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        drops.push(item);
    }

    return drops;
}

// Función para usar un item consumible
function useConsumableItem(itemId, characterId) {
    const playerData = getPlayerData();
    const itemIndex = playerData.inventory.findIndex(i => i.id === itemId);
    const character = playerData.characters.find(c => c.id === characterId);

    if (itemIndex === -1 || !character) return false;

    const item = playerData.inventory[itemIndex];

    if (item.type !== ITEM_TYPES.CONSUMABLE) {
        alert('Este item no es consumible.');
        return false;
    }

    // Aplicar efecto
    if (item.effect) {
        if (item.effect.type === 'heal') {
            // Restaurar salud
            character.currentHealth = Math.min(character.stats.health, (character.currentHealth || 0) + item.effect.value);
            alert(`${character.name} ha recuperado ${item.effect.value} puntos de salud.`);
        } else if (item.effect.type === 'buff') {
            // Aplicar buff temporal
            if (!character.buffs) character.buffs = [];

            character.buffs.push({
                stat: item.effect.stat,
                value: item.effect.value,
                duration: item.effect.duration
            });

            alert(`${character.name} ha recibido un buff de ${item.effect.value} en ${item.effect.stat} durante ${item.effect.duration} turnos.`);
        }
    }

    // Eliminar el item del inventario
    playerData.inventory.splice(itemIndex, 1);
    savePlayerData(playerData);

    return true;
}

// Función para crear un item para la tienda
function createShopItem(template, level, rarity = ITEM_RARITIES.COMMON) {
    const statMultiplier = rarity.statMultiplier * (0.8 + (level * 0.2));
    const statBonus = {};

    if (template.baseStats) {
        Object.keys(template.baseStats).forEach(stat => {
            statBonus[stat] = Math.floor(template.baseStats[stat] * statMultiplier);
        });
    }

    // Crear nombre con modificador según rareza
    let itemName = template.name;
    if (rarity !== ITEM_RARITIES.COMMON) {
        const prefixes = ['Poderoso', 'Místico', 'Ancestral', 'Divino', 'Indomable'];
        const randomIndex = Math.floor(Math.random() * prefixes.length);
        itemName = `${prefixes[randomIndex]} ${itemName}`;
    }

    // Crear item para la tienda
    const item = {
        id: `shop_${template.name.toLowerCase()}_${Date.now()}`,
        name: itemName,
        type: template.type,
        slot: template.slot,
        equipable: template.equipable,
        rarity: rarity.name,
        level: level,
        statBonus: statBonus,
        description: template.description,
        value: Math.floor((template.type === ITEM_TYPES.CONSUMABLE ? 20 : 50) * level * rarity.statMultiplier)
    };

    // Si es consumible, copiar el efecto
    if (template.effect) {
        item.effect = { ...template.effect };
        // Escalar el efecto con el nivel
        if (item.effect.value) {
            item.effect.value = Math.floor(item.effect.value * (1 + (level * 0.1)));
            if (item.effect.type === 'heal') {
                item.description = `Restaura ${item.effect.value} puntos de salud.`;
            }
        }
    }

    return item;
}