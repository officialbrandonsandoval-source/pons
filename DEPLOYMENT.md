# 🚀 PONS AI OS - Deployment Guide

## Production Deployment to Vercel

### Prerequisites

1. **GitHub Account** with your repository pushed
2. **Vercel Account** (sign up at [vercel.com](https://vercel.com))
3. **Supabase Project** (create at [supabase.com](https://supabase.com))
4. **OpenAI API Key** (get from [platform.openai.com](https://platform.openai.com))

---

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning (~2 minutes)
3. Navigate to **Project Settings** → **API**
4. Copy these values (you'll need them later):
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### 1.2 Run Database Schema
1. Open the **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase_production.sql` from this repository
3. Paste and click **Run** to create all tables, indexes, and RLS policies
4. Verify tables were created in the **Table Editor**

---

## Step 2: Deploy to Vercel

### 2.1 Import Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `officialbrandonsandoval-source/pons`
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build` (or leave default)
   - **Install Command**: `pnpm install`

### 2.2 Configure Environment Variables
Add the following environment variables in Vercel:

#### Required Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://your-app.vercel.app

OPENAI_API_KEY=sk-your_openai_api_key
NEXT_PUBLIC_OPENAI_API_KEY=sk-your_openai_api_key
```

#### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### Optional Integration Variables:
Add these only if you want to enable specific integrations:
```bash
# Social Media
TWITTER_CLIENT_ID=...
INSTAGRAM_CLIENT_ID=...
LINKEDIN_CLIENT_ID=...
FACEBOOK_APP_ID=...
TIKTOK_CLIENT_KEY=...
YOUTUBE_CLIENT_ID=...

# Financial
PLAID_CLIENT_ID=...
STRIPE_SECRET_KEY=...
PAYPAL_CLIENT_ID=...

# Productivity
GOOGLE_CLIENT_ID=...
NOTION_API_KEY=...
SPOTIFY_CLIENT_ID=...
GITHUB_TOKEN=...
```

### 2.3 Deploy
1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

---

## Step 3: Post-Deployment Configuration

### 3.1 Update NEXTAUTH_URL
1. Copy your deployed URL from Vercel
2. Go to Vercel **Settings** → **Environment Variables**
3. Update `NEXTAUTH_URL` to your production URL
4. Redeploy the application

### 3.2 Configure Supabase Auth
1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
3. Add redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/api/auth/callback/*`

### 3.3 Test Authentication
1. Visit `https://your-app.vercel.app/auth/signup`
2. Create a test account
3. Check your email for verification
4. Sign in at `https://your-app.vercel.app/auth/signin`

---

## Step 4: Enable Integrations (Optional)

### Social Media Integrations
Each integration requires OAuth app setup:

#### Twitter/X
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create app and get client ID/secret
3. Add callback URL: `https://your-app.vercel.app/api/integrations/twitter/callback`

#### Instagram
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create app with Instagram Basic Display
3. Configure OAuth redirect URI

#### LinkedIn
1. Go to [developer.linkedin.com](https://developer.linkedin.com)
2. Create app and add redirect URI

### Financial Integrations

#### Plaid (Banking)
1. Sign up at [plaid.com/developers](https://plaid.com/developers)
2. Get sandbox credentials (free for development)
3. Apply for production access when ready

#### Stripe
1. Get API keys from [stripe.com/developers](https://stripe.com/developers)
2. Use test mode keys initially

### Productivity Integrations

#### Google Calendar & Gmail
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project and enable APIs
3. Configure OAuth consent screen

#### Notion
1. Get integration token from [notion.so/my-integrations](https://notion.so/my-integrations)

---

## Step 5: Monitoring & Maintenance

### Enable Vercel Analytics
1. Go to your project → **Analytics** tab
2. Enable Web Analytics (included in Pro plan)

### Monitor Supabase
1. Check **Database** → **Usage** for storage and queries
2. Review **Auth** → **Users** for sign-ups
3. Monitor **Logs** for errors

### Performance Optimization
- Vercel automatically optimizes Next.js builds
- Enable Edge Functions for faster API routes
- Use Vercel's Image Optimization for media

---

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Review build logs in Vercel dashboard

### Auth Not Working
- Verify `NEXTAUTH_URL` matches your deployment URL
- Check Supabase redirect URLs are configured
- Ensure `NEXTAUTH_SECRET` is set

### Database Connection Issues
- Verify Supabase credentials in environment variables
- Check RLS policies allow authenticated access
- Review Supabase logs for connection errors

### Integration Errors
- Confirm API keys are valid and not expired
- Check rate limits haven't been exceeded
- Verify OAuth callback URLs match exactly

---

## Security Best Practices

1. **Never commit `.env.local`** - it contains secrets
2. **Rotate API keys** periodically
3. **Enable Supabase RLS** - already configured in schema
4. **Use environment-specific keys** - separate dev/prod
5. **Monitor API usage** - set up alerts for unusual activity
6. **Enable 2FA** on all service accounts

---

## Automatic Deployments

Vercel automatically deploys when you push to `main`:
```bash
git add .
git commit -m "Update features"
git push origin main
```

Preview deployments are created for pull requests.

---

## Custom Domain (Optional)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to use custom domain
5. Update Supabase redirect URLs

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Repository**: [github.com/officialbrandonsandoval-source/pons](https://github.com/officialbrandonsandoval-source/pons)

---

## Estimated Costs

- **Vercel**: Free hobby plan (sufficient for personal use)
- **Supabase**: Free tier (500MB database, 2GB bandwidth/month)
- **OpenAI**: Pay-per-use (~$0.50-5/month for personal use)
- **Integrations**: Most have free tiers for personal use

**Total estimated**: $0-10/month for personal use

---

## Next Steps

After deployment:
1. ✅ Create your account
2. ✅ Connect your first integration
3. ✅ Upload a document to test RAG
4. ✅ Try the AI copilot
5. ✅ Enable background sync
6. ✅ Explore voice commands

🎉 **Congratulations! Your PONS AI OS is live!**
