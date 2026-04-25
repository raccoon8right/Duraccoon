import { useState, useEffect, useRef } from 'react'

import './App.css'

function App() {

  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const mensajesContainerRef = useRef(null)
  // Scroll automático
  useEffect(() => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTop = mensajesContainerRef.current.scrollHeight
    }
  }, [mensajes, escribiendo])
  // Cargar mensajes guardados al iniciar
  useEffect(() => {
    const guardados = localStorage.getItem('chatMensajes')
    if (guardados) {
      setMensajes(JSON.parse(guardados))
    }
  }, [])
  // Guardar mensajes en localStorage cada vez que cambien
  useEffect(() => {
    if (mensajes.length > 0) {
      localStorage.setItem('chatMensajes', JSON.stringify(mensajes))
    } else {
      localStorage.removeItem('chatMensajes')
    }
  }, [mensajes])

  const obtenerRespuesta = (textoUsuario) => {
    const texto = textoUsuario.toLowerCase()
    if (texto.includes('hola') || texto.includes('buenas') || texto.includes('holi')) {
      return '¡Hola! ¿Cómo estás?'
    }
    if (texto.includes('cómo estás') || texto.includes('como estas')) {
      return 'Estoy bien, gracias por preguntar. ¿Y tú?'
    }
    if (texto.includes('bien') || texto.includes('muy bien')) {
      return 'Me alegra mucho que estés bien.'
    }
    if (texto.includes('adiós') || texto.includes('chao') || texto.includes('hasta luego')) {
      return 'Chao, fue un gusto conversar. ¡Vuelve pronto!'
    }
    if (texto.includes('gracias')) {
      return '¡De nada! Para eso estoy.'
    }
    if (texto.includes('que haces') || texto.includes('qué haces')) {
      return 'Estoy aprendiendo a conversar. ¿Tú qué haces?'
    }
    return 'Lo siento, no entiendo esa pregunta. ¿Puedes reformular?'
  }

  const enviarMensaje = (e) => {
    e.preventDefault()
    if (input.trim() === '') return

    // Comando /clear
    if (input.trim().toLowerCase() === '/clear') {
      setMensajes([])
      localStorage.removeItem('chatMensajes')
      setInput('')
      // Opcional: mostrar mensaje de confirmación del bot
      setMensajes([{ id: Date.now(), texto: 'Historial borrado.', remitente: 'bot' }])
      return
    }
    // Comando /help
    if (input.trim().toLowerCase() === '/help') {
      const ayuda = "Comandos disponibles:\n/clear - Borra historial\n/help - Muestra esta ayuda\n/info - Estadísticas del chat";
      setMensajes(prev => [...prev, { id: Date.now(), texto: ayuda, remitente: 'bot' }]);
      setInput('');
      return;
    }
    // Comando /info
    if (input.trim().toLowerCase() === '/info') {
      const total = mensajes.length;
      const usuarioCount = mensajes.filter(m => m.remitente === 'usuario').length;
      const botCount = mensajes.filter(m => m.remitente === 'bot').length;
      const info = `Estadísticas:\nMensajes totales: ${total}\nTuyos: ${usuarioCount}\nMíos: ${botCount}`;
      setMensajes(prev => [...prev, { id: Date.now(), texto: info, remitente: 'bot' }]);
      setInput('');
      return;
    }

    const nuevoMensajeUsuario = {
      id: Date.now(),
      texto: input,
      remitente: 'usuario'
    }

    setMensajes(prev => [...prev, nuevoMensajeUsuario])
    const textoUsuario = input
    setInput('')

    setEscribiendo(true)

    setTimeout(() => {
      const respuestaBot = obtenerRespuesta(textoUsuario)
      const nuevoMensajeBot = {
        id: Date.now() + 1,
        texto: respuestaBot,
        remitente: 'bot'
      }
      setMensajes(prev => [...prev, nuevoMensajeBot])
      setEscribiendo(false)
    }, 800)
  }

  return (
    <div className='chat-container'>
      <div className='mensajes' ref={mensajesContainerRef}>
        {mensajes.length === 0 && (
          <div className='mensaje-bienvenida'>
            ¡Hola! Soy tu Duraccoon. Escribe algo para empezar.
          </div>
        )}
        {mensajes.map((msg) => (
          <div key={msg.id} className={`mensaje ${msg.remitente}`}>
            {msg.texto}
          </div>
        ))}
        {escribiendo && (
          <div className='mensaje bot escribiendo'>
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}
      </div>

      <form className='input-area' onSubmit={enviarMensaje}>
        <input type='text' value={input} onChange={(e) => setInput(e.target.value)} placeholder='Escribe un mensaje...' />
        <button type='submit'>Enviar</button>
      </form>
    </div>
  )
}
export default App