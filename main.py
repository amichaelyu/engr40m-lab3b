import time
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import serial.tools.list_ports

data = []
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    return {"message": "cooked"}

@app.websocket("/serial")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            data = await websocket.receive_text()
            # print(f"Received data: {data}\n")
            if data == "close":
                break
            for line in data.splitlines():
                arduino.write(str.encode(line))
                time.sleep(0.001)
        except Exception as e:
            print(f"Error: {e}")
            break
    await websocket.close()

if __name__ == "__main__":
    import uvicorn

    print("Available serial ports:")
    for port in serial.tools.list_ports.comports():
        print(port.device)

    arduino = serial.Serial(port='/dev/cu.usbserial-DJ00S9MH', baudrate=57600, timeout=0)
    time.sleep(2)  # wait for the serial connection to establish
    uvicorn.run(app, host="0.0.0.0", port=8080)