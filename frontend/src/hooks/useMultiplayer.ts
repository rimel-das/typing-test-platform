import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../context/authStore";

/**
 * Custom Hook: useMultiplayer
 * Manages WebSocket connection for multiplayer racing
 */

interface RaceParticipant {
  username: string;
  wpm: number;
  accuracy: number;
  progress: number;
  position?: number;
  finished: boolean;
}

export function useMultiplayer() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);
  const [raceStatus, setRaceStatus] = useState<
    "waiting" | "in_progress" | "completed"
  >("waiting");
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");
    const newSocket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to multiplayer");
    });

    newSocket.on("connect_error", (err) => {
      setError(err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Create race room
  const createRoom = useCallback(
    (duration: number, wordList: string[]) => {
      if (!socket) return;

      socket.emit("race:create", { duration, wordList }, (response: any) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setParticipants(response.room.participants);
          setError(null);
        } else {
          setError(response.error);
        }
      });
    },
    [socket],
  );

  // Join race room
  const joinRoom = useCallback(
    (code: string) => {
      if (!socket) return;

      socket.emit("race:join", { roomCode: code }, (response: any) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setParticipants(response.room.participants);
          setError(null);
        } else {
          setError(response.error);
        }
      });
    },
    [socket],
  );

  // Start race
  const startRace = useCallback(() => {
    if (!socket || !roomCode) return;

    socket.emit("race:start", {}, (response: any) => {
      if (!response.success) {
        setError(response.error);
      }
    });
  }, [socket, roomCode]);

  // Update progress
  const updateProgress = useCallback(
    (wpm: number, accuracy: number, progress: number) => {
      if (!socket || !roomCode) return;
      socket.emit("race:progress", { wpm, accuracy, progress });
    },
    [socket, roomCode],
  );

  // Finish race
  const finishRace = useCallback(
    (wpm: number, accuracy: number) => {
      if (!socket || !roomCode) return;

      socket.emit("race:finish", { wpm, accuracy }, (response: any) => {
        if (!response.success) {
          setError(response.error);
        }
      });
    },
    [socket, roomCode],
  );

  // Listen for race updates
  useEffect(() => {
    if (!socket) return;

    socket.on("race:updated", (room: any) => {
      setParticipants(room.participants);
    });

    socket.on("race:started", () => {
      setRaceStatus("in_progress");
    });

    socket.on("race:progress", (data: any) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.username === data.username
            ? {
                ...p,
                wpm: data.wpm,
                accuracy: data.accuracy,
                progress: data.progress,
              }
            : p,
        ),
      );
    });

    socket.on("race:participant-finished", (data: any) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.username === data.username
            ? { ...p, finished: true, position: data.position, wpm: data.wpm }
            : p,
        ),
      );
    });

    socket.on("race:completed", () => {
      setRaceStatus("completed");
    });

    return () => {
      socket.off("race:updated");
      socket.off("race:started");
      socket.off("race:progress");
      socket.off("race:participant-finished");
      socket.off("race:completed");
    };
  }, [socket]);

  return {
    roomCode,
    participants,
    raceStatus,
    error,
    createRoom,
    joinRoom,
    startRace,
    updateProgress,
    finishRace,
  };
}

export default useMultiplayer;
