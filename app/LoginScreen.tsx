// LoginScreen.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './h1.css';
import './global.css';
import './Login.css';

interface Props {
  onAuthChange: (user: { email: string; id: string } | null) => void;
}

const LoginScreen: React.FC<Props> = ({ onAuthChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
      } else {
        const user = data.user;
        onAuthChange(user ? { email: user.email ?? '', id: user.id } : null);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError(error.message);
      } else {
        const user = data.user;
        onAuthChange(user ? { email: user.email ?? '', id: user.id } : null);
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
            {isLogin ? '¿No tienes una cuenta? ' : '¿Ya tienes cuenta? '}
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
