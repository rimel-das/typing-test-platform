# API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained from login endpoint and sent in responses.

## Endpoints

### 1. Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Validation Rules:**

- Username: 3-32 characters, alphanumeric + underscore/hyphen
- Email: Valid email format
- Password: Minimum 8 characters
- confirmPassword: Must match password

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "display_name": "John Doe",
    "avatar_url": "https://..."
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Error (401):**

```json
{
  "error": "Invalid credentials"
}
```

#### Get Current User

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "display_name": "John Doe",
  "avatar_url": "https://...",
  "bio": "I love typing",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Update Profile

```http
PUT /auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "display_name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "I love typing"
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "display_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "I love typing"
  }
}
```

### 2. Typing Tests

#### Submit Test Result

```http
POST /tests/submit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "originalText": "The quick brown fox jumps over the lazy dog",
  "typedText": "The quick brown fox jumps over the lazy dog",
  "duration": 60,
  "difficulty": "normal",
  "language": "english",
  "mode": "time",
  "testType": "normal",
  "durationActual": 58,
  "inputHistory": [
    { "timestamp": 100, "char": "T" },
    { "timestamp": 150, "char": "h" },
    ...
  ]
}
```

**Required Fields:**

- `originalText`: Text the user needed to type
- `typedText`: What the user actually typed
- `duration`: Test duration in seconds (15-3600)
- `difficulty`: "easy", "normal", or "hard"

**Optional Fields:**

- `language`: Default "english"
- `mode`: Default "time" (options: time, words, quote, zen)
- `testType`: Default "normal" (options: normal, punctuation, numbers)
- `durationActual`: Actual time taken (for validation)
- `inputHistory`: Array of keystroke events for analysis

**Response (201):**

```json
{
  "message": "Test submitted successfully",
  "test": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "wpm": 75.5,
    "accuracy": 98.5,
    "consistency": 92.3,
    "created_at": "2024-01-15T11:45:00Z"
  }
}
```

**Validation:**

- Maximum WPM: 300
- Accuracy: 0-100%
- Test duration must match (within 50% tolerance)

#### Get Test History

```http
GET /tests/history?limit=50&offset=0
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `limit`: Number of results (default: 50, max: 500)
- `offset`: Pagination offset (default: 0)

**Response (200):**

```json
{
  "tests": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "wpm": 75.5,
      "accuracy": 98.5,
      "consistency": 92.3,
      "difficulty": "normal",
      "duration": 60,
      "created_at": "2024-01-15T11:45:00Z"
    },
    ...
  ],
  "count": 10
}
```

#### Get User Statistics

```http
GET /tests/statistics
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "total_tests": 42,
  "total_time_typing": 2520,
  "avg_wpm": 68.5,
  "max_wpm": 95.3,
  "min_wpm": 45.2,
  "avg_accuracy": 96.8,
  "avg_consistency": 89.2,
  "tests_easy": 5,
  "tests_normal": 30,
  "tests_hard": 7,
  "current_streak": 3,
  "longest_streak": 8,
  "updated_at": "2024-01-15T11:45:00Z"
}
```

#### Get Best Test

```http
GET /tests/best
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "wpm": 95.3,
  "accuracy": 99.2,
  "consistency": 94.5,
  "difficulty": "hard",
  "created_at": "2024-01-10T14:20:00Z"
}
```

#### Get Test by ID

```http
GET /tests/:testId
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "wpm": 75.5,
  "accuracy": 98.5,
  "consistency": 92.3,
  "raw_wpm": 76.2,
  "difficulty": "normal",
  "duration": 60,
  "language": "english",
  "characters_typed": 450,
  "correct_characters": 443,
  "incorrect_characters": 7,
  "extra_characters": 0,
  "missed_characters": 2,
  "created_at": "2024-01-15T11:45:00Z"
}
```

### 3. Leaderboard

#### Get Global Leaderboard

```http
GET /leaderboard?period=all_time&limit=100&offset=0
```

**Query Parameters:**

- `period`: "daily", "weekly", "monthly", "all_time" (default: "all_time")
- `limit`: Results per page (default: 100, max: 1000)
- `offset`: Pagination offset

**Response (200):**

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "typing_master",
      "wpm": 150.5,
      "accuracy": 99.4,
      "tests_completed": 248,
      "avg_consistency": 95.2
    },
    {
      "rank": 2,
      "user_id": "660e8400-e29b-41d4-a716-446655440001",
      "username": "speed_demon",
      "wpm": 145.2,
      "accuracy": 98.9,
      "tests_completed": 201,
      "avg_consistency": 93.8
    },
    ...
  ],
  "period": "all_time"
}
```

#### Get User Rank

```http
GET /leaderboard/:userId/rank?period=all_time
```

**Response (200):**

```json
{
  "rank": 5,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "wpm": 95.3,
  "tests_completed": 42
}
```

**Response (404):**

```json
{
  "error": "User not ranked"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "username",
      "message": "Username must be 3-32 characters"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Missing or invalid Authorization header",
  "code": "MISSING_TOKEN"
}
```

### 401 Unauthorized (Invalid/Expired Token)

This status code is returned when a token is invalid, expired, malformed, or tampered with.

```json
{
  "error": "Token has expired. Please log in again.",
  "code": "EXPIRED"
}
```

Or for malformed tokens:

```json
{
  "error": "Invalid token format.",
  "code": "MALFORMED"
}
```

Or for tampered tokens:

```json
{
  "error": "Invalid or tampered token.",
  "code": "INVALID"
}
```

### 403 Forbidden

This status code is returned when a user is authenticated but lacks the required permissions to access a resource (e.g., trying to access another user's private data).

**Note**: This differs from 401 (authentication failure). 403 means authentication succeeded but authorization failed.

```json
{
  "error": "Insufficient permissions to access this resource",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 409 Conflict

```json
{
  "error": "Username or email already exists"
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- Auth endpoints: 5 requests per hour per IP
- General endpoints: 100 requests per 15 minutes per IP
- WebSocket: No limit (managed internally)

## WebSocket Events

### Connection

```typescript
const socket = io("http://localhost:5000", {
  auth: {
    token: accessToken,
  },
});
```

### Create Race

```typescript
// Client
socket.emit('race:create',
  { duration: 60, wordList: ['word1', 'word2', ...] },
  (response) => {
    if (response.success) {
      console.log('Room code:', response.roomCode);
    }
  }
);

// Server Response
socket.on('race:updated', (room) => {
  console.log('Participants:', room.participants);
});
```

### Join Race

```typescript
socket.emit("race:join", { roomCode: "ABC123" }, (response) => {
  if (response.success) {
    console.log("Joined room:", response.roomCode);
  }
});
```

### Start Race

```typescript
socket.emit("race:start", {}, (response) => {
  if (response.success) {
    console.log("Race started");
  }
});

// Receive start event
socket.on("race:started", ({ startTime }) => {
  console.log("Race started at:", new Date(startTime));
});
```

### Progress Update

```typescript
// Send progress every second
socket.emit("race:progress", {
  wpm: 75.5,
  accuracy: 98.2,
  progress: 45, // percentage
});

// Receive other users' progress
socket.on("race:progress", (data) => {
  console.log(`${data.username}: ${data.wpm} WPM`);
});
```

### Finish Race

```typescript
socket.emit("race:finish", { wpm: 85.3, accuracy: 97.5 }, (response) => {
  if (response.success) {
    console.log("Final position:", response.position);
  }
});

// Receive finish notifications
socket.on("race:participant-finished", (data) => {
  console.log(`${data.username} finished in position ${data.position}!`);
});

// Race complete
socket.on("race:completed", (room) => {
  console.log("Race completed!", room);
});
```

## Data Types

### User

```typescript
interface User {
  id: string; // UUID
  username: string; // 3-32 chars
  email: string; // Valid email
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}
```

### TypingTest

```typescript
interface TypingTest {
  id: string;
  user_id: string;
  wpm: number;
  accuracy: number; // 0-100
  consistency: number; // 0-100
  raw_wpm: number;
  difficulty: "easy" | "normal" | "hard";
  duration: number; // seconds
  characters_typed: number;
  correct_characters: number;
  incorrect_characters: number;
  extra_characters: number;
  missed_characters: number;
  created_at: Date;
}
```

### LeaderboardEntry

```typescript
interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  wpm: number;
  accuracy: number;
  tests_completed: number;
  avg_consistency: number;
}
```

## Rate Limits

| Endpoint        | Limit          |
| --------------- | -------------- |
| /auth/register  | 5 per hour     |
| /auth/login     | 5 per hour     |
| /tests/submit   | 20 per hour    |
| /tests/history  | 30 per hour    |
| Other endpoints | 100 per 15 min |

## Versioning

Current API version: v1

- No version prefix currently used
- Breaking changes will create v2 with `/api/v2/` prefix
- Deprecated endpoints will include `X-Deprecated` header with sunset date

## Support

For API issues or questions, check:

1. Example requests in this document
2. Response examples for your use case
3. Error handling section above
