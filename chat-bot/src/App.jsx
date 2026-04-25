import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [nombreUsuario, setNombreUsuario] = useState(() => {
    return localStorage.getItem('nombreUsuario') || ''
  })
  const mensajesContainerRef = useRef(null)

  // Scroll automático
  useEffect(() => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTop = mensajesContainerRef.current.scrollHeight
    }
  }, [mensajes, escribiendo])

  // Cargar mensajes guardados
  useEffect(() => {
    const guardados = localStorage.getItem('chatMensajes')
    if (guardados) {
      setMensajes(JSON.parse(guardados))
    }
  }, [])

  // Guardar mensajes en localStorage
  useEffect(() => {
    if (mensajes.length > 0) {
      localStorage.setItem('chatMensajes', JSON.stringify(mensajes))
    } else {
      localStorage.removeItem('chatMensajes')
    }
  }, [mensajes])

  // Guardar nombre en localStorage
  useEffect(() => {
    if (nombreUsuario) {
      localStorage.setItem('nombreUsuario', nombreUsuario)
    } else {
      localStorage.removeItem('nombreUsuario')
    }
  }, [nombreUsuario])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const obtenerRespuesta = (textoUsuario) => {
    const texto = textoUsuario.toLowerCase()
    // Detectar nombre
    const nombreMatch = texto.match(/(?:me llamo|mi nombre es)\s+(\w+)/i)
    if (nombreMatch) {
      const nombre = nombreMatch[1]
      setNombreUsuario(nombre)
      return `Encantado de conocerte, ${nombre}.`
    }

    if (texto.includes('hola') || texto.includes('buenas') || texto.includes('holi')) {
      return nombreUsuario ? `¡Hola ${nombreUsuario}! ¿Cómo estás?` : '¡Hola! ¿Cómo estás?'
    }
    if (texto.includes('cómo estás') || texto.includes('como estas')) {
      return nombreUsuario ? `Estoy bien, gracias ${nombreUsuario}. ¿Y tú?` : 'Estoy bien, gracias por preguntar. ¿Y tú?'
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
    // Imágenes por palabras clave
    if (texto.includes('perro')) {
      return 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg'
    }
    if (texto.includes('gato')) {
      return 'https://cdn2.thecatapi.com/images/9j5.jpg'
    }
    return 'Lo siento, no entiendo esa pregunta. ¿Puedes reformular?'
  }

  const obtenerBroma = async () => {
    try {
      const res = await fetch('https://v2.jokeapi.dev/joke/Any?lang=es')
      const data = await res.json()
      if (data.type === 'single') {
        return data.joke
      } else {
        return `${data.setup} ... ${data.delivery}`
      }
    } catch (error) {
      return 'No pude obtener una broma en este momento.'
    }
  }

  const enviarMensaje = async (e) => {
    e.preventDefault()
    if (input.trim() === '') return

    const textoUsuario = input.trim().toLowerCase()

    // Comandos
    if (textoUsuario === '/clear') {
      setMensajes([])
      localStorage.removeItem('chatMensajes')
      setInput('')
      setMensajes([{ id: Date.now(), texto: 'Historial borrado.', remitente: 'bot' }])
      return
    }
    if (textoUsuario === '/help') {
      const ayuda = "Comandos disponibles:\n/clear - Borrar historial\n/help - Mostrar esta ayuda\n/info - Estadísticas del chat"
      setMensajes(prev => [...prev, { id: Date.now(), texto: ayuda, remitente: 'bot' }])
      setInput('')
      return
    }
    if (textoUsuario === '/info') {
      const total = mensajes.length
      const usuarioCount = mensajes.filter(m => m.remitente === 'usuario').length
      const botCount = mensajes.filter(m => m.remitente === 'bot').length
      const info = `Estadísticas:\nTotal mensajes: ${total}\nTuyos: ${usuarioCount}\nMíos: ${botCount}`
      setMensajes(prev => [...prev, { id: Date.now(), texto: info, remitente: 'bot' }])
      setInput('')
      return
    }

    // Agregar mensaje del usuario
    const nuevoMensajeUsuario = {
      id: Date.now(),
      texto: input,
      remitente: 'usuario'
    }
    setMensajes(prev => [...prev, nuevoMensajeUsuario])
    const textoUsuarioOriginal = input
    setInput('')
    setEscribiendo(true)

    // Verificar si es broma
    if (textoUsuario.includes('broma') || textoUsuario.includes('chiste')) {
      const broma = await obtenerBroma()
      const nuevoMensajeBot = {
        id: Date.now() + 1,
        texto: broma,
        remitente: 'bot'
      }
      setMensajes(prev => [...prev, nuevoMensajeBot])
      setEscribiendo(false)
      return
    }

    // Respuesta normal con setTimeout
    setTimeout(() => {
      const respuesta = obtenerRespuesta(textoUsuarioOriginal)
      const nuevoMensajeBot = {
        id: Date.now() + 1,
        texto: respuesta,
        remitente: 'bot'
      }
      setMensajes(prev => [...prev, nuevoMensajeBot])
      setEscribiendo(false)
    }, 800)
  }

  return (
    <div className={`chat-container ${darkMode ? 'dark' : ''}`}>
      <div className="chat-header">
        <button onClick={toggleDarkMode} className="dark-mode-btn">
          {darkMode ? '☀️ Modo claro' : '🌙 Modo oscuro'}
        </button>
      </div>
      <div className="mensajes" ref={mensajesContainerRef}>
        {mensajes.length === 0 && (
          <div className="mensaje-bienvenida">
            ¡Hola! Soy tu Duraccoon. Escribe algo para empezar.
          </div>
        )}
        {mensajes.map((msg) => (
          <div key={msg.id} className={`mensaje ${msg.remitente}`}>
            {msg.remitente === 'bot' && msg.texto.match(/https?:\/\/.*\.(jpg|png|gif)/i) ? (
              <img src={msg.texto} alt="imagen" style={{ maxWidth: '200px', borderRadius: '8px' }} />
            ) : (
              msg.texto
            )}
          </div>
        ))}
        {escribiendo && (
          <div className="mensaje bot escribiendo">
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}
      </div>
      <form className="input-area" onSubmit={enviarMensaje}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje... (/help para comandos)"
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}

export default App