# Pusher Private Channel Authorization Guide

## Overview

This guide explains how to set up Laravel backend authorization for Pusher private channels used in WebRTC signaling. Private channels require server-side authorization to ensure only authorized users can subscribe.

## Error You're Seeing

```
AuthError: Unable to retrieve auth string from channel-authorization endpoint - received status: 0 from /pusher/auth
```

This error occurs because the Laravel backend doesn't have the authorization endpoint configured.

---

## Laravel Backend Setup

### 1. Install Pusher PHP SDK (if not already installed)

```bash
composer require pusher/pusher-php-server
```

### 2. Configure Pusher in `config/broadcasting.php`

```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'encrypted' => true,
        'host' => env('PUSHER_HOST', '127.0.0.1'),
        'port' => env('PUSHER_PORT', 6001),
        'scheme' => env('PUSHER_SCHEME', 'http'),
    ],
],
```

### 3. Create Authorization Route

Add this route in `routes/api.php` or `routes/web.php`:

```php
Route::post('/pusher/auth', [PusherAuthController::class, 'authenticate'])
    ->middleware('auth:sanctum'); // or 'auth:api' depending on your auth guard
```

### 4. Create PusherAuthController

Create `app/Http/Controllers/PusherAuthController.php`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Pusher\Pusher;

class PusherAuthController extends Controller
{
    /**
     * Authorize private channel subscription
     */
    public function authenticate(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $socketId = $request->input('socket_id');
        $channelName = $request->input('channel_name');

        // Validate channel name format
        // Expected format: private-webrtc-consultation{id}
        if (!preg_match('/^private-webrtc-consultation(\d+)$/', $channelName, $matches)) {
            return response()->json(['error' => 'Invalid channel name'], 400);
        }

        $consultationId = (int) $matches[1];

        // Verify user has access to this consultation
        if (!$this->userHasAccessToConsultation($user, $consultationId)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        // Initialize Pusher
        $pusher = new Pusher(
            config('broadcasting.connections.pusher.key'),
            config('broadcasting.connections.pusher.secret'),
            config('broadcasting.connections.pusher.app_id'),
            config('broadcasting.connections.pusher.options')
        );

        // Generate auth signature
        $auth = $pusher->socket_auth($channelName, $socketId);

        return response()->json($auth);
    }

    /**
     * Check if user has access to consultation
     */
    private function userHasAccessToConsultation($user, $consultationId): bool
    {
        // For doctors: check if consultation belongs to doctor
        if ($user->user_type === 'doctor') {
            return \App\Models\Consultation::where('id', $consultationId)
                ->where('doctorID', $user->id)
                ->exists();
        }

        // For patients: check if consultation belongs to patient
        if ($user->user_type === 'patient') {
            return \App\Models\Consultation::where('id', $consultationId)
                ->where('patientID', $user->id)
                ->exists();
        }

        return false;
    }
}
```

### 5. Alternative: Using Laravel Broadcasting (Recommended)

If you're using Laravel's broadcasting system, you can use the built-in authorization:

#### Create Channel Authorization Class

Create `app/Broadcasting/WebRTCConsultationChannel.php`:

```php
<?php

namespace App\Broadcasting;

use App\Models\User;
use App\Models\Consultation;

class WebRTCConsultationChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, int $consultationId): bool
    {
        $consultation = Consultation::find($consultationId);

        if (!$consultation) {
            return false;
        }

        // Check if user is doctor or patient in this consultation
        if ($user->user_type === 'doctor') {
            return $consultation->doctorID === $user->id;
        }

        if ($user->user_type === 'patient') {
            return $consultation->patientID === $user->id;
        }

        return false;
    }
}
```

#### Register Channel in `routes/channels.php`

```php
use App\Broadcasting\WebRTCConsultationChannel;

Broadcast::channel('webrtc-consultation{consultationId}', WebRTCConsultationChannel::class);
```

**Note:** Laravel automatically adds the `private-` prefix, so register as `webrtc-consultation{consultationId}` not `private-webrtc-consultation{consultationId}`.

#### Update Frontend Pusher Configuration

Make sure your frontend Pusher config includes the auth endpoint:

```typescript
// In PusherService.ts or wherever you initialize Pusher
const pusher = new Pusher(PUSHER_APP_KEY, {
  cluster: PUSHER_APP_CLUSTER,
  authEndpoint: `${API_BASE_URL}/broadcasting/auth`, // Laravel default endpoint
  auth: {
    headers: {
      Authorization: `Bearer ${authToken}`, // Your auth token
    },
  },
});
```

---

## Frontend Configuration

### Update PusherService.ts

Make sure your `PusherService` is configured to use the auth endpoint:

```typescript
// src/services/pusher/PusherService.ts

import Pusher from 'pusher-js';
import { apiClient } from '../api/api-client';

class PusherService {
  private pusher: Pusher | null = null;
  private readonly PUSHER_APP_KEY = 'your-pusher-key';
  private readonly PUSHER_CLUSTER = 'your-cluster';
  private readonly API_BASE_URL = 'https://your-api.com';

  initialize(): void {
    if (this.pusher) {
      return;
    }

    // Get auth token from your auth store
    const authToken = this.getAuthToken();

    this.pusher = new Pusher(this.PUSHER_APP_KEY, {
      cluster: this.PUSHER_CLUSTER,
      authEndpoint: `${this.API_BASE_URL}/api/pusher/auth`, // Your custom endpoint
      // OR use Laravel default:
      // authEndpoint: `${this.API_BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      },
      enabledTransports: ['ws', 'wss'],
    });

    // Connection state listeners
    this.pusher.connection.bind('connected', () => {
      console.log('✅ [PusherService] Connected to Pusher');
    });

    this.pusher.connection.bind('error', (error: any) => {
      console.error('❌ [PusherService] Connection error:', error);
    });
  }

  private getAuthToken(): string {
    // Get token from your auth store
    // Example:
    // const { token } = useAuthStore.getState();
    // return token || '';
    return '';
  }
}
```

---

## Testing Authorization

### 1. Test with cURL

```bash
curl -X POST http://your-api.com/api/pusher/auth \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "socket_id": "123.456",
    "channel_name": "private-webrtc-consultation63"
  }'
```

**Expected Response:**
```json
{
  "auth": "your-pusher-key:signature",
  "channel_data": null
}
```

### 2. Check Laravel Logs

Monitor `storage/logs/laravel.log` for any authorization errors.

### 3. Test in Frontend

1. Open browser DevTools → Network tab
2. Filter for "pusher/auth" or "broadcasting/auth"
3. Try to join a consultation
4. Check if the auth request returns 200 OK

---

## Troubleshooting

### Error: "Unauthorized" (401)

- **Cause:** User is not authenticated
- **Fix:** Ensure auth token is sent in Authorization header
- **Check:** Verify `auth:sanctum` or `auth:api` middleware is working

### Error: "Access denied" (403)

- **Cause:** User doesn't have access to the consultation
- **Fix:** Check `userHasAccessToConsultation()` logic
- **Check:** Verify consultation exists and user is doctor/patient

### Error: "Invalid channel name" (400)

- **Cause:** Channel name doesn't match expected format
- **Fix:** Ensure channel name is `private-webrtc-consultation{id}`
- **Check:** Verify regex pattern matches your channel names

### Error: "Status 0" or Network Error

- **Cause:** Endpoint doesn't exist or CORS issue
- **Fix:** 
  1. Verify route exists: `php artisan route:list | grep pusher`
  2. Check CORS configuration in `config/cors.php`
  3. Ensure endpoint URL is correct in frontend

### Error: "Signature mismatch"

- **Cause:** Pusher credentials don't match
- **Fix:** Verify `PUSHER_APP_KEY`, `PUSHER_APP_SECRET`, `PUSHER_APP_ID` in `.env`

---

## Security Considerations

1. **Always verify user identity** - Don't trust client-provided user IDs
2. **Check consultation access** - Verify user is doctor or patient for that consultation
3. **Use HTTPS** - Always use encrypted connections in production
4. **Rate limiting** - Add rate limiting to prevent abuse
5. **Logging** - Log authorization attempts for security auditing

---

## Example: Complete Laravel Route with Middleware

```php
// routes/api.php

use App\Http\Controllers\PusherAuthController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/pusher/auth', [PusherAuthController::class, 'authenticate'])
        ->middleware('throttle:60,1'); // Rate limit: 60 requests per minute
});
```

---

## Example: Complete Controller with Logging

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Pusher\Pusher;

class PusherAuthController extends Controller
{
    public function authenticate(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            Log::warning('Pusher auth failed: User not authenticated');
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $socketId = $request->input('socket_id');
        $channelName = $request->input('channel_name');

        Log::info('Pusher auth request', [
            'user_id' => $user->id,
            'user_type' => $user->user_type,
            'channel' => $channelName,
            'socket_id' => $socketId,
        ]);

        // Validate channel name
        if (!preg_match('/^private-webrtc-consultation(\d+)$/', $channelName, $matches)) {
            Log::warning('Pusher auth failed: Invalid channel name', ['channel' => $channelName]);
            return response()->json(['error' => 'Invalid channel name'], 400);
        }

        $consultationId = (int) $matches[1];

        // Verify access
        if (!$this->userHasAccessToConsultation($user, $consultationId)) {
            Log::warning('Pusher auth failed: Access denied', [
                'user_id' => $user->id,
                'consultation_id' => $consultationId,
            ]);
            return response()->json(['error' => 'Access denied'], 403);
        }

        // Generate auth
        $pusher = new Pusher(
            config('broadcasting.connections.pusher.key'),
            config('broadcasting.connections.pusher.secret'),
            config('broadcasting.connections.pusher.app_id'),
            config('broadcasting.connections.pusher.options')
        );

        $auth = $pusher->socket_auth($channelName, $socketId);

        Log::info('Pusher auth successful', [
            'user_id' => $user->id,
            'consultation_id' => $consultationId,
        ]);

        return response()->json($auth);
    }

    private function userHasAccessToConsultation($user, $consultationId): bool
    {
        $consultation = \App\Models\Consultation::find($consultationId);
        
        if (!$consultation) {
            return false;
        }

        if ($user->user_type === 'doctor') {
            return $consultation->doctorID === $user->id;
        }

        if ($user->user_type === 'patient') {
            return $consultation->patientID === $user->id;
        }

        return false;
    }
}
```

---

## Quick Checklist

- [ ] Pusher PHP SDK installed
- [ ] Pusher credentials configured in `.env`
- [ ] Authorization route created (`/api/pusher/auth` or `/broadcasting/auth`)
- [ ] Controller created with authentication logic
- [ ] User access verification implemented
- [ ] Frontend Pusher config includes `authEndpoint`
- [ ] Auth token sent in Authorization header
- [ ] CORS configured (if needed)
- [ ] Tested with cURL
- [ ] Tested in frontend

---

## Need Help?

If you're still seeing errors:

1. Check Laravel logs: `tail -f storage/logs/laravel.log`
2. Check browser Network tab for auth request
3. Verify Pusher dashboard shows connection attempts
4. Test endpoint directly with cURL
5. Verify user authentication is working

---

## References

- [Pusher Channel Authorization](https://pusher.com/docs/channels/server_api/authorizing-users/)
- [Laravel Broadcasting](https://laravel.com/docs/broadcasting)
- [Pusher PHP SDK](https://github.com/pusher/pusher-http-php)
