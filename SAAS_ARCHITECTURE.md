# SaaS Architecture — RockeyHub Multi-Tenant Design

---

## Multi-Tenant Model

RockeyHub is built on a **shared database, isolated data** multi-tenant model — the standard approach for SaaS products that need to balance scalability with data privacy.

### Core Principle

Every user-facing table has an `organization_id` column. Supabase Row Level Security (RLS) policies enforce that queries only return rows matching the authenticated user's organization.

```
User authenticates (Supabase Auth)
    ↓
JWT contains: { user_id, organization_id, role }
    ↓
Every DB query automatically filtered by RLS:
    WHERE organization_id = auth.jwt() ->> 'organization_id'
```

No application-level filtering required — isolation is enforced at the database layer.

---

## Role Hierarchy

```
super_master
    │ Global platform view
    │ Manages all organizations (tenants)
    │ Accesses SaaS Master Panel
    │ Manages University content globally
    │
    ├── admin (per organization)
    │       │ Full access within their org
    │       │ Manages members, leads, users
    │       │ Configures WhatsApp, AI limits
    │       │ Views Strategy Advisor
    │       │
    │       └── leader (per organization)
    │               Private lead directory (own leads only)
    │               Message Composer (sends to own leads)
    │               University viewer
    │               Dashboard (own metrics)
```

### Permission Matrix

| Action | super_master | admin | leader |
|---|:---:|:---:|:---:|
| Access SaaS Master Panel | ✅ | ❌ | ❌ |
| View all organizations | ✅ | ❌ | ❌ |
| Manage University content | ✅ | ❌ | ❌ |
| View Member Directory | ❌ | ✅ | ❌ |
| View own leads | ❌ | ✅* | ✅ |
| Use Message Composer | ✅ | ✅ | ✅ |
| Use Strategy Advisor | ❌ | ✅ | ❌ |
| Manage org users | ❌ | ✅ | ❌ |
| Configure WhatsApp | ❌ | ✅ | ❌ |
| Configure AI limits | ❌ | ✅ | ❌ |
| View University content | ❌ | ❌ | ✅ |
| Access Dashboard | ❌ | ✅ | ✅ |

*Admins fetch all leads but RLS limits results to own `assigned_to` records.

---

## Organization Feature Flags

Each organization can have individual feature flags:

| Flag | Type | Effect |
|---|---|---|
| `plan` | enum (free/pro/enterprise) | Controls available features |
| `status` | enum (active/suspended) | Blocks access if suspended |
| `allowed_whatsapp_mode` | enum (basic/api) | Controls WhatsApp send mode |
| `is_university` | boolean | Enables E-learning module |
| `is_private` | boolean | Hides member directory from leaders |
| `ai_daily_limit_leaders` | integer | Cap AI calls per day per leader |

---

## The ViewState Enum Architecture

### Decision

The SPA uses a `ViewState` enum for all navigation instead of React Router.

### Implementation Pattern

```typescript
// 1. Enum defines all possible views
enum ViewState {
  DASHBOARD, DIRECTORY, MESSAGING, STRATEGY,
  ADMIN_USERS, SAAS_PANEL, INVITE_MANAGER,
  UNIVERSITY_MANAGER, UNIVERSITY_DASHBOARD,
  LEADS, ADMIN_LEADS
}

// 2. Permission guard at transition time
const handleViewChange = (view: ViewState) => {
  if (currentUser?.role === 'leader') {
    if ([ViewState.ADMIN_USERS, ViewState.STRATEGY,
         ViewState.INVITE_MANAGER, ViewState.DIRECTORY]
        .includes(view)) {
      alert("Access denied: Admin privileges required.");
      return;
    }
  }
  setCurrentView(view);
};

// 3. Render decision tree in JSX
effectiveView === ViewState.DASHBOARD ? <Dashboard /> :
effectiveView === ViewState.DIRECTORY && role === 'admin' ? <MemberDirectory /> :
effectiveView === ViewState.LEADS && role === 'leader' ? <LeadDirectory /> :
// ... etc
<AccessRestricted />
```

### Why This Works for Internal SaaS

| Requirement | Met? |
|---|---|
| No deep-linking needed (closed auth app) | ✅ |
| Role gates are simple and auditable | ✅ |
| No URL-based state injection attacks | ✅ |
| Zero router dependency | ✅ |
| New views are easy to add | ✅ |

**Trade-off acknowledged**: This pattern would not be appropriate for public-facing apps, SEO-optimized content, or apps requiring shareable URLs.

---

## SaaS Master Panel

The `super_master` role has exclusive access to a global management panel that provides:

- Full list of all organizations (tenants) and their status
- Plan management (upgrade/downgrade/suspend)
- University content management (global course library)
- Cross-org user provisioning
- Platform configuration

This is the operator's control plane — completely invisible to `admin` and `leader` roles.

---

## Messaging Contact Model

A subtle but important design: **what contact list does the Message Composer show?**

```typescript
const messagingContacts = useMemo(() => {
  // Leaders compose to their own private leads
  if (currentUser?.role === 'leader') return leadsAsMemberShape;
  // Admins compose to the full member directory
  return members;
}, [currentUser, leads, members]);
```

This means:
- Leaders never see the member directory (privacy)
- Admins never see individual leaders' leads (isolation)
- The Message Composer UI is the same component — only the data changes

---

## Deployment Architecture

| Service | Platform | Notes |
|---|---|---|
| Frontend SPA | Vercel | Auto-deploy from GitHub main branch |
| Edge Functions | Supabase | Deno runtime, auto-scaled |
| Database | Supabase | PostgreSQL + pgvector + RLS |
| Storage | Supabase | Private buckets for University media |
| Domain | Custom (rockeyhub.app) | CNAME to Vercel |
