import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyToken } from "../utils/jwt";

import { generateRoomCode } from "../utils/randomUtils";
import config from "../config";

/**
 * WebSocket / Socket.io Handler
 * Handles real-time multiplayer racing
 *
 * Architecture:
 * - Users connect with JWT token
 * - Create or join race rooms
 * - Real-time WPM/progress updates
 * - Finish detection and ranking
 */

interface RaceRoom {
  id: string;
  roomCode: string;
  createdBy: string;
  participants: RaceParticipant[];
  status: "waiting" | "in_progress" | "completed";
  startedAt: number | null;
  endedAt: number | null;
  duration: number; // seconds
  wordList: string[];
}

interface RaceParticipant {
  userId: string;
  username: string;
  socketId: string;
  wpm: number;
  accuracy: number;
  progress: number; // percentage
  finished: boolean;
  finishedAt: number | null;
  position: number | null;
}

// Active race rooms
const activeRooms = new Map<string, RaceRoom>();
const userToRoom = new Map<string, string>(); // socket.id -> roomCode

/**
 * Initialize Socket.io handlers
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: config.socketIo.cors,
    transports: ["websocket", "polling"],
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    try {
      const payload = verifyToken(token);
      (socket as any).user = payload;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.userId} (${socket.id})`);

    /**
     * Create new race room
     */
    socket.on("race:create", async (data: any, callback: any) => {
      try {
        const roomCode = generateRoomCode();
        const room: RaceRoom = {
          id: roomCode,
          roomCode,
          createdBy: user.userId,
          participants: [
            {
              userId: user.userId,
              username: user.username,
              socketId: socket.id,
              wpm: 0,
              accuracy: 100,
              progress: 0,
              finished: false,
              finishedAt: null,
              position: null,
            },
          ],
          status: "waiting",
          startedAt: null,
          endedAt: null,
          duration: data.duration || 60,
          wordList: data.wordList || [],
        };

        activeRooms.set(roomCode, room);
        userToRoom.set(socket.id, roomCode);

        // Join socket.io room
        socket.join(roomCode);

        callback({ success: true, roomCode, room });
        io.to(roomCode).emit("race:updated", room);
      } catch (error) {
        callback({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create room",
        });
      }
    });

    /**
     * Join existing race room
     */
    socket.on("race:join", (data: any, callback: any) => {
      try {
        const { roomCode } = data;
        const room = activeRooms.get(roomCode);

        if (!room) {
          callback({ success: false, error: "Room not found" });
          return;
        }

        if (room.status !== "waiting") {
          callback({ success: false, error: "Race already started" });
          return;
        }

        // Add participant
        const participant: RaceParticipant = {
          userId: user.userId,
          username: user.username,
          socketId: socket.id,
          wpm: 0,
          accuracy: 100,
          progress: 0,
          finished: false,
          finishedAt: null,
          position: null,
        };

        room.participants.push(participant);
        userToRoom.set(socket.id, roomCode);

        socket.join(roomCode);

        callback({ success: true, roomCode, room });
        io.to(roomCode).emit("race:updated", room);
      } catch (error) {
        callback({
          success: false,
          error: error instanceof Error ? error.message : "Failed to join room",
        });
      }
    });

    /**
     * Start race
     */
    socket.on("race:start", (_data: any, callback: any) => {
      try {
        const roomCode = userToRoom.get(socket.id);
        if (!roomCode) {
          callback({ success: false, error: "Not in a room" });
          return;
        }

        const room = activeRooms.get(roomCode);
        if (!room || room.status !== "waiting") {
          callback({ success: false, error: "Invalid room state" });
          return;
        }

        // Only creator can start
        if (room.createdBy !== user.userId) {
          callback({ success: false, error: "Only room creator can start" });
          return;
        }

        room.status = "in_progress";
        room.startedAt = Date.now();

        callback({ success: true });
        io.to(roomCode).emit("race:started", { startTime: room.startedAt });
      } catch (error) {
        callback({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to start race",
        });
      }
    });

    /**
     * Update progress during race
     */
    socket.on("race:progress", (data: any) => {
      try {
        const roomCode = userToRoom.get(socket.id);
        if (!roomCode) return;

        const room = activeRooms.get(roomCode);
        if (!room || room.status !== "in_progress") return;

        const participant = room.participants.find(
          (p) => p.socketId === socket.id,
        );
        if (!participant) return;

        // Update participant stats
        participant.wpm = data.wpm || 0;
        participant.accuracy = data.accuracy || 100;
        participant.progress = data.progress || 0;

        // Broadcast to all participants
        io.to(roomCode).emit("race:progress", {
          userId: user.userId,
          username: user.username,
          wpm: participant.wpm,
          accuracy: participant.accuracy,
          progress: participant.progress,
        });
      } catch (error) {
        console.error("Progress update error:", error);
      }
    });

    /**
     * Finish race
     */
    socket.on("race:finish", (data: any, callback: any) => {
      try {
        const roomCode = userToRoom.get(socket.id);
        if (!roomCode) {
          callback({ success: false, error: "Not in a room" });
          return;
        }

        const room = activeRooms.get(roomCode);
        if (!room || room.status !== "in_progress") {
          callback({ success: false, error: "Race not in progress" });
          return;
        }

        const participant = room.participants.find(
          (p) => p.socketId === socket.id,
        );
        if (!participant) {
          callback({ success: false, error: "Participant not found" });
          return;
        }

        // Mark as finished
        participant.finished = true;
        participant.finishedAt = Date.now();

        // Calculate position
        const finishedCount = room.participants.filter(
          (p) => p.finished,
        ).length;
        participant.position = finishedCount;

        callback({ success: true, position: participant.position });

        // Update final stats
        participant.wpm = data.wpm || 0;
        participant.accuracy = data.accuracy || 100;

        // Broadcast finishing
        io.to(roomCode).emit("race:participant-finished", {
          username: user.username,
          position: participant.position,
          wpm: participant.wpm,
        });

        // Check if all finished
        if (room.participants.every((p) => p.finished)) {
          room.status = "completed";
          room.endedAt = Date.now();
          io.to(roomCode).emit("race:completed", room);

          // Clean up after delay
          setTimeout(() => {
            activeRooms.delete(roomCode);
          }, 5000);
        }
      } catch (error) {
        callback({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to finish race",
        });
      }
    });

    /**
     * Disconnect handler
     */
    socket.on("disconnect", () => {
      const roomCode = userToRoom.get(socket.id);
      if (roomCode) {
        const room = activeRooms.get(roomCode);
        if (room) {
          // Remove participant
          room.participants = room.participants.filter(
            (p) => p.socketId !== socket.id,
          );

          // Clean up empty rooms
          if (room.participants.length === 0) {
            activeRooms.delete(roomCode);
          } else {
            io.to(roomCode).emit("race:updated", room);
          }
        }
        userToRoom.delete(socket.id);
      }

      console.log(`User disconnected: ${user.userId} (${socket.id})`);
    });
  });

  return io;
}

export default initializeWebSocket;
