# StudentHub frontend

## Files
- `index.html` — page structure and form/table layout
- `style.css` — responsive design
- `script.js` — dashboard, add/edit/delete, search, status filter, CSV export

## Run it
1. Open this folder in VS Code.
2. Open `index.html` in a browser, or use the VS Code Live Server extension.
3. Try adding, editing, searching, filtering and deleting students.

## Important learning note
This is the frontend-only learning version. It saves demo records in the browser's `localStorage`.
It is NOT connected to Node.js, Express or MySQL yet. Browser storage is not a secure shared database.
In later lessons, we will create the backend API and replace the localStorage operations with `fetch()` requests.
