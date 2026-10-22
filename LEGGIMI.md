# Il limoneto — installare il gioco su Android e iPhone

Un telefono installa un'app web solo se la apre da un indirizzo **https**.
Il modo più semplice e gratuito è GitHub Pages, che usi già per il gestionale.

## 1. Metti il gioco online (una volta sola)

1. Su GitHub crea un repository nuovo, per esempio `limoneto-gioco`, **Public**.
2. Estrai lo zip `app-gioco` sul computer.
3. Nel repository: **Add file → Upload files**. Trascina **tutti i file** della cartella
   (non la cartella): `index.html`, `manifest.webmanifest`, `sw.js`, le icone, `.nojekyll`.
4. **Commit changes**.
5. **Settings → Pages → Deploy from a branch → main / (root) → Save**.
6. Dopo 1–2 minuti il gioco è su `https://TUONOME.github.io/limoneto-gioco/`

In alternativa puoi caricare gli stessi file in una cartella del tuo repository
`superetnafood` (es. `superetnafood/gioco/`) e il gioco sarà su
`https://TUONOME.github.io/superetnafood/gioco/`.

## 2. Installalo sul telefono

**Android (Chrome)**
1. Apri l'indirizzo con Chrome.
2. Menu ⋮ → **Installa app** (o "Aggiungi a schermata Home").
3. Trovi l'icona Super Etna Food fra le app: si apre a schermo intero.

**iPhone e iPad (Safari)**
1. Apri l'indirizzo con **Safari** (non Chrome).
2. Tocca **Condividi** (il quadrato con la freccia) → **Aggiungi alla schermata Home** → **Aggiungi**.
3. L'icona compare nella Home: si apre senza barre del browser.

## Collegare gli accessi al foglio "Adotta un limone" (automatico)

Lo script è già compilato per il tuo foglio: legge email e password dalla scheda
**Adozioni**, e il numero e il nome della pianta dalla scheda **Alberi**.

1. Vai su https://script.google.com con l'account proprietario del foglio
   → **Nuovo progetto**. Cancella tutto e incolla `apps-script-Gioco.gs.txt`.
2. Alla riga `SEGRETO` sostituisci la frase con una tua, lunga, che non dici a nessuno.
3. Salva (icona del dischetto). In alto scegli la funzione `doPost` solo se ti chiede
   di autorizzare: non serve eseguirla.
4. **Esegui il deploy → Nuovo deployment → ingranaggio → App web**.
   Esegui come: **Me** · Chi ha accesso: **Chiunque** → **Esegui il deploy** →
   **Autorizza accesso** (scegli il tuo account → Avanzate → Vai al progetto → Consenti).
5. Copia l'**URL dell'app web** (finisce con `/exec`).
6. Apri `accesso-sito.json`, incolla l'URL tra le virgolette di `"url"` e caricalo su GitHub.

Gli adottanti entrano con **la mail del pagamento e la password della mail di benvenuto**,
le stesse dell'area riservata. I punteggi vanno nella scheda nuova **Classifica gioco**.

## Accesso degli adottanti (a mano, se non usi il foglio)

Il gioco si apre solo con nome utente e password. Sono gli stessi dati che mandi
agli adottanti via mail per l'area riservata del sito.

1. Quando mandi la mail a un nuovo adottante, apri la pagina **Accessi gioco** del progetto.
2. Scrivi nome utente, password, nome della targhetta, numero dell'albero e formula,
   poi tocca **Aggiungi adottante**.
3. Tocca **Scarica utenti-gioco.json**.
4. Nel repository GitHub del gioco: **Add file → Upload files**, trascina il file nuovo
   (stesso nome) e tocca **Commit changes**. Dopo un minuto l'adottante può entrare.

Nel file c'è un utente di prova: `prova` / `limone2026`. Toglilo prima di
pubblicare il gioco.

Nel file non c'è nessuna password in chiaro, solo un'impronta cifrata.

Chi entra trova il suo albero con l'anello e la targhetta d'oro, e riceve un bonus
una sola volta: 50 € (Vicino di casa), 150 € e la scala (Compaesano), 300 €, la scala
e la motocarriola (Di famiglia).

## Da sapere

- Si gioca meglio col telefono in **orizzontale**.
- Dopo la prima apertura con internet, il gioco funziona anche **senza campo**.
  Solo la foto dell'Etna nel pannello iniziale arriva dal sito.
- I salvataggi (soldi, piante, quaderno, classifica) restano **sul telefono**.
  Android e iPhone hanno salvataggi separati. Se disinstalli l'app o cancelli
  i dati del browser, la partita riparte da capo.
- Per aggiornare: carica il nuovo `index.html` nello stesso repository.
  Sul telefono chiudi e riapri il gioco con internet attivo.
