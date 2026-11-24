(function(){
const MESI=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
const M=(v,t)=>({v,t});
const MISSIONI={
  concime:{titolo:'Concimare',verbo:'concimare',strumento:'sacco',obiettivo:'Concima tutte le piante',azione:'Concima',
    intro:'Spargi il concime in cerchio sotto la chioma di ogni pianta. Ogni sacco basta per cinque piante.',
    mesi:[M('no','A gennaio la pianta riposa e la pioggia lava via il concime prima che le radici riescano a prenderlo.'),
      M('si','Fine inverno: la pianta si risveglia e prepara i fiori. È il momento della prima concimazione.'),
      M('si','Marzo è perfetto: le radici ripartono e il concime nutre la fioritura di primavera.'),
      M('quasi','Si può ancora, ma sei in ritardo: la fioritura è già partita.'),
      M('si','Seconda concimazione: aiuta i limoncini appena nati a crescere.'),
      M('si','Ultima dose prima del caldo forte, con l\'acqua che non manca.'),
      M('no','Con il caldo di luglio il concime senz\'acqua brucia le radici.'),
      M('secca','Solo dopo la secca: quando torna l\'acqua, il concime spinge i fiori del verdello. Senza secca è troppo caldo.'),
      M('quasi','Si può, ma è meglio aspettare le prime piogge d\'autunno.'),
      M('quasi','Una piccola dose d\'autunno va bene, senza esagerare.'),
      M('no','Arriva il freddo: l\'azoto fa spuntare getti teneri che il gelo rovina.'),
      M('no','La pianta è a riposo: il concime andrebbe sprecato.')]},
  potatura:{titolo:'Potare/trattamenti',verbo:'potare',strumento:'forbici',obiettivo:'Pota le piante',azione:'Pota',
    intro:'Taglia i succhioni (i rami dritti verso il cielo) e i rami secchi. Non tagliare le branche, i rami grossi che reggono la pianta.',
    mesi:[M('no','Fa freddo: i tagli guariscono male e il mal secco entra dalle ferite.'),
      M('quasi','Si può cominciare se non gela più, ma è ancora presto.'),
      M('si','Il freddo è passato: la potatura principale si fa adesso.'),
      M('si','Ottimo momento: via succhioni e rami secchi prima della fioritura piena.'),
      M('si','Va ancora bene, subito dopo la raccolta dei bianchetti.'),
      M('quasi','Solo i succhioni: niente tagli grossi con il caldo.'),
      M('no','Con il sole di luglio il legno appena tagliato si scotta.'),
      M('no','Ad agosto il legno scoperto si scotta e la pianta soffre.'),
      M('quasi','Una pulizia leggera dei succhioni si può fare.'),
      M('no','Stai raccogliendo il primofiore: tagliando toglieresti i frutti.'),
      M('no','Arriva il freddo: le ferite non si chiudono.'),
      M('no','Pieno inverno: i tagli fanno entrare le malattie.')]},
  raccolta:{titolo:'Raccogliere',verbo:'raccogliere',strumento:'cesta',obiettivo:'Raccogli i limoni maturi e portali al camion di Gelso',azione:'Raccogli',
    intro:'Tocca solo i limoni maturi, lascia sull\'albero quelli piccoli e verde scuro. Porta le cassette al camion di Gelso per venderle.',
    mesi:[M('quasi','I limoni invernali sono ancora indietro: pochi sono pronti.'),
      M('si','Tempo di bianchetti: limoni chiari, raccolti dopo l\'inverno.'),
      M('si','Bianchetti: limoni chiari e succosi.'),
      M('si','Bianchetti: ultimi limoni della fioritura di primavera.'),
      M('si','Coda dei bianchetti, prima dell\'estate.'),
      M('secca','Verdello: limoni d\'estate, verdi fuori e pieni di succo. Nascono solo se l\'anno prima hai fatto la secca.'),
      M('secca','Verdello: il limone d\'estate, pagato di più. Ci sono solo se hai fatto la secca.'),
      M('secca','Verdello: il limone d\'estate. Ci sono solo se hai fatto la secca.'),
      M('secca','Ultimi verdelli dell\'estate, solo dopo la secca.'),
      M('si','Primofiore: i primi limoni della fioritura di primavera, i più belli.'),
      M('si','Primofiore: piena raccolta.'),
      M('si','Primofiore: ultimi limoni dell\'anno.')]},
  erba:{titolo:'Tagliare l\'erba',verbo:'tagliare l\'erba',strumento:'decespugliatore',obiettivo:'Taglia l\'erba sotto le piante',azione:'Taglia',
    intro:'Cammina con il decespugliatore acceso sopra l\'erba alta. Se la lasci crescere, ruba acqua e azoto ai limoni.',
    mesi:[M('si','D\'inverno l\'erba cresce poco, ma toglie luce ai frutti bassi.'),
      M('si','Prima del risveglio: un taglio prepara il terreno al concime.'),
      M('si','In primavera l\'erba corre e beve l\'acqua delle piante: tagliala.'),
      M('si','L\'erba è alta e assetata: è il momento giusto.'),
      M('si','Ultimo taglio prima del secco: meno erba, meno sete per i limoni.'),
      M('si','Erba secca: tagliarla riduce il rischio di incendio.'),
      M('si','Erba secca: tagliarla riduce il rischio di incendio.'),
      M('si','Erba secca: tienila bassa contro gli incendi.'),
      M('si','Prepara il terreno alle prime piogge.'),
      M('si','Dopo le prime piogge ricresce: un taglio tiene pulito sotto le chiome.'),
      M('si','Un taglio prima dell\'inverno rende comoda la raccolta.'),
      M('si','D\'inverno l\'erba cresce poco: un passaggio veloce basta.')]},
  irrigazione:{titolo:'Concimare e irrigare',verbo:'concimare e irrigare',strumento:'tubo',obiettivo:'Dai concime e acqua a tutte le piante',azione:'Concima e irriga',
    intro:'Per ogni pianta: zappa la conca intorno al tronco, guarda le foglie e dai la dose giusta di concime, poi riempi la conca d\'acqua senza farla traboccare. Il concime lo compri nello Shop, l\'acqua viene dal pozzo.',
    mesi:[M('no','A gennaio la pianta riposa e piove: concime e acqua andrebbero sprecati e le radici marciscono.'),
      M('quasi','Fine inverno: la pianta si risveglia e vuole il primo concime, ma l\'acqua la dà ancora la pioggia.'),
      M('si','Marzo è perfetto: le radici ripartono, concime e un po\' d\'acqua nutrono la fioritura.'),
      M('si','Fioritura di primavera: concime e acqua aiutano i fiori a diventare limoni.'),
      M('si','I limoncini appena nati crescono: concime e acqua regolari.'),
      M('si','Ultima dose forte di concime prima del caldo, con l\'acqua che non deve mancare.'),
      M('si','Piena estate: concime e acqua insieme, oppure fai la secca per avere il verdello.'),
      M('si','Agosto è il mese più assetato. Dopo la secca, concime e acqua spingono i fiori del verdello.'),
      M('si','Fa ancora caldo: continua con concime e acqua.'),
      M('quasi','Arrivano le prime piogge: basta una piccola dose, con poca acqua.'),
      M('no','Arriva il freddo e piove: il concime fa spuntare getti teneri che il gelo rovina.'),
      M('no','Pieno inverno: le piante non bevono e non mangiano.')]}
};
const FINESTRA=m=>m>=5&&m<=8?'verdello':(m>=9?'primofiore':'bianchetto');
const NOME_FIN={verdello:'Verdello',primofiore:'Primofiore',bianchetto:'Bianchetto'};
const PREZZO_BASE={verdello:0.72,primofiore:0.46,bianchetto:0.34};
const BOTTEGA=[
  {id:'concime',nome:'Sacco di concime organico',nota:'25 kg, basta per 5 piante',prezzo:22,tipo:'scorta'},
  {id:'olio',nome:'Olio bianco',nota:'Contro la cocciniglia, basta per 4 piante',prezzo:12,tipo:'scorta'},
  {id:'collRosso',nome:'Collare rosso per Limo',nota:'Rosso come un pomodoro di Pachino',prezzo:40,tipo:'limo',slot:'collare',val:'rosso'},
  {id:'collBlu',nome:'Collare blu per Limo',nota:'Blu come il mare di Acitrezza',prezzo:40,tipo:'limo',slot:'collare',val:'blu'},
  {id:'bandana',nome:'Bandana gialla per Limo',nota:'Gialla come un limone maturo',prezzo:60,tipo:'limo',slot:'collare',val:'bandana'},
  {id:'paglia',nome:'Cappello di paglia per Limo',nota:'Per il sole d\'agosto',prezzo:80,tipo:'limo',slot:'cappello',val:'paglia'},
  {id:'coppola',nome:'Coppola siciliana per Limo',nota:'Elegante come un vero contadino',prezzo:100,tipo:'limo',slot:'cappello',val:'coppola'},
  {id:'troncarami',nome:'Troncarami',nota:'Taglia i rami secchi grossi',prezzo:40,tipo:'attrezzo'},
  {id:'scala',nome:'Scala da frutteto',nota:'Arrivi ai succhioni e ai limoni in alto',prezzo:60,tipo:'attrezzo'},
  {id:'spandiconcime',nome:'Spandiconcime',nota:'Concimi il doppio più in fretta',prezzo:50,tipo:'attrezzo'},
  {id:'decesp',nome:'Decespugliatore professionale',nota:'Taglia una striscia larga il doppio',prezzo:120,tipo:'attrezzo'},
  {id:'carriola',nome:'Motocarriola',nota:'Porti 15 cassette invece di 6',prezzo:90,tipo:'attrezzo'},
  {id:'fertirrigazione',nome:'Impianto di fertirrigazione',nota:'Gocciolatori a ogni pianta: acqua e concime arrivano da soli, non serve più concimare e irrigare. Funziona col pozzo sistemato.',prezzo:2000,tipo:'attrezzo'},
  {id:'trattore',nome:'Trattore da frutteto',nota:'Vai quasi al doppio della velocità. Gli attrezzi si comprano a parte: li trovi accanto allo Shop e li agganci col trattore. Il gasolio costa 6 dobloni a giornata.',prezzo:1000,tipo:'attrezzo'},
  {id:'trTrincia',nome:'Trinciaerba per il trattore',nota:'Tagli l\'erba con una striscia larghissima',prezzo:500,tipo:'attrezzo',richiede:'trattore'},
  {id:'trSpandi',nome:'Spandiconcime per il trattore',nota:'Concimi tre volte più in fretta',prezzo:500,tipo:'attrezzo',richiede:'trattore'},
  {id:'trBotte',nome:'Botte per il trattore',nota:'Zappi e riempi le conche quasi al doppio',prezzo:500,tipo:'attrezzo',richiede:'trattore'},
  {id:'trCarrello',nome:'Carrello per il trattore',nota:'Porti 30 cassette alla volta',prezzo:500,tipo:'attrezzo',richiede:'trattore'},
  {id:'trPiattaforma',nome:'Piattaforma per il trattore',nota:'Arrivi ai rami e ai limoni in alto senza scala',prezzo:500,tipo:'attrezzo',richiede:'trattore'},
];
function rnd(){ return Math.random(); }
// imprevisti del giorno, in base al mese (0-11) e alla missione
function eventi(m, tipo, st){
  const E=[], p=x=>rnd()<x;
  const inverno=m<=2||m>=10, estate=m>=5&&m<=8, prim=m>=2&&m<=4;
  if(inverno&&p(0.45)) E.push({id:'pioggia',titolo:'Piove',t:'Il terreno è bagnato: si cammina più piano. La pioggia riempie un po\' il pozzo.'});
  else if(estate&&p(0.4)) E.push({id:'scirocco',titolo:'Scirocco',t:'Vento caldo dall\'Africa: le piante perdono acqua in fretta.'});
  else if((prim||m===9||m===10)&&p(0.3)) E.push({id:'grandine',titolo:'Grandinata',t:'Stanotte è grandinato: alcuni limoni sono ammaccati e valgono meno.'});
  if(estate&&p(0.35)) E.push({id:'siccita',titolo:'Siccità',t:'Non piove da settimane: il pozzo è più basso e le piante hanno sete.'});
  if(m>=4&&m<=8&&p(0.35)) E.push({id:'cocciniglia',titolo:'Cocciniglia',t:'Piccoli insetti bianchi sulle foglie di alcune piante. Avvicinati e trattale con l\'olio bianco.'});
  if((m<=2||m>=10)&&p(0.3)) E.push({id:'malsecco',titolo:'Mal secco',t:'Un fungo fa seccare un ramo su alcune piante. Va tagliato con la potatura.'});
  if(tipo==='raccolta'){ const d=Math.round((rnd()-0.45)*30); if(Math.abs(d)>=8) E.push({id:'prezzo',delta:d,titolo:d>0?'Gelso paga di più':'Gelso paga di meno',t:d>0?`Oggi al mercato i limoni mancano: Gelso alza il prezzo del ${d}%.`:`Oggi al mercato ci sono troppi limoni: Gelso abbassa il prezzo del ${-d}%.`}); }
  if(st&&st.quaderno&&st.quaderno.length&&p(0.22)) E.push({id:'ispezione',titolo:'Controllo del quaderno',t:'Arriva un ispettore: vuole vedere se hai scritto sul quaderno di campagna tutti i concimi e i trattamenti.'});
  return E;
}
const QUIZ=[
  {d:'Cosa si usa contro la cocciniglia?',o:['L\'olio bianco','Lo zucchero','L\'acqua salata'],x:'L\'olio bianco copre gli insetti e li fa staccare dalle foglie.'},
  {d:'Le foglie sono gialle e pallide. Quanto concime serve?',o:['Dose piena','Niente concime','Mezza dose'],x:'Foglie pallide vuol dire che la pianta ha fame: dose piena.'},
  {d:'Cosa va scritto sul quaderno di campagna?',o:['Concimi e trattamenti','I compiti di scuola','I nomi dei vicini'],x:'Ogni concime e ogni trattamento va scritto e firmato.'},
  {d:'Cos\'è un succhione?',o:['Un ramo dritto e verde chiaro che va verso il cielo','Un insetto che succhia la linfa','Un limone ancora acerbo'],x:'I succhioni rubano forza alla pianta: con la potatura si tagliano.'},
  {d:'Perché si taglia l\'erba sotto i limoni?',o:['Perché ruba acqua e concime ai limoni','Per farla ricrescere più blu','Perché a Limo non piace'],x:'L\'erba alta beve l\'acqua e mangia il concime dei limoni. E d\'estate può prendere fuoco.'},
  {d:'Quale limone si raccoglie d\'estate?',o:['Il verdello','Il bianchetto','Il primofiore'],x:'Il verdello arriva d\'estate, dopo la secca. È verde fuori e si paga di più.'},
  {d:'Cosa fa il mal secco?',o:['Fa seccare i rami','Fa crescere limoni giganti','Colora le foglie di blu'],x:'È un fungo: il ramo malato va tagliato.'},
  {d:'Fino a dove si riempie la conca d\'acqua?',o:['Fino alla fascia verde','Finché trabocca','Basta una goccia'],x:'Se trabocca, l\'acqua si spreca. Fermati nella fascia verde.'},
  {d:'Cos\'è la secca?',o:['Un periodo senz\'acqua che fa rifiorire la pianta','Un ramo morto','Un vento caldo'],x:'Dopo la secca la pianta si spaventa, rifiorisce e fa il verdello.'},
  {d:'Cosa protegge i limoni dalla grandine?',o:['Le reti','L\'ombrello di Limo','Il trattore'],x:'Le reti fanno rimbalzare i chicchi di ghiaccio.'}];
const CRESCITA_ERBA=[0.08,0.12,0.35,0.35,0.2,0.05,0.03,0.03,0.12,0.25,0.2,0.1];
window.REGOLE={MESI,MISSIONI,FINESTRA,NOME_FIN,PREZZO_BASE,BOTTEGA,eventi,CRESCITA_ERBA,QUIZ};
})();
