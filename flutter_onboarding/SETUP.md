# Flutter Attendance App — Setup Guide

## 1. Install Flutter dependencies

```bash
cd flutter_onboarding
flutter pub get
```

## 2. Back4App — Create collections

In the Back4App Dashboard → Database, create three classes with these fields:

### Employee
| Field       | Type    | Notes                    |
|-------------|---------|--------------------------|
| employeeId  | String  | e.g. "EMP-001"           |
| fullName    | String  | Display name             |
| email       | String  | Lowercase, indexed       |
| role        | String  | "ADMIN" or "EMPLOYEE"    |
| isActivated | Boolean | false until signup done  |

### AppUser
| Field        | Type   | Notes                         |
|--------------|--------|-------------------------------|
| email        | String | Lowercase, unique             |
| passwordHash | String | SHA-256 + salt                |
| role         | String | "ADMIN" or "EMPLOYEE"         |
| employeeId   | String | References Employee.employeeId|

### OTP
| Field     | Type    | Notes                           |
|-----------|---------|---------------------------------|
| email     | String  | Lowercase                       |
| otp       | String  | 6-digit code                    |
| expiresAt | Date    | Created + 5 minutes             |

## 3. Back4App — Deploy Cloud Code

1. Open Back4App Dashboard → Cloud Code
2. Upload `back4app_cloud_code/main.js` and `back4app_cloud_code/package.json`
3. Click **Deploy**

### Set Cloud Code environment variables
Back4App Dashboard → App Settings → Server Settings → Environment Variables:

| Key               | Value                        |
|-------------------|------------------------------|
| GMAIL             | your-gmail@gmail.com         |
| GMAIL_APP_PASSWORD| your-16-char-app-password    |

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App passwords

## 4. Back4App — Security
In Dashboard → Security for each class:
- **Employee**: Read (authenticated users), Write (admin only via Master Key)
- **AppUser**: Read (self), Write (self)
- **OTP**: Read (self), Write (self), Delete (self)

## 5. Run the app

```bash
flutter run \
  --dart-define=BACK4APP_APP_ID=YOUR_APP_ID \
  --dart-define=BACK4APP_JS_KEY=YOUR_JS_KEY \
  --dart-define=ADMIN_GMAIL=admin@yourcompany.com
```

Find your App ID and JS Key in:  
Back4App Dashboard → App Settings → Security & Keys

## 6. Replit Secrets (for CI / build pipelines)

The following secrets are already set in Replit and should be passed
as `--dart-define` flags in your build command:

| Replit Secret        | --dart-define key     |
|---------------------|-----------------------|
| BACK4APP_APP_ID     | BACK4APP_APP_ID       |
| BACK4APP_JS_KEY     | BACK4APP_JS_KEY       |
| ADMIN_GMAIL         | ADMIN_GMAIL           |

> `GMAIL` and `GMAIL_APP_PASSWORD` are used **only** in Back4App Cloud Code
> (server-side). They are never embedded in the Flutter client app.

## App Flow

```
Cold Start
   │
   ├── First launch?  ──YES──▶  Onboarding (3 pages)
   │                                  │
   │                             Get Started
   └── Returning user ──────────────▼
                              Login Screen
                                   │
                         ┌─────────┴──────────┐
                      Login OK            Sign Up
                         │                   │
                    Success Screen     OTP Verification
                                            │
                                      Success Screen
```
