# LiveJourney: Fresh Deployment Reset Guide

If you ever need to completely wipe your application data (reset everything back to zero) and deploy a fresh instance of LiveJourney, follow these steps.

This process will **DELETE ALL USER ACCOUNTS, LOGS, AND PROGRESS**.

## 🔴 Method 1: The Nuclear Option (Easiest)
Run this single command from the root of your project directory (`/Users/piyush/Projects/progress-tracker`).

```bash
docker-compose -p livejourney down -v && docker-compose -p livejourney up -d --build
```

**What this does:**
1. `down -v`: Stops all running containers and **deletes the associated volumes** (which holds your Postgres Database and Redis data). 
2. `up -d --build`: Rebuilds the images with the latest code and starts fresh containers.

Because the old volumes were deleted, Postgres will initialize a completely empty database.

---

## 🟡 Method 2: Step-by-Step

If you want to be careful and see the output step-by-step:

**1. Stop Containers and Wipe Data**
```bash
docker-compose -p livejourney down -v
```

**2. Build and Start Fresh Containers**
```bash
docker-compose -p livejourney up -d --build
```

---

## 🟢 Post-Reset Operations (Crucial)

Since you just wiped the database, there are **no user accounts** and **no journey data**. You must run your setup scripts to populate the system.

**1. Create the Seed/Test User:**
```bash
docker-compose -p livejourney exec backend python manage.py shell -c "from django.contrib.auth.models import User; getattr(User.objects.filter(username='dev').first(), 'delete', lambda: None)(); User.objects.create_superuser('dev', 'dev@example.com', 'admin');"
```

**2. Load the 60-Day Roadmap (Seed Data):**
```bash
docker-compose -p livejourney exec backend python manage.py seed_journey
```

*Note: The script outputs: **"Journey seeded successfully!"** once complete.*

You can now log in to the fresh deployment using `dev` / `admin`.
