// ============================================================
// ⚡ CONFIGURACIÓN DE SUPABASE — Tu Zona Táctica CCS
// ============================================================
// INSTRUCCIONES:
// 1. Entra a https://supabase.com con tu cuenta (GitHub/Google)
// 2. Crea un proyecto (ej: tuzona-tactica) y crea la base de datos
// 3. En Project Settings → API copia tus valores aquí abajo:
//    - Project URL  → SUPABASE_URL
//    - anon public  → SUPABASE_ANON_KEY
// 4. Ejecuta el script supabase-setup.sql en el SQL Editor
//
// ⚠️ Mientras los campos estén vacíos ("PONER_..."),
//    la tienda funciona en modo LOCAL (localStorage) como siempre.
// ============================================================

const SUPABASE_URL = "https://zonfcrulxrozzfhaumdm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbmZjcnVseHJvenpmaGF1bWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODE4OTQsImV4cCI6MjA5NDg1Nzg5NH0.E_BYgjHjf9ago1O3xJ-RGogCZPJHQch_z3IcKBz6KtU";

// No modificar: detecta si Supabase está configurado
const SUPABASE_ENABLED = SUPABASE_URL && SUPABASE_ANON_KEY &&
    !SUPABASE_URL.startsWith("PONER_") && !SUPABASE_ANON_KEY.startsWith("PONER_");