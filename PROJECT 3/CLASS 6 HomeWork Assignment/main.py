from fastapi import FastAPI, HTTPException

app = FastAPI()

users = {
    "fatima": {"pin": 1234, "balance": 2000},
    "ali": {"pin": 1111, "balance": 24788},
    "moin": {"pin": 2222, "balance": 109876}
}

@app.get("/")
async def root():
    return {"message": "bank api running"}

@app.post("/authenticate")
async def authenticate_user(name: str, pin_number: int):
    user = users.get(name)
    if not user or user["pin"] != pin_number:
        raise HTTPException(status_code=401, detail={"error": "Invalid Credentials"})
    return {"name": name, "bank_balance": user["balance"]}

@app.post("/deposit")
async def deposit(name: str, amount: float):
    user = users.get(name)
    if not user:
        raise HTTPException(status_code=404, detail={"error": "User not found"})
    user["balance"] += amount
    return {"name": name, "bank_balance": user["balance"]}

@app.post("/bank-transfer")
async def bank_transfer(sender_name: str, send_pin: int, recipient_name: str, amount: float):
    # Authenticate sender
    sender = users.get(sender_name)
    if not sender or sender["pin"] != send_pin:
        raise HTTPException(status_code=401, detail={"error": "Invalid Credentials"})

    # Check if recipient exists
    recipient = users.get(recipient_name)
    if not recipient:
        raise HTTPException(status_code=404, detail={"error": "Recipient not found"})

    # Check if sender has enough balance
    if sender["balance"] < amount:
        raise HTTPException(status_code=400, detail={"error": "Insufficient balance"})

    # Perform the transfer
    sender["balance"] -= amount
    recipient["balance"] += amount

    return {
        "message": "Transfer successful",
        "sender": {"name": sender_name, "updated_balance": sender["balance"]},
        "recipient": {"name": recipient_name, "updated_balance": recipient["balance"]}
    }

