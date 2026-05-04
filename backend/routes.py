from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
from database import get_db, User, Client, Invoice, AgentLog, MarketPrice, Alert, WhatsAppMessage

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SECRET_KEY = "fabriciq-secret-2025"
ALGORITHM = "HS256"

def hash_password(p): return pwd_context.hash(p[:72])
def verify_password(p, h): return pwd_context.verify(p, h)
def create_token(data):
    d = data.copy()
    d["exp"] = datetime.utcnow() + timedelta(days=7)
    return jwt.encode(d, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        if not user: raise HTTPException(status_code=401, detail="Login karo")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalid")

class RegisterBody(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class ClientBody(BaseModel):
    name: str
    company: Optional[str] = None
    phone: str
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    plan: Optional[str] = "starter"
    plan_amount: Optional[float] = 8000
    gst_number: Optional[str] = None
    notes: Optional[str] = None

class InvoiceBody(BaseModel):
    client_id: int
    amount: float
    due_days: Optional[int] = 15

# AUTH
@router.post("/api/auth/register")
def register(body: RegisterBody, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already hai")
    user = User(name=body.name, email=body.email, phone=body.phone, password_hash=hash_password(body.password))
    db.add(user); db.commit(); db.refresh(user)
    token = create_token({"sub": user.email})
    return {"token": token, "user": {"name": user.name, "email": user.email}}

@router.post("/api/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ya password galat hai")
    token = create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"name": user.name, "email": user.email}}

@router.get("/api/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {"name": current_user.name, "email": current_user.email, "phone": current_user.phone}

# DASHBOARD
@router.get("/api/dashboard/stats")
def stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
    return {
        "total_clients": db.query(Client).filter(Client.is_active == True).count(),
        "mrr": db.query(func.sum(Client.plan_amount)).filter(Client.is_active == True).scalar() or 0,
        "paid_this_month": db.query(func.sum(Invoice.total_amount)).filter(Invoice.status == "paid", Invoice.paid_date >= month_start).scalar() or 0,
        "pending_amount": db.query(func.sum(Invoice.total_amount)).filter(Invoice.status == "pending").scalar() or 0,
        "unread_alerts": db.query(Alert).filter(Alert.is_read == False).count(),
        "new_clients_month": db.query(Client).filter(Client.joined_date >= month_start).count(),
    }

@router.get("/api/dashboard/agents")
def agent_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    agents = ["Data Agent","Forecast Agent","Alert Agent","Report Agent","Billing Agent","Support Agent","Sales Agent","Market Agent","WhatsApp Agent"]
    result = []
    for a in agents:
        last = db.query(AgentLog).filter(AgentLog.agent_name == a).order_by(AgentLog.ran_at.desc()).first()
        result.append({"name": a, "status": last.status if last else "never", "last_ran": last.ran_at.isoformat() if last else None, "message": last.message if last else "Abhi tak nahi chala"})
    return result

@router.get("/api/dashboard/alerts")
def get_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(20).all()
    return [{"id": a.id, "title": a.title, "message": a.message, "type": a.alert_type, "is_read": a.is_read, "created_at": a.created_at.isoformat()} for a in alerts]

@router.post("/api/dashboard/alerts/{alert_id}/read")
def mark_read(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if a: a.is_read = True; db.commit()
    return {"ok": True}

@router.get("/api/dashboard/market-prices")
def market_prices(db: Session = Depends(get_db)):
    prices = db.query(MarketPrice).order_by(MarketPrice.fetched_at.desc()).limit(12).all()
    return [{"commodity": p.commodity, "city": p.city, "price": p.price, "unit": p.unit, "change_percent": p.change_percent} for p in prices]

# CLIENTS
@router.get("/api/clients")
def list_clients(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    clients = db.query(Client).order_by(Client.joined_date.desc()).all()
    return [{"id": c.id, "name": c.name, "company": c.company, "phone": c.phone, "city": c.city, "plan": c.plan, "plan_amount": c.plan_amount, "is_active": c.is_active} for c in clients]

@router.post("/api/clients")
def add_client(body: ClientBody, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client = Client(**body.dict())
    db.add(client); db.commit(); db.refresh(client)
    return {"id": client.id, "message": "Client add ho gaya!"}

@router.delete("/api/clients/{client_id}")
def delete_client(client_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Client).filter(Client.id == client_id).first()
    if c: c.is_active = False; db.commit()
    return {"message": "Client deactivate ho gaya"}

# INVOICES
@router.get("/api/invoices")
def list_invoices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).limit(50).all()
    result = []
    for inv in invoices:
        c = db.query(Client).filter(Client.id == inv.client_id).first()
        result.append({"id": inv.id, "invoice_number": inv.invoice_number, "client_name": c.name if c else "Unknown", "amount": inv.amount, "total_amount": inv.total_amount, "status": inv.status, "due_date": inv.due_date.isoformat() if inv.due_date else None})
    return result

@router.post("/api/invoices/generate")
def generate_invoice(body: InvoiceBody, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Client).filter(Client.id == body.client_id).first()
    if not c: raise HTTPException(status_code=404, detail="Client nahi mila")
    gst = body.amount * 0.18
    inv = Invoice(
        invoice_number=f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M')}-{body.client_id}",
        client_id=body.client_id, amount=body.amount,
        gst_amount=gst, total_amount=body.amount + gst,
        status="pending", due_date=datetime.utcnow() + timedelta(days=body.due_days)
    )
    db.add(inv); db.commit()
    return {"invoice_number": inv.invoice_number, "total": inv.total_amount, "message": "Invoice ban gayi!"}

@router.post("/api/invoices/{invoice_id}/paid")
def mark_paid(invoice_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if inv: inv.status = "paid"; inv.paid_date = datetime.utcnow(); db.commit()
    return {"message": "Paid mark ho gaya!"}

# AGENTS MANUAL RUN
@router.post("/api/agents/run/{agent_name}")
def run_agent(agent_name: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    import random
    commodities = [
        {"commodity": "Cotton", "city": "Surat", "price": random.uniform(67000, 70000), "unit": "per candy"},
        {"commodity": "Cotton", "city": "Mumbai", "price": random.uniform(67500, 70500), "unit": "per candy"},
        {"commodity": "Yarn", "city": "Surat", "price": random.uniform(240, 250), "unit": "per kg"},
        {"commodity": "Polyester", "city": "Surat", "price": random.uniform(95, 102), "unit": "per kg"},
    ]
    if agent_name == "market":
        for item in commodities:
            mp = MarketPrice(**item, change_percent=random.uniform(-3, 3))
            db.add(mp)
        db.commit()
    log = AgentLog(agent_name=f"{agent_name.title()} Agent", action="manual_run", status="success", message=f"CEO ne manually run kiya")
    db.add(log); db.commit()
    return {"message": f"{agent_name} agent run ho gaya!"}

@router.get("/api/whatsapp/messages")
def wa_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    msgs = db.query(WhatsAppMessage).order_by(WhatsAppMessage.sent_at.desc()).limit(50).all()
    return [{"id": m.id, "from": m.from_number, "to": m.to_number, "message": m.message[:100], "direction": m.direction, "status": m.status, "sent_at": m.sent_at.isoformat()} for m in msgs]