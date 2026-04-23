import React from 'react'
import {
  Html, Head, Body, Container, Section, Row, Column,
  Text, Heading, Button, Hr, Preview,
} from '@react-email/components'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import type { Booking } from '@/types/booking'

const resend = new Resend(process.env.RESEND_API_KEY)

const c = {
  moss:     '#2e6b42',
  mossText: 'rgba(255,255,255,0.95)',
  mossMid:  'rgba(255,255,255,0.55)',
  surface:  '#faf8f2',
  surface2: '#ede9dc',
  ink:      '#1e3328',
  inkSoft:  '#4a6358',
  inkMute:  '#7a9082',
  line:     '#d5d1c0',
  white:    '#ffffff',
}

function EmailHeader({ subtitle }: { subtitle: string }) {
  return (
    <Section style={{ backgroundColor: c.moss, borderRadius: '10px 10px 0 0', padding: '18px 24px' }}>
      <Row>
        <Column>
          <Text style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: c.mossText, margin: 0, letterSpacing: '-0.01em' }}>
            Les Tsabloz
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontFamily: 'monospace', fontSize: '8.5px', color: c.mossMid, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            {subtitle}
          </Text>
        </Column>
      </Row>
    </Section>
  )
}

function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
  const pairs: { label: string; value: string }[][] = []
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2))
  }
  return (
    <Section style={{ backgroundColor: c.surface2, borderRadius: '8px', padding: '14px 16px', marginBottom: '20px' }}>
      {pairs.map((pair, i) => (
        <Row key={i} style={{ marginBottom: i < pairs.length - 1 ? '12px' : '0' }}>
          {pair.map((item) => (
            <Column key={item.label}>
              <Text style={{ fontFamily: 'monospace', fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: c.inkMute, margin: 0 }}>
                {item.label}
              </Text>
              <Text style={{ color: c.ink, fontSize: '13px', marginTop: '4px', marginBottom: 0 }}>
                {item.value}
              </Text>
            </Column>
          ))}
        </Row>
      ))}
    </Section>
  )
}

function EmailFooter({ text }: { text: string }) {
  return (
    <>
      <Hr style={{ borderColor: c.line, margin: '0 0 14px' }} />
      <Text style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase', color: c.inkMute, textAlign: 'center', margin: 0 }}>
        {text}
      </Text>
    </>
  )
}

export function ConfirmationEmail({ booking }: { booking: Booking }) {
  const firstName = (booking.name || '').split(' ')[0] || 'vous'
  const calendarUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/${booking.id}/ical`
  const ref = `#TSB-${booking.id.slice(0, 8)}`

  return (
    <Html lang="fr">
      <Head />
      <Preview>Votre réservation aux Tsabloz est confirmée !</Preview>
      <Body style={{ backgroundColor: c.surface, fontFamily: 'Georgia, serif', margin: 0, padding: '24px 16px' }}>
        <Container style={{ maxWidth: '520px', margin: '0 auto' }}>
          <EmailHeader subtitle="Vercorin · Valais" />
          <Section style={{ backgroundColor: c.surface, borderRadius: '0 0 10px 10px', padding: '28px 24px' }}>
            <Text style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: c.moss, margin: '0 0 8px' }}>
              ✦ Réservation confirmée
            </Text>
            <Heading as="h1" style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: c.ink, letterSpacing: '-0.02em', lineHeight: '1.1', margin: '0 0 14px', fontWeight: 400 }}>
              Merci, <em style={{ color: c.moss }}>{firstName}</em>.
            </Heading>
            <Text style={{ fontSize: '13px', color: c.inkSoft, lineHeight: '1.7', margin: '0 0 20px' }}>
              Nous avons le plaisir de confirmer votre réservation aux Tsabloz. Nous avons hâte de vous accueillir !
            </Text>
            <InfoGrid items={[
              { label: 'Arrivée', value: booking.start_date },
              { label: 'Départ',  value: booking.end_date },
              { label: 'Référence', value: ref },
            ]} />
            <Section style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Button href={calendarUrl} style={{ backgroundColor: c.moss, color: '#ffffff', fontSize: '12px', padding: '10px 20px', borderRadius: '7px', textDecoration: 'none', display: 'inline-block' }}>
                Ajouter au calendrier →
              </Button>
            </Section>
            <EmailFooter text="À très bientôt — Les Tsabloz · Vercorin, Valais" />
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function AdminNotificationEmail({ booking, adminUrl }: { booking: Booking; adminUrl: string }) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Nouvelle demande de réservation — {booking.name}</Preview>
      <Body style={{ backgroundColor: c.surface, fontFamily: 'Georgia, serif', margin: 0, padding: '24px 16px' }}>
        <Container style={{ maxWidth: '520px', margin: '0 auto' }}>
          <EmailHeader subtitle="Espace admin" />
          <Section style={{ backgroundColor: c.surface, borderRadius: '0 0 10px 10px', padding: '28px 24px' }}>
            <Text style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: c.moss, margin: '0 0 8px' }}>
              Nouvelle demande
            </Text>
            <Heading as="h1" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: c.ink, letterSpacing: '-0.02em', lineHeight: '1.1', margin: '0 0 14px', fontWeight: 400 }}>
              Demande de <em>{booking.name}</em>
            </Heading>
            <Text style={{ fontSize: '13px', color: c.inkSoft, lineHeight: '1.7', margin: '0 0 20px' }}>
              Une nouvelle demande de réservation a été soumise et attend votre validation.
            </Text>
            <InfoGrid items={[
              { label: 'Nom',    value: booking.name },
              { label: 'Email',  value: booking.email },
              { label: 'Arrivée', value: booking.start_date },
              { label: 'Départ',  value: booking.end_date },
            ]} />
            {booking.message && (
              <Section style={{ backgroundColor: c.white, border: `1px solid ${c.line}`, borderRadius: '7px', padding: '12px 14px', marginBottom: '20px' }}>
                <Text style={{ fontFamily: 'monospace', fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: c.inkMute, margin: '0 0 6px' }}>
                  Message
                </Text>
                <Text style={{ fontSize: '12.5px', color: c.inkSoft, lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                  "{booking.message}"
                </Text>
              </Section>
            )}
            <Section style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Button href={adminUrl} style={{ backgroundColor: c.moss, color: '#ffffff', fontSize: '12px', padding: '10px 20px', borderRadius: '7px', textDecoration: 'none', display: 'inline-block' }}>
                Gérer dans l'espace admin →
              </Button>
            </Section>
            <EmailFooter text="Les Tsabloz · Espace admin" />
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  const html = await render(React.createElement(ConfirmationEmail, { booking }))
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: booking.email,
    subject: 'Votre réservation aux Tsabloz est confirmée',
    html,
  })
}

export async function sendBookingNotification(booking: Booking): Promise<void> {
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin`
  const html = await render(React.createElement(AdminNotificationEmail, { booking, adminUrl }))
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.OWNER_EMAIL!,
    subject: `Nouvelle demande de réservation — ${booking.name}`,
    html,
  })
}
