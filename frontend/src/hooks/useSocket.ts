'use client';
import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export const useSocket = (onCandidateUpdate?: (data: any) => void, onNewCandidate?: (data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) socket.connect();

    if (onCandidateUpdate) socket.on('candidate:updated', onCandidateUpdate);
    if (onNewCandidate) socket.on('candidate:new', onNewCandidate);

    return () => {
      if (onCandidateUpdate) socket.off('candidate:updated', onCandidateUpdate);
      if (onNewCandidate) socket.off('candidate:new', onNewCandidate);
    };
  }, []);

  return socketRef;
};
