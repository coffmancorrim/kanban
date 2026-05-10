# Saved For Later

Bookmarking app built with Django, Django REST Framework, React, built with Vite and fetching handled by Tanstack Query.

Django backend exposes a REST API that the React frontend consumes via TanStack Query. The Chrome extension hits the same API endpoints to save media items.

Intended to be used with [Saved For Later Chrome Extension](https://github.com/coffmancorrim/sfl-extension) extnesion. You can click the extension icon and it will attempt to save that page to the Django backend. Sign up and add API keys for IGDB and OMDB api for the best results (gets image banner and other data).

Primarily built for saving Media but can be used for general bookmarking.
