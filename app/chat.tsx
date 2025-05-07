// components/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Menu from './Menu';
import './chat.css';  // Importar el archivo CSS para el chat

interface Message {
  id: string;
  user_id: string;
  email: string;
  text: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Obtener el usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? '');
        setUserId(user.id);
      } else {
        window.location.href = '/login';  // Redirigir si no está autenticado
      }
    };
    fetchUser();

    // Suscripción en tiempo real
    const subscription = supabase
      .channel('realtime:chat_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((currentMessages) => [...currentMessages, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Obtener mensajes al cargar
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) console.error(error);
      else setMessages(data);
    };

    fetchMessages();
  }, []);

  // Enviar mensaje
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !email || !userId) return;

    const { error } = await supabase.from('chat_messages').insert([{
      user_id: userId,
      email: email,
      text: text,
    }]);

    if (error) console.error(error);
    setText('');
  };

  // Función para mostrar solo la parte anterior al '@'
  const getUsernameFromEmail = (email: string) => {
    return email.split('@')[0];  // Extraer la parte antes de '@'
  };

  // Función para mostrar la hora sin segundos
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 🔍 Función para hacer scroll automático si estamos al final
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
      if (isAtBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <Menu />
      <div className="chat-content">
        <h2 className="chat-header">💬 Chat en Tiempo Real 💬</h2>

        {/* Contenedor que permite scroll manual */}
        <div className="chat-messages-scroller" ref={messagesContainerRef}>
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.user_id === userId ? 'sent' : 'received'}`}>
                <div className="message-bubble">
                  <strong>{getUsernameFromEmail(msg.email)}</strong>
                  <div className="message-text">
                    {msg.text}
                  </div>
                  <span className="timestamp">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="centered-message">¡Sé el primero en enviar un mensaje! 🚀</p>
          )}
        </div>

        {/* Input para enviar un nuevo mensaje */}
        <form className="chat-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
