# Production Setup Checklist

## Clerk Configuration

### 1. Environment Variables (Vercel)
Ensure these are set in your Vercel project settings:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

### 2. Clerk Dashboard Setup

1. Go to your Clerk Dashboard
2. Navigate to **Webhooks** section
3. Create a new webhook endpoint:
   - **Endpoint URL**: `https://your-domain.vercel.app/api/webhooks/clerk`
   - **Events to listen**: 
     - `user.created`
     - `user.updated`
     - `user.deleted`
4. Copy the **Signing Secret** and add it as `CLERK_WEBHOOK_SECRET` in Vercel

### 3. Verify Webhook is Working
After setting up, test by:
1. Creating a new user account
2. Check Clerk webhook logs for successful delivery
3. Check Vercel function logs for any errors

## Supabase Configuration

### 1. Environment Variables (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Setup
1. Run the schema SQL in your production Supabase project
2. Ensure RLS is enabled on all tables
3. The service role key bypasses RLS, so the webhook can create authors

### 3. Check RLS Policies
The RLS policies use `auth.uid()` which expects Supabase auth. Since we're using Clerk, the webhook uses the service role key to bypass RLS.

## Debugging Steps

### 1. Check Vercel Function Logs
```bash
vercel logs --follow
```

### 2. Common Issues

**"Unable to complete action" on login:**
- Missing `CLERK_WEBHOOK_SECRET`
- Webhook endpoint not configured in Clerk
- Webhook failing to create author record

**Database errors:**
- Missing `SUPABASE_SERVICE_ROLE_KEY`
- RLS policies blocking operations
- Schema not applied to production database

### 3. Test Webhook Manually
You can test the webhook endpoint manually:
```bash
curl -X POST https://your-domain.vercel.app/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```
This should return a 400 error about missing svix headers, confirming the endpoint is reachable.

## Quick Fix for Login Issues

If users can't log in due to missing author records:

1. **Temporary Fix**: Manually create author records in Supabase
```sql
INSERT INTO authors (clerk_id, name, avatar_url)
VALUES ('user_xxxxx', 'User Name', 'https://...');
```

2. **Permanent Fix**: Ensure webhook is properly configured and working

## Verification Steps

1. Create a test account
2. Check Clerk webhook logs
3. Check Vercel function logs
4. Verify author record created in Supabase
5. Try logging in and creating a post