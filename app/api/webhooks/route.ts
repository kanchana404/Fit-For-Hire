// app/api/webhooks/route.ts

import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';

import { createUser, updateUser, deleteUser } from '@/actions/userActions';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Error: WEBHOOK_SECRET is not set in environment variables.');
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  // Access headers directly from the request object
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Error: Missing Svix headers');
    return new NextResponse('Error: Missing Svix headers', { status: 400 });
  }

  // Get the raw body as text for signature verification
  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error: Verification failed', { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0]?.email_address || '',
      username: username || '',
      firstName: first_name || '',
      lastName: last_name || '',
      photo: image_url || '',
      scans: 3, // Set scans to default value 3
    };

    try {
      const newUser = await createUser(user);
      console.log(`User created successfully: ${newUser.clerkId}`);
      return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 200 });
    } catch (error) {
      console.error('Error creating user:', error);
      return new NextResponse('Error creating user', { status: 500 });
    }
  } else if (eventType === 'user.updated') {
    const { id, first_name, last_name, username, image_url } = evt.data;

    if (!id) {
      console.error('Error: User ID is missing in user.updated event');
      return new NextResponse('Error: User ID is missing', { status: 400 });
    }

    const updateData = {
      firstName: first_name || '',
      lastName: last_name || '',
      username: username || '',
      photo: image_url || '',
    };

    try {
      const updatedUser = await updateUser(id, updateData);
      if (updatedUser) {
        console.log(`User updated successfully: ${updatedUser.clerkId}`);
        return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });
      } else {
        console.warn(`User with Clerk ID ${id} not found for update.`);
        return new NextResponse('User not found for update', { status: 404 });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return new NextResponse('Error updating user', { status: 500 });
    }
  } else if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (!id) {
      console.error('Error: User ID is missing in user.deleted event');
      return new NextResponse('Error: User ID is missing', { status: 400 });
    }

    try {
      const deletedUser = await deleteUser(id);
      if (deletedUser) {
        console.log(`User deleted successfully: ${deletedUser.clerkId}`);
        return NextResponse.json({ message: 'User deleted successfully', user: deletedUser }, { status: 200 });
      } else {
        console.warn(`User with Clerk ID ${id} not found for deletion.`);
        return new NextResponse('User not found for deletion', { status: 404 });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return new NextResponse('Error deleting user', { status: 500 });
    }
  }

  // For unhandled event types, return a 200 response
  console.log(`Unhandled event type: ${eventType}`);
  return new NextResponse('Event not handled', { status: 200 });
}
