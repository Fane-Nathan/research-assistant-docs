# Authentication API

The StudyAssistant Authentication API provides comprehensive authentication and authorization services with support for multiple authentication methods, role-based access control (RBAC), and advanced security features.

## Overview

The Authentication API manages user identity, access control, and security policies across the StudyAssistant platform. It supports multiple authentication providers, implements JWT-based token management, and provides fine-grained permission controls.

## Base URL

```
https://api.studyassistant.com/v1/auth
```

## Authentication Methods

### JWT Bearer Token

Most API endpoints require authentication using JWT Bearer tokens:

```http
Authorization: Bearer <your-jwt-token>
```

### API Key

For service-to-service communication:

```http
X-API-Key: <your-api-key>
```

## Endpoints

### User Authentication

#### Login

Authenticate user with credentials and receive JWT tokens.

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "remember_me": false,
  "mfa_token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["researcher", "premium"],
      "permissions": ["read:documents", "write:documents"]
    }
  }
}
```

**Curl Example:**
```bash
curl -X POST "https://api.studyassistant.com/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

#### OAuth Login

Initiate OAuth authentication with external providers.

**Endpoint:** `GET /oauth/{provider}`

**Parameters:**
- `provider` (path): OAuth provider (`google`, `github`, `orcid`, `microsoft`)
- `redirect_uri` (query): Redirect URI after authentication
- `state` (query): State parameter for CSRF protection

**Response:**
```json
{
  "success": true,
  "data": {
    "auth_url": "https://accounts.google.com/oauth/authorize?...",
    "state": "random-state-string"
  }
}
```

#### OAuth Callback

Handle OAuth callback and exchange code for tokens.

**Endpoint:** `POST /oauth/{provider}/callback`

**Request Body:**
```json
{
  "code": "authorization-code",
  "state": "state-parameter"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "provider": "google",
      "provider_id": "google-user-id"
    }
  }
}
```

### Token Management

#### Refresh Token

Exchange refresh token for new access token.

**Endpoint:** `POST /refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

#### Validate Token

Validate and decode JWT token.

**Endpoint:** `POST /validate`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user_id": "user123",
    "email": "user@example.com",
    "roles": ["researcher", "premium"],
    "permissions": ["read:documents", "write:documents"],
    "expires_at": "2024-01-01T12:00:00Z",
    "issued_at": "2024-01-01T11:00:00Z"
  }
}
```

#### Revoke Token

Revoke access or refresh token.

**Endpoint:** `POST /revoke`

**Request Body:**
```json
{
  "token": "token-to-revoke",
  "token_type": "access_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token revoked successfully"
}
```

### User Registration

#### Register User

Create new user account.

**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "Jane Doe",
  "organization": "University of Example",
  "research_areas": ["machine learning", "nlp"],
  "terms_accepted": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user456",
    "email": "newuser@example.com",
    "verification_required": true,
    "message": "Registration successful. Please check your email for verification."
  }
}
```

#### Verify Email

Verify user email address.

**Endpoint:** `POST /verify-email`

**Request Body:**
```json
{
  "token": "email-verification-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Resend Verification

Resend email verification.

**Endpoint:** `POST /resend-verification`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

### Password Management

#### Change Password

Change user password (requires authentication).

**Endpoint:** `POST /change-password`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Reset Password Request

Request password reset email.

**Endpoint:** `POST /reset-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### Reset Password Confirm

Confirm password reset with token.

**Endpoint:** `POST /reset-password/confirm`

**Request Body:**
```json
{
  "token": "password-reset-token",
  "new_password": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Multi-Factor Authentication

#### Enable MFA

Enable multi-factor authentication.

**Endpoint:** `POST /mfa/enable`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "method": "totp",
  "backup_codes": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qr_code": "data:image/png;base64,...",
    "backup_codes": ["12345678", "87654321", "..."]
  }
}
```

#### Confirm MFA Setup

Confirm MFA setup with verification code.

**Endpoint:** `POST /mfa/confirm`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "verification_code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "MFA enabled successfully"
}
```

#### Disable MFA

Disable multi-factor authentication.

**Endpoint:** `POST /mfa/disable`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "verification_code": "123456",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "MFA disabled successfully"
}
```

### User Profile Management

#### Get Profile

Get current user profile.

**Endpoint:** `GET /profile`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "organization": "University of Example",
    "research_areas": ["machine learning", "nlp"],
    "roles": ["researcher", "premium"],
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-01T12:00:00Z",
    "mfa_enabled": true,
    "email_verified": true
  }
}
```

#### Update Profile

Update user profile information.

**Endpoint:** `PATCH /profile`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "organization": "New University",
  "research_areas": ["deep learning", "computer vision"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "name": "John Smith",
    "organization": "New University",
    "research_areas": ["deep learning", "computer vision"],
    "updated_at": "2024-01-01T12:30:00Z"
  }
}
```

### Role and Permission Management

#### Get User Roles

Get user roles and permissions.

**Endpoint:** `GET /roles`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "roles": [
      {
        "name": "researcher",
        "description": "Research access",
        "permissions": ["read:documents", "write:documents"]
      },
      {
        "name": "premium",
        "description": "Premium features",
        "permissions": ["advanced:search", "bulk:export"]
      }
    ],
    "effective_permissions": [
      "read:documents",
      "write:documents",
      "advanced:search",
      "bulk:export"
    ]
  }
}
```

#### Check Permission

Check if user has specific permission.

**Endpoint:** `GET /permissions/{permission}`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Parameters:**
- `permission` (path): Permission to check (e.g., `read:documents`)

**Response:**
```json
{
  "success": true,
  "data": {
    "has_permission": true,
    "permission": "read:documents",
    "granted_by": ["researcher", "premium"]
  }
}
```

### API Key Management

#### Create API Key

Create new API key for service access.

**Endpoint:** `POST /api-keys`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Research Pipeline",
  "description": "API key for automated research pipeline",
  "scopes": ["read:documents", "write:embeddings"],
  "expires_in": 2592000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key_id": "key123",
    "api_key": "sk_live_1234567890abcdef...",
    "name": "Research Pipeline",
    "scopes": ["read:documents", "write:embeddings"],
    "created_at": "2024-01-01T12:00:00Z",
    "expires_at": "2024-02-01T12:00:00Z"
  }
}
```

#### List API Keys

List user's API keys.

**Endpoint:** `GET /api-keys`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "api_keys": [
      {
        "key_id": "key123",
        "name": "Research Pipeline",
        "scopes": ["read:documents", "write:embeddings"],
        "created_at": "2024-01-01T12:00:00Z",
        "expires_at": "2024-02-01T12:00:00Z",
        "last_used": "2024-01-01T11:30:00Z"
      }
    ]
  }
}
```

#### Revoke API Key

Revoke API key.

**Endpoint:** `DELETE /api-keys/{key_id}`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

## Security Features

### Rate Limiting

The Authentication API implements rate limiting to prevent abuse:

- **Login attempts**: 5 attempts per 15 minutes per IP
- **Password reset**: 3 requests per hour per email
- **Token refresh**: 10 requests per minute per user
- **Registration**: 2 registrations per hour per IP

### Security Headers

All responses include security headers:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Password Policy

Password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot be commonly used passwords

### Token Security

JWT tokens include:
- Expiration time (exp)
- Issued at time (iat)
- User ID (sub)
- Roles and permissions
- Token ID for revocation

## Error Responses

### Authentication Errors

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {
      "field": "password",
      "attempts_remaining": 4
    }
  }
}
```

### Authorization Errors

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to access this resource",
    "details": {
      "required_permission": "admin:users",
      "user_permissions": ["read:documents", "write:documents"]
    }
  }
}
```

### Rate Limit Errors

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 300,
      "limit": 5,
      "window": 900
    }
  }
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## SDKs and Libraries

### Python SDK

```python
from studyassistant import AuthClient

# Initialize client
auth_client = AuthClient(api_key="your-api-key")

# Login
result = auth_client.login(
    email="user@example.com",
    password="password"
)

# Access token
access_token = result.access_token

# Refresh token
new_token = auth_client.refresh_token(result.refresh_token)
```

### JavaScript SDK

```javascript
import { AuthClient } from '@studyassistant/auth';

// Initialize client
const authClient = new AuthClient({
  apiKey: 'your-api-key'
});

// Login
const result = await authClient.login({
  email: 'user@example.com',
  password: 'password'
});

// Set token for future requests
authClient.setToken(result.access_token);
```

## Best Practices

1. **Token Storage**: Store JWT tokens securely (httpOnly cookies for web)
2. **Token Refresh**: Implement automatic token refresh before expiration
3. **Error Handling**: Handle authentication errors gracefully
4. **Rate Limiting**: Implement client-side rate limiting
5. **Security**: Use HTTPS for all authentication requests
6. **MFA**: Enable multi-factor authentication for enhanced security
7. **API Keys**: Use API keys for service-to-service communication
8. **Logging**: Log authentication events for security monitoring

## See Also

- [Configuration API](configuration.md)
- [Data Manager API](data-manager.md)
- [Security Guide](../development/security.md)
- [API Documentation](../api/)
