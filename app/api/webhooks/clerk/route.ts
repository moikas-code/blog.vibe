import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, first_name, last_name, image_url } = evt.data

    const authorData = {
      clerk_id: id,
      name: `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous',
      avatar_url: image_url || null,
    }

    try {
      await supabaseAdmin
        .from('authors')
        .upsert(authorData, { onConflict: 'clerk_id' })
    } catch (error) {
      console.error('Error syncing author:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      await supabaseAdmin
        .from('authors')
        .delete()
        .eq('clerk_id', id)
    } catch (error) {
      console.error('Error deleting author:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}