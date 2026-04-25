import { useState, useEffect, useRef } from 'react'

import './App.css'

function App() {

  const [mensaje, setMensaje] = useState([])

  const [input, setInput] = useState('')

  const [escribiendo, setEscribiendo] = useState(false)

  const mensajesContainerRef = useRef(null)

  useEffect(() => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTop = mensajesContainerRef.current.scrollHeight
    }
  }, [mensajes, escribiendo])

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    const guardados = localStorage.getItem('chatMensajes')
    if (guardados) {
      setMensajes(JSON.parse(guardados))
    }
  }, [])

  // Guardar cada vez que mensajes cambie
  useEffect(() => {
    if (mensajes.length > 0) {
      localStorage.setItem('chatMensajes', JSON.stringify(mensajes))
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
    if (input.trim().toLowerCase() === '/clear') {
      setMensajes([])
      localStorage.removeItem('chatMensajes')
      setInput('')
      return   // Salimos, no enviamos al bot
    }
    if (input.trim().toLowerCase() === '/clear') {
      setMensajes([])
      localStorage.removeItem('chatMensajes')
      setInput('')
      // Añadir un mensaje del bot confirmando
      setMensajes([{ id: Date.now(), texto: '🧹 Historial borrado.', remitente: 'bot' }])
      return
    }
    return 'Lo siento, no entiendo esa pregunta. ¿Puedes reformular?'
  }

  const enviarMensaje = (e) => {
    e.preventDefault()
    if (input.trim() === '') return

    const nuevoMensajeUsuario = {
      id: Date.now(),
      texto: input,
      remitente: 'usuario'
    }

    setMensaje(prev => [...prev, nuevoMensajeUsuario])
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
      setMensaje(prev => [...prev, nuevoMensajeBot])
      setEscribiendo(false)
    }, 800)
  }

  return (
    <div className='chat-container'>
      <div className='mensajes' rel={mensajesContainerRef}>
        {mensaje.length === 0 && (
          <div className='mensaje-bienvenida'>
            ¡Hola! Soy tu Duraccoon. Escribe algo para empezar.
          </div>
        )}
        {mensaje.map((msg) => (
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
