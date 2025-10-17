const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/securechat';
const User = require("./models/User");

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connessione a MongoDB riuscita!');
  salvaUtente();
})
.catch(err => {
  console.error('Errore di connessione:', err);
});


// Funzione per salvare un nuovo utente
async function salvaUtente() {
  try {
    const nuovoUtente = new User({
      id: 1,
      email: 'mario.rossi@example.com',
      username: 'Mario Rossi',
      password_hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
      public_key: "ladslklkjFpPFlkLLKjHLKJKakhénmMBnPKJHKbgKöJAdkéékHPppdhHdphKJADék",
      created_at: new Date("2016-05-18T16:00:00Z"),
      last_seen_at: new Date("2016-05-18T16:00:00Z"),
      is_active: false
    });

    const risultato = await nuovoUtente.save();
    console.log('Utente salvato:', risultato);
    // Chiudi la connessione dopo il salvataggio
    mongoose.connection.close();
  } catch (err) {
    console.error('Errore nel salvataggio:', err);
  }
}
