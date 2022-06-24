# API

## What is this API

It's an api that someone can
* Account management
    * log in will return auth token,
    * log out
    * check on API transaction usage
    * extend a login session
    * create an user
    * verify account
    * Change subscription
    * List current subscription plan
    * Add, remove payment methods
    * make payment primary
    * list payment menthods
    * List cards
    * remove a user
    * change the password after login
    * request password reset
    * reset password after request
    * 
* Errors
    * Server Errors (500)
    * User errors (400)
    * Unauthorized (401)
    * Page not found (404)
    * Access denied (403)
    * Rate Limit error (429)


## Account management

### Create User

Server sends a verification token to the user's email, which they must confirm before using the system.

if the subscription plan is "free", then cardNumber and other payment details is optional.

*Request*
```
POST /api/1.0/account/create

{
    "username": "email@example.com",
    "password": "examplePassword",
    "subscriptionPlan": "basic",
    "cardNumber": "4242424242424242",
    "expirationMonth": "02",
    "expirationYear": "2030",
    "cvc": "123",
    "postalCode": "90210"
}
```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Account created with basic plan",
}
```

### Verify Account

*Request*
```
POST /api/1.0/account/verify

{
    "username": "email@example.com",
    "verificationToken": "def123",
}
```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Account verified",
}
```

### Change billing plan

Server sends a verification token to the user's email, which they must confirm before using the system.

*Request*
```
POST /api/1.0/account/subscription
Authorization: Basic abc123

{
    "subscriptionPlan": "advanced",
}
```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Subscription plan changed to advanced",
}
```

### View API Transaction

User has so many transactions per month as part of their subscription plan. This api endpoint lists their current usage.

*Request*
```
GET /api/1.0/account/subscription


```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Account created with basic plan",
    "data": {
        "subscriptionPlan": "basic",
        "accountStartDateTime": "1210192830913",
        "billingPeriodStartDateTime": "1210192039824",
        "billingPeriodEndDateTime": "1210193209420",
        "transactionsUsed": 43038,
        "transactionsAvailableInBillingPeriod": 50000,
    }
}
```

### List payment methods

Server gives list of payment methods to user if authenticated

*Request*
```
GET /api/1.0/account/paymentmethods
Authorization: Basic abc123


```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Payment methods retrieved",
    "data": [
        {
            "last4": "4242",
            "expirationMonth": "02",
            "expirationYear": "2030",
            "postalCode": "90210",
            "isPrimary": true
        },
    ]
}
```

### Add payment method

*Request*
```
POST /api/1.0/account/paymentmethods
Authorization: Basic abc123

{
    "cardNumber": "4242424242424242",
    "expirationMonth": "02",
    "expirationYear": "2030",
    "cvc": "123",
    "postalCode": "90210",
    "isPrimary": true
},
```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Added payment method",
}
```

### Make payment method primary

*Request*
```
PUT /api/1.0/account/paymentmethods/<paymentMethodId>
Authorization: Basic abc123

{
    "isPrimary": true
}
```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "ayment method marked as primary",
}
```

### Removed payment method

*Request*
```
DELETE /api/1.0/account/paymentmethods/<paymentMethodId>
Authorization: Basic abc123


```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Removed payment method",
}
```

### Log in

Send username and password over POST and server returns an auth token and expiration.

By default, AccessToken expires in 1 hour (3,600,000 ms).

*Request*
```
POST /api/1.0/account/login

{
    "username": "email@example.com",
    "password": "examplePassword"
}
```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Login success",
    "data" {
        "accessToken": "abc123",
        "expiresAt": 12198298429187,
        "tokenType": "Bearer"
    }
}
```

### Extend Login

*Requires*
* Authorization: Bearer [accessToken]

Invalid authorization returns `401 Unauthorized`

*Request*
```
POST /api/1.0/account/refresh
Authorization: Bearer abc123


```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Access token extended",
    "data" {
        "accessToken": "abc123",
        "expiresAt": 12198298429187,
        "tokenType": "Bearer"
    }
}
```


### Log out

*Requires*
* Authorization: Bearer [accessToken]

Invalid authorization returns `401 Unauthorized`

*Request*
```
POST /api/1.0/account/logout
Authorization: Bearer abc123


```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Logout success"
}
```


### Remove a user

*Requires*
* Authorization: Bearer [accessToken]

Invalid authorization returns `401 Unauthorized`

*Request*
```
POST /api/1.0/account/remove
Authorization: Bearer abc123


```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Account remove"
}
```

### Authenticated User Changes Password

*Requires*
* Authorization: Bearer [accessToken]

Invalid authorization returns `401 Unauthorized`

*Request*
```
POST /api/1.0/account/password/change
Authorization: Bearer abc123

{
    "currentPassword": "examplePassword",
    "newPassword": "changePassword"
}
```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Password changed"
}
```

### Unauthenticated user requests password reset

When a user forgot their password, they can request access to change their password, but they must prove they can open an email from their login email address.

The server will generate a reset password token and email it to the user for verification.

If the email doesn't exist, then return a `404 Not Found`

*Request*
```
POST /api/1.0/account/password/reset

{
    "username": "email@example.com",
}
```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Initialized password reset",
    "data": {
        "expiresAt": 1429042034982093
    }
}
```


### Unauthenticated user completes password reset

User has picked up their reset password token from their email, and the can complete a password reset.

If the email or reset password token doesn't exist or is expired, then return a `404 Not Found`

*Request*
```
POST /api/1.0/account/password/reset

{
    "username": "email@example.com",
    "resetPasswordToken": "034344",
    "newPassword": "examplePassword"
}
```

*Response*
```
HTTP/1.1 200 OK

{
    "status": "success",
    "message": "Password reset complete"
}
```

## Errors

### 500 Server Error

```
HTTP/1.1 500 Internal Server Error

{
    "status": "error",
    "message": "Internal server error"
}
```

### 401 Unauthorized

```
HTTP/1.1 401 Unauthorized


{
    "status": "error",
    "message": "Invalid authorization"
}
```

### 403 Forbidden

```
HTTP/1.1 403 Forbidden


{
    "status": "error",
    "message": "Invalid account access"
}
```

### 404 Page not found

```
HTTP/1.1 403 Forbidden


{
    "status": "error",
    "message": "Resource doesn't exist"
}
```

### 400 Bad Request

Example login failed because username was not the right format.

```json
HTTP/1.1 400 Bad Request


{
    "status": "error",
    "message": "Invalid data",
    "errors": {
        "username": "invalid email format",
        "password": "password must be a string",
    }
}
```


### 400 Bad Request

For example a user may enter credit card information but then the credit card processing fails and kicks back an error message

```
HTTP/1.1 400 Bad Request


{
    "status": "error",
    "message": "Payment declined",
    "errors": {
        "paymentMethod": "Insufficient balance",
    }
}
```


### 429 Too Many Requests 

If the user exceeds their API rate limit, produce a rate limit error.

```
HTTP/1.1 429 Too Many Requests 


{
    "status": "error",
    "message": "Rate limit of 1000 tranasctions per second exceeded. Please upgrade for more transctions",
}
```

### 402 Payment Required

If the user exceeds their monthly API transaction limit, produce a payment required error.

```
HTTP/1.1 402 Payment Required


{
    "status": "error",
    "message": "Exceeded basic tier usage of 50,000 requests this month. Please upgrade for more transactions",
}
```


## Example Usage in React

This example shows how to use the `/api/1.0/account/login` endpoint

```javascript
const loginForm = ({route, navigation}) => {
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [errors, setErrors] = useState({})

    const hasErorrs = () => {
        return (Object.keys(errors).length) > 0
    }

    const login = () => {
        const data = {
            username,
            password
        }
        const response = await fetch("/api/1.0/account/login", {
            method: "POST",
            body: JSON.stringify(data)
        })
        const responseJson = await response.json()
        if (responseJson.status === "success") {
            // navigate to authenticated area of site
            localStorage.set("accessToken", responseJson.data.accesToken)
            // store the login token
            navigation.push("/account/dashboard")
        } else if (responseJson.status === "error") {
            // populate the html input fields with
            // reference or id-based error codes
            setErrors(responseJson.errors)
        }
    }

    return (
        <div>
            { hasErrors() &&
                <div class="formError">
                    There was a problem logging you in. Please check your username and password and try again. 
                </div>
            }
            <div class="inputGroup">
                <label for="username">Username</label>
                <input
                    id="username"
                    type="email"
                    value={username}
                    onChangeText={setUsername}
                    class={errors.username? "error": ""}
                />
                {errors.username &&
                <div class="inputError">
                    Invalid username
                </div>
                }
            </div>
            <div class="inputGroup">
                <label for="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChangeText={setPassword}
                    class={errors.password? "error": ""}
                />
                {errors.username &&
                <div class="inputError">
                    Password required
                </div>
                }
            </div>
            <button onClick="login" />
        </div>
    )
}
```