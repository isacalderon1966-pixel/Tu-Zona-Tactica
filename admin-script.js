// ==================== ADMINISTRACIÓN ====================

let adminProducts = [];
let editingProductId = null;
const adminDefaultUser = 'admin';
const adminDefaultPassword = 'admin123';

// Devuelve la contraseña actual del admin: la guardada en localStorage
// (sección Cambiar Contraseña) o la por defecto si aún no se ha cambiado
function getAdminPassword() {
    try {
        return localStorage.getItem('adminPassword') || adminDefaultPassword;
    } catch (err) {
        return adminDefaultPassword;
    }
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', function() {
    checkAdminLogin();
    loadAdminData();
    setupAdminEventListeners();
});

// ==================== AUTENTICACIÓN ====================

function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');

    if (isLoggedIn) {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'flex';
        document.getElementById('adminWelcome').textContent = `Bienvenido, ${sessionStorage.getItem('adminUser')}`;
    } else {
        loginScreen.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPassword').value;
    const alertDiv = document.getElementById('loginAlert');

    // Verificación simple (en producción, usar backend seguro)
    if (user === adminDefaultUser && password === getAdminPassword()) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', user);
        checkAdminLogin();
        alertDiv.innerHTML = '';
    } else {
        alertDiv.innerHTML = '<div class="alert alert-danger">❌ Usuario o contraseña incorrectos</div>';
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUser');
    location.reload();
});

// ==================== NAVEGACIÓN DEL PANEL ====================

function setupAdminEventListeners() {
    // Menu links
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.dataset.section;
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            document.getElementById(section).classList.add('active');
        });
    });

    // Formularios
    setupTextosForm();
    setupProductsForm();
    setupVerificationsPanel();
    setupShippingForm();
    setupLogoForm();
    setupSettingsForm();
    setupPasswordForm();

    // Actualizar dashboard
    updateDashboard();
    updateLastUpdate();
}

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleString('es-VE', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('lastUpdate').textContent = `Última actualización: ${timeString}`;
}

// ==================== DASHBOARD ====================

function updateDashboard() {
    adminProducts = JSON.parse(localStorage.getItem('tuzonatacticaProducts')) || [];
    const total = adminProducts.length;
    const restricted = adminProducts.filter(p => p.restricted).length;

    document.getElementById('totalProducts').textContent = total;
    document.getElementById('restrictedProducts').textContent = restricted;
}

// ==================== GESTIÓN DE TEXTOS ====================

function setupTextosForm() {
    const form = document.getElementById('textosForm');
    if (!form) return;

    // Cargar textos guardados
    const textos = {
        mainMessage: 'Tu Zona Táctica CCS: Equipamiento Táctico y Policial de Alta Calidad',
        welcomeText: 'Bienvenido a Tu Zona Táctica CCS...',
        specializationText: 'En Tu Zona Táctica CCS...',
        qualityText: 'Nos dedicamos a proporcionarte...',
        commitmentText: 'Tu satisfacción es nuestra prioridad...',
        ctaText: 'Explora nuestra tienda online...',
        returnPolicyText: 'Si el equipo falla...'
    };

    Object.keys(textos).forEach(key => {
        const stored = localStorage.getItem(key);
        if (stored && document.getElementById(key)) {
            document.getElementById(key).value = stored;
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        Object.keys(textos).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                localStorage.setItem(key, element.value);
            }
        });

        showAdminNotification('Textos actualizados correctamente');
        
        // Actualizar en la página pública
        if (window.opener && !window.opener.closed) {
            window.opener.location.reload();
        }
    });
}

// ==================== UTILIDADES DE IMÁGENES ====================

// Convierte un archivo de imagen del computador en Base64 (dataURL),
// redimensionándolo y comprimiéndolo para no llenar el localStorage.
function compressImageFile(file, maxWidth, quality, keepPng) {
    return new Promise(function(resolve, reject) {
        if (!file || !file.type || !file.type.startsWith('image/')) {
            reject(new Error('El archivo seleccionado no es una imagen válida (use JPG, PNG, GIF o WEBP).'));
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            reject(new Error('La imagen es demasiado pesada (máximo 15MB). Comprímala antes de subirla.'));
            return;
        }

        const reader = new FileReader();
        reader.onerror = function() {
            reject(new Error('No se pudo leer el archivo seleccionado.'));
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
                const usePng = keepPng && file.type === 'image/png';
                if (!usePng) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL(usePng ? 'image/png' : 'image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function setFileNameLabel(spanId, text) {
    const span = document.getElementById(spanId);
    if (span) span.textContent = text;
}

// ==================== GESTIÓN DE PRODUCTOS ====================

let currentProductImage = null;

function setupProductsForm() {
    const form = document.getElementById('productForm');
    const addBtn = document.getElementById('addProductBtn');
    const cancelBtn = document.getElementById('cancelProductBtn');
    const imageFileInput = document.getElementById('productImageFile');

    if (!addBtn) return;

    // Manejo de carga de imagen
    if (imageFileInput) {
        imageFileInput.addEventListener('change', handleImageUpload);
    }

    // Manejo de URL de imagen
    const imageUrlInput = document.getElementById('productImageUrl');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', function(e) {
            if (this.value) {
                currentProductImage = this.value;
                const previewContainer = document.getElementById('imagePreviewContainer');
                previewContainer.innerHTML = `
                    <div style="margin-top: 10px;">
                        <strong>✓ URL de Imagen:</strong><br>
                        <img src="${this.value}" class="image-preview" style="max-width: 200px; max-height: 200px; margin-top: 8px;" onerror="this.parentElement.innerHTML='<p style=\"color: red; font-size: 12px;\">❌ No se pudo cargar la imagen</p>'">
                    </div>
                `;
            }
        });
    }

    addBtn.addEventListener('click', function() {
        editingProductId = null;
        currentProductImage = null;
        document.getElementById('formTitle').textContent = 'Agregar Nuevo Producto';
        form.style.display = 'block';
        form.reset();
        setFileNameLabel('productImageFileName', '');
        document.getElementById('imagePreviewContainer').innerHTML = '';
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            form.style.display = 'none';
            form.reset();
            editingProductId = null;
            currentProductImage = null;
            setFileNameLabel('productImageFileName', '');
            document.getElementById('imagePreviewContainer').innerHTML = '';
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Sincronizar antes de guardar para no perder cambios de la tienda
            syncAdminProducts();

            const product = {
                id: editingProductId || Date.now(),
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                price: parseFloat(document.getElementById('productPrice').value),
                stock: parseInt(document.getElementById('productStock').value) || 0,
                warrantyValue: parseFloat(document.getElementById('productWarrantyValue').value) || 5,
                warrantyUnit: document.getElementById('productWarrantyUnit').value || 'dias',
                description: document.getElementById('productDescription').value,
                image: currentProductImage || document.getElementById('productImageUrl').value || 'https://via.placeholder.com/300x300?text=Producto',
                materials: document.getElementById('productMaterials').value.split(',').map(m => m.trim()).filter(m => m),
                sizing: document.getElementById('productSizing').value.split(',').map(s => s.trim()).filter(s => s),
                restricted: document.getElementById('productRestricted').checked
            };

            if (editingProductId) {
                // Actualizar producto existente
                const existingProduct = adminProducts.find(p => p.id === editingProductId);
                product.id = existingProduct.id;
                adminProducts = adminProducts.map(p => p.id === editingProductId ? product : p);
                showAdminNotification('Producto actualizado correctamente');
            } else {
                // Agregar nuevo producto
                adminProducts.push(product);
                showAdminNotification('Producto agregado correctamente');
            }

            saveAdminProducts();
            renderProductsTable();
            renderStockTable();
            form.style.display = 'none';
            form.reset();
            editingProductId = null;
            currentProductImage = null;
            setFileNameLabel('productImageFileName', '');
            document.getElementById('imagePreviewContainer').innerHTML = '';
            updateDashboard();
        });
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const previewContainer = document.getElementById('imagePreviewContainer');
    setFileNameLabel('productImageFileName', '⏳ Procesando imagen...');

    // Redimensiona y comprime la imagen para que cualquier foto del
    // computador funcione sin llenar el localStorage
    compressImageFile(file, 900, 0.82, false).then(function(dataUrl) {
        currentProductImage = dataUrl;
        setFileNameLabel('productImageFileName', '✓ ' + file.name);
        previewContainer.innerHTML = `
            <div style="margin-top: 10px;">
                <strong>✓ Imagen Cargada (${file.name}):</strong><br>
                <img src="${currentProductImage}" class="image-preview" style="max-width: 200px; max-height: 200px; margin-top: 8px;">
            </div>
        `;
    }).catch(function(err) {
        currentProductImage = null;
        setFileNameLabel('productImageFileName', '');
        event.target.value = '';
        previewContainer.innerHTML = '';
        showAdminNotification(err.message, 'error');
    });
}

function editProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    currentProductImage = product.image;
    document.getElementById('formTitle').textContent = 'Editar Producto';
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productWarrantyValue').value = product.warrantyValue || 5;
    document.getElementById('productWarrantyUnit').value = product.warrantyUnit || 'dias';
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productMaterials').value = product.materials.join(', ');
    document.getElementById('productSizing').value = product.sizing.join(', ');
    document.getElementById('productRestricted').checked = product.restricted;

    // Mostrar preview de imagen actual
    const previewContainer = document.getElementById('imagePreviewContainer');
    previewContainer.innerHTML = `
        <div style="margin-top: 10px;">
            <strong>Imagen Actual:</strong><br>
            <img src="${product.image}" class="image-preview" style="max-width: 200px; max-height: 200px;">
        </div>
    `;

    document.getElementById('productForm').style.display = 'block';
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteProduct(productId) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        syncAdminProducts();
        adminProducts = adminProducts.filter(p => p.id !== productId);
        saveAdminProducts();
        renderProductsTable();
        renderStockTable();
        showAdminNotification('Producto eliminado correctamente');
        updateDashboard();
    }
}

function renderProductsTable() {
    const table = document.getElementById('productsTable');
    if (!table) return;

    if (adminProducts.length === 0) {
        table.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No hay productos. Agregue uno.</td></tr>';
        return;
    }

    table.innerHTML = adminProducts.map(product => `
        <tr>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryLabel(product.category)}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td><span class="badge ${product.stock === 0 ? 'badge-danger' : product.stock < 3 ? 'badge-warning' : 'badge-success'}">${product.stock}</span></td>
            <td>${product.restricted ? '✓ Sí' : 'No'}</td>
            <td>
                <button class="btn btn-secondary" onclick="editProduct(${product.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function renderStockTable() {
    const table = document.getElementById('stockTable');
    if (!table) return;

    if (adminProducts.length === 0) {
        table.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">No hay productos.</td></tr>';
        return;
    }

    table.innerHTML = adminProducts.map(product => `
        <tr>
            <td><strong>${product.name}</strong></td>
            <td>
                <span style="font-size: 18px; font-weight: bold; color: #ff6b35;">${product.stock}</span>
                <span style="color: #999; margin-left: 5px;">unidades</span>
            </td>
            <td>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="adjustStock(${product.id}, 1)">➕ +1</button>
                <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px; margin-left: 5px;" onclick="adjustStock(${product.id}, -1)">➖ -1</button>
                <input type="number" id="stock-input-${product.id}" style="width: 70px; padding: 6px; margin-left: 10px; border: 1px solid #ddd; border-radius: 4px;" value="${product.stock}" min="0">
                <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px; margin-left: 5px;" onclick="setStock(${product.id})">Establecer</button>
            </td>
        </tr>
    `).join('');
}

function adjustStock(productId, amount) {
    syncAdminProducts();
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    product.stock = Math.max(0, product.stock + amount);
    saveAdminProducts();
    renderStockTable();
    renderProductsTable();
    updateDashboard();
    showAdminNotification(`Stock de ${product.name} ajustado a ${product.stock}`);
}

function setStock(productId) {
    syncAdminProducts();
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    const input = document.getElementById(`stock-input-${productId}`);
    const newStock = parseInt(input.value) || 0;
    product.stock = Math.max(0, newStock);
    saveAdminProducts();
    renderStockTable();
    renderProductsTable();
    updateDashboard();
    showAdminNotification(`Stock de ${product.name} establecido a ${product.stock}`);
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

// ==================== GESTIÓN DE LOGO ====================

function setupLogoForm() {
    const form = document.getElementById('logoForm');
    if (!form) return;

    // Cargar logo actual
    const currentLogo = localStorage.getItem('headerLogo') || 'https://via.placeholder.com/120x80?text=Tu+Zona+Tactica';
    const logoImg = document.getElementById('currentLogo');
    if (logoImg) logoImg.src = currentLogo;

    const logoFile = document.getElementById('logoFile');
    const logoUrl = document.getElementById('logoUrl');
    let currentLogoImage = null;

    function resetLogoForm() {
        currentLogoImage = null;
        setFileNameLabel('logoFileName', '');
        form.reset();
    }

    function saveLogo(logoData) {
        try {
            localStorage.setItem('headerLogo', logoData);
        } catch (err) {
            showAdminNotification('Error al guardar el logo: el almacenamiento del navegador está lleno. Use una imagen más ligera.', 'error');
            return;
        }
        if (logoImg) logoImg.src = logoData;
        showAdminNotification('Logo actualizado correctamente');
        resetLogoForm();

        if (window.opener && !window.opener.closed) {
            window.opener.location.reload();
        }
    }

    // Manejo de carga de archivo
    if (logoFile) {
        logoFile.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;

            setFileNameLabel('logoFileName', '⏳ Procesando logo...');

            // Redimensiona y comprime el logo (máx. 400px, conserva transparencia PNG)
            compressImageFile(file, 400, 0.85, true).then(function(dataUrl) {
                currentLogoImage = dataUrl;
                setFileNameLabel('logoFileName', '✓ ' + file.name);
                if (logoImg) logoImg.src = dataUrl;
                if (logoUrl) logoUrl.value = '';
            }).catch(function(err) {
                currentLogoImage = null;
                setFileNameLabel('logoFileName', '');
                event.target.value = '';
                showAdminNotification(err.message, 'error');
            });
        });
    }

    // Manejo de URL
    if (logoUrl) {
        logoUrl.addEventListener('input', function() {
            if (this.value) {
                currentLogoImage = this.value;
                if (logoImg) logoImg.src = this.value;
                if (logoFile) logoFile.value = '';
                setFileNameLabel('logoFileName', '');
            }
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const logoData = currentLogoImage || (logoUrl ? logoUrl.value.trim() : '');

        if (!logoData) {
            showAdminNotification('Seleccione un archivo o ingrese una URL', 'error');
            return;
        }

        saveLogo(logoData);
    });
}

// ==================== GESTIÓN DE CONFIGURACIÓN ====================

function setupSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (!form) return;

    // Cargar configuración guardada
    const settings = {
        phoneNumber: '+58 424-206-2978',
        email: 'info@tuzonatacticaccs.com',
        location: 'Venezuela - Disponible en toda la República',
        maintenanceMode: false
    };

    Object.keys(settings).forEach(key => {
        const stored = localStorage.getItem(`setting_${key}`);
        if (stored) {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = stored === 'true';
                } else {
                    element.value = stored;
                }
            }
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                const value = element.type === 'checkbox' ? element.checked : element.value;
                localStorage.setItem(`setting_${key}`, value);
            }
        });

        showAdminNotification('Configuración actualizada correctamente');
        
        // Actualizar en la página pública
        if (window.opener && !window.opener.closed) {
            window.opener.location.reload();
        }
    });
}

// ==================== GESTIÓN DE CONTRASEÑA ====================

function setupPasswordForm() {
    const form = document.getElementById('passwordForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Verificar contraseña actual
        if (currentPassword !== getAdminPassword()) {
            showAdminNotification('Contraseña actual incorrecta', 'error');
            return;
        }

        // Verificar que las nuevas contraseñas coincidan
        if (newPassword !== confirmPassword) {
            showAdminNotification('Las nuevas contraseñas no coinciden', 'error');
            return;
        }

        // Verificar longitud mínima
        if (newPassword.length < 6) {
            showAdminNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        // Actualizar contraseña de forma persistente (en producción, usar backend seguro)
        try {
            localStorage.setItem('adminPassword', newPassword);
        } catch (err) {
            showAdminNotification('Error al guardar la contraseña', 'error');
            return;
        }
        showAdminNotification('Contraseña actualizada correctamente. Úsala en tu próximo inicio de sesión.');
        form.reset();
    });
}

// ==================== GESTIÓN DE VERIFICACIONES DE IDENTIDAD ====================

function setupVerificationsPanel() {
    renderVerificationsTable();
}

function renderVerificationsTable() {
    const table = document.getElementById('verificationsTable');
    if (!table) return;

    const verifications = JSON.parse(localStorage.getItem('verifications')) || [];
    const pending = verifications.filter(v => v.status === 'pending');

    if (pending.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No hay solicitudes pendientes</td></tr>';
        return;
    }

    table.innerHTML = pending.map(v => `
        <tr>
            <td><strong>${v.name}</strong></td>
            <td>${v.credential}</td>
            <td><span class="badge badge-warning">${v.status === 'pending' ? 'Pendiente' : v.status === 'approved' ? 'Aprobado' : 'Rechazado'}</span></td>
            <td>${v.submittedAt}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="viewVerificationDetails(${verifications.indexOf(v)})">Ver</button>
                <button class="btn btn-success" style="padding: 4px 8px; font-size: 12px;" onclick="approveVerification(${verifications.indexOf(v)})">✓ Aprobar</button>
                <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="rejectVerification(${verifications.indexOf(v)})">✕ Rechazar</button>
            </td>
        </tr>
    `).join('');
}

function viewVerificationDetails(index) {
    const verifications = JSON.parse(localStorage.getItem('verifications')) || [];
    const v = verifications[index];

    const detailsDiv = document.getElementById('verificationDetails');
    detailsDiv.innerHTML = `
        <table style="width: 100%; margin-top: 15px;">
            <tr>
                <td><strong>Nombre:</strong></td>
                <td>${v.name}</td>
            </tr>
            <tr>
                <td><strong>Cédula:</strong></td>
                <td>${v.identity}</td>
            </tr>
            <tr>
                <td><strong>Institución:</strong></td>
                <td>${v.credential}</td>
            </tr>
            <tr>
                <td><strong>Credencial #:</strong></td>
                <td>${v.credentialNumber}</td>
            </tr>
            <tr>
                <td><strong>Email:</strong></td>
                <td>${v.email}</td>
            </tr>
            <tr>
                <td><strong>Solicitado:</strong></td>
                <td>${v.submittedAt}</td>
            </tr>
        </table>
    `;
    document.getElementById('verificationDetailsModal').style.display = 'block';
}

function approveVerification(index) {
    if (!confirm('¿Aprobar esta verificación? El cliente podrá comprar productos del Área Restringida.')) return;

    const verifications = JSON.parse(localStorage.getItem('verifications')) || [];
    verifications[index].status = 'approved';
    localStorage.setItem('verifications', JSON.stringify(verifications));

    // Habilitar la compra de productos restringidos para este navegador/cliente
    localStorage.setItem('identityVerified', 'true');
    localStorage.setItem('identityVerifiedName', verifications[index].name || '');

    renderVerificationsTable();
    showAdminNotification('✓ Verificación aprobada: identidad habilitada para compras restringidas');
}

function rejectVerification(index) {
    if (!confirm('¿Rechazar esta verificación de identidad?')) return;

    const verifications = JSON.parse(localStorage.getItem('verifications')) || [];
    verifications[index].status = 'rejected';
    localStorage.setItem('verifications', JSON.stringify(verifications));
    renderVerificationsTable();
    showAdminNotification('✕ Verificación rechazada');
}

// ==================== GESTIÓN DE ENVÍOS (CARRITOS POR CLIENTE) ====================

let selectedCartId = null;

// Ventana de devolución: 5 días desde la entrega del envío
const RETURN_WINDOW_MS = 5 * 24 * 60 * 60 * 1000;

function getStatusBadge(status) {
    if (status === 'entregado') {
        return '<span class="badge" style="background-color: #17a2b8; color: #fff;">Entregado</span>';
    }
    if (status === 'aprobado') {
        return '<span class="badge badge-success">Entregado y Aprobado</span>';
    }
    return '<span class="badge badge-warning">Programado</span>';
}

// Horas de garantía de un producto (compatibilidad: 5 días si no tiene el campo)
function getProductWarrantyHours(product) {
    if (!product || !product.warrantyValue || product.warrantyValue <= 0) return 5 * 24;
    if (product.warrantyUnit === 'horas') return product.warrantyValue;
    return product.warrantyValue * 24;
}

// Etiqueta legible de una duración dada en horas
function getWarrantyLabel(hours) {
    if (!hours || hours <= 0) hours = 5 * 24;
    if (hours % 24 === 0) {
        const d = hours / 24;
        return d + (d === 1 ? ' día' : ' días');
    }
    return hours + (hours === 1 ? ' hora' : ' horas');
}

// Calcula toda la información de la garantía de un envío entregado
// (la duración se define por envío al marcarlo como entregado, en horas)
function getWarrantyInfo(shipping) {
    if (!shipping.deliveredAt) return null;

    const totalMs = (shipping.warrantyHours && shipping.warrantyHours > 0)
        ? shipping.warrantyHours * 3600000
        : RETURN_WINDOW_MS;                                          // compatibilidad: 5 días

    const useDays = totalMs >= 86400000;
    const totalDays = Math.round(totalMs / 86400000);

    const deliveredAt = new Date(shipping.deliveredAt);
    const deadline = deliveredAt.getTime() + totalMs;
    const elapsed = Date.now() - deliveredAt.getTime();
    const remaining = deadline - Date.now();

    const days = Math.floor(Math.max(0, remaining) / 86400000);
    const hours = Math.floor((Math.max(0, remaining) % 86400000) / 3600000);
    const minutes = Math.floor((Math.max(0, remaining) % 3600000) / 60000);

    let remainingText;
    if (remaining <= 0) {
        remainingText = 'Plazo vencido';
    } else if (useDays) {
        remainingText = days + 'd ' + hours + 'h ' + minutes + 'm restantes';
    } else {
        remainingText = hours + 'h ' + minutes + 'm restantes';
    }

    return {
        totalMs: totalMs,
        totalLabel: getWarrantyLabel(totalMs / 3600000),
        useDays: useDays,
        day: useDays ? Math.min(totalDays, Math.floor(elapsed / 86400000) + 1) : 0,
        progress: Math.max(0, Math.min(100, (elapsed / totalMs) * 100)),
        expired: remaining <= 0,
        deliveredLabel: deliveredAt.toLocaleString('es-VE'),
        deadlineLabel: new Date(deadline).toLocaleString('es-VE'),
        remainingText: remainingText,
        remaining: remaining
    };
}

// Cuenta regresiva compacta para la tabla de envíos (solo para el admin)
function getReturnCountdown(shipping) {
    const info = getWarrantyInfo(shipping);
    if (!info || shipping.status !== 'entregado' || info.expired) return '';
    return `🛡️ Garantía: Día ${info.day} de 5 — ${info.remainingText}`;
}

// Panel de control de garantía: recuento visible de los 5 días por envío entregado
function renderWarrantyPanel() {
    const panel = document.getElementById('warrantyPanel');
    if (!panel) return;

    const shippings = JSON.parse(localStorage.getItem('shippings')) || [];
    const delivered = shippings.filter(s => s.status === 'entregado' || s.status === 'aprobado');

    if (delivered.length === 0) {
        panel.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay envíos entregados en seguimiento de garantía. Marca un envío como "📬 Entregado" para iniciar su cuenta regresiva de 5 días.</p>';
        return;
    }

    panel.innerHTML = delivered.map(s => {
        const realIndex = shippings.indexOf(s);
        const info = getWarrantyInfo(s);
        if (!info) return '';
        const isApproved = s.status === 'aprobado';

        let barColor, statusText;
        if (isApproved) {
            barColor = '#6c757d';
            statusText = '🛡️ Garantía finalizada — Envío Entregado y Aprobado';
        } else if (info.expired) {
            barColor = '#6c757d';
            statusText = '⏰ Plazo de devolución vencido (pasando a Entregado y Aprobado)';
        } else if (info.remaining > info.totalMs / 2) {
            barColor = '#28a745';
            statusText = '✅ En garantía — devolución disponible';
        } else if (info.remaining > info.totalMs / 4) {
            barColor = '#ffc107';
            statusText = '⚠️ Garantía por vencer';
        } else {
            barColor = '#dc3545';
            statusText = '🔴 Últimas horas de devolución';
        }

        return `
        <div style="border: 1px solid #ddd; border-left: 5px solid ${barColor}; border-radius: 8px; padding: 15px; margin-bottom: 15px; background-color: #fff;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; align-items: center;">
                <div>
                    <strong style="font-size: 15px;">👤 ${escapeHtml(s.customerName || 'Cliente')}</strong>${s.customerPhone ? ' <small style="color: #666;">📞 ' + escapeHtml(s.customerPhone) + '</small>' : ''}<br>
                    <small style="color: #666;">📦 Entregado: ${info.deliveredLabel} &nbsp;•&nbsp; ⏰ Límite de devolución: ${info.deadlineLabel}</small>
                </div>
                <div>
                    ${getStatusBadge(s.status)}
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px; margin-left: 5px;" onclick="viewShippingDetails(${realIndex})">👁 Ver</button>
                    ${!isApproved ? `<button class="btn btn-success" style="padding: 4px 8px; font-size: 12px; margin-left: 5px;" onclick="approveReturn(${realIndex})">✅ Aprobar Devolución</button>` : ''}
                </div>
            </div>
            <div style="margin-top: 12px;">
                <strong>🛡️ Garantía de ${info.totalLabel}${info.useDays ? ': Día ' + info.day + ' de ' + Math.round(info.totalMs / 86400000) : ''}</strong> — ${info.remainingText}
                <div style="background-color: #e9ecef; border-radius: 20px; height: 14px; margin-top: 6px; overflow: hidden;">
                    <div style="width: ${info.progress}%; height: 100%; background-color: ${barColor}; border-radius: 20px; transition: width 0.3s;"></div>
                </div>
                <small style="color: ${barColor}; font-weight: 700;">${statusText}</small>
            </div>
        </div>
        `;
    }).join('');
}

// Pasa a "Entregado y Aprobado" los envíos cuyo plazo de devolución de 5 días terminó
function checkDeliveries() {
    const shippings = JSON.parse(localStorage.getItem('shippings')) || [];
    let changed = false;
    shippings.forEach(s => {
        if (s.status === 'entregado' && s.deliveredAt) {
            const totalMs = (s.warrantyHours && s.warrantyHours > 0) ? s.warrantyHours * 3600000 : RETURN_WINDOW_MS;
            const end = new Date(s.deliveredAt).getTime() + totalMs;
            if (Date.now() >= end) {
                s.status = 'aprobado';
                s.approvedAt = new Date().toLocaleString('es-VE');
                changed = true;
            }
        }
    });
    if (changed) {
        localStorage.setItem('shippings', JSON.stringify(shippings));
        showAdminNotification('✓ Envíos marcados como Entregados y Aprobados (fin del plazo de devolución)');
    }
}

// El administrador marca el envío como entregado: inicia la cuenta regresiva de garantía
function markDelivered(index) {
    if (!confirm('¿Marcar este envío como ENTREGADO? Esto iniciará la cuenta regresiva de la garantía para devoluciones.')) return;

    const shippings = JSON.parse(localStorage.getItem('shippings')) || [];
    const shipping = shippings[index];
    if (!shipping) return;

    // Sugerir la garantía MAYOR entre los productos del envío
    let suggestedHours = 0;
    let detail = '';
    (shipping.products || []).forEach(p => {
        const h = getProductWarrantyHours(p);
        suggestedHours = Math.max(suggestedHours, h);
        detail += '• ' + p.name + ': ' + getWarrantyLabel(h) + '\n';
    });
    if (suggestedHours <= 0) suggestedHours = 120; // 5 días por defecto

    const answer = prompt(
        '⏱️ Duración de la garantía de ESTE envío (en horas):\n\n' +
        'Garantías de los productos:\n' + detail +
        '\nSe sugiere la mayor: ' + getWarrantyLabel(suggestedHours) + ' = ' + suggestedHours + ' horas.' +
        '\nPuedes cambiarla. Ejemplos: 240 = 10 días • 72 = 3 días • 2 = 2 horas',
        suggestedHours
    );

    if (answer === null) return; // cancelado por el admin
    const warrantyHours = parseFloat(answer);
    if (isNaN(warrantyHours) || warrantyHours <= 0) {
        showAdminNotification('Duración de garantía inválida. El envío sigue sin entregar.', 'error');
        return;
    }

    shipping.status = 'entregado';
    shipping.deliveredAt = new Date().toISOString();
    shipping.warrantyHours = warrantyHours;
    localStorage.setItem('shippings', JSON.stringify(shippings));

    renderShippingTable();
    showAdminNotification('✓ Envío entregado. Garantía de ' + getWarrantyLabel(warrantyHours) + ' en curso.');
}

// Elimina un envío definitivamente (útil para registros duplicados o erróneos)
function deleteShipping(index) {
    if (!confirm('¿ELIMINAR este envío definitivamente? Esta acción no se puede deshacer.')) return;

    const shippings = JSON.parse(localStorage.getItem('shippings')) || [];
    shippings.splice(index, 1);
    localStorage.setItem('shippings', JSON.stringify(shippings));

    renderShippingTable();
    showAdminNotification('🗑️ Envío eliminado');
}

// El administrador aprueba la devolución manualmente: finaliza la garantía de inmediato
function approveReturn(index) {
    if (!confirm('¿APROBAR la devolución de este envío? La garantía terminará de inmediato.')) return;

    const shippings = JSON.parse(localStorage.getItem('shippings')) || [];
    const shipping = shippings[index];
    if (!shipping) return;

    shipping.status = 'aprobado';
    shipping.approvedAt = new Date().toLocaleString('es-VE');
    shipping.approvedManually = true;
    localStorage.setItem('shippings', JSON.stringify(shippings));

    renderShippingTable();
    showAdminNotification('✓ Devolución aprobada manualmente. Garantía finalizada.');
}

// ==================== GESTIÓN DE DEVOLUCIONES ====================

function renderReturnsTable() {
    const table = document.getElementById('returnsTable');
    if (!table) return;

    const returns = JSON.parse(localStorage.getItem('returns')) || [];

    if (returns.length === 0) {
        table.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No hay solicitudes de devolución. Las solicitudes de los clientes aparecerán aquí.</td></tr>';
        return;
    }

    // Pendientes primero
    const sorted = returns.slice().sort((a, b) => {
        if (a.status === 'pendiente' && b.status !== 'pendiente') return -1;
        if (a.status !== 'pendiente' && b.status === 'pendiente') return 1;
        return 0;
    });

    table.innerHTML = sorted.map((req, index) => {
        const realIndex = returns.indexOf(req);
        const productsText = (req.products || []).map(p => escapeHtml(p.name) + ' x' + p.quantity).join('<br>');

        let badge, actions = '';
        if (req.status === 'pendiente') {
            badge = '<span class="badge badge-warning">Pendiente</span>';
            actions = `
                <button class="btn btn-success" style="padding: 4px 8px; font-size: 12px;" onclick="acceptReturnRequest(${realIndex})">✅ Aceptar</button>
                <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="rejectReturnRequest(${realIndex})">❌ Rechazar</button>`;
        } else if (req.status === 'aprobada') {
            badge = '<span class="badge badge-success">Aprobada</span>';
        } else {
            badge = '<span class="badge badge-danger">Rechazada</span>';
        }

        return `
        <tr>
            <td><strong>${escapeHtml(req.customerName || 'Cliente')}</strong>${req.customerPhone ? '<br><small>📞 ' + escapeHtml(req.customerPhone) + '</small>' : ''}</td>
            <td>${productsText}</td>
            <td>${req.reason ? escapeHtml(req.reason) : '<small style="color: #999;">Sin motivo</small>'}${req.reviewNote ? '<br><small style="color: #dc3545;">Admin: ' + escapeHtml(req.reviewNote) + '</small>' : ''}</td>
            <td>${req.requestedAt}</td>
            <td>${badge}${req.reviewedAt ? '<br><small>' + req.reviewedAt + '</small>' : ''}</td>
            <td>${actions || '<small style="color: #999;">Revisada</small>'}</td>
        </tr>`;
    }).join('');
}

// Acepta la solicitud de devolución: finaliza la garantía del envío correspondiente
function acceptReturnRequest(index) {
    if (!confirm('¿ACEPTAR esta devolución? Se finalizará la garantía del envío y deberás coordinar la recogida con el cliente.')) return;

    const returns = JSON.parse(localStorage.getItem('returns')) || [];
    const req = returns[index];
    if (!req) return;

    req.status = 'aprobada';
    req.reviewedAt = new Date().toLocaleString('es-VE');
    localStorage.setItem('returns', JSON.stringify(returns));

    // Finaliza la garantía del envío correspondiente
    const shippings = JSON.parse(localStorage.getItem('shippings')) || [];
    const shipping = shippings.find(s => s.id === req.shippingId);
    if (shipping && shipping.status === 'entregado') {
        shipping.status = 'aprobado';
        shipping.approvedAt = new Date().toLocaleString('es-VE');
        shipping.approvedManually = true;
        localStorage.setItem('shippings', JSON.stringify(shippings));
        renderShippingTable();
    }

    renderReturnsTable();
    showAdminNotification('✓ Devolución aprobada. Coordina el proceso con el cliente (📞 ' + (req.customerPhone || 'sin teléfono') + ').');
}

// Rechaza la solicitud (ej: el equipo no venía dañado de fábrica)
function rejectReturnRequest(index) {
    const note = prompt('❌ Motivo del rechazo (opcional). Ej: El equipo no presentó daños de fábrica:', '');
    if (note === null) return; // cancelado

    const returns = JSON.parse(localStorage.getItem('returns')) || [];
    const req = returns[index];
    if (!req) return;

    req.status = 'rechazada';
    req.reviewedAt = new Date().toLocaleString('es-VE');
    req.reviewNote = note.trim();
    localStorage.setItem('returns', JSON.stringify(returns));

    renderReturnsTable();
    showAdminNotification('✕ Devolución rechazada. La garantía del envío sigue su curso.');
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderCartsTable() {
    const table = document.getElementById('cartsTable');
    if (!table) return;

    const carts = JSON.parse(localStorage.getItem('tuzonatacticaCarts')) || [];
    const pending = carts.filter(c => c.status === 'pending');

    if (pending.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No hay carritos pendientes. Los pedidos confirmados por los clientes aparecerán aquí.</td></tr>';
        return;
    }

    table.innerHTML = pending.map(cart => `
        <tr>
            <td><strong>${escapeHtml(cart.customerName)}</strong>${cart.customerPhone ? '<br><small>📞 ' + escapeHtml(cart.customerPhone) + '</small>' : ''}</td>
            <td>${cart.products.length} producto(s)</td>
            <td>$${cart.total.toFixed(2)}</td>
            <td>${cart.createdAt}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="viewCartDetails(${cart.id})">👁 Ver Productos</button>
                <button class="btn btn-primary" style="padding: 4px 8px; font-size: 12px; margin-left: 5px;" onclick="selectCartForShipping(${cart.id})">📦 Programar Envío</button>
            </td>
        </tr>
    `).join('');
}

function viewCartDetails(cartId) {
    const carts = JSON.parse(localStorage.getItem('tuzonatacticaCarts')) || [];
    const cart = carts.find(c => c.id === cartId);
    if (!cart) return;

    const rows = cart.products.map(p => `
        <tr>
            <td>${escapeHtml(p.name)}</td>
            <td>${p.quantity}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>$${(p.price * p.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    showCartDetails(`
        <p><strong>Cliente:</strong> ${escapeHtml(cart.customerName)}</p>
        <p><strong>Pedido realizado:</strong> ${cart.createdAt}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="border-bottom: 2px solid #ddd;">
                    <th style="text-align: left; padding: 8px;">Producto</th>
                    <th style="text-align: left; padding: 8px;">Cantidad</th>
                    <th style="text-align: left; padding: 8px;">Precio</th>
                    <th style="text-align: left; padding: 8px;">Subtotal</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <p style="text-align: right; font-size: 18px; font-weight: 700; color: #ff6b35; margin-top: 15px;">Total: $${cart.total.toFixed(2)}</p>
    `);
}

function showCartDetails(html) {
    const panel = document.getElementById('cartDetailsModal');
    const content = document.getElementById('cartDetails');
    if (!panel) return;
    if (content) content.innerHTML = html;
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
}

function closeCartDetails() {
    const panel = document.getElementById('cartDetailsModal');
    if (panel) panel.style.display = 'none';
}

function selectCartForShipping(cartId) {
    const carts = JSON.parse(localStorage.getItem('tuzonatacticaCarts')) || [];
    const cart = carts.find(c => c.id === cartId);
    if (!cart) return;

    selectedCartId = cartId;
    closeCartDetails();

    const card = document.getElementById('shippingFormCard');
    const summary = document.getElementById('selectedCartSummary');

    if (summary) {
        summary.innerHTML = `
            <strong>👤 Cliente:</strong> ${escapeHtml(cart.customerName)}${cart.customerPhone ? ' — 📞 ' + escapeHtml(cart.customerPhone) : ''} &nbsp;|&nbsp;
            <strong>🛍️ Productos:</strong> ${cart.products.length} &nbsp;|&nbsp;
            <strong>💰 Total:</strong> $${cart.total.toFixed(2)}
        `;
    }
    if (card) {
        card.style.display = 'block';
        card.scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelCartSelection() {
    selectedCartId = null;
    const card = document.getElementById('shippingFormCard');
    if (card) card.style.display = 'none';
    const form = document.getElementById('shippingForm');
    if (form) form.reset();
}

function setupShippingForm() {
    const form = document.getElementById('shippingForm');
    if (!form) return;

    let lastShippingScheduledAt = 0;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Evita envíos duplicados por doble clic
        if (Date.now() - lastShippingScheduledAt < 2000) return;

        if (!selectedCartId) {
            showAdminNotification('Selecciona primero un carrito de la lista', 'error');
            return;
        }

        const carts = JSON.parse(localStorage.getItem('tuzonatacticaCarts')) || [];
        const selectedCart = carts.find(c => c.id === selectedCartId);
        if (!selectedCart) {
            showAdminNotification('El carrito seleccionado ya no existe', 'error');
            cancelCartSelection();
            renderCartsTable();
            return;
        }

        const shipping = {
            id: Date.now(),
            cartId: selectedCart.id,
            customerName: selectedCart.customerName,
            customerPhone: selectedCart.customerPhone,
            shippingDate: document.getElementById('shippingDate').value,
            shippingTime: document.getElementById('shippingTime').value || 'No especificada',
            notes: document.getElementById('shippingNotes').value,
            products: selectedCart.products,
            total: selectedCart.total,
            status: 'programado',
            createdAt: new Date().toLocaleString('es-VE')
        };

        let shippings = JSON.parse(localStorage.getItem('shippings')) || [];
        shippings.push(shipping);
        localStorage.setItem('shippings', JSON.stringify(shippings));

        // Marcar el carrito del cliente como programado (sale de los pendientes)
        selectedCart.status = 'scheduled';
        localStorage.setItem('tuzonatacticaCarts', JSON.stringify(carts));

        lastShippingScheduledAt = Date.now();

        renderCartsTable();
        cancelCartSelection();

        renderShippingTable();
        form.reset();
        showAdminNotification('✓ Envío programado correctamente');
    });
}

function renderShippingTable() {
    const table = document.getElementById('shippingTable');
    if (!table) return;

    // Aplica la transición automática a "Entregado y Aprobado" si el plazo terminó
    checkDeliveries();

    // Actualiza el panel de control de garantía (cuenta regresiva de 5 días)
    renderWarrantyPanel();

    const shippings = JSON.parse(localStorage.getItem('shippings')) || [];
    const returns = JSON.parse(localStorage.getItem('returns')) || [];

    if (shippings.length === 0) {
        table.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No hay envíos programados</td></tr>';
        return;
    }

    table.innerHTML = shippings.map((shipping, index) => {
        const countdown = getReturnCountdown(shipping);
        const pendingReturn = returns.some(r => r.shippingId === shipping.id && r.status === 'pendiente');
        let actions = `<button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="viewShippingDetails(${index})">Ver</button>`;

        if (shipping.status === 'programado') {
            actions += ` <button class="btn btn-success" style="padding: 4px 8px; font-size: 12px;" onclick="markDelivered(${index})">📬 Entregado</button>`;
            actions += ` <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="cancelShipping(${index})">Cancelar</button>`;
        }

        if (shipping.status === 'entregado') {
            actions += ` <button class="btn btn-success" style="padding: 4px 8px; font-size: 12px;" onclick="approveReturn(${index})">✅ Aprobar Devolución</button>`;
        }

        actions += ` <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px; margin-left: 5px;" onclick="deleteShipping(${index})">🗑️ Eliminar</button>`;

        return `
        <tr>
            <td><strong>${escapeHtml(shipping.customerName || 'Cliente')}</strong>${shipping.customerPhone ? '<br><small>📞 ' + escapeHtml(shipping.customerPhone) + '</small>' : ''}</td>
            <td><strong>${shipping.shippingDate}</strong><br><small>${shipping.shippingTime}</small></td>
            <td>${shipping.products.length} producto(s)</td>
            <td>$${shipping.total.toFixed(2)}</td>
            <td>${shipping.notes ? escapeHtml(shipping.notes) : '-'}</td>
            <td>${getStatusBadge(shipping.status)}${countdown ? '<br><small style="color: #17a2b8; font-weight: 700;">' + countdown + '</small>' : ''}${pendingReturn ? '<br><span class="badge badge-danger" style="margin-top: 4px;">↩️ Devolución solicitada</span>' : ''}</td>
            <td>${actions}</td>
        </tr>
    `;}).join('');
}

function viewShippingDetails(index) {
    const shippings = JSON.parse(localStorage.getItem('shippings')) || [];
    const shipping = shippings[index];
    if (!shipping) return;

    const rows = shipping.products.map(p => `
        <tr>
            <td>${escapeHtml(p.name)}</td>
            <td>${p.quantity}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>$${(p.price * p.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const info = getWarrantyInfo(shipping);
    const statusLabel = shipping.status === 'entregado' ? 'Entregado (garantía de ' + (info ? info.totalLabel : '5 días') + ' en curso)' :
                        shipping.status === 'aprobado' ? 'Entregado y Aprobado (garantía finalizada' + (shipping.approvedManually ? ' manualmente' : '') + ')' :
                        'Programado (pendiente de entrega)';
    const countdown = getReturnCountdown(shipping);

    showCartDetails(`
        <p><strong>Cliente:</strong> ${escapeHtml(shipping.customerName || 'Cliente')}</p>
        ${shipping.customerPhone ? '<p><strong>Teléfono:</strong> ' + escapeHtml(shipping.customerPhone) + '</p>' : ''}
        <p><strong>Estado:</strong> ${statusLabel}</p>
        <p><strong>Fecha programada:</strong> ${shipping.shippingDate} — ${shipping.shippingTime}</p>
        ${shipping.deliveredAt ? '<p><strong>Entregado:</strong> ' + new Date(shipping.deliveredAt).toLocaleString('es-VE') + '</p>' : ''}
        ${info ? '<p><strong>Garantía:</strong> ' + info.totalLabel + ' (vence: ' + info.deadlineLabel + ')</p>' : ''}
        ${shipping.approvedManually ? '<p><strong>Devolución aprobada manualmente:</strong> ' + shipping.approvedAt + '</p>' : ''}
        ${countdown ? '<p style="color: #17a2b8; font-weight: 700;">' + countdown + '</p>' : ''}
        <p><strong>Notas:</strong> ${shipping.notes ? escapeHtml(shipping.notes) : 'Ninguna'}</p>
        <p><strong>Pedido realizado:</strong> ${shipping.createdAt || '-'}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="border-bottom: 2px solid #ddd;">
                    <th style="text-align: left; padding: 8px;">Producto</th>
                    <th style="text-align: left; padding: 8px;">Cantidad</th>
                    <th style="text-align: left; padding: 8px;">Precio</th>
                    <th style="text-align: left; padding: 8px;">Subtotal</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <p style="text-align: right; font-size: 18px; font-weight: 700; color: #ff6b35; margin-top: 15px;">Total: $${shipping.total.toFixed(2)}</p>
    `);
}

function cancelShipping(index) {
    if (!confirm('¿Cancelar este envío?')) return;

    const shippings = JSON.parse(localStorage.getItem('shippings')) || [];
    const shipping = shippings[index];

    // Devolver el carrito del cliente a la lista de pendientes
    if (shipping && shipping.cartId) {
        const carts = JSON.parse(localStorage.getItem('tuzonatacticaCarts')) || [];
        const cart = carts.find(c => c.id === shipping.cartId);
        if (cart) {
            cart.status = 'pending';
            localStorage.setItem('tuzonatacticaCarts', JSON.stringify(carts));
        }
    }

    shippings.splice(index, 1);
    localStorage.setItem('shippings', JSON.stringify(shippings));
    renderShippingTable();
    renderCartsTable();
    showAdminNotification('Envío cancelado. El carrito volvió a la lista de pendientes.');
}

// ==================== ALMACENAMIENTO ====================

function loadAdminData() {
    adminProducts = JSON.parse(localStorage.getItem('tuzonatacticaProducts')) || [];
    renderProductsTable();
    renderCartsTable();
    renderShippingTable();
    renderReturnsTable();
}

function saveAdminProducts() {
    try {
        localStorage.setItem('tuzonatacticaProducts', JSON.stringify(adminProducts));
    } catch (err) {
        showAdminNotification('Error al guardar: el almacenamiento del navegador está lleno. Use imágenes más ligeras o URLs.', 'error');
    }
}

// Re-sincroniza el catálogo desde localStorage ANTES de modificarlo,
// para no pisar cambios hechos por la tienda (ej: stock descontado por un pedido)
function syncAdminProducts() {
    try {
        const stored = JSON.parse(localStorage.getItem('tuzonatacticaProducts'));
        if (Array.isArray(stored)) adminProducts = stored;
    } catch (err) { /* si falla, se mantiene lo cargado en memoria */ }
}

// Sincronización en vivo entre pestañas (tienda ↔ admin):
// si la tienda confirma un pedido, las tablas del admin se actualizan al instante
window.addEventListener('storage', function(e) {
    if (e.key === 'tuzonatacticaProducts') {
        adminProducts = JSON.parse(e.newValue) || [];
        renderProductsTable();
        renderStockTable();
        updateDashboard();
    }
    if (e.key === 'tuzonatacticaCarts') {
        renderCartsTable();
    }
    if (e.key === 'returns') {
        renderReturnsTable();
        renderShippingTable();
        showAdminNotification('↩️ Nueva solicitud de devolución recibida. Revisa la sección Devoluciones.');
    }
});

// Revisa cada minuto el fin del plazo de devolución (cuenta regresiva de 5 días)
setInterval(function() {
    if (document.getElementById('shippingTable')) {
        renderShippingTable();
    }
}, 60000);

function showAdminNotification(message, type = 'success') {
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

// Estilos de animación
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
