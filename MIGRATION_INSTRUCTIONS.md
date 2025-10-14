# Database Migration Instructions

## Important: Run This Migration Now

The code changes have been completed, but the database schema needs to be updated.

## Steps to Run the Migration

### 1. Open a Terminal in the Backend Directory

```bash
cd backend
```

### 2. Run the Prisma Migration Command

```bash
npx prisma migrate dev --name add_demo_schedule_details
```

### 3. What the Migration Will Do

This will add three new columns to the `Application` table:

- `demoLocation` VARCHAR(191) NULL
- `demoDuration` INT NULL
- `demoNotes` TEXT NULL

### 4. Expected Output

You should see output like:

```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": MySQL database "hr_ms" at "localhost:3306"

Applying migration `20250914xxxxxx_add_demo_schedule_details`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250914xxxxxx_add_demo_schedule_details/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

### 5. Verify the Migration

After running the migration, verify it worked:

```bash
npx prisma studio
```

Then:

1. Navigate to the `Application` model
2. Check that the new fields appear:
   - demoLocation
   - demoDuration
   - demoNotes

### 6. Start the Backend Server

```bash
npm run dev
```

## What Changed

### Schema Changes:

```prisma
model Application {
  // ... existing fields
  demoSchedule   DateTime?
  demoLocation   String?      // ✅ NEW
  demoDuration   Int?         // ✅ NEW
  demoNotes      String?  @db.Text  // ✅ NEW
  // ... rest of fields
}

enum UserRole {
  APPLICANT
  HR
  ADMIN  // ✅ Added back to match database
}
```

## Testing After Migration

### Test 1: Schedule a Demo (HR)

1. Login as HR user
2. Go to Scheduling page
3. Schedule a demo with:
   - Date: [future date]
   - Time: [any time]
   - Location: "Room 305"
   - Duration: 60 minutes
   - Notes: "Please prepare a lesson on algebra"
4. Submit
5. Check database - all fields should be saved

### Test 2: View Demo (Applicant)

1. Login as applicant
2. Go to Dashboard
3. Check "Upcoming Demo" card shows:
   - ✅ Date and Time
   - ✅ Duration: 60 minutes
   - ✅ Location: Room 305
   - ✅ Instructions: "Please prepare a lesson on algebra"

## Troubleshooting

### If Migration Fails

**Error: "Column already exists"**

```bash
# The column might have been manually added. Check with:
npx prisma db pull
npx prisma generate
```

**Error: "Database connection failed"**

```bash
# Check your .env file has correct DATABASE_URL
# Make sure MySQL server is running
```

**Error: "Prisma Client outdated"**

```bash
npx prisma generate
```

### If You Need to Rollback

```bash
# To undo the last migration:
npx prisma migrate resolve --rolled-back 20250914xxxxxx_add_demo_schedule_details
```

Then manually drop the columns:

```sql
ALTER TABLE Application
  DROP COLUMN demoLocation,
  DROP COLUMN demoDuration,
  DROP COLUMN demoNotes;
```

## Summary

✅ **Code changes**: Complete  
⏳ **Database migration**: Run the command above  
⏳ **Testing**: After migration completes

Once you run the migration, the complete demo scheduling feature will work with all fields being saved and displayed!
