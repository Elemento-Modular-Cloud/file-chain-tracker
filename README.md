# ebvt ~ elemento-blockchain-volume-tracket

ID
name
location (ip address)
owner (server wallet address)
timestamp
checksum (calcolata con SHA-256(volume + timestamp))

su richiesta il server calcola il checksum del volume, univoco per ogni volume, che dimostra la proprietà di tale volume

il server espone 
  /list
    elenco dei volumi che puo fornire, call smart contract
  /mount
    funzione che permette al client di montare un volume prescelto
  /unmount
    funzione che smonta il volume dal client
    richiamo dello smart contract per aggiornare checksum del volume


se ho 3 server che espongono lo stesso volume, come faccio a sapere quale ha il volume piu aggiornato?