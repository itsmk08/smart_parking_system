import asyncio
import websockets
import subprocess

async def handler(websocket):
    print("Client connected")
    try:
        async for message in websocket:
            print(f"Received message: {message}")
            if message in ["entry", "exit"]:
                print("Triggering main.py...")
                subprocess.Popen([
                    r"C:\Users\Lenovo\Downloads\Programs\smart_parking_system\plate_detect\venv\Scripts\python.exe","main.py", message
                ])
            else:
                print("Unknown message:", message)
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Client disconnected unexpectedly: {e}")
    except Exception as e:
        print(f"Unhandled error: {e}")

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8765):
        print("WebSocket server started on port 8765")
        await asyncio.Future()

asyncio.run(main())
