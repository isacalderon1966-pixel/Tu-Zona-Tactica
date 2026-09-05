// ============================================================
// ⚡ DATA LAYER — Capa de datos (Supabase + fallback localStorage)
// Si Supabase está configurado: los datos se guardan en la nube
// y se sincronizan EN VIVO entre la tienda y el panel admin.
// Si no: todo funciona con localStorage como siempre.
// ============================================================

const DB = (function () {

    // Claves de localStorage (modo local)
    const LSK = {
        products: 'tuzonatacticaProducts',
        orders: 'tuzonatacticaCarts',
        verifications: 'verifications',
        returns: 'returns',
        shippings: 'shippings'
    };

    const mode = (typeof SUPABASE_ENABLED !== 'undefined' && SUPABASE_ENABLED && typeof supabase !== 'undefined')
        ? 'supabase' : 'local';
    const client = (mode === 'supabase') ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

    // Memoria de las colecciones (modo nube se mantiene fresco por Realtime)
    const memory = { products: [], orders: [], verifications: [], returns: [], shippings: [], settings: null };
    const listeners = [];
    let authed = false;

    // ---- utilidades de localStorage ----
    function localRead(key) {
        try { return JSON.parse(localStorage.getItem(LSK[key])) || []; } catch (err) { return []; }
    }
    function localWrite(key, arr) {
        try { localStorage.setItem(LSK[key], JSON.stringify(arr)); } catch (err) { console.error('localStorage lleno:', err); }
    }

    // ---- mapeo filas de Supabase ↔ objetos camelCase del código ----
    const rowMappers = {
        orders: {
            toRow: function (o) {
                return {
                    id: String(o.id),
                    customer_name: o.customerName || '',
                    customer_phone: o.customerPhone || '',
                    products: o.products || [],
                    total: Number(o.total) || 0,
                    status: o.status || 'pending',
                    created_at: o.createdAtIso || new Date().toISOString()
                };
            },
            fromRow: function (r) {
                return {
                    id: String(r.id),
                    customerName: r.customer_name,
                    customerPhone: r.customer_phone || '',
                    products: r.products || [],
                    total: Number(r.total) || 0,
                    status: r.status || 'pending',
                    createdAt: r.created_at ? new Date(r.created_at).toLocaleString('es-VE') : '',
                    createdAtIso: r.created_at
                };
            }
        },
        verifications: {
            toRow: function (v) {
                return {
                    id: String(v.id),
                    full_name: v.fullName || v.name || '',
                    identity: v.identity || '',
                    police_body: v.policeBody || '',
                    credential: v.credential || '',
                    credential_number: v.credentialNumber || '',
                    email: v.email || '',
                    credential_image: v.credentialImage || '',
                    status: v.status || 'pending',
                    submitted_at: v.submittedAtIso || new Date().toISOString(),
                    reviewed_at: v.reviewedAt || null
                };
            },
            fromRow: function (r) {
                return {
                    id: String(r.id),
                    fullName: r.full_name,
                    name: r.full_name,
                    identity: r.identity || '',
                    policeBody: r.police_body || '',
                    credential: r.credential || '',
                    credentialNumber: r.credential_number || '',
                    email: r.email || '',
                    credentialImage: r.credential_image || '',
                    status: r.status || 'pending',
                    submittedAt: r.submitted_at ? new Date(r.submitted_at).toLocaleString('es-VE') : '',
                    submittedAtIso: r.submitted_at,
                    reviewedAt: r.reviewed_at || ''
                };
            }
        },
        returns: {
            toRow: function (r0) {
                return {
                    id: String(r0.id),
                    shipping_id: String(r0.shippingId || ''),
                    customer_name: r0.customerName || '',
                    customer_phone: r0.customerPhone || '',
                    products: r0.products || [],
                    reason: r0.reason || '',
                    status: r0.status || 'pendiente',
                    requested_at: r0.requestedAtIso || new Date().toISOString(),
                    reviewed_at: r0.reviewedAt || null,
                    review_note: r0.reviewNote || ''
                };
            },
            fromRow: function (r) {
                return {
                    id: String(r.id),
                    shippingId: r.shipping_id || '',
                    customerName: r.customer_name,
                    customerPhone: r.customer_phone || '',
                    products: r.products || [],
                    reason: r.reason || '',
                    status: r.status || 'pendiente',
                    requestedAt: r.requested_at ? new Date(r.requested_at).toLocaleString('es-VE') : '',
                    requestedAtIso: r.requested_at,
                    reviewedAt: r.reviewed_at || '',
                    reviewNote: r.review_note || ''
                };
            }
        }
    };

    // ---- carga inicial de datos ----
    async function loadAll() {
        if (mode !== 'supabase') {
            memory.products = localRead('products');
            memory.orders = localRead('orders');
            memory.verifications = localRead('verifications');
            memory.returns = localRead('returns');
            memory.shippings = localRead('shippings');
            return;
        }

        // app_data: productos, envíos y ajustes (documentos jsonb)
        const { data: appRows, error: errApp } = await client.from('app_data').select('key, value');
        if (!errApp && Array.isArray(appRows)) {
            appRows.forEach(function (row) {
                if (row.key === 'products' && Array.isArray(row.value)) memory.products = row.value;
                if (row.key === 'shippings' && Array.isArray(row.value)) memory.shippings = row.value;
                if (row.key === 'settings' && row.value && typeof row.value === 'object') memory.settings = row.value;
            });
        }

        // Tablas de envíos de clientes
        const results = await Promise.all([
            client.from('orders').select('*'),
            client.from('verifications').select('*'),
            client.from('returns').select('*')
        ]);
        memory.orders = (results[0].data || []).map(rowMappers.orders.fromRow);
        memory.verifications = (results[1].data || []).map(rowMappers.verifications.fromRow);
        memory.returns = (results[2].data || []).map(rowMappers.returns.fromRow);
    }

    // ---- sincronización en vivo (Realtime) ----
    function subscribeRealtime() {
        if (mode !== 'supabase' || !client) return;

        client.channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, function (p) { handleChange('orders', p); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'verifications' }, function (p) { handleChange('verifications', p); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, function (p) { handleChange('returns', p); })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'app_data' }, function (p) { handleChange('app_data', p); })
            .subscribe();
    }

    function handleChange(collection, payload) {
        if (collection === 'app_data') {
            const key = (payload.new && payload.new.key) || (payload.old && payload.old.key);
            if (payload.new && key === 'products' && Array.isArray(payload.new.value)) memory.products = payload.new.value;
            if (payload.new && key === 'shippings' && Array.isArray(payload.new.value)) memory.shippings = payload.new.value;
            if (payload.new && key === 'settings' && payload.new.value) memory.settings = payload.new.value;
        } else {
            const mapper = rowMappers[collection];
            const arr = memory[collection];

            if (payload.eventType === 'INSERT' && payload.new) {
                const obj = mapper.fromRow(payload.new);
                if (!arr.some(function (x) { return String(x.id) === String(obj.id); })) arr.push(obj);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
                const obj = mapper.fromRow(payload.new);
                const i = arr.findIndex(function (x) { return String(x.id) === String(obj.id); });
                if (i >= 0) arr[i] = obj; else arr.push(obj);
            } else if (payload.eventType === 'DELETE' && payload.old) {
                const i = arr.findIndex(function (x) { return String(x.id) === String(payload.old.id); });
                if (i >= 0) arr.splice(i, 1);
            }
        }
        notify(collection);
    }

    function notify(key) {
        listeners.forEach(function (fn) {
            try { fn(key); } catch (err) { console.error('Error en listener de DB:', err); }
        });
    }

    // ---- API PÚBLICA ----
    return {
        isCloud: mode === 'supabase',

        // Inicialización: carga datos + activa Realtime + restaura sesión
        async init() {
            if (mode === 'supabase') {
                try {
                    const { data } = await client.auth.getSession();
                    authed = !!(data && data.session);
                } catch (err) { authed = false; }
                await loadAll();
                subscribeRealtime();
            } else {
                await loadAll();
            }
        },

        // Registro de cambios (los listeners re-dibujan la interfaz)
        onChange(cb) { listeners.push(cb); },

        // ---- getters (modo local lee localStorage fresco) ----
        getProducts() { return mode === 'local' ? localRead('products') : memory.products; },
        getOrders() { return mode === 'local' ? localRead('orders') : memory.orders; },
        getVerifications() { return mode === 'local' ? localRead('verifications') : memory.verifications; },
        getReturns() { return mode === 'local' ? localRead('returns') : memory.returns; },
        getShippings() { return mode === 'local' ? localRead('shippings') : memory.shippings; },
        getSettings() { return memory.settings; },

        // ---- guardar colecciones administradas (requiere admin en la nube) ----
        async setProducts(arr) {
            memory.products = arr;
            if (mode === 'supabase') {
                const { error } = await client.from('app_data').upsert({ key: 'products', value: arr, updated_at: new Date().toISOString() });
                if (error) throw error;
            } else { localWrite('products', arr); }
            notify('products');
        },

        async setShippings(arr) {
            memory.shippings = arr;
            if (mode === 'supabase') {
                const { error } = await client.from('app_data').upsert({ key: 'shippings', value: arr, updated_at: new Date().toISOString() });
                if (error) throw error;
            } else { localWrite('shippings', arr); }
            notify('shippings');
        },

        async saveSettings(obj) {
            memory.settings = obj;
            if (mode === 'supabase') {
                const { error } = await client.from('app_data').upsert({ key: 'settings', value: obj, updated_at: new Date().toISOString() });
                if (error) throw error;
                notify('settings');
            }
        },

        // ---- PEDIDOS (los envía el cliente) ----
        async addOrder(order) {
            if (mode === 'supabase') {
                const { data, error } = await client.from('orders').insert(rowMappers.orders.toRow(order)).select();
                if (error) return { ok: false, error: error.message };
                const obj = rowMappers.orders.fromRow(data[0]);
                if (!memory.orders.some(function (x) { return String(x.id) === String(obj.id); })) memory.orders.push(obj);
                notify('orders');
                return { ok: true };
            }
            const arr = localRead('orders');
            arr.push(order);
            localWrite('orders', arr);
            notify('orders');
            return { ok: true };
        },

        async updateOrder(id, patch) {
            if (mode === 'supabase') {
                const row = {};
                if (patch.status) row.status = patch.status;
                const { error } = await client.from('orders').update(row).eq('id', String(id));
                if (error) return { ok: false, error: error.message };
            }
            const arr = mode === 'local' ? localRead('orders') : memory.orders;
            const i = arr.findIndex(function (x) { return String(x.id) === String(id); });
            if (i >= 0) { arr[i] = Object.assign({}, arr[i], patch); if (mode === 'local') localWrite('orders', arr); }
            notify('orders');
            return { ok: true };
        },

        // ---- VERIFICACIONES ----
        async addVerification(v) {
            if (mode === 'supabase') {
                const { data, error } = await client.from('verifications').insert(rowMappers.verifications.toRow(v)).select();
                if (error) return { ok: false, error: error.message };
                const obj = rowMappers.verifications.fromRow(data[0]);
                if (!memory.verifications.some(function (x) { return String(x.id) === String(obj.id); })) memory.verifications.push(obj);
                notify('verifications');
                return { ok: true };
            }
            const arr = localRead('verifications');
            arr.push(v);
            localWrite('verifications', arr);
            notify('verifications');
            return { ok: true };
        },

        async updateVerification(id, patch) {
            const arr = mode === 'local' ? localRead('verifications') : memory.verifications;
            const i = arr.findIndex(function (x) { return String(x.id) === String(id); });
            if (i >= 0) arr[i] = Object.assign({}, arr[i], patch);
            if (mode === 'supabase') {
                const row = {};
                if (patch.status) row.status = patch.status;
                if (patch.reviewedAt) row.reviewed_at = patch.reviewedAt;
                const { error } = await client.from('verifications').update(row).eq('id', String(id));
                if (error) return { ok: false, error: error.message };
            } else { localWrite('verifications', arr); }
            notify('verifications');
            return { ok: true };
        },

        // ---- DEVOLUCIONES ----
        async addReturn(r0) {
            if (mode === 'supabase') {
                const { data, error } = await client.from('returns').insert(rowMappers.returns.toRow(r0)).select();
                if (error) return { ok: false, error: error.message };
                const obj = rowMappers.returns.fromRow(data[0]);
                if (!memory.returns.some(function (x) { return String(x.id) === String(obj.id); })) memory.returns.push(obj);
                notify('returns');
                return { ok: true };
            }
            const arr = localRead('returns');
            arr.push(r0);
            localWrite('returns', arr);
            notify('returns');
            return { ok: true };
        },

        async updateReturn(id, patch) {
            const arr = mode === 'local' ? localRead('returns') : memory.returns;
            const i = arr.findIndex(function (x) { return String(x.id) === String(id); });
            if (i >= 0) arr[i] = Object.assign({}, arr[i], patch);
            if (mode === 'supabase') {
                const row = {};
                if (patch.status) row.status = patch.status;
                if (patch.reviewedAt) row.reviewed_at = patch.reviewedAt;
                if (patch.reviewNote !== undefined) row.review_note = patch.reviewNote;
                const { error } = await client.from('returns').update(row).eq('id', String(id));
                if (error) return { ok: false, error: error.message };
            } else { localWrite('returns', arr); }
            notify('returns');
            return { ok: true };
        },

        // ---- AUTENTICACIÓN DEL ADMIN (Supabase Auth) ----
        async signIn(email, password) {
            if (mode !== 'supabase') return { ok: false, error: 'Supabase no está configurado' };
            const { data, error } = await client.auth.signInWithPassword({ email: email, password: password });
            if (error) return { ok: false, error: error.message };
            authed = true;
            return { ok: true };
        },

        async signOut() {
            if (mode === 'supabase') { await client.auth.signOut(); }
            authed = false;
        },

        isAuthenticated() {
            return mode === 'supabase' ? authed : (sessionStorage.getItem('adminLoggedIn') === 'true');
        },

        // ---- MIGRACIÓN: datos locales → nube ----
        async migrateLocalToCloud() {
            if (mode !== 'supabase') return { ok: false, error: 'Supabase no está configurado' };
            if (!authed) return { ok: false, error: 'Inicia sesión primero' };
            const summary = [];

            const localProducts = localRead('products');
            if (localProducts.length) { await this.setProducts(localProducts); summary.push('productos: ' + localProducts.length); }

            const localShippings = localRead('shippings');
            if (localShippings.length) { await this.setShippings(localShippings); summary.push('envíos: ' + localShippings.length); }

            let added = 0;
            for (const o of localRead('orders')) {
                if (!memory.orders.some(function (x) { return String(x.id) === String(o.id); })) {
                    const r = await this.addOrder(o);
                    if (r.ok) added++;
                }
            }
            if (added) summary.push('pedidos: ' + added);

            added = 0;
            for (const v of localRead('verifications')) {
                if (!memory.verifications.some(function (x) { return String(x.id) === String(v.id); })) {
                    const r = await this.addVerification(v);
                    if (r.ok) added++;
                }
            }
            if (added) summary.push('verificaciones: ' + added);

            added = 0;
            for (const r0 of localRead('returns')) {
                if (!memory.returns.some(function (x) { return String(x.id) === String(r0.id); })) {
                    const r = await this.addReturn(r0);
                    if (r.ok) added++;
                }
            }
            if (added) summary.push('devoluciones: ' + added);

            return { ok: true, summary: summary.length ? summary.join(' • ') : 'No había datos locales nuevos por migrar' };
        }
    };
})();