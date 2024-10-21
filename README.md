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

# AdminController

## Endpoints

### 1. Get All Checkpoints

#### **Endpoint:**

```http
GET /admin/checkpoints
```

#### **Description:**

Returns a list of all **Checkpoints** available in the system.

#### **Response:**

- **200 OK:**

  - Returns an array of `CheckpointPOIEntity` objects.
  - Example Response:

    ```json
    [
      {
        "id": 1,
        "name": "Checkpoint A",
        "status": "ACTIVE",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "lastUpdated": "2024-10-20T14:32:28.123Z",
        "statusUpdatedById": 12,
        "comment": "Status updated due to maintenance."
      },
      ...
    ]
    ```

- **401 Unauthorized:**

  - If the user is not authenticated or doesn't have admin access.
  - Example Response:

    ```json
    {
      "statusCode": 401,
      "message": "Admin access required"
    }
    ```

#### **Error Handling:**

- **UnauthorizedException** is thrown when the request doesn't contain a valid admin-level JWT token.

#### **Input:**

- **Headers:**
  - JWT token must be included as a cookie (`req.cookies.jwt`).

#### **Entities Returned:**

- **CheckpointPOIEntity**
  - `id`: bigint — Unique ID of the checkpoint.
  - `name`: string — Name of the checkpoint.
  - `status`: `CheckpointStatus` — Current status of the checkpoint.
  - `latitude`: number — Latitude of the checkpoint.
  - `longitude`: number — Longitude of the checkpoint.
  - `lastUpdated`: Date — Timestamp of the last update.
  - `statusUpdatedById`: bigint — ID of the user who updated the checkpoint status.
  - `comment`: string (optional) — Additional comments.

---

### 2. Get All Users

#### **Endpoint:**

```http
GET /admin/users
```

#### **Description:**

Fetches and returns a list of all **Users** in the system.

#### **Response:**

- **200 OK:**

  - Returns an array of `UserEntity` objects.
  - Example Response:

    ```json
    [
      {
        "id": 1,
        "username": "adminUser",
        "email": "admin@example.com",
        "role": "ADMIN",
        "createdAt": "2024-09-01T14:32:28.123Z",
        "updatedAt": "2024-10-20T12:22:45.789Z",
        "isSubscribed": true,
        "stripeCustomer": "cus_123ABC",
        "stripeSubscribedDate": "2024-09-15T10:45:00.000Z",
        "freeEnd": false
      },
      ...
    ]
    ```

- **401 Unauthorized:**

  - If the user is not authenticated or doesn't have admin access.
  - Example Response:

    ```json
    {
      "statusCode": 401,
      "message": "Admin access required"
    }
    ```

#### **Error Handling:**

- **UnauthorizedException** is thrown when the request doesn't contain a valid admin-level JWT token.

#### **Input:**

- **Headers:**
  - JWT token must be included as a cookie (`req.cookies.jwt`).

#### **Entities Returned:**

- **UserEntity**
  - `id`: bigint — Unique ID of the user.
  - `username`: string — Username of the user.
  - `email`: string — Email address of the user.
  - `role`: `Role` — Role of the user (e.g., `ADMIN`, `USER`).
  - `createdAt`: Date — Account creation timestamp.
  - `updatedAt`: Date — Timestamp of the last account update.
  - `isSubscribed`: boolean — Whether the user is subscribed to a plan.
  - `stripeCustomer`: string (optional) — Stripe customer ID.
  - `stripeSubscribedDate`: Date (optional) — Date when the subscription started.
  - `freeEnd`: boolean — Whether the user’s free trial has ended.

---

### Delete User

Deletes a user from the system.

- **URL:** `/admin/users/:id`
- **Method:** `DELETE`
- **URL Params:**
  - `id`: The ID of the user to be deleted
- **Headers:**
  - `Cookie`: Must contain a valid JWT token in the `jwt` cookie
- **Success Response:**
  - **Code:** 200
  - **Content:** No content
- **Error Responses:**
  - **Code:** 401 UNAUTHORIZED
    - **Content:** `{ "message": "Admin access required" }`
  - **Code:** 404 NOT FOUND
    - **Content:** `{ "message": "User not found" }`

#### Example

```http
DELETE /admin/users/123
Cookie: jwt=your_jwt_token_here
```

### Update User Role

Updates the role of a specified user.

- **URL:** `/admin/users/:id/role`
- **Method:** `PUT`
- **URL Params:**
  - `id`: The ID of the user whose role is to be updated
- **Headers:**
  - `Cookie`: Must contain a valid JWT token in the `jwt` cookie
- **Data Params:**
  - `role`: The new role to assign to the user (e.g., "ADMIN", "USER")
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ user }` (Updated user object)
- **Error Responses:**
  - **Code:** 401 UNAUTHORIZED
    - **Content:** `{ "message": "Admin access required" }`
  - **Code:** 404 NOT FOUND
    - **Content:** `{ "message": "User not found" }`

#### Example

```http
PUT /admin/users/123/role
Cookie: jwt=your_jwt_token_here
Content-Type: application/json

{
  "role": "ADMIN"
}
```

### Notes

- Both endpoints require admin privileges. The JWT token in the cookie is used for authentication and authorization.
- If a non-admin user attempts to access these endpoints, a 401 Unauthorized error will be returned.
- If the specified user ID does not exist, a 404 Not Found error will be returned.
- For the Update User Role endpoint, ensure that the `role` provided in the request body is a valid role in your system.
