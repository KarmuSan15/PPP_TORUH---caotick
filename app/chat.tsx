// components/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; // Importa el cliente de supabase para interactuar con la base de datos
import Menu from './Menu'; // Importa el componente de menú
import './chat.css';  // Importa el archivo CSS para los estilos del chat

// Definición de la interfaz Message para estructurar los datos de un mensaje
interface Message {
  id: string;
  user_id: string;
  email: string;
  text: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  // Definir los estados para los mensajes, el texto del input, el email y el id del usuario
  const [messages, setMessages] = useState<Message[]>([]); 
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null); // Referencia al contenedor de mensajes para hacer scroll automático

  // Obtener el usuario autenticado cuando se carga el componente
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? ''); // Establecer el email del usuario
        setUserId(user.id); // Establecer el id del usuario
      } else {
        window.location.href = '/login';  // Si no está autenticado, redirigir al login
      }
    };
    fetchUser();

    // Suscripción en tiempo real para recibir mensajes nuevos
    const subscription = supabase
      .channel('realtime:chat_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((currentMessages) => [...currentMessages, payload.new as Message]); // Agregar el nuevo mensaje a la lista
      })
      .subscribe();

    // Limpiar la suscripción al desmontar el componente
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []); // El efecto solo se ejecuta una vez al montar el componente

  // Obtener los mensajes al cargar el componente
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true }); // Obtener los mensajes ordenados por timestamp

      if (error) console.error(error); // Si ocurre un error, mostrarlo
      else setMessages(data); // Establecer los mensajes obtenidos
    };

    fetchMessages();
  }, []); // El efecto solo se ejecuta una vez al montar el componente

  // Función para enviar un mensaje
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !email || !userId) return; // Si no hay texto o datos del usuario, no enviar el mensaje

    const { error } = await supabase.from('chat_messages').insert([{
      user_id: userId,
      email: email,
      text: text,
    }]);

    if (error) console.error(error); // Si ocurre un error al insertar el mensaje, mostrarlo
    setText(''); // Limpiar el input de texto
  };

  // Función para obtener el nombre de usuario a partir del email (parte antes de '@')
  const getUsernameFromEmail = (email: string) => {
    return email.split('@')[0];  // Extraer la parte antes del '@' en el email
  };

  // Función para formatear la marca de tiempo y mostrar solo la hora (sin segundos)
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formato de hora en dos dígitos
  };

  // Función para hacer scroll automático si estamos al final de los mensajes
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
      if (isAtBottom) {
        container.scrollTop = container.scrollHeight; // Desplazar al fondo si estamos al final
      }
    }
  }, [messages]); // Cada vez que los mensajes cambian, ejecutar el efecto

  return (
    <div className="chat-container">
      <Menu /> {/* Componente del menú */}
      <div className="chat-content">
        <h2 className="chat-header">💬 Chat en Tiempo Real 💬</h2>

        {/* Contenedor de los mensajes con scroll manual */}
        <div className="chat-messages-scroller" ref={messagesContainerRef}>
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.user_id === userId ? 'sent' : 'received'}`}>
                <div className="message-bubble">
                  <strong>{getUsernameFromEmail(msg.email)}</strong> {/* Mostrar nombre del usuario */}
                  <div className="message-text">
                    {msg.text} {/* Mostrar texto del mensaje */}
                  </div>
                  <span className="timestamp">
                    {formatTimestamp(msg.timestamp)} {/* Mostrar la hora del mensaje */}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="centered-message">¡Sé el primero en enviar un mensaje! 🚀</p> // Mensaje cuando no hay mensajes
          )}
        </div>

        {/* Formulario para enviar un nuevo mensaje */}
        <form className="chat-form" onSubmit={sendMessage}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)} // Actualizar el texto del input
            placeholder="Escribe un mensaje..."
          />
          <button type="submit">Enviar</button> {/* Botón para enviar el mensaje */}
        </form>
      </div>
    </div>
  );
};

export default Chat;
