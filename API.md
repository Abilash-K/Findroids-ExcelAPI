# API Documentation

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

Request Body:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  }
}
```

### Login User
```http
POST /auth/login
```

Request Body:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "first_name": "John",
        "last_name": "Doe"
      }
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
}
```

### Logout User
```http
POST /auth/logout
```

Headers:
```
Authorization: Bearer jwt_token
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Get Current User
```http
GET /auth/me
```

Headers:
```
Authorization: Bearer jwt_token
```

Response (200 OK):
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  }
}
```

## Vendor Management Endpoints

### Get All Vendors
```http
GET /api/vendors
```

Headers:
```
Authorization: Bearer jwt_token
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Vendors retrieved successfully",
  "data": {
    "vendors": [
      {
        "id": "uuid",
        "name": "Vendor 1",
        "payment_schedule": "weekly",
        "is_active": true,
        "created_at": "2024-03-20T00:00:00Z",
        "updated_at": "2024-03-20T00:00:00Z"
      }
    ]
  }
}
```

### Create Vendor
```http
POST /api/vendors
```

Headers:
```
Authorization: Bearer jwt_token
```

Request Body:
```json
{
  "name": "New Vendor",
  "payment_schedule": "weekly"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Vendor created successfully",
  "data": {
    "vendor": {
      "id": "uuid",
      "name": "New Vendor",
      "payment_schedule": "weekly",
      "is_active": true,
      "created_at": "2024-03-20T00:00:00Z",
      "updated_at": "2024-03-20T00:00:00Z"
    }
  }
}
```

### Update Vendor
```http
PUT /api/vendors/:id
```

Headers:
```
Authorization: Bearer jwt_token
```

Request Body:
```json
{
  "name": "Updated Vendor Name",
  "payment_schedule": "biweekly",
  "is_active": true
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Vendor updated successfully",
  "data": {
    "vendor": {
      "id": "uuid",
      "name": "Updated Vendor Name",
      "payment_schedule": "biweekly",
      "is_active": true,
      "created_at": "2024-03-20T00:00:00Z",
      "updated_at": "2024-03-20T00:00:00Z"
    }
  }
}
```

### Delete Vendor
```http
DELETE /api/vendors/:id
```

Headers:
```
Authorization: Bearer jwt_token
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Vendor deleted successfully"
}
```

## Account Management Endpoints

### Get All Accounts
```http
GET /api/accounts
```

Headers:
```
Authorization: Bearer jwt_token
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Accounts retrieved successfully",
  "data": {
    "accounts": [
      {
        "id": "uuid",
        "name": "Account 1",
        "balance": 200000.00,
        "created_at": "2024-03-20T00:00:00Z",
        "updated_at": "2024-03-20T00:00:00Z"
      }
    ]
  }
}
```

## Payment Management Endpoints

### Get All Payments
```http
GET /api/payments
```

Headers:
```
Authorization: Bearer jwt_token
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "uuid",
        "vendor_id": "uuid",
        "account_id": "uuid",
        "amount": 1000.00,
        "payment_date": "2024-03-20",
        "status": "completed",
        "created_at": "2024-03-20T00:00:00Z",
        "updated_at": "2024-03-20T00:00:00Z",
        "vendors": {
          "name": "Vendor 1"
        },
        "accounts": {
          "name": "Account 1"
        }
      }
    ]
  }
}
```

### Create Payment
```http
POST /api/payments
```

Headers:
```
Authorization: Bearer jwt_token
```

Request Body:
```json
{
  "vendor_id": "uuid",
  "account_id": "uuid",
  "amount": 1000.00,
  "payment_date": "2024-03-20"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "payment": {
      "id": "uuid",
      "vendor_id": "uuid",
      "account_id": "uuid",
      "amount": 1000.00,
      "payment_date": "2024-03-20",
      "status": "pending",
      "created_at": "2024-03-20T00:00:00Z",
      "updated_at": "2024-03-20T00:00:00Z"
    }
  }
}
```

### Update Payment
```http
PUT /api/payments/:id
```

Headers:
```
Authorization: Bearer jwt_token
```

Request Body:
```json
{
  "amount": 1500.00,
  "payment_date": "2024-03-21",
  "status": "completed"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Payment updated successfully",
  "data": {
    "payment": {
      "id": "uuid",
      "vendor_id": "uuid",
      "account_id": "uuid",
      "amount": 1500.00,
      "payment_date": "2024-03-21",
      "status": "completed",
      "created_at": "2024-03-20T00:00:00Z",
      "updated_at": "2024-03-20T00:00:00Z"
    }
  }
}
```

### Delete Payment
```http
DELETE /api/payments/:id
```

Headers:
```
Authorization: Bearer jwt_token
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

## Reporting Endpoints

### Generate Account Status Report
```http
GET /api/report
```

Headers:
```
Authorization: Bearer jwt_token
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "payments": [
      {
        "id": "uuid",
        "vendor_id": "uuid",
        "account_id": "uuid",
        "amount": 1000.00,
        "payment_date": "2024-03-20",
        "status": "completed",
        "created_at": "2024-03-20T00:00:00Z",
        "updated_at": "2024-03-20T00:00:00Z",
        "vendors": {
          "name": "Vendor 1"
        },
        "accounts": {
          "name": "Account 1"
        }
      }
    ],
    "accounts": [
      {
        "id": "uuid",
        "name": "Account 1",
        "balance": 199000.00,
        "created_at": "2024-03-20T00:00:00Z",
        "updated_at": "2024-03-20T00:00:00Z"
      }
    ],
    "generated_at": "2024-03-20T00:00:00Z"
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
``` 