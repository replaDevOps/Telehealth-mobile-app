import Pusher from 'pusher-js/react-native';

// Pusher configuration
const PUSHER_KEY = 'c990100ab2e049d3a02a';
const PUSHER_CLUSTER = 'ap2';

class PusherService {
  private pusher: Pusher | null = null;
  private channels: Map<string, any> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initialize Pusher connection
   */
  initialize(): Pusher {
    console.log('🔌 [PusherService] initialize() called');

    if (this.pusher && this.isInitialized) {
      console.log('🔌 [PusherService] Already initialized, returning existing instance');
      return this.pusher;
    }

    console.log('🔌 [PusherService] Creating new Pusher instance...');
    this.pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
    });

    // Connection state change listeners
    this.pusher.connection.bind('connected', () => {
      console.log('🔌 [PusherService] Connected to Pusher');
    });

    this.pusher.connection.bind('disconnected', () => {
      console.log('🔌 [PusherService] Disconnected from Pusher');
    });

    this.pusher.connection.bind('error', (err: any) => {
      console.error('🔌 [PusherService] Connection error:', err);
    });

    this.pusher.connection.bind('state_change', (states: any) => {
      console.log(`🔌 [PusherService] Connection state changed: ${states.previous} -> ${states.current}`);
    });

    this.isInitialized = true;
    console.log('🔌 [PusherService] Pusher initialized successfully');
    return this.pusher;
  }

  /**
   * Get Pusher instance
   */
  getInstance(): Pusher | null {
    if (!this.pusher || !this.isInitialized) {
      this.initialize();
    }
    return this.pusher;
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channelName: string): any {
    console.log(`📡 [PusherService] subscribe() called for channel: ${channelName}`);

    if (!this.pusher) {
      console.log(`📡 [PusherService] Pusher not initialized, initializing now...`);
      this.initialize();
    }

    if (this.channels.has(channelName)) {
      console.log(`📡 [PusherService] Already subscribed to channel: ${channelName}`);
      return this.channels.get(channelName);
    }

    try {
      console.log(`📡 [PusherService] Attempting to subscribe to channel: ${channelName}`);

      const channel = this.pusher!.subscribe(channelName);

      // Listen for subscription success
      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`✅ [PusherService] Successfully subscribed to channel: ${channelName}`);
      });

      // Listen for subscription error
      channel.bind('pusher:subscription_error', (error: any) => {
        console.error(`❌ [PusherService] Subscription error for channel ${channelName}:`, error);
      });

      this.channels.set(channelName, channel);
      console.log(`📡 [PusherService] Channel ${channelName} stored in channels map`);
      return channel;
    } catch (error) {
      console.error(`❌ [PusherService] Error subscribing to channel ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channelName: string): void {
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName);
      if (channel && this.pusher) {
        try {
          // Unbind all events from the channel
          channel.unbind_all();
          // Unsubscribe from the channel
          this.pusher.unsubscribe(channelName);
          this.channels.delete(channelName);
          console.log(`✅ [PusherService] Unsubscribed from channel: ${channelName}`);
        } catch (error) {
          console.error(`❌ [PusherService] Error unsubscribing from channel ${channelName}:`, error);
        }
      }
    }
  }

  /**
   * Bind event to a channel
   */
  bind(channelName: string, eventName: string, callback: (data: any) => void): void {
    console.log(`🔗 [PusherService] bind() called - channel: ${channelName}, event: ${eventName}`);

    // Ensure we are subscribed
    const channel = this.subscribe(channelName);

    // Bind the event
    channel.bind(eventName, callback);
    console.log(`✅ [PusherService] Successfully bound event ${eventName} to channel ${channelName}`);
  }

  /**
   * Unbind event from a channel
   */
  unbind(channelName: string, eventName: string): void {
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.unbind(eventName);
        console.log(`🔗 [PusherService] Unbound event: ${channelName}:${eventName}`);
      }
    }
  }

  /**
   * Disconnect Pusher
   */
  disconnect(): void {
    console.log('🔌 [PusherService] disconnect() called');

    // Unsubscribe from all channels
    const channelNames = Array.from(this.channels.keys());
    console.log(`🔌 [PusherService] Unsubscribing from ${channelNames.length} channels:`, channelNames);

    channelNames.forEach(channelName => {
      this.unsubscribe(channelName);
    });

    if (this.pusher) {
      try {
        console.log('🔌 [PusherService] Disconnecting Pusher instance...');
        this.pusher.disconnect();
        this.pusher = null;
        this.isInitialized = false;
        console.log('✅ [PusherService] Pusher disconnected successfully');
      } catch (error) {
        console.error('❌ [PusherService] Error disconnecting Pusher:', error);
      }
    } else {
      console.log('🔌 [PusherService] No Pusher instance to disconnect');
    }
  }

  /**
   * Check if Pusher is initialized
   */
  getConnectionStatus(): boolean {
    const status = this.isInitialized && this.pusher !== null && this.pusher.connection.state === 'connected';
    console.log(`🔌 [PusherService] getConnectionStatus(): ${status} (isInitialized: ${this.isInitialized}, pusher: ${this.pusher !== null}, state: ${this.pusher?.connection.state})`);
    return status;
  }
}

// Export singleton instance
export const pusherService = new PusherService();
export default pusherService;
