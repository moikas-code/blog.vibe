# Debug Endpoints

These endpoints are for debugging purposes only and should be removed or disabled in production.

## Security Measures:
1. All endpoints require authentication (Clerk userId)
2. No sensitive data (like keys) are exposed - only boolean checks
3. Consider adding additional restrictions in production

## Endpoints:
- `/api/debug/webhook` - Check webhook configuration
- `/api/debug/check-tables` - Verify database tables exist
- `/api/debug/test-create-author` - Test author creation

## To disable in production:
Add environment check or remove the `/debug` folder before deploying to production.