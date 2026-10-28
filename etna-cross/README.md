# Etna Cross

Gioco 3D di cross nel browser: guidi il camion futuristico VCU su un circuito di terra lavica alle pendici dell'Etna.
È una pagina statica: niente installazione e niente compilazione.

## Come si gioca

- **Guida**: frecce o WASD. **R** ti rimette in pista, **C** cambia camera, **V** avvia o ferma la ripresa cinematica. Su telefono e tablet ci sono i pulsanti a schermo.
- **Gara di 2 giri**: il cronometro parte quando passi il traguardo guidando tu. Dopo il secondo giro la gara finisce e compare il riepilogo con i tempi.
- **Moltiplicatori**: i limoni con la scritta ×1,1, ×1,25 e ×1,5 alzano il prezzo dei limoni fino a ×3. Quelli dorati sono in alto dopo i salti e si prendono solo in volo. Ricompaiono dopo 30 secondi.
- **Salti**: in volo il gas alza il muso e il freno lo abbassa. Se atterri parallelo alla discesa non perdi velocità; se atterri storto rallenti e la sospensione picchia.
- **Terreno**: in pista hai più aderenza, sulla sciara meno, nel fango pochissima. Entrando forte in curva il camion derapa.
- **Ostacoli**: muretti a secco, rocce laviche e pini sono solidi.
- **Codice per il Limoneto**: a fine gara ricevi un codice (per esempio `ETNA-50K3P7Q`) da scrivere nel gioco del Limoneto. Gelso pagherà i limoni di più alla prossima consegna. Ogni codice vale una volta sola.

Il gioco parte in ripresa cinematica: guida il pilota automatico, che non raccoglie limoni. Basta premere una freccia (o "Prendi il volante") per guidare. Con `?avvio=guida` nell'indirizzo parte subito in guida; con `?ora=tramonto` la luce è quella del tramonto.

## File

| File | Cosa contiene |
|---|---|
| `index.html` | La pagina del gioco: interfaccia, istruzioni, riepilogo di fine gara, codice |
| `js/circuito-etna.js` | Motore del circuito: terreno, tracciato, fisica, particelle, regia, post-produzione |
| `js/camion-futuristico.js` | Modello 3D procedurale del camion VCU |
| `js/three.min.js` | three.js r128 (licenza MIT) |

## Pubblicarlo con GitHub Pages

1. Crea un repository e carica questi file mantenendo la cartella `js/`.
2. Vai su **Settings → Pages**, scegli **Deploy from a branch**, branch `main`, cartella `/ (root)`.
3. Dopo un minuto il gioco è online su `https://<utente>.github.io/<repository>/`.

Per provarlo sul computer serve un piccolo server locale:

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Note tecniche

- Grafica tutta procedurale con three.js r128: terreno lavico, pista con solchi e pozze di fango, rocce, ginestre, pini, muretti a secco, l'Etna con il pennacchio.
- Fisica a misura di gioco: sospensioni a molla e smorzatore per ogni ruota e cingolo, trasferimento di carico, cerchio d'aderenza con derapata e pattinamento, salti con rotazione e controllo in volo, urti contro gli ostacoli.
- Post-produzione: motion blur ricostruito dalla profondità, grading, vignettatura, grana e bande cinema durante la ripresa.
- Le istruzioni si mostrano solo alla prima apertura (memoria del browser, chiave `etna-istruzioni-viste`).
