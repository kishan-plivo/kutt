# Kutt API Documentation

This document provides a reference for the Kutt URL shortener API.

**Base URL:** `/api` (Assumed - please verify based on deployment)

**Authentication:**

*   Most endpoints require authentication via either:
    *   **JWT Token:** Sent as a cookie (`jwt`) or potentially an `Authorization: Bearer <token>` header (verify implementation). Obtained via login/signup.
    *   **API Key:** Sent via an `X-API-Key` header. Generated via the user settings endpoint.
*   Some endpoints require **Admin** privileges in addition to standard authentication.
*   Endpoints related to initial setup (create admin) or public actions (signup, report) may have different requirements.

---

## Health Check

### `GET /api/health`

*   **Description:** Checks if the API server is running.
*   **Authentication:** None required.
*   **Response:**
    *   `200 OK`: `OK` (Plain text)

---

## Authentication (`/api/auth`)

### `POST /api/auth/login`

*   **Description:** Logs in a user.
*   **Authentication:** None required.
*   **Request Body:** `application/json`
    *   `email` (string, required): User's email.
    *   `password` (string, required): User's password (min 8 chars).
*   **Success Response:** `200 OK`
    *   Sets JWT cookie.
    *   Body: User object (sanitized).
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`.

### `POST /api/auth/signup`

*   **Description:** Registers a new user. Requires `MAIL_ENABLED` and `DISALLOW_REGISTRATION=false` in environment variables.
*   **Authentication:** None required.
*   **Request Body:** `application/json`
    *   `email` (string, required): User's email.
    *   `password` (string, required): User's password (min 8 chars).
*   **Success Response:** `201 Created`
    *   May send verification email.
    *   Body: User object (sanitized).
*   **Error Response:** `400 Bad Request`, `403 Forbidden` (if registration disabled), `409 Conflict` (if verified email exists).

### `POST /api/auth/create-admin`

*   **Description:** Creates the initial admin user. Likely intended for setup only.
*   **Authentication:** None required (verify deployment - might be restricted).
*   **Request Body:** `application/json`
    *   `email` (string, required): Admin email.
    *   `password` (string, required): Admin password (min 8 chars).
*   **Success Response:** `201 Created`
    *   Sets JWT cookie.
    *   Body: User object (sanitized).
*   **Error Response:** `400 Bad Request`.

### `POST /api/auth/change-password`

*   **Description:** Changes the logged-in user's password.
*   **Authentication:** JWT required.
*   **Request Body:** `application/json`
    *   `currentpassword` (string, required): Current password.
    *   `newpassword` (string, required): New password (min 8 chars).
*   **Success Response:** `200 OK`
    *   Body: `{ "message": "Password changed successfully." }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`.

### `POST /api/auth/change-email`

*   **Description:** Initiates an email change request for the logged-in user. Requires `MAIL_ENABLED=true`.
*   **Authentication:** JWT required.
*   **Request Body:** `application/json`
    *   `password` (string, required): Current password.
    *   `email` (string, required): New email address.
*   **Success Response:** `200 OK`
    *   Sends confirmation email to new address.
    *   Body: `{ "message": "Change email request sent." }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`.

### `POST /api/auth/apikey`

*   **Description:** Generates/regenerates an API key for the logged-in user.
*   **Authentication:** JWT required.
*   **Success Response:** `200 OK`
    *   Body: `{ "apikey": "YOUR_NEW_API_KEY" }`
*   **Error Response:** `401 Unauthorized`.

### `POST /api/auth/reset-password`

*   **Description:** Sends a password reset link to the user's email. Requires `MAIL_ENABLED=true`.
*   **Authentication:** None required.
*   **Request Body:** `application/json`
    *   `email` (string, required): User's email.
*   **Success Response:** `200 OK`
    *   Body: `{ "message": "Password reset email sent." }`
*   **Error Response:** `400 Bad Request`, `404 Not Found`.

### `POST /api/auth/new-password`

*   **Description:** Sets a new password using a reset token.
*   **Authentication:** None required.
*   **Request Body:** `application/json`
    *   `reset_password_token` (string, required, UUID): Token from the reset email.
    *   `new_password` (string, required): New password (min 8 chars).
    *   `repeat_password` (string, required): Must match `new_password`.
*   **Success Response:** `200 OK`
    *   Sets JWT cookie.
    *   Body: `{ "message": "Password has been reset." }`
*   **Error Response:** `400 Bad Request`, `404 Not Found`.

---

## Users (`/api/users`)

### `GET /api/users`

*   **Description:** Gets the profile of the currently logged-in user.
*   **Authentication:** JWT or API Key required.
*   **Success Response:** `200 OK`
    *   Body: User object (sanitized).
*   **Error Response:** `401 Unauthorized`.

### `POST /api/users/delete`

*   **Description:** Deletes the currently logged-in user's account.
*   **Authentication:** JWT or API Key required.
*   **Request Body:** `application/json`
    *   `password` (string, required): User's current password.
*   **Success Response:** `200 OK`
    *   Body: `{ "message": "Account deleted successfully." }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`.

### `GET /api/users/admin`

*   **Description:** Gets a list of users (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Query Parameters:**
    *   `limit` (integer, optional): Number of users per page.
    *   `skip` (integer, optional): Number of users to skip.
    *   `search` (string, optional): Search term for email/ID.
    *   `banned` (boolean, optional): Filter by banned status.
    *   `verified` (boolean, optional): Filter by verified status.
    *   `role` (string, optional): Filter by role ('user' or 'admin').
*   **Success Response:** `200 OK`
    *   Body: `{ total: number, limit: number, skip: number, data: [User Object (Admin Sanitized)] }`
*   **Error Response:** `401 Unauthorized`, `403 Forbidden`.

### `POST /api/users/admin`

*   **Description:** Creates a new user (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Request Body:** `application/json`
    *   `email` (string, required): New user's email.
    *   `password` (string, required): New user's password (min 8 chars).
    *   `role` (string, optional): `user` or `admin`.
    *   `verified` (boolean, optional): Set verified status.
    *   `banned` (boolean, optional): Set banned status.
    *   `verification_email` (boolean, optional): Send verification email if `MAIL_ENABLED=true`.
*   **Success Response:** `201 Created`
    *   Body: `{ message: "User created successfully." }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict` (email exists).

### `DELETE /api/users/admin/:id`

*   **Description:** Deletes a specific user by ID (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Path Parameters:**
    *   `:id` (integer, required): ID of the user to delete.
*   **Success Response:** `200 OK`
    *   Body: `{ message: "User deleted successfully." }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

### `POST /api/users/admin/ban/:id`

*   **Description:** Bans a specific user by ID (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Path Parameters:**
    *   `:id` (integer, required): ID of the user to ban.
*   **Request Body:** `application/json`
    *   `links` (boolean, optional): Ban user's links?
    *   `domains` (boolean, optional): Ban user's domains?
*   **Success Response:** `200 OK`
    *   Body: `{ message: "Banned user successfully." }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

---

## Domains (`/api/domains`)

### `POST /api/domains`

*   **Description:** Adds a new custom domain for the logged-in user.
*   **Authentication:** JWT or API Key required.
*   **Request Body:** `application/json`
    *   `address` (string, required): Domain address (e.g., `my.co`).
    *   `homepage` (string, optional): URL to redirect to if domain root is accessed.
    *   `org_id` (integer, required): The organization ID this domain belongs to.
*   **Success Response:** `200 OK`
    *   Body: Domain object (sanitized).
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `409 Conflict`.

### `DELETE /api/domains/:id`

*   **Description:** Removes a custom domain association for the logged-in user (sets `user_id` to null).
*   **Authentication:** JWT or API Key required.
*   **Path Parameters:**
    *   `:id` (string, required, UUID): UUID of the domain to remove.
*   **Success Response:** `200 OK`
    *   Body: `{ message: "Domain deleted successfully" }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `404 Not Found`.

### `GET /api/domains/admin`

*   **Description:** Gets a list of all domains (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Query Parameters:**
    *   `limit` (integer, optional): Number of domains per page.
    *   `skip` (integer, optional): Number of domains to skip.
    *   `search` (string, optional): Search term for address/homepage.
    *   `user` (string, optional): Filter by user email or ID.
    *   `banned` (boolean, optional): Filter by banned status.
    *   `owner` (boolean, optional): Filter by whether domain has an owner (`user_id` is not null).
    *   `links` (boolean, optional): Filter by whether domain has associated links.
*   **Success Response:** `200 OK`
    *   Body: `{ total: number, limit: number, skip: number, data: [Domain Object (Admin Sanitized)] }`
*   **Error Response:** `401 Unauthorized`, `403 Forbidden`.

### `POST /api/domains/admin`

*   **Description:** Adds a new domain globally (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Request Body:** `application/json`
    *   `address` (string, required): Domain address.
    *   `homepage` (string, optional): Homepage URL.
    *   `banned` (boolean, optional): Ban the domain upon creation.
    *   `org_id` (integer, required): The organization ID this domain belongs to.
*   **Success Response:** `200 OK`
    *   Body: `{ message: "The domain has been added successfully." }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict`.

### `DELETE /api/domains/admin/:id`

*   **Description:** Deletes a domain completely from the system (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Path Parameters:**
    *   `:id` (integer, required): ID of the domain to delete.
*   **Query Parameters:**
    *   `links` (boolean, optional): Also delete all associated links?
*   **Success Response:** `200 OK`
    *   Body: `{ message: "Domain deleted successfully" }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

### `POST /api/domains/admin/ban/:id`

*   **Description:** Bans a domain (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Path Parameters:**
    *   `:id` (integer, required): ID of the domain to ban.
*   **Request Body:** `application/json`
    *   `user` (boolean, optional): Also ban the domain owner (if any)?
    *   `links` (boolean, optional): Also ban all associated links?
*   **Success Response:** `200 OK`
    *   Body: `{ message: "Banned domain successfully." }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

---

## Links (`/api/links`)

### `POST /api/links`

*   **Description:** Creates a new shortened link. Anonymous creation might be disabled (`DISALLOW_ANONYMOUS_LINKS`).
*   **Authentication:** JWT or API Key (required if anonymous links are disabled).
*   **Request Body:** `application/json`
    *   `target` (string, required): The URL to shorten.
    *   `password` (string, optional, user-only): Password protect the link (min 3 chars).
    *   `customurl` (string, optional, user-only): Desired custom short address (min 1 char).
    *   `reuse` (boolean, optional, user-only): Reuse existing link if target matches.
    *   `description` (string, optional): Description for the link.
    *   `expire_in` (string, optional): Expiration time (e.g., "10m", "1h", "2 days").
    *   `domain` (string, optional, user-only): Custom domain address to use for the short link.
*   **Success Response:** `201 Created`
    *   Body: Link object (sanitized), includes the `link` field with the full short URL.
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `409 Conflict` (custom URL taken).

### `GET /api/links`

*   **Description:** Gets a list of links for the logged-in user.
*   **Authentication:** JWT or API Key required.
*   **Query Parameters:**
    *   `limit` (integer, optional): Number of links per page.
    *   `skip` (integer, optional): Number of links to skip.
    *   `search` (string, optional): Search term for target/address/description.
*   **Success Response:** `200 OK`
    *   Body: `{ total: number, limit: number, skip: number, data: [Link Object] }`
*   **Error Response:** `401 Unauthorized`.

### `PATCH /api/links/:id`

*   **Description:** Edits a link owned by the logged-in user.
*   **Authentication:** JWT or API Key required.
*   **Path Parameters:**
    *   `:id` (string, required, UUID): UUID of the link to edit.
*   **Request Body:** `application/json` (Send only fields to update)
    *   `target` (string, optional): New target URL.
    *   `password` (string, optional): New password (or empty string to remove).
    *   `address` (string, optional): New custom short address.
    *   `expire_in` (string, optional): New expiration time string.
    *   `description` (string, optional): New description.
*   **Success Response:** `200 OK`
    *   Body: Updated Link object (sanitized).
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`.

### `DELETE /api/links/:id`

*   **Description:** Deletes a link owned by the logged-in user.
*   **Authentication:** JWT or API Key required.
*   **Path Parameters:**
    *   `:id` (string, required, UUID): UUID of the link to delete.
*   **Success Response:** `200 OK`
    *   Body: `{ message: "Link deleted successfully" }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `404 Not Found`.

### `GET /api/links/:id/stats`

*   **Description:** Gets visit statistics for a link owned by the logged-in user.
*   **Authentication:** JWT or API Key required.
*   **Path Parameters:**
    *   `:id` (string, required, UUID): UUID of the link.
*   **Success Response:** `200 OK`
    *   Body: Statistics object (format TBD by `link.stats` handler).
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `404 Not Found`.

### `POST /api/links/:id/protected`

*   **Description:** Submits the password for a password-protected link (used during redirection flow).
*   **Authentication:** None required (intended for public access).
*   **Path Parameters:**
    *   `:id` (string, required, UUID): UUID of the protected link.
*   **Request Body:** `application/json`
    *   `password` (string, required): Password attempt.
*   **Success Response:** `200 OK` (Redirects or provides target info - check handler)
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `404 Not Found`.

### `POST /api/links/report`

*   **Description:** Reports a potentially malicious link. Requires `MAIL_ENABLED=true`.
*   **Authentication:** None required.
*   **Request Body:** `application/json`
    *   `link` (string, required): The full short URL to report.
*   **Success Response:** `200 OK`
    *   Body: `{ message: "Link reported successfully." }`
*   **Error Response:** `400 Bad Request`.

### `GET /api/links/admin`

*   **Description:** Gets a list of all links (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Query Parameters:**
    *   `limit` (integer, optional): Number of links per page.
    *   `skip` (integer, optional): Number of links to skip.
    *   `search` (string, optional): Search term for target/address/description/domain.
    *   `user` (string, optional): Filter by user email or ID.
    *   `banned` (boolean, optional): Filter by banned status.
    *   `owner` (boolean, optional): Filter by whether link has an owner (`user_id` is not null).
    *   `domain` (string, optional): Filter by domain address.
*   **Success Response:** `200 OK`
    *   Body: `{ total: number, limit: number, skip: number, data: [Link Object (Admin Sanitized)] }`
*   **Error Response:** `401 Unauthorized`, `403 Forbidden`.

### `PATCH /api/links/admin/:id`

*   **Description:** Edits any link (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Path Parameters:**
    *   `:id` (string, required, UUID): UUID of the link to edit.
*   **Request Body:** `application/json` (Send only fields to update)
    *   `target` (string, optional): New target URL.
    *   `password` (string, optional): New password (or empty string to remove).
    *   `address` (string, optional): New custom short address.
    *   `expire_in` (string, optional): New expiration time string.
    *   `description` (string, optional): New description.
*   **Success Response:** `200 OK`
    *   Body: Updated Link object (sanitized).
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`.

### `POST /api/links/admin/ban/:id`

*   **Description:** Bans a specific link by ID (Admin only).
*   **Authentication:** JWT or API Key + Admin required.
*   **Path Parameters:**
    *   `:id` (string, required, UUID): UUID of the link to ban.
*   **Request Body:** `application/json`
    *   `host` (boolean, optional): Ban the target hostname?
    *   `user` (boolean, optional): Ban the link owner (if any)?
    *   `userLinks` (boolean, optional): Ban all links from the owner?
    *   `domain` (boolean, optional): Ban the custom domain used (if any)?
*   **Success Response:** `200 OK`
    *   Body: `{ message: "Banned link successfully." }`
*   **Error Response:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

--- 