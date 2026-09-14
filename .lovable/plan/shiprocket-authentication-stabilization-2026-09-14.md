# Shiprocket authentication stabilization

## Goal
Stop avoidable repeated Shiprocket logins while keeping the existing checkout, order payload, courier, webhook, status, database, and UI behavior unchanged.

## Confirmed current state
- Shiprocket authentication is isolated in `src/lib/shiprocket.server.ts` and uses server-only environment variables.
- The email is trimmed and credentials/tokens are not logged or sent to the browser.
- A module-level token cache and one shared in-flight authentication promise already prevent duplicate logins within the same running server instance.
- The cache currently lasts 9 days (216 hours), not Shiprocket’s stated 240 hours.
- Shiprocket API requests currently throw on 401 without invalidating the token, refreshing once, or retrying the original request.

## Implementation
- Change the cached token lifetime to 240 hours, with a small expiry safety margin so an almost-expired token is not reused.
- Keep the existing shared in-flight authentication promise so simultaneous requests await one login.
- Move authenticated API calls through one small wrapper that obtains the cached token.
- On a 401 only:
  - invalidate the cached token only when it matches the rejected token;
  - obtain one refreshed token through the same shared authentication promise;
  - retry the original Shiprocket request exactly once.
- Do not refresh or retry authentication for 403 responses or “user blocked” messages.
- Preserve the existing safe error messages and never include credentials or tokens in errors or logs.
- Leave order creation data and every non-authentication behavior unchanged.

## Verification
- Use focused tests with mocked Shiprocket responses, not real test orders.
- Confirm sequential API calls reuse one token.
- Confirm simultaneous calls trigger only one login.
- Confirm one 401 causes one refresh and one retry.
- Confirm a second 401 stops, and 403/user-blocked responses never trigger another login.
- Confirm no credential or token appears in returned errors.
