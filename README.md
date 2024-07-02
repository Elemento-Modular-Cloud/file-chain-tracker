# FCT ~ file-chain-tracker

## How to run the project

1. npx hardhat node
2. cd hardhat &&
  npx hardhat ignition deploy --network localhost ./ignition/modules/FCT.js
3. set address contract into api/index.js eg. 0x5FbDB2315678afecb367f032d93F642f64180aa3
4. cd api && nodemon
5. run cli project eg. node cli.js


## Notes

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


## TODO

- testare polygon in locale

## Q&A

- aggiornamento contratto per rimuovere i volumi piu vecchi di 1 anno e liberare risorse a livello di Smart Contract per evitare alti costi di gas fee

- serve tracciare CHI?? ha effettuato modifiche su un determinato file? eg. address del wallet che ha effettuato update

- come gestire il lock su un file o volume a livello di blockchain

- allineamento dei server di storage in P2P

