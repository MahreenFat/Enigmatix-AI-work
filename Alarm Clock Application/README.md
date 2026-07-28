# Alarm Clock Application

A simple responsive alarm clock web app. It can be opened on desktop and mobile devices from the same Wi-Fi network.

## How to use

1. Open `index.html` in your browser for local use.
2. To use from mobile, run a local web server from this folder:
   - With Python: `python -m http.server 8000`
   - With VS Code Live Server: right-click `index.html` and choose "Open with Live Server".
3. On your phone, open the same IP and port in your browser, for example:
   - `http://192.168.1.100:8000`
4. Set the alarm time and label, then keep the page open.

## Notes

- The alarm rings only when the page is open in the browser.
- Mobile devices can use the same page when connected to the same network.
- The app is built with plain HTML, CSS, and JavaScript.
