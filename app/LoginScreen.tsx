import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Importa la configuración de Supabase
import './h1.css';
import './global.css'; 
import './Login.css'

interface Props {
  onAuthChange: (user: { email: string } | null) => void; // Callback para actualizar el estado en Index
}

const LoginScreen: React.FC<Props> = ({ onAuthChange }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLogin, setIsLogin] = useState<boolean>(true); // Determina si estamos en login o registro

  // Maneja el login o el registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onAuthChange(data.user ? { email: data.user.email ?? '' } : null); // Actualiza el estado en Index
      }
    } else {
      // Registrar
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onAuthChange(data.user ? { email: data.user.email ?? '' } : null); // Actualiza el estado en Index
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          <button type="submit" className="submit-btn">
            {isLogin ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <div className="switch-form">
          <span>
            {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes cuenta? "}
            <button onClick={() => setIsLogin(!isLogin)} className="switch-btn">
              {isLogin ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
