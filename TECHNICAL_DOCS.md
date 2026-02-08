# 💻 Technical Manual: IT Stock System

## 1. System Overview
**Type**: Serverless Single Page Application (SPA)
**Backend**: Firebase (Firestore Auth + Database)
**Frontend**: Vanilla JS (Single `script.js` file)
**Key Feature**: Multi-tenant support (Campuses) and Role-Based Access Control (RBAC).

## 2. Code Logic Analysis (`script.js`)

### A. Initialization & Seeding
**Function**: `initializeDatabase()` (Lines 50-127)
**Logic**:
1.  Checks if `categories` collection is empty.
2.  If empty, automatically populates:
    *   **Categories**: (Computers, Networking, Printers, etc.)
    *   **Locations**: (Main Office GF/1F/2F)
    *   **Sample Assets**: (Dell Latitude, MacBook Pro)
3.  This ensures the app works immediately upon first load without manual setup.

### B. Global Filtering (Tenancy)
**Variable**: `currentGlobalCampus`
**Function**: `handleGlobalCampusChange()` & `displayAssets()`
**Logic**:
*   The dashboard has a "Campus" dropdown.
*   The `displayAssets` function filters the `allAssets` array:
    ```javascript
    assets.filter(a =>
        // 1. User Permission Check
        (currentUserHasAccess(a.campus)) &&
        // 2. Dashboard Filter Check
        (currentGlobalCampus === '' || a.campus === currentGlobalCampus)
    )
    ```
*   This provides a "View Mode" where an Admin can focus on one specific site.

### C. Role-Based Access Control (RBAC)
**Roles**: `Admin`, `IT Staff`, `Viewer` (Implicit)
**Implementation**:
*   **UI Hiding**: Elements with class `admin-only` are hidden via CSS `display: none` in `showPage()` if role != Admin.
*   **Logic Gates**:
    *   `updateNavigation()`: Explicitly toggles "Add Asset" / "Edit User" buttons.
    *   `displayUsers()`: Only Admins see the "Edit/Delete" buttons for users.

### D. cascading Selects (UI Logic)
**Functions**: `updateAssetBuildings()` -> `updateAssetFloors()` -> `updateAssetRooms()`
**Logic**:
*   When a user selects a Campus, the Building dropdown is repopulated with *only* buildings belonging to that campus.
*   It uses `getUniqueValues()` helper to parse the flat `allLocations` array into a hierarchy on the fly.

## 3. Data Dictionary (Firestore/NoSQL)

**Collections**:

| Collection | Document Structure (JSON) | Notes |
| :--- | :--- | :--- |
| **`assets`** | `{ name, category, brand, model, condition, quantity, campus, locationDetails: {building, floor, room}, active: true }` | `active` flag used for soft-deletes. |
| **`categories`** | `{ name, description, active }` | |
| **`locations`** | `{ campus, building, floor, room, active }` | Stores the hierarchy definitions. |
| **`users`** | `{ email, name, role, allowedCampuses: [], active }` | `allowedCampuses` array controls which sites a user can see. |

## 4. Configuration
**File**: `script.js` (Top of file)
**Object**: `firebaseConfig`
**Secrets**: API Keys are public (Client-side). Security relies on **Firestore Security Rules** (not visible in code, managed in Firebase Console).
