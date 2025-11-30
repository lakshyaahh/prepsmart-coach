@echo off
REM Start ngrok tunnel with proper output
echo Starting ngrok tunnel to localhost:3000...
echo Your public HTTPS URL will appear below:
echo.

ngrok http 3000

pause
