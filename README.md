# ROOT URL FOR AUTH: http://<your-api-url>/user

### 1. User Login

- **Endpoint:** `POST /login`
- **Description:** This endpoint allows users to log in to their account by providing their username and password.

#### Request Body

```json
{
  "username": "string",
  "password": "string"
}
```

- **Fields:**
  - `username` (string): The username of the user.
  - `password` (string): The user's password.

#### Response

- **Success (HTTP Status 200):**

```json
{
  "message": "Login successful",
  "token": "string" // JWT token for authenticated sessions
}
```

- **Error Responses:**

  - **HTTP Status 422:**

    - Reason: Missing required fields.
    - Response Body:

    ```json
    {
      "message": "Missing required fields. Please provide both username and password to proceed."
    }
    ```

  - **HTTP Status 401:**
    - Reason: Invalid username or password.
    - Response Body:
    ```json
    {
      "message": "Invalid username. No user found with the provided username."
    }
    ```

---

### 2. User Registration

- **Endpoint:** `POST /register`
- **Description:** This endpoint allows new users to create an account.

#### Request Body

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

- **Fields:**
  - `username` (string): Desired username for the new account.
  - `email` (string): User's email address.
  - `password` (string): Password for the new account.

#### Response

- **Success (HTTP Status 201):**

```json
{
  "message": "Registration successful. Please log in."
}
```

- **Error Responses:**

  - **HTTP Status 409:**

    - Reason: Username or email already exists.
    - Response Body:

    ```json
    {
      "message": "Username or email already exists"
    }
    ```

  - **HTTP Status 400:**
    - Reason: Password is too short.
    - Response Body:
    ```json
    {
      "message": "Password must be at least 8 characters long"
    }
    ```

---

### 3. Validate JWT

- **Endpoint:** `POST /validate-jwt`
- **Description:** This endpoint checks the validity of the provided JWT token and returns the user data if valid.

#### Request Headers

- **Cookies:**
  - `jwt` (string): The JWT token issued during login.

#### Response

- **Success (HTTP Status 200):**

```json
{
  "message": "Token is valid",
  "userData": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string",
    "isSubscribed": "boolean"
  }
}
```

- **Error Responses:**
  - **HTTP Status 401:**
    - Reason: Invalid token.
    - Response Body:
    ```json
    {
      "message": "Invalid token."
    }
    ```

---

# Map Controller

Base URL: `/map`
Authentication: All endpoints require JWT authentication (JwtAuthGuard)

## Endpoints

### 1. Get All POIs

Retrieves all Points of Interest.

- **Method:** GET
- **Path:** `/pois`
- **Auth Required:** Yes
- **Request Body:** None
- **Response:**
  - Status Code: 200
  - Body: Array of `CheckpointPOIEntity`
    ```typescript
    [
      {
        id: bigint,
        name: string,
        status: CheckpointStatus,
        latitude: number,
        longitude: number,
        lastUpdated: Date,
        statusUpdatedById: bigint,
        comment?: string
      },
      // ...
    ]
    ```

### 2. Get POI by ID

Retrieves a specific Point of Interest by its ID.

- **Method:** GET
- **Path:** `/pois/:id`
- **Auth Required:** Yes
- **Parameters:**
  - `id`: string (POI ID)
- **Response:**
  - Status Code: 200
  - Body: `CheckpointPOIEntity`
    ```typescript
    {
      id: bigint,
      name: string,
      status: CheckpointStatus,
      latitude: number,
      longitude: number,
      lastUpdated: Date,
      statusUpdatedById: bigint,
      comment?: string
    }
    ```

### 3. Update POI Status

Updates the status and comment of a specific Point of Interest.

- **Method:** PUT
- **Path:** `/pois/:id/status`
- **Auth Required:** Yes
- **Parameters:**
  - `id`: string (POI ID)
- **Request Body:**

  ```json
  {
    "status": "ACTIVE" | "INACTIVE" | "UNKNOWN",
    "comment": "string"
  }

  ```

- **Response:**
  - Status Code: 200
  - Body: Updated `CheckpointPOIEntity`

### 4. Create POI

Creates a new Point of Interest.

- **Method:** POST
- **Path:** `/pois`
- **Auth Required:** Yes
- **Request Body:**
  ```typescript
  {
    name: string,
    status: CheckpointStatus,
    latitude: number,
    longitude: number,
    statusUpdatedById: bigint,
    comment?: string
  }
  ```
- **Response:**
  - Status Code: 201
  - Body: Created `CheckpointPOIEntity`

### 5. Delete POI

Deletes a specific Point of Interest.

- **Method:** DELETE
- **Path:** `/pois/:id`
- **Auth Required:** Yes
- **Parameters:**
  - `id`: string (POI ID)
- **Response:**
  - Status Code: 204
  - Body: None

## Data Types

### CheckpointPOIEntity

```typescript
{
  id: bigint,
  name: string,
  status: CheckpointStatus,
  latitude: number,
  longitude: number,
  lastUpdated: Date,
  statusUpdatedById: bigint,
  comment?: string
}
```

### CheckpointStatus

Enum with values: `'ACTIVE'`, `'INACTIVE'`, `'UNKNOWN'`

## Error Responses

- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid JWT token
- 404 Not Found: POI not found
- 500 Internal Server Error: Server-side error

Note: Specific error messages will be included in the response body.

```

```
