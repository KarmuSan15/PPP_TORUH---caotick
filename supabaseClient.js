// Importación del cliente de Supabase
import { createClient } from "@supabase/supabase-js";

// Creación del cliente de Supabase utilizando variables de entorno
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,    // URL de Supabase, obtenida de las variables de entorno
  process.env.REACT_APP_SUPABASE_ANON_KEY // Clave pública (anon key), obtenida de las variables de entorno
);

// Exportación del cliente para usarlo en cualquier parte de la aplicación
export default supabase;
