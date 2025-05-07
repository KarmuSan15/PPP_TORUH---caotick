// LoginScreen.tsx
import React, { useState } from 'react'; // Importa React y el hook useState para gestionar el estado local del componente
import { supabase } from '../lib/supabase'; // Importa la instancia de supabase, que se usa para autenticar usuarios
import './h1.css'; // Importa estilos personalizados para títulos (h1)
import './global.css'; // Importa estilos globales que afectan a toda la aplicación
import './Login.css'; // Importa los estilos específicos de la pantalla de login

// Define las propiedades que el componente espera recibir
interface Props {
  onAuthChange: (user: { email: string; id: string } | null) => void; // Callback para notificar cambios en el estado de autenticación del usuario
}

// Componente funcional LoginScreen que recibe las propiedades especificadas en Props
const LoginScreen: React.FC<Props> = ({ onAuthChange }) => {
  // Definimos los estados del componente usando useState:
  const [email, setEmail] = useState(''); // Estado para almacenar el correo electrónico ingresado por el usuario
  const [password, setPassword] = useState(''); // Estado para almacenar la contraseña ingresada por el usuario
  const [error, setError] = useState(''); // Estado para almacenar mensajes de error (si los hay)
  const [isLogin, setIsLogin] = useState(true); // Estado que indica si el formulario es de login (true) o de registro (false)

  // Función que maneja el envío del formulario de login o registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne el comportamiento por defecto de un formulario HTML (recargar la página al enviarlo)
    setError(''); // Resetea cualquier mensaje de error previo al intentar enviar el formulario

    // Verifica si el usuario está intentando iniciar sesión o registrarse:
    if (isLogin) {
      // Si es un login:
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message); // Si ocurre un error, actualiza el estado de error con el mensaje de error
      } else {
        const user = data.user; // Si no hay error, obtiene el usuario autenticado
        // Llama al callback onAuthChange para notificar el cambio en el estado de autenticación del usuario
        onAuthChange(user ? { email: user.email ?? '', id: user.id } : null);
      }
    } else {
      // Si es un registro:
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError(error.message); // Si ocurre un error, actualiza el estado de error con el mensaje de error
      } else {
        const user = data.user; // Si no hay error, obtiene el usuario registrado
        // Llama al callback onAuthChange para notificar el cambio en el estado de autenticación del usuario
        onAuthChange(user ? { email: user.email ?? '', id: user.id } : null);
      }
    }
  };

  return (
    <div className="login-container"> {/* Contenedor principal del formulario de login */}
      <div className="login-box"> {/* Caja que contiene el formulario de login/registro */}
        {/* Título que cambia dinámicamente según si el usuario está en el formulario de login o registro */}
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        {/* Formulario que maneja el submit con la función handleSubmit */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo de entrada para el correo electrónico */}
          <input
            type="email" // Asegura que el campo solo reciba emails
            placeholder="Correo Electrónico" // Texto de ayuda cuando el campo está vacío
            value={email} // El valor del campo está vinculado al estado 'email'
            onChange={(e) => setEmail(e.target.value)} // Actualiza el estado 'email' con el valor ingresado
            required // Hace el campo obligatorio
            className="input-field" // Aplica el estilo definido en 'Login.css'
          />
          {/* Campo de entrada para la contraseña */}
          <input
            type="password" // Asegura que el campo oculte la contraseña ingresada
            placeholder="Contraseña" // Texto de ayuda cuando el campo está vacío
            value={password} // El valor del campo está vinculado al estado 'password'
            onChange={(e) => setPassword(e.target.value)} // Actualiza el estado 'password' con el valor ingresado
            required // Hace el campo obligatorio
            className="input-field" // Aplica el estilo definido en 'Login.css'
          />
          {/* Botón de envío, que ejecuta el handleSubmit */}
          <button type="submit" className="submit-btn">
            {isLogin ? 'Iniciar sesión' : 'Registrarse'} {/* Muestra el texto adecuado según el estado de 'isLogin' */}
          </button>
        </form>
        {/* Muestra un mensaje de error si lo hay, por ejemplo, si las credenciales son incorrectas */}
        {error && <p className="error-message">{error}</p>}
        <div className="switch-form"> {/* Contenedor para el enlace entre formularios de login y registro */}
          {/* Texto que cambia dependiendo de si el usuario está en login o registro */}
          <span>
            {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes cuenta? '}
            {/* Botón que permite cambiar entre los formularios de login y registro */}
            <button onClick={() => setIsLogin(!isLogin)} className="switch-btn">
              {isLogin ? 'Registrarse' : 'Iniciar sesión'} {/* Muestra el texto adecuado según el estado de 'isLogin' */}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen; // Exporta el componente para que pueda ser utilizado en otros archivos
