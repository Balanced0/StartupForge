# StartupForge (Frontend)

StartupForge is a web platform designed to connect startup founders with passionate collaborators. It serves as a matchmaking ecosystem where founders can post opportunities and manage applicants, collaborators can browse opportunities and join startups, and administrators can oversee the network.

---

## Features

### Authentication & Session Management
- **Better Auth Integration**: Highly secure credential sign-up and sign-in flow.
- **Social Login**: Single-click authentication using Google OAuth.
- **Role-Based Provisioning**: Dynamic onboarding specifying role type (`Founder` vs. `Collaborator`).
- **Profile Image Upload**: Integrated image uploading to ImgBB.

### Role-Based Dashboards
- **Founder Dashboard**:
  - Manage startup profile page.
  - Create and manage opportunity postings (Job roles).
  - Track, view, and respond to collaborator applications.
- **Collaborator Dashboard**:
  - Track active applications status.
  - Browse opportunity listings matching skills.
  - Update collaborator profile details.
- **Admin Dashboard**:
  - General system health and statistics.
  - Manage and review system users.
  - Oversee startups listing.
  - Monitor Stripe transaction logs.

### Opportunities & Startup Discovery
- **Explore Portal**: Search, paginate, and filter startup listings and job opportunities.
- **Responsive Filtering**: Filter by industry types (FinTech, SaaS, AI/ML, CleanTech, Web3, etc.) and work environments (Remote, On-site, Hybrid).

### Payments Integration
- **Stripe Payments**: Safe payment integration for transactions and premiums checkout.

---

## Tech Stack

- **Core**: [Next.js](https://nextjs.org/) (App Router architecture, dynamic routing, compile optimizations)
- **State & Data Fetching**: React Client Hooks & Better Auth hooks
- **Authentication**: [Better Auth](https://www.better-auth.com/) (using MongoDB Adapter)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/) (Modern CSS utilities & theme presets)
- **Icons**: [@gravity-ui/icons](https://github.com/gravity-ui/icons)
- **Payments**: [@stripe/stripe-js](https://stripe.com/)

---

## Key File Structure

```text
src/
├── app/
│   ├── (Auth)/                  # Sign-in & Sign-up pages
│   ├── (Main)/                  # Public access profiles & layout
│   ├── api/                     # Backend API handlers (Auth/Stripe sessions)
│   ├── dashboard/               # Role-based views (admin, founder, collaborator)
│   ├── opportunities/           # Browse opportunities portal
│   └── startups/                # Startup lists & profiles
├── components/                  # Common UI components (Navbar, Topbar, Sidebar, OpportunityCard)
├── lib/                         # Clients initialization (Better Auth client, Token sync hook)
└── public/                      # Static resources (images, vectors)
```

---

## Configuration & Setup

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your_auth_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth Keys
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database Details
AUTH_DB_NAME=StartUpForge
MONGO_URI=your_mongodb_connection_uri

# ImgBB Key for file uploads
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key

# Backend API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:5000

# Stripe Payments Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
INTERNAL_SECRET=your_internal_shared_secret
```

---

## 🚀 Running Locally

Follow these steps to run the development server:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```

3. **Open the App**:
   Navigate to [http://localhost:3000](http://localhost:3000) inside your web browser.

> [!NOTE]
> The app relies on the companion backend server running at `http://localhost:5000` to fetch opportunities, user lists, and handle general API database writes. Make sure the backend server is running in parallel.
