import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Real-time subscription management
 */

type SubscriptionCallback = (payload: any) => void;

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribe(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: SubscriptionCallback,
    filter?: string
  ): () => void {
    const channelName = `${table}-${event}-${filter || 'all'}`;
    
    if (this.channels.has(channelName)) {
      console.warn(`Already subscribed to ${channelName}`);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  presence(channelName: string) {
    const channel = supabase.channel(channelName, {
      config: { presence: { key: '' } },
    });

    return {
      track: (state: any) => channel.track(state),
      untrack: () => channel.untrack(),
      subscribe: (callback: (state: any) => void) => {
        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            callback(state);
          })
          .subscribe();
        
        return () => supabase.removeChannel(channel);
      },
    };
  }
}

export const realtimeManager = new RealtimeManager();
