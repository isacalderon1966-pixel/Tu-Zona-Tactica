// ==================== PRODUCTOS INICIALES CON STOCK ====================

let products = [
    {
        id: 1,
        name: "Uniforme BDU Tactical",
        category: "indumentaria",
        price: 150.00,
        description: "Uniforme táctico profesional con múltiples bolsillos y refuerzos en zonas de desgaste.",
        image: "https://via.placeholder.com/300x300?text=Uniforme+BDU",
        materials: ["Ripstop 65/35", "Refuerzos Cordura®"],
        sizing: ["XS", "S", "M", "L", "XL", "XXL"],
        restricted: false,
        stock: 15
    },
    {
        id: 2,
        name: "Botas Tácticas Militares",
        category: "indumentaria",
        price: 200.00,
        description: "Botas de seguridad con suela reforzada, resistentes al agua y excelente tracción en terrenos difíciles.",
        image: "https://via.placeholder.com/300x300?text=Botas+Tacticas",
        materials: ["Cuero Premium", "Suela Vibram"],
        sizing: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
        restricted: false,
        stock: 2
    },
    {
        id: 3,
        name: "Chaleco Porta Placas Level III",
        category: "carga",
        price: 800.00,
        description: "Chaleco de protección certificado para placas balísticas nivel III. Diseño modular con múltiples puntos MOLLE.",
        image: "https://via.placeholder.com/300x300?text=Chaleco+Porta+Placas",
        materials: ["Gore-Tex®", "Cordura®", "Nylon 500D"],
        sizing: ["S", "M", "L", "XL", "XXL"],
        restricted: true,
        stock: 0
    },
    {
        id: 4,
        name: "Mochila Táctica 45L",
        category: "carga",
        price: 250.00,
        description: "Mochila de gran capacidad con sistema de carga MOLLE, compartimentos especializados y excelente ergonomía.",
        image: "https://via.placeholder.com/300x300?text=Mochila+Tactica",
        materials: ["Cordura® 500D", "Refuerzos Ripstop"],
        sizing: ["45L"],
        restricted: false,
        stock: 8
    },
    {
        id: 5,
        name: "Linterna Táctica LED 1000 Lúmenes",
        category: "optica",
        price: 120.00,
        description: "Linterna de alto rendimiento con 1000 lúmenes, resistente al agua y con múltiples modos de iluminación.",
        image: "https://via.placeholder.com/300x300?text=Linterna+Tactica",
        materials: ["Aluminio Anodizado"],
        sizing: ["Universal"],
        restricted: false,
        stock: 25
    },
    {
        id: 6,
        name: "Visor Nocturno PVS-14",
        category: "optica",
        price: 3500.00,
        description: "Dispositivo de visión nocturna de generación avanzada con campo de visión 40°.",
        image: "https://via.placeholder.com/300x300?text=Visor+Nocturno",
        materials: ["Componentes militares"],
        sizing: ["Universal"],
        restricted: true,
        stock: 1
    },
    {
        id: 7,
        name: "Fundas Holster Retráctiles",
        category: "accesorios",
        price: 80.00,
        description: "Fundas profesionales con retracción automática, compatibles con múltiples modelos de armas.",
        image: "https://via.placeholder.com/300x300?text=Holster",
        materials: ["Kydex®", "Polímero resistente"],
        sizing: ["Estándar"],
        restricted: true,
        stock: 0
    },
    {
        id: 8,
        name: "Guantes Tácticos Profesionales",
        category: "indumentaria",
        price: 65.00,
        description: "Guantes reforzados con protección de nudillos y palma antideslizante para máximo agarre.",
        image: "https://via.placeholder.com/300x300?text=Guantes+Tacticos",
        materials: ["Neopreno", "Cuero sintético"],
        sizing: ["XS", "S", "M", "L", "XL"],
        restricted: false,
        stock: 12
    },
    {
        id: 9,
        name: "Cinturón de Servicio Profesional",
        category: "carga",
        price: 95.00,
        description: "Cinturón de servicio con puntos de carga distribuida y sistema de cierre profesional.",
        image: "https://via.placeholder.com/300x300?text=Cinturon+Servicio",
        materials: ["Cordura®", "Nylon reforzado"],
        sizing: ["S", "M", "L", "XL"],
        restricted: false,
        stock: 6
    },
    {
        id: 10,
        name: "Casco Táctico FAST",
        category: "accesorios",
        price: 280.00,
        description: "Casco táctico ligero con sistema de carril para accesorios y protección balística nivel IIIA.",
        image: "https://via.placeholder.com/300x300?text=Casco+FAST",
        materials: ["Carbono", "Polímero compuesto"],
        sizing: ["Universal"],
        restricted: true,
        stock: 3
    }
];

// ==================== VARIABLES GLOBALES ====================

let currentCategory = 'all';
const modal = document.getElementById('productModal');
const closeBtn = document.querySelector('.close');

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async function() {
    await DB.init();
    loadProductsFromStorage();
    renderProducts(products);
    setupEventListeners();
    setActiveNavLink();
    updateStats();
    updateCartCount();
    loadSettingsFromStorage();
    loadLogoFromStorage();
});

// ==================== FUNCIONES DE ALMACENAMIENTO ====================

async function saveProductsToStorage() {
    if (DB.isCloud) {
        try { await DB.setProducts(products); } catch (err) { showNotification('Error al sincronizar: ' + err.message, 'error'); }
        return;
    }
    localStorage.setItem('tuzonatacticaProducts', JSON.stringify(products));
}

function loadProductsFromStorage() {
    // Modo nube: los productos vienen de Supabase; modo local: del navegador
    products = DB.getProducts().slice();
}

function loadTextsFromStorage() {
    const texts = {
        mainMessage: localStorage.getItem('mainMessage') || 'Tu Zona Táctica CCS: Equipamiento Táctico y Policial de Alta Calidad',
        welcomeText: localStorage.getItem('welcomeText') || 'Bienvenido a Tu Zona Táctica CCS, tu destino definitivo para encontrar artículos tácticos y policiales de la más alta calidad. Nos enorgullecemos de ofrecer una selección curada de productos, tanto de origen nacional como importados, garantizando que cada artículo cumpla con los más rigurosos estándares de rendimiento y durabilidad.',
        specializationText: localStorage.getItem('specializationText') || 'En Tu Zona Táctica CCS, entendemos las necesidades específicas de profesionales y entusiastas del equipamiento táctico. Nuestra gama de productos abarca desde equipamiento esencial para fuerzas de seguridad y personal militar, hasta artículos de alta gama para quienes buscan lo mejor en protección, utilidad y fiabilidad.',
        qualityText: localStorage.getItem('qualityText') || 'Nos dedicamos a proporcionarte lo mejor de ambos mundos. Colaboramos con fabricantes nacionales que destacan por su innovación y calidad, al mismo tiempo que importamos artículos de marcas reconocidas internacionalmente por su excelencia. Esta combinación asegura que siempre encontrarás opciones de vanguardia y probadas en el campo.',
        commitmentText: localStorage.getItem('commitmentText') || 'Tu satisfacción es nuestra prioridad. En Tu Zona Táctica CCS, cada producto es seleccionado pensando en su funcionalidad, resistencia y valor. Ya sea que necesites equipamiento para tu labor profesional o para actividades especializadas, puedes confiar en que encontrarás artículos que superarán tus expectativas.',
        ctaText: localStorage.getItem('ctaText') || 'Explora nuestra tienda online y descubre por qué Tu Zona Táctica CCS es el referente en artículos tácticos y policiales de calidad superior.',
        returnPolicyText: localStorage.getItem('returnPolicyText') || 'Si el equipo falla, no ajusta bien en el campo o presenta algún defecto, el proceso de cambio debe ser rápido y eficiente. Disponemos de 5 días hábiles para:'
    };
    
    if (document.getElementById('mainMessage')) {
        document.getElementById('mainMessage').textContent = texts.mainMessage;
        document.getElementById('welcomeText').textContent = texts.welcomeText;
        document.getElementById('specializationText').textContent = texts.specializationText;
        document.getElementById('qualityText').textContent = texts.qualityText;
        document.getElementById('commitmentText').textContent = texts.commitmentText;
        document.getElementById('ctaText').textContent = texts.ctaText;
        document.getElementById('returnPolicyText').textContent = texts.returnPolicyText;
    }
}

function loadLogoFromStorage() {
    // Prioridad: logo en la nube (Supabase) → localStorage → placeholder
    const cloudSettings = DB.getSettings();
    const logo = (DB.isCloud && cloudSettings && cloudSettings.logo)
        ? cloudSettings.logo
        : (localStorage.getItem('headerLogo') || 'https://via.placeholder.com/120x80?text=Tu+Zona+Tactica');
    const logoElements = document.querySelectorAll('#headerLogo, #currentLogo');
    logoElements.forEach(el => {
        if (el) el.src = logo;
    });
}

// ==================== CONFIGURACIÓN GENERAL (ADMIN) ====================

// Aplica la configuración guardada en el panel admin a la página pública:
// teléfono, email, ubicación y modo mantenimiento
function loadSettingsFromStorage() {
    // Preferir la configuración centralizada (nube); fallback: localStorage
    const cloudSettings = DB.getSettings();
    const phone = (cloudSettings && cloudSettings.phoneNumber) || localStorage.getItem('setting_phoneNumber');
    const email = (cloudSettings && cloudSettings.email) || localStorage.getItem('setting_email');
    const locationText = (cloudSettings && cloudSettings.location) || localStorage.getItem('setting_location');
    const maintenance = cloudSettings
        ? (cloudSettings.maintenanceMode === true || cloudSettings.maintenanceMode === 'true')
        : localStorage.getItem('setting_maintenanceMode') === 'true';

    // Teléfono (header y contacto)
    if (phone) {
        const telHref = 'tel:' + phone.replace(/[^+\d]/g, '');

        const headerPhone = document.getElementById('headerPhone');
        if (headerPhone) {
            headerPhone.href = telHref;
            const numberSpan = headerPhone.querySelector('.phone-number');
            if (numberSpan) numberSpan.textContent = phone;
        }

        const contactPhone = document.getElementById('contactPhone');
        if (contactPhone) {
            contactPhone.href = telHref;
            contactPhone.textContent = phone;
        }
    }

    // Email
    if (email) {
        const contactEmail = document.getElementById('contactEmail');
        if (contactEmail) {
            contactEmail.href = 'mailto:' + email;
            contactEmail.textContent = email;
        }
    }

    // Ubicación
    if (locationText) {
        const contactLocation = document.getElementById('contactLocation');
        if (contactLocation) contactLocation.textContent = locationText;
    }

    // Modo Mantenimiento: oculta la tienda y muestra el aviso
    if (maintenance) {
        ['inicio', 'beneficios', 'productos'].forEach(function(id) {
            const section = document.getElementById(id);
            if (section) section.style.display = 'none';
        });

        const banner = document.getElementById('maintenanceBanner');
        if (banner) {
            banner.style.display = 'block';
            if (phone) {
                const bannerPhone = banner.querySelector('a[href^="tel:"]');
                if (bannerPhone) {
                    bannerPhone.href = 'tel:' + phone.replace(/[^+\d]/g, '');
                    bannerPhone.textContent = phone;
                }
            }
        }
    }
}

// ==================== RENDERIZADO DE PRODUCTOS ====================

function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    
    if (!grid) return;
    
    if (productsToRender.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No hay productos en esta categoría.</div>';
        return;
    }

    grid.innerHTML = productsToRender.map(product => {
        const stockStatus = getStockStatus(product.stock);
        const stockBadge = getStockBadge(product.stock);
        const isOutOfStock = product.stock === 0;

        return `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.restricted ? '<span class="restricted-badge">⚠️ RESTRINGIDO</span>' : ''}
                ${stockBadge}
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryLabel(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-stock">
                    <span class="stock-label">Stock:</span>
                    <span class="stock-amount ${stockStatus}">${product.stock} unidades</span>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="product-btn ${isOutOfStock ? 'disabled' : ''}" 
                        onclick="event.stopPropagation(); viewProductDetails(${product.id})"
                        ${isOutOfStock ? 'disabled' : ''}>
                    ${isOutOfStock ? 'Agotado' : 'Ver Detalles'}
                </button>
            </div>
        </div>
    `}).join('');
}

function getStockStatus(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock < 3) return 'low-stock';
    return 'in-stock';
}

function getStockBadge(stock) {
    if (stock === 0) {
        return '<span class="stock-badge out-of-stock">🔴 AGOTADO</span>';
    } else if (stock < 3) {
        return '<span class="stock-badge low-stock">⚠️ POCAS UNIDADES</span>';
    }
    return '';
}

function getCategoryLabel(category) {
    const labels = {
        'indumentaria': '👕 Indumentaria y Calzado',
        'carga': '🎒 Equipamiento de Carga',
        'optica': '🔍 Óptica e Iluminación',
        'accesorios': '🛡️ Accesorios de Defensa',
        'restringido': '⚠️ Área Restringida'
    };
    return labels[category] || category;
}

// ==================== GESTIÓN DE CATEGORÍAS ====================

function setupEventListeners() {
    // Botones de categoría
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = this.dataset.category;
            
            if (currentCategory === 'all') {
                renderProducts(products);
            } else if (currentCategory === 'restringido') {
                renderProducts(products.filter(p => p.restricted));
            } else {
                renderProducts(products.filter(p => p.category === currentCategory));
            }
        });
    });

    // Modal close
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }

    // Click fuera del modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeProductModal();
        }
    });

    // Cargar textos desde storage
    loadTextsFromStorage();
    loadLogoFromStorage();
}

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.classList.contains('admin-link')) {
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// ==================== MODAL DE PRODUCTO ====================

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Llenar datos del modal
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalCategory').textContent = getCategoryLabel(product.category);
    document.getElementById('modalPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modalImage').src = product.image;

    // Especificaciones
    const specsList = document.getElementById('specsList');
    specsList.innerHTML = product.materials.map(material => `<li>✓ ${material}</li>`).join('');

    // Guía de tallas
    const sizingList = document.getElementById('sizingList');
    sizingList.innerHTML = product.sizing.map(size => `<li>📏 ${size}</li>`).join('');

    // Stock en modal (reutiliza el badge existente para no acumular elementos)
    const stockStatus = getStockStatus(product.stock);
    const specDiv = document.getElementById('modalSpecifications');
    let stockBadge = specDiv.parentNode.querySelector('.modal-stock');
    if (!stockBadge) {
        stockBadge = document.createElement('div');
        stockBadge.className = 'modal-stock';
        specDiv.parentNode.insertBefore(stockBadge, specDiv);
    }
    stockBadge.innerHTML = `
        <strong>Disponibilidad:</strong> <span class="stock-amount ${stockStatus}">${product.stock} en stock</span>
        <br><small style="color: #555;">🛡️ Garantía: ${getProductWarrantyLabel(product)}</small>
    `;

    // Verificación de identidad (OBLIGATORIA para productos restringidos)
    const restrictedWarning = document.getElementById('restrictedWarning');
    if (product.restricted) {
        restrictedWarning.style.display = 'block';
        updateRestrictedStatusInModal();
    } else {
        restrictedWarning.style.display = 'none';
    }

    // Botón agregar carrito
    const addBtn = document.getElementById('addToCartBtn');
    addBtn.onclick = function() {
        if (product.stock > 0) {
            addToCart(product);
        }
    };

    if (product.stock === 0) {
        addBtn.disabled = true;
        addBtn.textContent = 'Producto Agotado';
    } else {
        addBtn.disabled = false;
        addBtn.textContent = 'Agregar al Carrito';
    }

    modal.classList.add('show');
}

function closeProductModal() {
    modal.classList.remove('show');
}

function viewProductDetails(productId) {
    openProductModal(productId);
}

function addToCart(product) {
    if (product.stock <= 0) {
        showNotification('Este producto está agotado', 'error');
        return;
    }

    // Productos restringidos: verificación de identidad OBLIGATORIA
    if (product.restricted && !isIdentityVerified()) {
        showNotification('⚠️ Producto restringido: primero debes verificar tu identidad', 'error');
        openVerificationModal();
        return;
    }

    // NOTA: el stock se descuenta al CONFIRMAR el pedido (confirmOrder),
    // no al agregar al carrito, para no perder unidades si no se compra

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Si el producto ya está en el carrito, sumar cantidad en vez de duplicar
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        if (existing.quantity >= product.stock) {
            showNotification(`No hay más stock disponible de "${product.name}"`, 'error');
            return;
        }
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar visualización
    renderProducts(currentCategory === 'all' ? products : 
                   currentCategory === 'restringido' ? products.filter(p => p.restricted) :
                   products.filter(p => p.category === currentCategory));
    updateCartCount();
    
    showNotification(`${product.name} agregado al carrito`, 'success');
    
    // Broadcast para actualizar el admin
    if (window.opener && !window.opener.closed) {
        window.opener.location.reload();
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
    }
}

function updateStats() {
    const totalProducts = products.length;
    const statsEl = document.getElementById('statsProducts');
    if (statsEl) {
        statsEl.textContent = totalProducts;
    }
}

// Refresca la cuadrícula respetando el filtro de categoría activo
function refreshProductGrid() {
    renderProducts(
        currentCategory === 'all' ? products :
        currentCategory === 'restringido' ? products.filter(p => p.restricted) :
        products.filter(p => p.category === currentCategory)
    );
}

// ==================== ESTADO DE VERIFICACIÓN DE IDENTIDAD ====================

// true si el administrador ya aprobó la verificación de identidad
function isIdentityVerified() {
    // MODO NUBE: hay identidad aprobada si existe una verificación aprobada
    // en la nube con MI nombre completo (guardado al enviar la solicitud)
    if (DB.isCloud) {
        const myName = (localStorage.getItem('myVerificationName') || '').trim().toLowerCase();
        if (!myName) return false;
        return DB.getVerifications().some(function (v) {
            return v.status === 'approved' && (v.fullName || v.name || '').trim().toLowerCase() === myName;
        });
    }
    return localStorage.getItem('identityVerified') === 'true';
}

// Actualiza el estado de verificación mostrado en el modal de producto abierto
function updateRestrictedStatusInModal() {
    const statusMsg = document.getElementById('restrictedVerifyStatus');
    const warning = document.getElementById('restrictedWarning');
    if (!statusMsg || !warning || warning.style.display === 'none') return;

    if (isIdentityVerified()) {
        const verifiedName = localStorage.getItem('identityVerifiedName') || '';
        statusMsg.innerHTML = '<span style="color: #28a745; font-weight: 700;">✓ Identidad verificada' + (verifiedName ? ' (' + verifiedName + ')' : '') + ' — puedes agregar este producto</span>';
    } else {
        statusMsg.innerHTML = '<span style="color: #dc3545; font-weight: 700;">✕ Identidad NO verificada — hazlo antes de agregar este producto</span>';
    }
}

// ==================== GARANTÍAS ====================

// Etiqueta legible de la garantía de un producto (compatibilidad: 5 días)
function getProductWarrantyLabel(product) {
    if (!product || !product.warrantyValue || product.warrantyValue <= 0) return '5 días';
    if (product.warrantyUnit === 'horas') {
        return product.warrantyValue + (product.warrantyValue === 1 ? ' hora' : ' horas');
    }
    return product.warrantyValue + (product.warrantyValue === 1 ? ' día' : ' días');
}

// Calcula el estado de la garantía de un envío para la consulta del cliente
function getPublicWarrantyInfo(shipping) {
    if (!shipping.deliveredAt) return null;

    const totalMs = (shipping.warrantyHours && shipping.warrantyHours > 0)
        ? shipping.warrantyHours * 3600000
        : (5 * 24 * 3600000);
    const useDays = totalMs >= 86400000;
    const totalDays = Math.round(totalMs / 86400000);

    const deliveredAt = new Date(shipping.deliveredAt);
    const deadline = deliveredAt.getTime() + totalMs;
    const remaining = deadline - Date.now();
    const expired = remaining <= 0;

    const r = Math.max(0, remaining);
    const days = Math.floor(r / 86400000);
    const hours = Math.floor((r % 86400000) / 3600000);
    const minutes = Math.floor((r % 3600000) / 60000);

    let remainingText;
    if (expired) {
        remainingText = 'Garantía finalizada';
    } else if (useDays) {
        remainingText = days + 'd ' + hours + 'h ' + minutes + 'm restantes';
    } else {
        remainingText = hours + 'h ' + minutes + 'm restantes';
    }

    return {
        status: shipping.status,
        expired: expired,
        totalMs: totalMs,
        totalLabel: useDays ? totalDays + (totalDays === 1 ? ' día' : ' días') : (shipping.warrantyHours + ' horas'),
        useDays: useDays,
        day: useDays ? Math.min(totalDays, Math.floor((Date.now() - deliveredAt.getTime()) / 86400000) + 1) : 0,
        progress: Math.max(0, Math.min(100, ((Date.now() - deliveredAt.getTime()) / totalMs) * 100)),
        deliveredLabel: deliveredAt.toLocaleString('es-VE'),
        deadlineLabel: new Date(deadline).toLocaleString('es-VE'),
        remainingText: remainingText
    };
}

// Consulta de garantía del cliente (página pública)
// Usa los MISMOS campos estructurados del pedido: debe coincidir nombre completo + teléfono
function searchWarranty() {
    const results = document.getElementById('warrantyResults');
    if (!results) return;

    const firstNameEl = document.getElementById('warrantyFirstName');
    const secondNameEl = document.getElementById('warrantySecondName');
    const firstLastEl = document.getElementById('warrantyFirstLastname');
    const secondLastEl = document.getElementById('warrantySecondLastname');
    const phoneEl = document.getElementById('warrantyPhone');

    const firstName = firstNameEl ? firstNameEl.value.trim() : '';
    const secondName = secondNameEl ? secondNameEl.value.trim() : '';
    const firstLastname = firstLastEl ? firstLastEl.value.trim() : '';
    const secondLastname = secondLastEl ? secondLastEl.value.trim() : '';
    const customerPhone = phoneEl ? phoneEl.value.trim() : '';

    // Mismas validaciones que al confirmar el pedido
    if (!firstName) {
        showNotification('Ingresa tu primer nombre para consultar', 'error');
        if (firstNameEl) firstNameEl.focus();
        return;
    }
    if (!firstLastname) {
        showNotification('Ingresa tu primer apellido para consultar', 'error');
        if (firstLastEl) firstLastEl.focus();
        return;
    }
    if (!customerPhone) {
        showNotification('Ingresa tu teléfono para consultar', 'error');
        if (phoneEl) phoneEl.focus();
        return;
    }

    // Coincidencia EXACTA: nombre completo (mismo formato del pedido) + teléfono
    const searchName = [firstName, secondName, firstLastname, secondLastname].filter(Boolean).join(' ').toLowerCase();
    const searchDigits = customerPhone.replace(/\D/g, '');

    const shippings = DB.getShippings();
    const mine = shippings.filter(s => {
        const n = (s.customerName || '').trim().toLowerCase();
        const p = (s.customerPhone || '').replace(/\D/g, '');
        return n === searchName && p === searchDigits;
    });

    if (mine.length === 0) {
        results.innerHTML = `
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0;">📭 No encontramos envíos con esos datos exactos.<br><small>Ingresa tu nombre, apellidos y teléfono <strong>tal cual</strong> los escribiste al confirmar tu pedido.</small></p>
            </div>
        `;
        return;
    }

    results.innerHTML = '<h3 style="margin-bottom: 15px;">📦 Tus envíos (' + mine.length + ')</h3>' + mine.map(s => {
        const productsText = (s.products || []).map(p => p.name + ' x' + p.quantity).join(' • ');

        if (s.status === 'programado') {
            return `
            <div style="border: 1px solid #ddd; border-left: 5px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 15px; background-color: #fff;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <strong>👤 ${s.customerName}</strong> <span class="badge badge-warning">Programado</span>
                </div>
                <p style="margin: 4px 0;">📞 Teléfono: ${s.customerPhone || '—'}</p>
                <p style="margin: 8px 0 4px;">🛍️ <strong>Productos:</strong> ${productsText}</p>
                <p style="margin: 4px 0;">📅 Tu envío está programado para: <strong>${s.shippingDate} — ${s.shippingTime}</strong></p>
                <small style="color: #999;">🛡️ La garantía de devolución empieza cuando tu envío sea entregado.</small>
            </div>`;
        }

        const info = getPublicWarrantyInfo(s);
        if (!info) {
            return `
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <strong>👤 ${s.customerName}</strong>
                <p style="margin: 8px 0 4px;">🛍️ <strong>Productos:</strong> ${productsText}</p>
            </div>`;
        }

        const isApproved = s.status === 'aprobado';
        const barColor = (isApproved || info.expired) ? '#6c757d' : '#28a745';

        // Estado de las solicitudes de devolución de este envío
        const returns = DB.getReturns();
        const pendingReq = returns.find(r => r.shippingId === s.id && r.status === 'pendiente');
        const approvedReq = returns.find(r => r.shippingId === s.id && r.status === 'aprobada');
        const rejectedReq = returns.find(r => r.shippingId === s.id && r.status === 'rechazada');

        const statusHtml = isApproved
            ? '<span class="badge badge-success">Entregado y Aprobado</span>'
            : '<span class="badge" style="background-color: #17a2b8; color: #fff;">Entregado</span>';

        const warrantyText = isApproved
            ? '🛡️ Tu garantía de ' + info.totalLabel + ' finalizó. Envío Entregado y Aprobado.'
            : '🛡️ Garantía de ' + info.totalLabel + (info.useDays ? ': Día ' + info.day + ' de ' + Math.round(info.totalMs / 86400000) : '') + ' — ' + info.remainingText;

        return `
        <div style="border: 1px solid #ddd; border-left: 5px solid ${barColor}; border-radius: 8px; padding: 15px; margin-bottom: 15px; background-color: #fff;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <strong>👤 ${s.customerName}</strong> ${statusHtml}
            </div>
            <p style="margin: 4px 0;">📞 Teléfono: ${s.customerPhone || '—'}</p>
            <p style="margin: 8px 0 4px;">🛍️ <strong>Productos:</strong> ${productsText}</p>
            <p style="margin: 4px 0;">📬 Entregado: ${info.deliveredLabel} • ⏰ Límite de devolución: ${info.deadlineLabel}</p>
            <p style="margin: 4px 0; font-weight: 700; color: ${isApproved ? '#6c757d' : '#28a745'};">${warrantyText}</p>
            ${!isApproved ? `
            <div style="background-color: #e9ecef; border-radius: 20px; height: 12px; margin-top: 6px; overflow: hidden;">
                <div style="width: ${info.progress}%; height: 100%; background-color: ${barColor}; border-radius: 20px;"></div>
            </div>` : ''}
            ${pendingReq ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 10px; margin-top: 10px;">
                <strong>↩️ Solicitud de devolución PENDIENTE</strong><br>
                <small>El administrador te contactará al ${s.customerPhone || 'tu teléfono'}.<br>Productos: ${pendingReq.products.map(p => p.name + ' x' + p.quantity).join(', ')}</small>
            </div>` : ''}
            ${approvedReq ? `
            <div style="background-color: #d4edda; border: 1px solid #28a745; border-radius: 6px; padding: 10px; margin-top: 10px;">
                <strong>✅ Tu devolución fue APROBADA</strong>${approvedReq.reviewedAt ? ' (' + approvedReq.reviewedAt + ')' : ''}<br>
                <small>Coordina la entrega del producto con la empresa.</small>
            </div>` : ''}
            ${rejectedReq ? `
            <div style="background-color: #f8d7da; border: 1px solid #dc3545; border-radius: 6px; padding: 10px; margin-top: 10px;">
                <strong>❌ Tu solicitud de devolución fue RECHAZADA</strong>${rejectedReq.reviewedAt ? ' (' + rejectedReq.reviewedAt + ')' : ''}${rejectedReq.reviewNote ? '<br><small>Motivo del admin: ' + rejectedReq.reviewNote + '</small>' : ''}
            </div>` : ''}
            ${(!isApproved && !info.expired && !pendingReq) ? `
            <button class="btn btn-danger" style="width: 100%; margin-top: 10px; padding: 10px;" onclick="toggleReturnForm(${s.id})">📦 Solicitar Devolución de Producto</button>
            <div id="returnForm-${s.id}" style="display: none; margin-top: 10px; padding: 12px; background-color: #f9f9f9; border-radius: 6px;">
                <strong>Selecciona los productos a devolver:</strong>
                ${(s.products || []).map((p, i) => `
                <label style="display: block; margin-top: 6px; cursor: pointer;">
                    <input type="checkbox" class="return-check-${s.id}" value="${i}"> ${p.name} x${p.quantity}
                </label>`).join('')}
                <textarea id="returnReason-${s.id}" placeholder="Motivo (opcional): describe el problema del equipo" style="width: 100%; margin-top: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; min-height: 60px;"></textarea>
                <button class="btn btn-primary" style="margin-top: 8px; width: 100%; padding: 10px;" onclick="submitReturnRequest(${s.id})">📤 Enviar Solicitud de Devolución</button>
            </div>` : ''}
        </div>`;
    }).join('');
}

// Muestra/oculta el formulario de solicitud de devolución de una tarjeta
function toggleReturnForm(shippingId) {
    const form = document.getElementById('returnForm-' + shippingId);
    if (form) form.style.display = (form.style.display === 'none') ? 'block' : 'none';
}

// Envía la solicitud de devolución al administrador
async function submitReturnRequest(shippingId) {
    const shippings = DB.getShippings();
    const shipping = shippings.find(s => s.id === shippingId);
    if (!shipping) return;

    // Debe seguir entregado y en garantía activa
    if (shipping.status !== 'entregado') {
        showNotification('Este envío ya no está en período de garantía activa', 'error');
        return;
    }

    // Evita solicitudes pendientes duplicadas para el mismo envío
    const returns = DB.getReturns();
    if (returns.some(r => r.shippingId === shippingId && r.status === 'pendiente')) {
        showNotification('Ya tienes una solicitud de devolución pendiente para este envío', 'error');
        return;
    }

    // Productos seleccionados
    const checks = document.querySelectorAll('.return-check-' + shippingId + ':checked');
    if (checks.length === 0) {
        showNotification('Selecciona al menos un producto a devolver', 'error');
        return;
    }

    const selectedProducts = Array.from(checks).map(cb => shipping.products[parseInt(cb.value, 10)]).filter(Boolean);
    const reasonEl = document.getElementById('returnReason-' + shippingId);
    const reason = reasonEl ? reasonEl.value.trim() : '';

    const request = {
        id: Date.now(),
        shippingId: shipping.id,
        customerName: shipping.customerName,
        customerPhone: shipping.customerPhone || '',
        products: selectedProducts,
        reason: reason,
        status: 'pendiente',
        requestedAt: new Date().toLocaleString('es-VE'),
        reviewedAt: null,
        reviewNote: ''
    };

    const res = await DB.addReturn(request);
    if (!res.ok) {
        showNotification('Error al enviar la solicitud: ' + res.error, 'error');
        return;
    }

    // Cierra el formulario y refresca la consulta para mostrar el estado "pendiente"
    const form = document.getElementById('returnForm-' + shippingId);
    if (form) form.style.display = 'none';
    searchWarranty();

    showNotification('✅ Solicitud enviada. Se espera confirmación del administrador, quien te contactará por tu teléfono.', 'success');
}

// Sincronización en vivo entre pestañas (tienda ↔ admin):
// si el admin cambia el stock, la tienda se actualiza al instante
window.addEventListener('storage', function(e) {
    if (e.key === 'tuzonatacticaProducts') {
        products = JSON.parse(e.newValue) || [];
        refreshProductGrid();
        updateStats();
    }
    if (e.key === 'identityVerified') {
        refreshProductGrid();
        updateRestrictedStatusInModal();
    }
});

// Sincronización en vivo (modo nube): cambios en Supabase → refrescar la tienda
DB.onChange(function(key) {
    if (key === 'products') {
        products = DB.getProducts().slice();
        refreshProductGrid();
        updateStats();
    }
    if (key === 'identityVerified' || key === 'verifications') {
        refreshProductGrid();
        updateRestrictedStatusInModal();
    }
    if (key === 'shippings') {
        const res = document.getElementById('warrantyResults');
        if (res && res.innerHTML.trim() !== '') searchWarranty();
    }
    if (key === 'settings') {
        loadSettingsFromStorage();
        loadLogoFromStorage();
    }
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#dc3545' : '#28a745';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== MODAL DE CARRITO ====================

function openCartModal() {
    // Cierra cualquier otro modal abierto para que el carrito siempre se muestre
    const productModalEl = document.getElementById('productModal');
    const verificationModalEl = document.getElementById('verificationModal');
    if (productModalEl) productModalEl.classList.remove('show');
    if (verificationModalEl) verificationModalEl.classList.remove('show');

    renderCart();
    document.getElementById('cartModal').classList.add('show');
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('show');
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsDiv = document.getElementById('cartItems');
    if (!cartItemsDiv) return;

    const totalEl = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 30px;">Tu carrito está vacío</p>';
        // Importante: NO reemplazar cartSummary (destruiría el span #cartTotal y rompería el carrito)
        if (totalEl) {
            totalEl.textContent = '0.00';
        } else {
            const summaryEl = document.getElementById('cartSummary');
            if (summaryEl) summaryEl.innerHTML = '<div style="font-size: 18px; font-weight: 700; color: #ff6b35;">Total: $0.00</div>';
        }
        return;
    }

    let total = 0;
    cartItemsDiv.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee;">
                <div>
                    <strong>${item.name}</strong><br>
                    <small style="color: #666;">$${item.price.toFixed(2)} x ${item.quantity}</small>
                </div>
                <div style="text-align: right;">
                    <strong>$${(item.price * item.quantity).toFixed(2)}</strong><br>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="removeFromCart(${index})">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');

    if (totalEl) {
        totalEl.textContent = total.toFixed(2);
    } else {
        const summaryEl = document.getElementById('cartSummary');
        if (summaryEl) summaryEl.innerHTML = '<div style="font-size: 18px; font-weight: 700; color: #ff6b35;">Total: $' + total.toFixed(2) + '</div>';
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    showNotification('Producto eliminado del carrito', 'success');
}

// ==================== CONFIRMAR PEDIDO (REGISTRA CARRITO PARA EL ADMIN) ====================

let lastOrderConfirmedAt = 0;

async function confirmOrder() {
    // Evita pedidos duplicados por doble clic
    if (Date.now() - lastOrderConfirmedAt < 2000) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }

    const firstNameEl = document.getElementById('cartFirstName');
    const secondNameEl = document.getElementById('cartSecondName');
    const firstLastEl = document.getElementById('cartFirstLastname');
    const secondLastEl = document.getElementById('cartSecondLastname');
    const phoneEl = document.getElementById('cartCustomerPhone');

    const firstName = firstNameEl ? firstNameEl.value.trim() : '';
    const secondName = secondNameEl ? secondNameEl.value.trim() : '';
    const firstLastname = firstLastEl ? firstLastEl.value.trim() : '';
    const secondLastname = secondLastEl ? secondLastEl.value.trim() : '';
    const customerPhone = phoneEl ? phoneEl.value.trim() : '';

    // Primer nombre y primer apellido OBLIGATORIOS; segundos opcionales
    if (!firstName) {
        showNotification('Ingresa tu primer nombre para confirmar el pedido', 'error');
        if (firstNameEl) firstNameEl.focus();
        return;
    }
    if (!firstLastname) {
        showNotification('Ingresa tu primer apellido para confirmar el pedido', 'error');
        if (firstLastEl) firstLastEl.focus();
        return;
    }
    if (!customerPhone) {
        showNotification('Ingresa tu teléfono: la empresa te llamará para coordinar la entrega', 'error');
        if (phoneEl) phoneEl.focus();
        return;
    }
    if (customerPhone.replace(/\D/g, '').length < 7) {
        showNotification('El teléfono parece incompleto (mínimo 7 dígitos)', 'error');
        if (phoneEl) phoneEl.focus();
        return;
    }

    // Nombre completo: PrimerNombre [SegundoNombre] PrimerApellido [SegundoApellido]
    const customerName = [firstName, secondName, firstLastname, secondLastname].filter(Boolean).join(' ');

    // Los productos restringidos exigen identidad verificada y aprobada
    const checkProducts = DB.getProducts();
    const hasRestricted = cart.some(item => {
        const p = checkProducts.find(pp => pp.id === item.id);
        return p && p.restricted;
    });
    if (hasRestricted && !isIdentityVerified()) {
        showNotification('Tu carrito contiene productos restringidos: verifica tu identidad primero', 'error');
        closeCartModal();
        openVerificationModal();
        return;
    }

    // Validar disponibilidad contra el stock actual antes de confirmar
    const storedProducts = DB.isCloud ? DB.getProducts().slice() : (JSON.parse(localStorage.getItem('tuzonatacticaProducts')) || products);
    for (const item of cart) {
        const product = storedProducts.find(p => p.id === item.id);
        if (!product) {
            showNotification(`"${item.name}" ya no está disponible`, 'error');
            return;
        }
        if (product.stock < item.quantity) {
            showNotification(`Stock insuficiente de "${item.name}" (disponible: ${product.stock})`, 'error');
            return;
        }
    }

    if (DB.isCloud) {
        // MODO NUBE: el pedido se registra en Supabase y el ADMIN descuenta
        // el stock al programar el envío. Aquí solo se valida.
        products = storedProducts;
    } else {
        // MODO LOCAL: el stock se descuenta AQUÍ (al confirmar el pedido)
        cart.forEach(item => {
            const product = storedProducts.find(p => p.id === item.id);
            if (product) product.stock -= item.quantity;
        });
        products = storedProducts;
        saveProductsToStorage();
        refreshProductGrid();
    }

    // Registrar el pedido en la lista de carritos pendientes del administrador
    const order = {
        id: Date.now(),
        customerName: customerName,
        customerPhone: customerPhone,
        products: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        createdAt: new Date().toLocaleString('es-VE'),
        createdAtIso: new Date().toISOString()
    };

    const res = await DB.addOrder(order);
    if (!res.ok) {
        showNotification('Error al enviar el pedido: ' + res.error, 'error');
        return;
    }

    lastOrderConfirmedAt = Date.now();

    // Vaciar el carrito de trabajo y los datos del cliente
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
    renderCart();
    [firstNameEl, secondNameEl, firstLastEl, secondLastEl, phoneEl].forEach(function(el) {
        if (el) el.value = '';
    });
    closeCartModal();

    showNotification(`¡Pedido confirmado, ${customerName}! El administrador revisará tu carrito para programar el envío.`, 'success');

    // Si el panel admin está abierto, refrescarlo
    if (window.opener && !window.opener.closed) {
        window.opener.location.reload();
    }
}

// ==================== VERIFICACIÓN DE IDENTIDAD ====================

function openVerificationModal() {
    document.getElementById('verificationModal').classList.add('show');
    document.getElementById('verificationForm').reset();

    // Limpiar el estado de la imagen de credencial
    verifyCredentialImageData = null;
    const imgInput = document.getElementById('verifyCredentialImage');
    const imgName = document.getElementById('verifyCredentialImageName');
    const imgPreview = document.getElementById('verifyCredentialImagePreview');
    if (imgInput) imgInput.value = '';
    if (imgName) imgName.textContent = '';
    if (imgPreview) { imgPreview.style.display = 'none'; imgPreview.src = ''; }

    const form = document.getElementById('verificationForm');
    const status = document.getElementById('verificationStatus');

    // Si la identidad ya fue aprobada por el admin, mostrar el estado aprobado
    if (isIdentityVerified()) {
        const verifiedName = localStorage.getItem('identityVerifiedName') || '';
        if (status) {
            status.innerHTML = `
                <p style="font-size: 20px; color: #28a745; font-weight: 700;">✓ Identidad Verificada y Aprobada</p>
                <p style="color: #666;">${verifiedName ? 'A nombre de: <strong>' + verifiedName + '</strong><br>' : ''}Ya puedes agregar productos del Área Restringida a tu carrito.</p>
            `;
            status.style.display = 'block';
        }
        if (form) form.style.display = 'none';
        return;
    }

    if (form) form.style.display = 'block';
    if (status) status.style.display = 'none';
}

function closeVerificationModal() {
    document.getElementById('verificationModal').classList.remove('show');
}

// ==================== IMAGEN DE CREDENCIAL (VERIFICACIÓN) ====================

let verifyCredentialImageData = null;

// Convierte una imagen en Base64 comprimiéndola (máx. 800px) para el localStorage
function compressImageFilePublic(file, maxWidth, quality) {
    return new Promise(function(resolve, reject) {
        if (!file || !file.type || !file.type.startsWith('image/')) {
            reject(new Error('El archivo no es una imagen válida (use JPG, PNG o WEBP).'));
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            reject(new Error('La imagen es demasiado pesada (máximo 15MB).'));
            return;
        }

        const reader = new FileReader();
        reader.onerror = function() {
            reject(new Error('No se pudo leer el archivo.'));
        };
        reader.onload = function(e) {
            const img = new Image();
            img.onerror = function() {
                reject(new Error('La imagen no es válida o está dañada.'));
            };
            img.onload = function() {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Vista previa + compresión de la credencial al seleccionarla
const verifyCredentialImageInput = document.getElementById('verifyCredentialImage');
if (verifyCredentialImageInput) {
    verifyCredentialImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const nameSpan = document.getElementById('verifyCredentialImageName');
        const preview = document.getElementById('verifyCredentialImagePreview');
        if (nameSpan) nameSpan.textContent = '⏳ Procesando imagen...';
        if (preview) preview.style.display = 'none';

        compressImageFilePublic(file, 800, 0.8).then(function(dataUrl) {
            verifyCredentialImageData = dataUrl;
            if (nameSpan) nameSpan.textContent = '✓ ' + file.name;
            if (preview) { preview.src = dataUrl; preview.style.display = 'block'; }
        }).catch(function(err) {
            verifyCredentialImageData = null;
            if (nameSpan) nameSpan.textContent = '';
            if (preview) preview.style.display = 'none';
            event.target.value = '';
            showNotification(err.message, 'error');
        });
    });
}

// Manejo del formulario de verificación
document.addEventListener('DOMContentLoaded', function() {
    const verificationForm = document.getElementById('verificationForm');
    if (verificationForm) {
        verificationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const firstName = document.getElementById('verifyFirstName').value.trim();
            const secondName = document.getElementById('verifySecondName').value.trim();
            const firstLastname = document.getElementById('verifyFirstLastname').value.trim();
            const secondLastname = document.getElementById('verifySecondLastname').value.trim();
            const policeBody = document.getElementById('verifyPoliceBody').value.trim();

            // Nombre completo: mismo formato que el pedido
            const fullName = [firstName, secondName, firstLastname, secondLastname].filter(Boolean).join(' ');

            if (!fullName) {
                showNotification('Completa tu primer nombre y primer apellido', 'error');
                return;
            }
            if (!policeBody) {
                showNotification('Ingresa el cuerpo policial al que perteneces', 'error');
                return;
            }
            if (!verifyCredentialImageData) {
                showNotification('📸 Debes subir la foto de tu credencial policial (obligatorio)', 'error');
                return;
            }

            const verification = {
                id: Date.now(),
                name: fullName,
                fullName: fullName,
                firstName: firstName,
                secondName: secondName,
                firstLastname: firstLastname,
                secondLastname: secondLastname,
                identity: document.getElementById('verifyIdentity').value,
                policeBody: policeBody,
                credential: document.getElementById('verifyCredential').value,
                credentialNumber: document.getElementById('verifyCredentialNumber').value,
                email: document.getElementById('verifyEmail').value,
                credentialImage: verifyCredentialImageData,
                status: 'pending', // pending, approved, rejected
                submittedAt: new Date().toLocaleString('es-VE')
            };

            // Guardar verificación (y recordar mi nombre para el estado de aprobación)
            if (DB.isCloud) localStorage.setItem('myVerificationName', fullName);
            const res = await DB.addVerification(verification);
            if (!res.ok) {
                showNotification('Error al enviar la verificación: ' + res.error, 'error');
                return;
            }

            // Mostrar estado de procesamiento
            document.getElementById('verificationForm').style.display = 'none';
            document.getElementById('verificationStatus').style.display = 'block';

            showNotification('Solicitud de verificación enviada. El administrador la revisará pronto.', 'success');

            // Cerrar modal en 3 segundos
            setTimeout(() => {
                closeVerificationModal();
            }, 3000);
        });
    }
});

// Hacer que los clicks fuera del modal lo cierren
window.addEventListener('click', function(event) {
    const cartModal = document.getElementById('cartModal');
    const verificationModal = document.getElementById('verificationModal');
    
    if (event.target === cartModal) {
        closeCartModal();
    }
    if (event.target === verificationModal) {
        closeVerificationModal();
    }
});
