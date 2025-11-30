'use client';

import { useEffect, useRef, useCallback } from 'react';
// @ts-ignore - Vapi Web SDK has unresolved type definitions
import Vapi from '@vapi-ai/web';

// Get Vapi Public Key from environment
const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

// Get Vapi Assistant ID from environment (set in .env.local after creating assistant in Vapi dashboard)
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

// Vapi event types
export type VapiEventType = string; // Flexible to handle various Vapi event names

interface VapiCallbacks {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onConversationUpdate?: (update: any) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

/**
 * Custom React hook to manage Vapi conversation state and events.
 * Handles initialization, event listeners, and cleanup.
 *
 * @param callbacks - Optional callbacks for Vapi events
 * @returns Object with methods to control Vapi conversation
 */
export function useVapi(callbacks?: VapiCallbacks) {
  const vapiInstanceRef = useRef<any>(null);
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  // Initialize Vapi client on first mount
  useEffect(() => {
    if (!vapiInstanceRef.current && VAPI_PUBLIC_KEY) {
      try {
        // @ts-ignore - Vapi SDK initialization
        vapiInstanceRef.current = new Vapi({
          publicKey: VAPI_PUBLIC_KEY,
        });
        console.log('✓ Vapi client initialized successfully');
      } catch (error) {
        console.error('✗ Failed to initialize Vapi client:', error);
      }
    }

    return () => {
      // Cleanup on unmount
      if (vapiInstanceRef.current) {
        try {
          vapiInstanceRef.current.stop();
        } catch (e) {
          console.warn('Error stopping Vapi on cleanup:', e);
        }
      }
    };
  }, []);

  // Setup event listeners when callbacks change
  useEffect(() => {
    if (!vapiInstanceRef.current) return;

    const vapi = vapiInstanceRef.current;

    // Define event handlers
    const handleCallStart = () => {
      console.log('📞 Vapi call started');
      callbacks?.onCallStart?.();
    };

    const handleCallEnd = () => {
      console.log('📞 Vapi call ended');
      callbacks?.onCallEnd?.();
    };

    const handleMessage = (message: any) => {
      console.log('💬 Vapi message:', message);
      callbacks?.onMessage?.(message);
    };

    const handleError = (error: any) => {
      console.error('❌ Vapi error:', error);
      console.log('Error details:', {
        message: error?.message,
        code: error?.code,
        status: error?.status,
        raw: error
      });
      callbacks?.onError?.(error);
    };

    const handleConversationUpdate = (update: any) => {
      console.log('🔄 Vapi conversation update:', update);
      callbacks?.onConversationUpdate?.(update);
    };

    const handleSpeechStart = () => {
      console.log('🎤 User started speaking');
      callbacks?.onSpeechStart?.();
    };

    const handleSpeechEnd = () => {
      console.log('🎤 User stopped speaking');
      callbacks?.onSpeechEnd?.();
    };

    // Register listeners
    try {
      vapi.on('call-start', handleCallStart);
      vapi.on('call-end', handleCallEnd);
      vapi.on('message', handleMessage);
      vapi.on('error', handleError);
      vapi.on('conversation-update', handleConversationUpdate);
      vapi.on('speech-start', handleSpeechStart);
      vapi.on('speech-end', handleSpeechEnd);

      // Store listeners for cleanup
      const listeners = new Map<string, Set<Function>>();
      listeners.set('call-start', new Set([handleCallStart]));
      listeners.set('call-end', new Set([handleCallEnd]));
      listeners.set('message', new Set([handleMessage]));
      listeners.set('error', new Set([handleError]));
      listeners.set('conversation-update', new Set([handleConversationUpdate]));
      listeners.set('speech-start', new Set([handleSpeechStart]));
      listeners.set('speech-end', new Set([handleSpeechEnd]));
      listenersRef.current = listeners;
    } catch (error) {
      console.error('Error setting up Vapi listeners:', error);
    }

    // Cleanup listeners on unmount or callback change
    return () => {
      try {
        vapi.off('call-start', handleCallStart);
        vapi.off('call-end', handleCallEnd);
        vapi.off('message', handleMessage);
        vapi.off('error', handleError);
        vapi.off('conversation-update', handleConversationUpdate);
        vapi.off('speech-start', handleSpeechStart);
        vapi.off('speech-end', handleSpeechEnd);
      } catch (e) {
        console.warn('Error cleaning up Vapi listeners:', e);
      }
    };
  }, [callbacks]);

  // Start Vapi call with optional assistant override
  const startVapiCall = useCallback(
    (assistantOverride?: string) => {
      if (!vapiInstanceRef.current) {
        console.error('Vapi client not initialized');
        return;
      }

      try {
        const assistantId = assistantOverride || VAPI_ASSISTANT_ID;
        if (!assistantId) {
          console.error(
            'No Vapi Assistant ID provided. Please set NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env.local'
          );
          return;
        }

        vapiInstanceRef.current.start(assistantId);
        console.log(`✓ Vapi call started with assistant: ${assistantId}`);
      } catch (error) {
        console.error('Error starting Vapi call:', error);
      }
    },
    []
  );

  // Stop Vapi call
  const stopVapiCall = useCallback(() => {
    if (!vapiInstanceRef.current) {
      console.error('Vapi client not initialized');
      return;
    }

    try {
      vapiInstanceRef.current.stop();
      console.log('✓ Vapi call stopped');
    } catch (error) {
      console.error('Error stopping Vapi call:', error);
    }
  }, []);

  // Check if Vapi call is active
  const isVapiCallActive = useCallback(() => {
    if (!vapiInstanceRef.current) return false;
    return vapiInstanceRef.current.isCallActive?.() ?? false;
  }, []);

  // Send message to Vapi
  const sendVapiMessage = useCallback((message: string) => {
    if (!vapiInstanceRef.current) {
      console.error('Vapi client not initialized');
      return;
    }

    try {
      vapiInstanceRef.current.send(message);
      console.log(`✓ Message sent to Vapi: ${message}`);
    } catch (error) {
      console.error('Error sending message to Vapi:', error);
    }
  }, []);

  // Get Vapi instance (for advanced usage)
  const getVapiInstance = useCallback(() => {
    return vapiInstanceRef.current;
  }, []);

  // Compute ready state
  const isVapiReady = !!vapiInstanceRef.current && !!VAPI_PUBLIC_KEY;

  return {
    startVapiCall,
    stopVapiCall,
    isVapiCallActive,
    sendVapiMessage,
    getVapiInstance,
    isVapiReady,
    vapiAssistantId: VAPI_ASSISTANT_ID,
  };
}

