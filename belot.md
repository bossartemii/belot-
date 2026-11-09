# Regole ufficiali — Belot moldavo / est-europeo (Bridge-Belot)

> Questo documento è la fonte normativa del motore di gioco. In caso di differenza con una regola generica del Belote, prevale questo profilo. Le regole ancora da precisare sono elencate in fondo: non vanno risolte inventando comportamenti.

## 1. Formato della partita

- 4 giocatori, in due squadre da 2 con compagni seduti uno di fronte all'altro.
- Posti in senso orario: Nord, Est, Sud, Ovest. Squadre: Nord+Sud contro Est+Ovest.
- Mazzo da 32 carte: 7, 8, 9, 10, J (Valet), Q (Damă), K (Popă), A (As) in ♣ ♦ ♥ ♠.
- Obiettivo configurabile: 501 oppure 1001 punti. La soglia deve essere scelta prima della partita.
- Otto prese per smazzata; otto carte per giocatore.
- Il mazziere ruota di un posto in senso orario dopo ogni smazzata, compresa una mano nulla.

## 2. Distribuzione e carta d'invito

1. Il mazziere distribuisce 5 carte a ciascun giocatore, in senso orario, in due blocchi: prima 3, poi 2.
2. Scopre una carta al centro: la carta d'invito (*Întoarsă*).
3. Si svolge la licitazione.
4. Dopo la scelta dell'atout, il mazziere distribuisce le restanti 3 carte a ciascun giocatore. Tutti hanno ora 8 carte.
5. La prima carta della prima presa è giocata dal giocatore alla sinistra del mazziere.

## 3. Licitazione dell'atout (*Alegerea Tromfului*)

La parola procede in senso orario, a partire dal giocatore alla sinistra del mazziere.

### Primo giro
Ogni giocatore può:
- accettare il seme della carta d'invito (*Joc* / *Iau*); oppure
- passare (*Pas*).

La prima accettazione determina il seme di atout e chiama la squadra attaccante.

### Secondo giro
Si apre soltanto se tutti e quattro hanno passato al primo giro. Ogni giocatore può chiamare uno qualsiasi degli altri tre semi come atout oppure passare.

### Mano nulla
Se tutti passano anche al secondo giro:
- la smazzata è annullata;
- le carte vengono raccolte e rimescolate;
- il mazziere passa al giocatore successivo;
- nessuna squadra registra punti.

## 4. Valori e gerarchia delle carte

| Carta | Atout: punti | Forza atout | Non-atout: punti | Forza non-atout |
|---|---:|---:|---:|---:|
| J (Valet) | 20 | 1 — più alta | 2 | 5 |
| 9 (Nouar) | 14 | 2 | 0 | 7 |
| A (As) | 11 | 3 | 11 | 1 — più alta |
| 10 | 10 | 4 | 10 | 2 |
| K (Popă) | 4 | 5 | 4 | 3 |
| Q (Damă) | 3 | 6 | 3 | 4 |
| 8 | 0 | 7 | 0 | 7 |
| 7 | 0 | 8 — più bassa | 0 | 8 — più bassa |

- Punti delle carte: 62 nell'atout + 90 nei tre semi non-atout.
- Ultima presa (*Dix de der*): +10 punti.
- Totale ordinario della smazzata: 162 punti, prima degli annunci.
- La forza delle carte serve a determinare la presa; il valore in punti serve al conteggio. Sono due concetti distinti.

## 5. Annunci (*Anunțuri*)

Gli annunci validi vengono dichiarati durante la prima presa e mostrati alla seconda.

### Sequenze dello stesso seme
L'ordine naturale per riconoscere una sequenza è: 7, 8, 9, 10, J, Q, K, A.

- Terț: 3 carte consecutive — 20 punti.
- Cincizeci: 4 carte consecutive — 50 punti.
- O sută: 5 o più carte consecutive — 100 punti.
- A parità di lunghezza prevale la sequenza con la carta terminale più alta; a ulteriore parità prevale quella di atout.

### Quartetti (*Careu*)
- Quattro J: 200 punti.
- Quattro 9: 150 punti.
- Quattro A, 10, K oppure Q: 100 punti.
- Quattro 8 o quattro 7: nessun punto.

### Quale squadra incassa gli annunci
Gli annunci ordinari delle due squadre si confrontano: soltanto la squadra con l'annuncio di grado più alto può conteggiare i propri annunci; quelli avversari vengono annullati. Il Belot/Rebelot è un'eccezione: resta sempre al giocatore che lo possiede e non viene annullato da annunci avversari.

### Belot e Rebelot
- Un giocatore che possiede K+Q di atout nella stessa mano può dichiarare Belot giocando la prima delle due carte e Rebelot giocando la seconda.
- Valore totale: 20 punti.
- È un annuncio personale e intoccabile: non viene annullato da annunci avversari superiori.

## 6. Regole obbligatorie di giocata (*Mersul Jocului*)

Per ogni carta giocata, il server deve verificare le regole nell'ordine corretto.

1. **Risposta a seme (*Culoare*):** se il giocatore possiede almeno una carta del seme aperto nella presa, deve giocare quel seme.
2. **Taglio (*Tăiere cu tromf*):** se è privo del seme aperto e la presa è momentaneamente vinta dagli avversari, deve giocare atout se ne possiede.
3. **Eccezione del compagno:** se il compagno è già padrone della presa, il giocatore senza il seme aperto non è obbligato a tagliare e può scartare una carta qualsiasi.
4. **Surtaglio (*Supra-tăiere / Urcare la tromf*):** se il giocatore è obbligato a giocare atout e sul tavolo è già presente atout, deve superare il più alto atout presente quando ne possiede uno superiore.
5. **Eccezione limitata al seme ordinario:** quando il seme di apertura non è atout e il compagno è il vincitore provvisorio, il giocatore senza il seme di apertura può scartare liberamente. L'eccezione elimina sia l'obbligo di taglio sia quello di surtaglio, anche se il compagno ha già tagliato.
6. **Apertura ad atout:** quando il seme di apertura è atout, l'eccezione del compagno non si applica. Chiunque abbia atout deve rispondere ad atout e surtagliare se possiede un atout superiore.

La verifica deve calcolare il vincitore provvisorio dell'intera presa in quel preciso momento. L'obbligo di surtaglio si applica soltanto quando il giocatore è tenuto a giocare atout.

## 7. Risultato della smazzata e punteggio

La squadra che ha scelto l'atout è l'**attaccante**; l'altra è la **difensora**. Il confronto comprende punti delle carte e annunci effettivamente validi.

### Contratto rispettato (*Joc făcut*)
Se l'attaccante realizza strettamente più punti della difensora:
- il contratto è riuscito;
- entrambe le squadre registrano i rispettivi punti realizzati;
- eventuali punti appesi da una precedente parità vengono assegnati alla squadra che ha appena realizzato il contratto.

### Contratto fallito (*În cădere / Baț*)
Se l'attaccante realizza meno punti della difensora:
- l'attaccante registra 0 punti per la smazzata;
- la difensora incassa l'intero piatto: 162 punti base più tutti gli annunci ordinari dichiarati da entrambe le squadre, compresi quelli che normalmente sarebbero stati annullati dal confronto degli annunci, e i Belot/Rebelot dichiarati.

### Parità (*Atârnat*)
Se le squadre totalizzano esattamente gli stessi punti (carte + annunci validi):
- la difensora registra subito i propri punti;
- l'attaccante registra 0 nel round;
- i punti dell'attaccante vengono aggiunti al buffer `suspended_points`.

Nella prima smazzata successiva risolta con un vincitore netto, la squadra che risolve il contratto — attaccante se lo rispetta, difensori se mandano in caduta l'attaccante — incassa i propri punti del round più l'intero buffer `suspended_points`, che viene quindi azzerato. Un altro Atârnat aggiunge i nuovi punti dell'attaccante al buffer esistente. Anche una caduta senza parità è un esito netto e risolve il buffer a favore dei difensori.

### Capot (*Valat*)
Se una squadra conquista tutte e 8 le prese, il punteggio base diventa **250 punti fissi**, in sostituzione dei 162 ordinari (i 250 includono già tutte le prese e il Dix de der). Si aggiungono gli annunci validi.

Se il capot è realizzato dagli attaccanti, il contratto è riuscito: gli attaccanti registrano 250 più i propri annunci validi e i difensori i propri eventuali Belot/Rebelot validi. Se il capot è realizzato dai difensori, si applicano contestualmente Capot e caduta: gli attaccanti registrano 0 e i difensori incassano 250 più **tutti** gli annunci dichiarati da entrambe le squadre, anche quelli ordinari normalmente annullati.

## 8. Configurazione della partita

La partita deve offrire, prima dell'avvio, la scelta fra:
- obiettivo 501 punti;
- obiettivo 1001 punti.

Il punteggio finale e la chiusura della partita devono essere calcolati dal server. Non si deve dichiarare un vincitore basandosi su valori inviati dal client.

## 9. Criteri di accettazione del motore

Prima di dichiarare il motore conforme:
- [ ] distribuzione 3+2, invito, licitazione e distribuzione finale 3;
- [ ] mano nulla e rotazione del mazziere;
- [ ] gerarchia e punti di ogni carta nei due contesti;
- [ ] obbligo di seme, taglio, eccezione del compagno e surtaglio;
- [ ] risoluzione degli annunci, inclusa priorità fra sequenze e quartetti;
- [ ] Belot/Rebelot intoccabile;
- [ ] successo, caduta, parità con punti appesi, capot;
- [ ] soglie 501 e 1001;
- [ ] test deterministici per ogni caso limite e partite complete simulate.

## 10. Decisioni normative confermate

Le cinque decisioni analitiche del proprietario sono state recepite nelle sezioni 5–7: gerarchia Careu/sequenze, eccezione del compagno limitata alle aperture non-atout, surtaglio obbligatorio su apertura ad atout, Capot difensivo con caduta e forfait di 250, buffer persistente Atârnat risolto al primo esito netto. La forza non-atout è 8 > 7 (l'8 ha forza 2 e il 7 forza 1 se la forza è espressa dal basso verso l'alto).

Non restano aperti i cinque punti precedentemente elencati. Restano da implementare e verificare nel motore tutti i criteri di accettazione della sezione 9.
