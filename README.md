# 🔐 Secure Chat App

Una semplice applicazione di chat **sicura** sviluppata con **Node.js**, che include autenticazione degli utenti tramite **JWT (JSON Web Tokens)**.

## 🚀 Funzionalità

- Registrazione e login utenti con gestione sicura delle credenziali  
- Autenticazione tramite token JWT  
- Comunicazione real-time tra utenti (es. con Socket.IO)  
- Protezione delle rotte con middleware di autenticazione  
- Struttura modulare e scalabile  

## 🛠️ Stack Tecnologico

- **Backend**: Node.js, Express  
- **Autenticazione**: JWT, bcrypt  
- **Realtime**: Socket.IO (opzionale)  
- **Database**: MongoDB / PostgreSQL / altro (modifica in base al tuo progetto)  

## 📦 Installazione

    git clone https://github.com/Morolukas/SecureChat.git
    cd SecureChat
    npm install

Crea un file `.env` nella root del progetto con queste variabili:

    PORT=3000
    JWT_SECRET=laTuaChiaveSegreta
    DB_URL=mongodb://localhost:27017/chatapp

## ▶️ Avvio

    npm start

Server disponibile su [http://localhost:3000](http://localhost:3000)

## 📄 API Endpoints

### 🔐 Autenticazione

- `POST /api/auth/register` – Registra un nuovo utente  
- `POST /api/auth/login` – Login e ricezione del token JWT  

### 💬 Chat

- `GET /api/messages` – Recupera i messaggi (protetto da JWT)  
- `POST /api/messages` – Invia un nuovo messaggio (protetto da JWT)  

*(Aggiungi qui le rotte effettive del tuo progetto)*

## 🧪 Test

    npm test

## 🔒 Sicurezza

- Le password degli utenti sono hashate con **bcrypt**  
- Le rotte protette richiedono un **token JWT** valido nell'`Authorization` header  
- È possibile implementare HTTPS per una maggiore sicurezza  

## 📁 Struttura del Progetto

    secure-chat-app/
    │
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── utils/
    ├── server.js
    └── .env

## 📌 TODO

- Aggiungere frontend (es. React o Vue)  
- Implementare cifratura end-to-end nei messaggi  
- Supporto per chat di gruppo  

## 📜 Licenza

Questo progetto è distribuito sotto licenza MIT.

---

> Creato con ❤️ e Node.js
