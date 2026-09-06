# 🎖️ Tu Zona Táctica CCS - Plataforma de E-Commerce

Bienvenido a Tu Zona Táctica CCS, una plataforma profesional de equipamiento táctico y policial con panel administrativo.

---

## 📋 Contenido de Archivos

### Archivos Principales:
- **index.html** - Página pública (tienda online)
- **admin.html** - Panel de administración privado
- **style.css** - Estilos unificados para ambas páginas
- **script.js** - Funcionalidad de la página pública
- **admin-script.js** - Funcionalidad del panel administrativo

---

## 🚀 Cómo Usar

> ⚠️ **Importante:** `index.html` es la página principal de la tienda. `admin.html` es solo el panel privado.
> Si usas Live Server de VS Code: haz clic derecho sobre `index.html` → **"Open with Live Server"**
> (Live Server abre el último archivo HTML que estuvo activo en el editor, por eso a veces abre el admin).

### 1. Abrir la Página Pública
Abre `index.html` en tu navegador para acceder a la tienda online:
- Visualización de productos por categoría
- Detalles técnicos de productos
- Confirmación de pedidos con nombre del cliente
- Información sobre políticas
- Contacto

### 2. Acceder al Panel Administrativo
Abre `admin.html` en tu navegador (o usa el enlace "← Volver a la Tienda" para regresar):

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

**Nota:** La contraseña cambiada en Configuración se guarda de forma persistente.
Si la olvidas, borra la clave `adminPassword` del localStorage (F12 → Application → Local Storage) y vuelve a `admin123`.

---

## 🔐 Panel Administrativo - Secciones

### 📊 Dashboard
- Vista general de productos
- Estadísticas de productos restringidos

### 📝 Gestionar Textos
Edita los textos principales de la página pública:
- Mensaje principal
- Textos de bienvenida, especialización y calidad
- Política de devoluciones
- Llamada a la acción (CTA)

### 🛍️ Gestionar Productos
- ➕ Agregar nuevos productos
- ✏️ Editar productos existentes
- 🗑️ Eliminar productos
- Configurar especificaciones, tallas y restricciones

**Campos de producto:**
- Nombre
- Categoría
- Precio
- Stock
- Descripción
- Imagen (subir archivo desde la PC o URL)
- Materiales (especificaciones)
- Guía de tallas
- Requiere verificación de identidad (checkbox)

**Imágenes:** puedes subir archivos desde tu computadora (JPG, PNG, GIF, WEBP hasta 15MB).
Se redimensionan y comprimen automáticamente para no llenar el almacenamiento del navegador.

### 🚚 Programar Envíos
Gestión de envíos por carrito de cada cliente:

**1. Carritos Pendientes de Envío**
- Lista cada pedido confirmado por los clientes, uno por persona
- 👁 **Ver Productos**: muestra el detalle del carrito (productos, cantidades, precios)
- 📦 **Programar Envío**: selecciona ese carrito para programarle su envío

**2. Programar Envío**
- Aparece al seleccionar un carrito, con su resumen (cliente, productos, total)
- Fecha y hora independientes para cada carrito
- Notas de envío opcionales

**3. Envíos Programados**
- Tabla con cliente, fecha programada, productos, total y estado
- **Cancelar** un envío devuelve el carrito a la lista de pendientes

### 🖼️ Cambiar Logo
- Actualizar el logo de la empresa
- Dimensiones recomendadas: 200x80 píxeles
- Ingresa la URL de la nueva imagen

### 📋 Gestionar Políticas
- Editar títulos de políticas
- Actualizar texto de devoluciones y verificación

### ⚙️ Configuración General
- Número telefónico
- Email de contacto
- Ubicación
- Modo de mantenimiento (oculta tienda a usuarios normales)

### 🔐 Cambiar Contraseña
- Actualizar contraseña de administrador
- Se requiere contraseña actual

---

## 📦 Categorías de Productos

### 1. 👕 Indumentaria y Calzado
- Uniformes (BDU/ACU)
- Botas tácticas
- Guantes
- Protección térmica

### 2. 🎒 Equipamiento de Carga
- Chalecos porta-placas
- Mochilas tácticas
- Cinturones de servicio

### 3. 🔍 Óptica e Iluminación
- Linternas de alta potencia
- Visores nocturnos
- Miras

### 4. 🛡️ Accesorios de Defensa
- Fundas (holsters)
- Herramientas multifunción
- Cascos
- Rodilleras

### 5. ⚠️ Área Restringida
- Productos que requieren verificación de identidad
- Insignias oficiales
- Luces de emergencia autorizadas
- Equipamiento especializado

---

## 🛍️ Flujo de Pedidos y Envíos

1. El cliente agrega productos al carrito (se valida el stock pero **no** se descuenta aún)
2. Abre el carrito 🛒, escribe su nombre y pulsa **✅ Confirmar Pedido**
3. Se valida el stock, se descuenta y el pedido queda registrado con su nombre
4. En el admin → **Programar Envíos**, el carrito aparece en "Carritos Pendientes"
5. El admin selecciona el carrito, revisa sus productos y le programa fecha/hora independientes
6. El envío programado aparece en la tabla con el nombre del cliente
7. Si se cancela el envío, el carrito vuelve a pendientes para reprogramarse

---

## ☁️ Base de Datos (Supabase)

La tienda funciona en dos modos automáticamente:

- **Modo NUBE (Supabase configurado):** productos, pedidos, verificaciones, devoluciones, logo y ajustes se guardan en Supabase y se sincronizan EN VIVO entre todos los dispositivos.
- **Modo LOCAL:** si `supabase-config.js` no está configurado, todo se guarda en localStorage del navegador.

**Instalación del backend:**
1. Crea un proyecto en https://supabase.com
2. Ejecuta `supabase-setup.sql` en el SQL Editor (puedes re-ejecutarlo cuando quieras: usa `drop policy if exists` y aplica siempre la versión más reciente de las políticas)
3. Copia la Project URL y la anon key en `supabase-config.js`
4. Crea el usuario admin en Supabase → Authentication → Users

**⚠️ Actualización de seguridad (importante):**
Si tu proyecto se creó con una versión antigua del script, **vuelve a ejecutar `supabase-setup.sql` completo** en el SQL Editor. Las versiones anteriores permitían que cualquiera con la clave anon leyera todos los pedidos (nombres y teléfonos) y las verificaciones de identidad (con fotos de credenciales). La versión actual protege esas tablas y agrega la función RPC `identity_is_approved` para que el cliente consulte su estado sin exponer datos.

**Recomendación pendiente:** la tabla `returns` sigue siendo de lectura pública porque la consulta de garantía del cliente muestra el estado de su solicitud. En una próxima versión conviene migrarla también a una RPC privada.

---

## 📱 Características

### Página Pública:
✅ Diseño responsivo (móvil, tablet, desktop)
✅ Navegación táctica intuitiva
✅ Fichas de producto con especificaciones técnicas
✅ Guía de tallas precisa
✅ Modal detallado de productos
✅ Carrito con cantidades acumuladas
✅ Confirmación de pedido con nombre del cliente
✅ Información de contacto visible (editable desde el admin)
✅ Políticas claras de devolución
✅ Área restringida con advertencia
✅ Modo mantenimiento (oculta la tienda y muestra aviso)

### Panel Administrativo:
✅ Autenticación con sesión y contraseña cambiante
✅ Gestión completa de contenido
✅ Formularios para edición
✅ Carga de imágenes desde la PC (con compresión automática) o por URL
✅ Dashboard con estadísticas
✅ Carritos pendientes por cliente y envíos con fecha/hora independientes
✅ Interfaz intuitiva
✅ Notificaciones de acciones

---

## 💾 Almacenamiento

Todos los datos se guardan en **localStorage** del navegador:

| Clave | Contenido |
|---|---|
| `tuzonatacticaProducts` | Catálogo de productos (con imágenes en Base64) |
| `tuzonatacticaCarts` | Carritos confirmados por los clientes (pendientes/programados) |
| `shippings` | Envíos programados |
| `cart` | Carrito de trabajo del visitante actual |
| `verifications` | Solicitudes de verificación de identidad |
| `headerLogo` | Logo (Base64 o URL) |
| `adminPassword` | Contraseña del administrador |
| `setting_*` | Teléfono, email, ubicación y modo mantenimiento |
| `texts_*` | Textos personalizados |

**Nota:** Los datos se guardan localmente. Los carritos de los clientes se ven en el admin
del mismo navegador. Para varias computadoras en producción, conectar a una base de datos backend.

---

## 📞 Contacto

**Número telefónico:** +58 424-206-2978 (editable en configuración)

El número aparece en:
- Header de la página
- Sección de contacto
- Links de teléfono clickeables

---

## 🎨 Personalización

### Cambiar Logo
1. Acceder a Admin > Cambiar Logo
2. Sube un archivo desde tu PC o ingresa una URL
3. Aparecerá en header y se actualizará automáticamente

### Cambiar Número Telefónico
1. Admin > Configuración General
2. Editar "Número Telefónico"
3. Guardar cambios

### Personalizar Textos
1. Admin > Gestionar Textos
2. Editar cualquier sección
3. Los cambios se reflejan inmediatamente en la página pública

---

## 🔒 Seguridad - Área Restringida

Algunos productos pueden marcarse como "Requiere Verificación de Identidad":
- Se muestra advertencia en modal
- Se requiere credencial válida
- Aparecen en categoría "Área Restringida"

---

## 🛡️ Especificaciones Técnicas

### Materiales Soportados:
- Cordura®
- Gore-Tex®
- Ripstop
- Nylon
- Cuero Premium
- Y más...

### Características de Desarrollo:
- HTML5 semántico
- CSS3 responsive
- JavaScript vanilla (sin dependencias)
- LocalStorage para persistencia
- SessionStorage para autenticación

---

## 📝 Notas Importantes

1. **Contraseña por defecto:** admin123 (cámbiala en Configuración; se guarda de forma persistente)
2. **Recuperar contraseña:** borrar `adminPassword` del localStorage devuelve la contraseña a admin123
3. **Persistencia de datos:** Los datos persisten entre sesiones en el mismo navegador
4. **Responsivo:** Diseño optimizado para todos los dispositivos
5. **Sin conexión:** Funciona completamente offline
6. **Seguridad:** Para producción, implementar autenticación backend

---

## 🚀 Próximas Mejoras

- Conexión a base de datos backend (para carritos de clientes en múltiples equipos)
- Checkout y pagos
- Historial de usuarios
- Reportes de ventas
- Sistema de comentarios/reseñas

---

**Versión:** 2.0
**Última actualización:** Enero 2026

¡Bienvenido a Tu Zona Táctica CCS! 🎖️
