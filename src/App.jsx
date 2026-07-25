import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// ⚠️ Pon aquí la URL de tu backend en Railway
const BACKEND = 'https://parking-backend-production-0748.up.railway.app'

const socket = io(BACKEND)
const API    = BACKEND + '/api'

export default function App() {
  const [dato,      setDato]      = useState({ temperatura: '--', humedad: '--' })
  const [historial, setHistorial] = useState([])

  useEffect(() => {
    axios.get(`${API}/estado`)
      .then(r => setDato(r.data))
      .catch(() => console.log('Esperando datos...'))

    axios.get(`${API}/historial`)
      .then(r => {
        setHistorial(r.data.reverse().map(h => ({
          ...h,
          hora: new Date(h.timestamp).toLocaleTimeString()
        })))
      })
      .catch(() => console.log('Sin historial aún'))

    socket.on('nuevo_dato', (data) => {
      setDato(data)
      setHistorial(prev => [...prev, {
        ...data,
        hora: new Date(data.timestamp).toLocaleTimeString()
      }].slice(-20))
    })

    return () => socket.off('nuevo_dato')
  }, [])

  return (
    <div style={{
      background: '#0f172a', minHeight: '100vh',
      padding: '20px', color: 'white', fontFamily: 'sans-serif'
    }}>

      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px' }}>
        🌡️ Monitor IoT — Sensor de Ambiente
      </h1>

      {/* Tarjetas */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '30px' }}>
        <div style={{
          flex: 1, background: '#1e293b', borderRadius: '16px',
          padding: '24px', textAlign: 'center'
        }}>
          <p style={{ color: '#94a3b8', marginBottom: '8px' }}>🌡️ Temperatura</p>
          <p style={{ fontSize: '52px', fontWeight: 'bold', color: '#f97316', margin: 0 }}>
            {dato.temperatura}°C
          </p>
        </div>
        <div style={{
          flex: 1, background: '#1e293b', borderRadius: '16px',
          padding: '24px', textAlign: 'center'
        }}>
          <p style={{ color: '#94a3b8', marginBottom: '8px' }}>💧 Humedad</p>
          <p style={{ fontSize: '52px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
            {dato.humedad}%
          </p>
        </div>
      </div>

      {/* Gráfica */}
      <div style={{
        background: '#1e293b', borderRadius: '16px',
        padding: '20px', marginBottom: '24px'
      }}>
        <h2 style={{ marginBottom: '16px', color: '#94a3b8' }}>
          📈 Historial en tiempo real
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={historial}>
            <XAxis dataKey="hora" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{
              background: '#0f172a', border: 'none', borderRadius: '8px'
            }} />
            <Legend />
            <Line type="monotone" dataKey="temperatura"
              stroke="#f97316" dot={false} name="Temp °C" />
            <Line type="monotone" dataKey="humedad"
              stroke="#38bdf8" dot={false} name="Humedad %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Lista */}
      <h2 style={{ marginBottom: '12px', color: '#94a3b8' }}>
        🗂️ Últimas lecturas
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[...historial].reverse().slice(0, 10).map((h, i) => (
          <div key={i} style={{
            background: '#1e293b', borderRadius: '10px', padding: '12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>
              🌡️ <strong style={{ color: '#f97316' }}>{h.temperatura}°C</strong>
              &nbsp;&nbsp;
              💧 <strong style={{ color: '#38bdf8' }}>{h.humedad}%</strong>
            </span>
            <span style={{ color: '#64748b', fontSize: '12px' }}>{h.hora}</span>
          </div>
        ))}
      </div>

    </div>
  )
}