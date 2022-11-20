# Projet API

### Explication du projet
Le but de notre API consiste à développer une application mobile sur le thème du skate. Le but est de créer une sorte de réseau social de skate, où des utilisateurs peuvent se connecter pour voir une collection de spots(lieu propice à la pratique du skate) dans une zone géographique. A chacun de ces spots l'utilisateur va pouvoir poster des vidéos des tricks qu'il a effectué dessus.

Pour les skateurs, il est intéressant de savoir quels tricks ont déja été effectués sur quels spots.

### Structure
Users: 
  - firstName
  - lastName
  - userName
  - password
  
Spots:
  - name
  - description
  - category
  - geolocation
  - picture
  - rating
  
Tricks:
  - name
  - video

### Real-Time Endpoint
Pour se connecter au real-time endpoint (web socket), il est disponible à l'adresse suivante: ws://tricks-spotter-api.onrender.com
Les informations qui sont envoyées au client sont deux messages:
  - Quand un nouveau tricks est posté, un message est envoyé à tous les utilisateurs pour informer que tel utilisateur a posté un tricks. De plus les informations du tricks en question sont envoyées.
  - Quand un nouveau spot est posté, un message est envoyé à tous les utilisateurs pour les informer que le nouveau spot est posté. Les informations du spot sont également envoyées.


David, Teo, Anas
