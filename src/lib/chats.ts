import { supabase } from './supabase';
import type { ChatMessage, ChatSession } from '../types/database';

export async function getChatSessions(options?: {
  status?: 'active' | 'closed';
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('chat_sessions')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
}

export async function createChatSession(data: {
  visitor_id: string;
  visitor_name?: string;
  visitor_email?: string;
}) {
  try {
    // First create the session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        visitor_id: data.visitor_id,
        visitor_name: data.visitor_name,
        visitor_email: data.visitor_email,
        status: 'active'
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Then create an initial system message
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        visitor_id: data.visitor_id,
        content: 'Welcome! How can we help you today?',
        is_from_visitor: false,
        read: true
      });

    if (messageError) throw messageError;

    // Send notification to admins
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-new-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ session }),
      }).then(async (response) => {
        if (!response.ok) {
          const error = await response.json();
          console.warn('Admin notification not sent:', error);
        }
      });
    } catch (notifyError) {
      // Silently handle notification errors to not disrupt chat experience
      console.warn('Could not send admin notification');
    }

    return session;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

export async function getChatMessages(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
}

export async function sendChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export async function markMessagesAsRead(sessionId: string) {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('session_id', sessionId)
      .eq('is_from_visitor', true)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

export async function closeChatSession(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({ status: 'closed' })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error closing chat session:', error);
    throw error;
  }
}