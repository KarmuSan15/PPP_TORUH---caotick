// Importación del cliente de Supabase
import { createClient } from '@supabase/supabase-js';

// Importación de las variables de entorno para la URL y la clave de Supabase
import { SUPABASE_URL, SUPABASE_KEY } from '@env';

// Creación del cliente de Supabase con la URL y la clave privada
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  // Configuración de autenticación
  auth: {
    autoRefreshToken: true,      // Refresca el token de sesión automáticamente
    persistSession: true,        // Mantiene la sesión persistente en el almacenamiento local
    detectSessionInUrl: true,    // Detecta la sesión en la URL después de un redireccionamiento
  },
});

// Exportación del cliente para usarlo en toda la aplicación
export { supabase };
