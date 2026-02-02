# Troubleshooting: Updates Not Saving

## Issue
After editing a post in Admin UI, changes don't persist after page refresh.

## Root Cause Analysis

The problem has been fixed in the code, but you need to **restart the dev server** for the changes to take effect.

## Solution Steps

### Step 1: Stop the Current Dev Server

Press `Ctrl+C` in the terminal where `npm run dev` is running, or:

```powershell
# Kill all Node processes (if needed)
Get-Process node | Stop-Process -Force
```

### Step 2: Clear Browser Cache & LocalStorage

**Option A: Hard Refresh**
- Press `Ctrl+Shift+Delete` in your browser
- Select "Cached images and files" and "Cookies and other site data"
- Click "Clear data"

**Option B: Use the Debug Tool**
1. Open `d:\Insight\debug-storage.html` in your browser
2. Click "🗑️ Clear All Data"
3. This will reset your localStorage

### Step 3: Restart the Dev Server

```bash
cd d:\Insight
npm run dev
```

### Step 4: Test the Fix

1. **Open** http://localhost:3000
2. **Login** to Admin UI (admin / IS2026?)
3. **Edit** an existing book:
   - Click the edit icon
   - Change the title to "TEST EDIT"
   - Save
4. **Refresh** the page (F5)
5. **Check** if "TEST EDIT" persists ✅

## What Was Fixed

### File: `services/databaseService.ts`

**Before (BUGGY):**
```typescript
defaultItems.forEach(item => {
    if (!deletedIds.has(item.id)) {
        itemMap.set(item.id, item); // ❌ Overwrites user edits!
    }
});
```

**After (FIXED):**
```typescript
defaultItems.forEach(item => {
    if (!deletedIds.has(item.id) && !itemMap.has(item.id)) {
        itemMap.set(item.id, item); // ✅ Only adds if not exists
    }
});
```

### File: `App.tsx`

Fixed state refresh to update all content types after save/delete.

## Debug Tools

### 1. LocalStorage Inspector
Open `debug-storage.html` in your browser to see:
- All books, articles, audios, videos
- Deleted IDs list
- Export/import data

### 2. Browser DevTools
1. Press `F12`
2. Go to "Application" tab
3. Click "Local Storage" → `http://localhost:3000`
4. Look for keys starting with `is_library_`

## Expected Behavior After Fix

✅ **Create**: New posts appear immediately and persist
✅ **Edit**: Changes save and persist after refresh
✅ **Delete**: Posts are removed and stay deleted

## If Problem Persists

1. **Check the code changes were saved:**
   ```powershell
   # View the fixed line in databaseService.ts
   Select-String -Path "d:\Insight\services\databaseService.ts" -Pattern "!itemMap.has"
   ```
   Should show: `if (!deletedIds.has(item.id) && !itemMap.has(item.id)) {`

2. **Verify dev server is using latest code:**
   - Stop server completely
   - Delete `node_modules/.vite` cache
   - Restart server

3. **Check browser console for errors:**
   - Press F12
   - Look for red errors in Console tab

## Contact Info

If the issue persists after following all steps, please provide:
1. Screenshot of browser console (F12)
2. Screenshot of `debug-storage.html` showing the data
3. What specific action you're doing (create/edit/delete)
4. What you expect vs what actually happens
