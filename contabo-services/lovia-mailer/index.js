/**
 * LovIA! — Servicio de Correos Secuenciales (Contabo/PM2)
 * 
 * Este servidor Express está diseñado para ejecutarse en el VPS de Contabo
 * bajo PM2. Recibe Webhooks de Supabase y envía correos vía Resend.com
 * 
 * Instrucciones de ejecución en Contabo:
 * 1. npm install express @supabase/supabase-js resend cors
 * 2. pm2 start index.js --name "lovia-mailer"
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

const app = express()
app.use(express.json())
app.use(cors())

// Configurar clientes (las llaves se sacan de .env en Contabo)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

const PORT = 3002 // Puerto designado para LovIA interno en el VPS

// ─────────────────────────────────────────────────────────────
// WEBHOOK: Disparado por Supabase cuando hay un INSERT en auth.users
// ─────────────────────────────────────────────────────────────
app.post('/webhooks/on-user-registered', async (req, res) => {
  try {
    // 1. Recibir datos del nuevo usuario desde Supabase
    const { record } = req.body
    if (!record || !record.id) {
       return res.status(400).json({ error: 'Payload de Supabase no válido.' })
    }

    const email = record.email
    const user_id = record.id
    const name = record.raw_user_meta_data?.name || 'Explorador/a'

    console.log(`[MAILER] Nuevo usuario detectado: ${email}`)

    // 2. Enviar EMAIL 1: Bienvenida Inmediata
    const mail1 = await resend.emails.send({
      from: 'LovIA Bienvenida <hola@lovia.app>',
      to: email,
      subject: `Bienvenido/a a la Ingeniería Relacional, ${name}.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
          <h2 style="color: #FF6B8A;">¡Hola ${name}!</h2>
          <p>Bienvenido/a a <strong>LovIA!</strong> Nos emociona tenerte aquí.</p>
          <p>Has dado el primer paso hacia conexiones más reales y conscientes. LovIA no es una app de citas tradicional, es un ecosistema basado en el modelo del psicólogo J. P. Peña, diseñado para entender desde dónde te conectas.</p>
          <p><strong>¿Qué sigue?</strong></p>
          <p>Te invitamos a completar tu cuestionario inicial para descubrir tu <em>Puntaje de Frecuencia</em> en las tres líneas: Amor, Sexual y Realización.</p>
          <a href="https://lovia.app/onboarding" style="display:inline-block; padding: 12px 24px; background-color: #A855F7; color: #fff; text-decoration: none; border-radius: 8px; margin-top: 20px;">Descubrir mi Frecuencia</a>
          <br><br>
          <p>Con cariño,<br>El equipo de LovIA</p>
        </div>
      `
    })

    // 3. Programar EMAIL 2 (Recordatorio Onboarding 48h) y EMAIL 3 (Tests)
    // Para no usar jobs complejos (Redis/Bull) en versión MVP,
    // usamos una tabla en Supabase `scheduled_emails` que un cron lee.
    
    // Programar a +48 horas para Recordatorio Onboarding
    let date48h = new Date()
    date48h.setHours(date48h.getHours() + 48)

    // Programar a +5 días para Invitación a Test Stroop/Digit Span
    let date5d = new Date()
    date5d.setDate(date5d.getDate() + 5)

    await supabase.from('scheduled_emails').insert([
      {
        user_id: user_id,
        email_type: 'onboarding_reminder_48h',
        send_at: date48h.toISOString(),
      },
      {
        user_id: user_id,
        email_type: 'cognitive_tests_invite_120h',
        send_at: date5d.toISOString(),
      }
    ])

    return res.status(200).json({ success: true, email_id: mail1.id })
  } catch (error) {
    console.error('[MAILER ERROR]', error)
    return res.status(500).json({ error: error.message })
  }
})

// ─────────────────────────────────────────────────────────────
// CRON JOB INTERNO: Leer correos programados cada hora
// ─────────────────────────────────────────────────────────────
// Nota: Puedes disparar esta URL desde pg_cron en Supabase o un setInterval local.
app.post('/cron/send-scheduled', async (req, res) => {
  try {
    const { data: pendingMails, error } = await supabase
      .from('scheduled_emails')
      .select('*, profiles!inner(name, email)')
      .eq('status', 'pending')
      .lte('send_at', new Date().toISOString())

    if (error) throw error

    for (const job of pendingMails) {
      if (job.email_type === 'onboarding_reminder_48h') {
        await resend.emails.send({
          from: 'LovIA Growth <crecimiento@lovia.app>',
          to: job.profiles.email,
          subject: `${job.profiles.name}, tu Frecuencia te espera 📈`,
          html: `<p>Hola! Hemos notado que tu perfil puede mejorar... entra a continuar tu onboarding.</p>`
        })
      }
      
      // Marcar como enviado
      await supabase.from('scheduled_emails').update({ status: 'sent' }).eq('id', job.id)
    }

    res.json({ processed: pendingMails.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 LovIA Mailer corriendo en puerto ${PORT}`)
  console.log(`Esperando webhooks de Supabase en /webhooks/on-user-registered`)
})
