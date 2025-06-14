 /**********************************************************
     * CONFIGURAZIONE DEL BOARD – Griglia 15×15, cella 40×40
     **********************************************************/
    const canvas = document.getElementById("boardCanvas");
    const ctx = canvas.getContext("2d");
    const cellSize = 40; // ogni cella 40×40 px

    // Definizione dei colori per le pedine
    const playerColors = {
      red: "#e74c3c",
      blue: "#3498db",
      yellow: "#f1c40f",
      green: "#2ecc71"
    };

    // Ordine fisso dei giocatori
    const playerOrder = ["red", "blue", "yellow", "green"];

    // Coordinate delle aree base (le "caselle casa") su griglia (ciascuna area in una mini-griglia 2×2)
    const basePositions = {
      red: [ {row:2, col:2}, {row:2, col:4}, {row:4, col:2}, {row:4, col:4} ],
      blue: [ {row:2, col:10}, {row:2, col:12}, {row:4, col:10}, {row:4, col:12} ],
      yellow: [ {row:10, col:2}, {row:10, col:4}, {row:12, col:2}, {row:12, col:4} ],
      green: [ {row:10, col:10}, {row:10, col:12}, {row:12, col:10}, {row:12, col:12} ]
    };

    // Mappa del percorso comune: 52 caselle in coordinate della griglia
    const pathCoordinates = [
      {r:6,  c:0}, {r:6,  c:1}, {r:6,  c:2}, {r:6,  c:3}, {r:6,  c:4}, {r:6,  c:5},
      {r:5,  c:6}, {r:4,  c:6}, {r:3,  c:6}, {r:2,  c:6}, {r:1,  c:6}, {r:0,  c:6},
      {r:0,  c:7}, {r:0,  c:8}, {r:1,  c:8}, {r:2,  c:8}, {r:3,  c:8}, {r:4,  c:8},
      {r:5,  c:8}, {r:6,  c:9}, {r:6,  c:10}, {r:6,  c:11}, {r:6,  c:12}, {r:6,  c:13},
      {r:6,  c:14}, {r:7,  c:14}, {r:8,  c:14}, {r:8,  c:13}, {r:8,  c:12}, {r:8,  c:11},
      {r:8,  c:10}, {r:8,  c:9}, {r:9,  c:8}, {r:10, c:8}, {r:11, c:8}, {r:12, c:8},
      {r:13, c:8}, {r:14, c:8}, {r:14, c:7}, {r:14, c:6}, {r:13, c:6}, {r:12, c:6},
      {r:11, c:6}, {r:10, c:6}, {r:9,  c:6}, {r:8,  c:5}, {r:8,  c:4}, {r:8,  c:3},
      {r:8,  c:2}, {r:8,  c:1}, {r:8,  c:0}, {r:7,  c:0}
    ];

    // Start per ciascun giocatore: dove il gettone entra sul percorso
    const startIndexes = {
      red: 0,      // Red parte da (6,0)
      blue: 13,    // Blue parte da (0,8)
      yellow: 26,  // Yellow parte da (8,14)
      green: 39    // Green parte da (14,6)
    };

    // Finishing lanes: 6 caselle per ciascun colore che conducono al centro (cella (7,7))
    const finishingLanes = {
      red:    [ {r:7, c:1}, {r:7, c:2}, {r:7, c:3}, {r:7, c:4}, {r:7, c:5}, {r:7, c:6} ],
      blue:   [ {r:1, c:7}, {r:2, c:7}, {r:3, c:7}, {r:4, c:7}, {r:5, c:7}, {r:6, c:7} ],
      yellow: [ {r:7, c:13}, {r:7, c:12}, {r:7, c:11}, {r:7, c:10}, {r:7, c:9}, {r:7, c:8} ],
      green:  [ {r:13, c:7}, {r:12, c:7}, {r:11, c:7}, {r:10, c:7}, {r:9, c:7}, {r:8, c:7} ]
    };

    /**********************************************************
     * STATO DEL GIOCO – GLOBAL GAME OBJECT
     **********************************************************/
    let game = {
      players: [],         // array dei giocatori
      currentTurn: 0,      // indice del giocatore corrente
      dice: 0,             // ultimo risultato del dado
      diceRolled: false,   // flag se il dado è stato tirato
      awaitingMove: false, // flag per attendere la scelta del gettone (per umani)
      gameStarted: false,
      running: false       // blocca gli input durante l'animazione
    };
    // Ogni giocatore sarà strutturato come:
    // { id, name, color, type ("human" o "bot"), startIndex, base (array di 4 coordinate), tokens: [ {progress: -1} o valore da 0 a 57 ] }

    /**********************************************************
     * VARIABILE PER TIMEOUT DEL TURNO UMANO (15 sec)
     **********************************************************/
    let humanMoveTimeout = null;

    /**********************************************************
     * SETUP DELLA PARTITA – SCHERMATA DI CONFIGURAZIONE
     **********************************************************/
    const setupScreen = document.getElementById("setupScreen");
    const setupForm = document.getElementById("setupForm");
    const playerSettingsDiv = document.getElementById("playerSettings");
    const gameScreen = document.getElementById("gameScreen");

    document.getElementById("numPlayers").addEventListener("change", function(){
      let num = parseInt(this.value);
      playerSettingsDiv.innerHTML = "";
      for(let i = 0; i < num; i++){
        let color = playerOrder[i];
        let div = document.createElement("div");
        div.className = "mb-3";
        div.innerHTML = `<label class="form-label">Giocatore ${i+1} (${color.toUpperCase()})</label>
              <select class="form-select playerType" required>
                <option value="human">Human</option>
                <option value="bot">Bot</option>
              </select>`;
        playerSettingsDiv.appendChild(div);
      }
    });

    setupForm.addEventListener("submit", function(e){
      e.preventDefault();
      const numPlayers = parseInt(document.getElementById("numPlayers").value);
      const playerTypes = document.querySelectorAll(".playerType");
      game.players = [];
      for(let i = 0; i < numPlayers; i++){
        let type = playerTypes[i].value;
        let color = playerOrder[i];
        game.players.push({
          id: i,
          name: "Giocatore " + (i+1),
          color: color,
          type: type,
          startIndex: startIndexes[color],
          base: basePositions[color],
          tokens: [ {progress:-1}, {progress:-1}, {progress:-1}, {progress:-1} ]
        });
      }
      game.gameStarted = true;
      setupScreen.style.display = "none";
      gameScreen.style.display = "block";
      updateTurnDisplay();
      addMessage("Partita avviata!");
      // Se il primo giocatore è Bot, avvia il turno Bot
      if(currentPlayer().type === "bot"){
        setTimeout(botTurn, 1000);
      }
      drawGame();
    });

    function currentPlayer(){
      return game.players[game.currentTurn];
    }

    function updateTurnDisplay(){
      document.getElementById("turnIndicator").textContent =
         "Turno: " + currentPlayer().name + " (" + currentPlayer().type + ")";
    }

    function addMessage(msg){
      const mp = document.getElementById("messagePanel");
      mp.innerHTML += `<div>${msg}</div>`;
      mp.scrollTop = mp.scrollHeight;
    }

    /**********************************************************
     * DADI E MOVIMENTO DEI GETTONI
     **********************************************************/
    const rollDiceBtn = document.getElementById("rollDiceBtn");
    const diceResultEl = document.getElementById("diceResult");
    const nextTurnBtn = document.getElementById("nextTurnBtn");

    function rollDice(){
      let value = Math.floor(Math.random() * 6) + 1;
      game.dice = value;
      game.diceRolled = true;
      diceResultEl.textContent = "Dado: " + value;
      addMessage("È uscito " + value + "!");
    }

    // Ritorna un array degli indici dei gettoni che possono muovere
    function validTokens(player){
      let valid = [];
      player.tokens.forEach((token, idx) => {
        if(token.progress === -1 && game.dice === 6) valid.push(idx);
        else if(token.progress >= 0 && token.progress < 57 && token.progress + game.dice <= 57) valid.push(idx);
      });
      return valid;
    }

    rollDiceBtn.addEventListener("click", function(){
      // Per giocatori umani, se non è già stato tirato il dado e se il gioco non è in animazione
      if(!game.diceRolled && currentPlayer().type === "human" && !game.running){
        rollDice();
        let moves = validTokens(currentPlayer());
        if(moves.length === 0){
          diceResultEl.textContent += " - Nessuna mossa possibile.";
          addMessage("Turno saltato: nessuna mossa possibile.");
          setTimeout(endTurn, 1500);
        } else {
          game.awaitingMove = true;
          addMessage("Scegli un gettone per muoverlo.");
          // Se il giocatore non muove entro 15 secondi, salta il turno
          humanMoveTimeout = setTimeout(() => {
            if(game.awaitingMove && currentPlayer().type === "human"){
              addMessage("Tempo scaduto, turno saltato.");
              endTurn();
            }
          }, 15000);
        }
      }
    });

    // Funzione per muovere il gettone selezionato; uso del flag game.running per bloccare input multipli
    function moveToken(player, tokenIndex){
      if(game.running) return;
      game.running = true;
      // Se il gettone è in base ed il dado è 6
      let token = player.tokens[tokenIndex];
      if(token.progress === -1 && game.dice === 6){
        token.progress = 0;
        addMessage(player.name + " esce dalla base.");
      } else {
        token.progress += game.dice;
        addMessage(player.name + " muove il gettone " + (tokenIndex+1) + " di " + game.dice + " caselle.");
      }
      // Se è sul percorso comune, verifica se atterra sopra un avversario (e non è in casella sicura)
      if(token.progress >= 0 && token.progress < 52){
        let pos = getMainTrackCoord(player, token.progress);
        game.players.forEach(p => {
          if(p.id !== player.id){
            p.tokens.forEach(t => {
              if(t.progress >= 0 && t.progress < 52){
                let oppPos = getMainTrackCoord(p, t.progress);
                if(oppPos.r === pos.r && oppPos.c === pos.c && !isSafeCell((p.startIndex + t.progress) % 52)){
                  t.progress = -1;
                  addMessage(player.name + " cattura un gettone di " + p.name + "!");
                }
              }
            });
          }
        });
      }

      // Se era turno extra (dado 6), mantiene lo stesso giocatore, altrimenti passa turno
      game.awaitingMove = false;
      if(currentPlayer().type === "human") {
        clearTimeout(humanMoveTimeout);
      }
      if(game.dice !== 6){
        nextTurn();
      } else {
        // Turno extra: reset dice per permettere un nuovo tiro
        game.diceRolled = false;
        diceResultEl.textContent = "Dado: (6) - Turno extra.";
        addMessage(player.name + " ha ottenuto un turno extra.");
        // Se il giocatore è Bot, lancia automaticamente
        if(player.type === "bot"){
          setTimeout(botTurn, 1000);
        }
      }
      game.running = false;
      checkVictory(player);
    }

    function endTurn(){
      game.diceRolled = false;
      nextTurn();
    }

    function nextTurn(){
      game.currentTurn = (game.currentTurn + 1) % game.players.length;
      game.dice = 0;
      diceResultEl.textContent = "";
      updateTurnDisplay();
      addMessage("Ora tocca a " + currentPlayer().name + ".");
      if(currentPlayer().type === "bot"){
        setTimeout(botTurn, 1000);
      }
    }

    /**********************************************************
     * TURNO DEL BOT – GESTIONE AUTOMATICA
     **********************************************************/
    function botTurn(){
      if(currentPlayer().type !== "bot") return;
      console.log("BotTurn per:", currentPlayer().name);
      if(!game.diceRolled){
        rollDice();
        setTimeout(botTurn, 600);
        return;
      }
      let moves = validTokens(currentPlayer());
      if(moves.length === 0){
        diceResultEl.textContent += " - Nessuna mossa possibile.";
        addMessage(currentPlayer().name + " (Bot) non ha mosse possibili.");
        setTimeout(endTurn, 1500);
        return;
      }
      let choice = moves[Math.floor(Math.random() * moves.length)];
      setTimeout(() => {
        moveToken(currentPlayer(), choice);
        drawGame();
        // Se il dado era 6 per il Bot, continua automaticamente
        if(currentPlayer().type === "bot" && game.diceRolled){
          setTimeout(botTurn, 1000);
        }
      }, 1000);
    }

    // Le caselle sicure sono quelle con indici 0, 13, 26, 39 sul percorso comune
    function isSafeCell(index){
      return [0, 13, 26, 39].includes(index);
    }

    /**********************************************************
     * CALCOLO DELLE COORDINATE PER IL DISEGNO DEL BOARD
     **********************************************************/
    // Converte coordinate di griglia {r, c} al centro della cella (in pixel)
    function gridToPixel(coord){
      return {
        x: coord.c * cellSize + cellSize/2,
        y: coord.r * cellSize + cellSize/2
      };
    }
    // Per un gettone sul percorso comune: la cella da usare è pathCoordinates[(player.startIndex + token.progress) mod 52]
    function getMainTrackCoord(player, progress){
      let idx = (player.startIndex + progress) % 52;
      return { r: pathCoordinates[idx].r, c: pathCoordinates[idx].c };
    }
    // Per i token nelle finishing lanes (progress da 52 a 56)
    function getFinishingCoord(player, progress){
      let lane = finishingLanes[player.color];
      return lane[progress - 52];
    }
    // Se progress è 57, la posizione è il centro (cella (7,7))
    function getFinishedCoord(){
      return { r: 7, c: 7 };
    }

    /**********************************************************
     * DISEGNO DEL TABELLONE
     **********************************************************/
    function drawBoard(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Griglia 15x15
      for(let i = 0; i <= 15; i++){
        // Linee orizzontali
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.strokeStyle = "#bbb";
        ctx.stroke();
        // Linee verticali
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.strokeStyle = "#bbb";
        ctx.stroke();
      }
      // Colori delle aree base
      // Rosso – in alto a sinistra
      ctx.fillStyle = "#ffcccc";
      ctx.fillRect(0, 0, cellSize * 6, cellSize * 6);
      // Blu – in alto a destra
      ctx.fillStyle = "#ccccff";
      ctx.fillRect(cellSize * 9, 0, cellSize * 6, cellSize * 6);
      // Giallo – in basso a sinistra
      ctx.fillStyle = "#ffffcc";
      ctx.fillRect(0, cellSize * 9, cellSize * 6, cellSize * 6);
      // Verde – in basso a destra
      ctx.fillStyle = "#ccffcc";
      ctx.fillRect(cellSize * 9, cellSize * 9, cellSize * 6, cellSize * 6);
      // Centro – area finale: celle centrali da 6 a 8
      ctx.fillStyle = "#eee";
      ctx.fillRect(cellSize * 6, cellSize * 6, cellSize * 3, cellSize * 3);

      // Disegna il percorso comune
      for(let i = 0; i < pathCoordinates.length; i++){
        let cell = pathCoordinates[i];
        let x = cell.c * cellSize;
        let y = cell.r * cellSize;
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = "#333";
        ctx.strokeRect(x, y, cellSize, cellSize);
        if(isSafeCell(i)){
          let center = { x: x + cellSize/2, y: y + cellSize/2 };
          ctx.beginPath();
          ctx.arc(center.x, center.y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = "#fff200";
          ctx.fill();
          ctx.strokeStyle = "#333";
          ctx.stroke();
        }
      }

      // Disegna le finishing lanes per ciascun giocatore
      // Rosso: finishing lane lungo la fila 7, colonne 1..6
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
      finishingLanes.red.forEach(cell => {
        ctx.fillRect(cell.c * cellSize, cell.r * cellSize, cellSize, cellSize);
        ctx.strokeRect(cell.c * cellSize, cell.r * cellSize, cellSize, cellSize);
      });
      // Blu: finishing lane lungo la colonna 7, righe 1..6
      ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
      finishingLanes.blue.forEach(cell => {
        ctx.fillRect(cell.c * cellSize, cell.r * cellSize, cellSize, cellSize);
        ctx.strokeRect(cell.c * cellSize, cell.r * cellSize, cellSize, cellSize);
      });
      // Giallo: finishing lane lungo la fila 7, colonne 8..13
      ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
      finishingLanes.yellow.forEach(cell => {
        ctx.fillRect(cell.c * cellSize, cell.r * cellSize, cellSize, cellSize);
        ctx.strokeRect(cell.c * cellSize, cell.r * cellSize, cellSize, cellSize);
      });
      // Verde: finishing lane lungo la colonna 7, righe 8..13
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
      finishingLanes.green.forEach(cell => {
        ctx.fillRect(cell.c * cellSize, cell.r * cellSize, cellSize, cellSize);
        ctx.strokeRect(cell.c * cellSize, cell.r * cellSize, cellSize, cellSize);
      });
    }

    /**********************************************************
     * DISEGNO DEI GETTONI
     **********************************************************/
    function drawTokens(){
      game.players.forEach(player => {
        player.tokens.forEach((token, idx) => {
          let pos;
          if(token.progress === -1){
            pos = gridToPixel( basePositions[player.color][idx] );
          } else if(token.progress >= 0 && token.progress < 52){
            pos = gridToPixel( getMainTrackCoord(player, token.progress) );
          } else if(token.progress >= 52 && token.progress < 57){
            pos = gridToPixel( getFinishingCoord(player, token.progress) );
          } else if(token.progress === 57){
            pos = gridToPixel({r:7, c:7});
          }
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
          ctx.fillStyle = playerColors[player.color];
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.stroke();
          // Evidenzia il gettone se è muovibile (solo per giocatori umani)
          if(player.id === currentPlayer().id && game.awaitingMove && validTokens(player).includes(idx)){
            ctx.save();
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 18, 0, 2 * Math.PI);
            ctx.strokeStyle = "gold";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();
          }
          // Disegna il numero identificativo sul gettone
          ctx.fillStyle = "#fff";
          ctx.font = "bold 12px Roboto";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(idx+1, pos.x, pos.y);
        });
      });
    }

    function drawGame(){
      drawBoard();
      drawTokens();
    }

    /**********************************************************
     * CICLO DI DISEGNO (GAME LOOP)
     **********************************************************/
    function gameLoop(){
      drawGame();
      requestAnimationFrame(gameLoop);
    }
    gameLoop();

    /**********************************************************
     * INTERAZIONE SUL CANVAS PER I GIOCATORI UMANI
     **********************************************************/
    canvas.addEventListener("click", function(e){
      if(!game.awaitingMove || currentPlayer().type !== "human") return;
      let rect = canvas.getBoundingClientRect();
      let clickX = e.clientX - rect.left;
      let clickY = e.clientY - rect.top;
      validTokens(currentPlayer()).forEach(idx => {
        let token = currentPlayer().tokens[idx];
        let pos;
        if(token.progress === -1) pos = gridToPixel( basePositions[currentPlayer().color][idx] );
        else if(token.progress >= 0 && token.progress < 52) pos = gridToPixel( getMainTrackCoord(currentPlayer(), token.progress) );
        else if(token.progress >= 52 && token.progress < 57) pos = gridToPixel( getFinishingCoord(currentPlayer(), token.progress) );
        else if(token.progress === 57) pos = gridToPixel({r:7, c:7});
        let dx = clickX - pos.x;
        let dy = clickY - pos.y;
        if(Math.sqrt(dx*dx + dy*dy) < 20){
          moveToken(currentPlayer(), idx);
          drawGame();
        }
      });
    });

    /**********************************************************
     * MODALI: ISTRUZIONI E VITTORIA
     **********************************************************/
    const instructionsBtn = document.getElementById("instructionsBtn");
    const rulesModal = new bootstrap.Modal(document.getElementById("rulesModal"));
    const winModal = new bootstrap.Modal(document.getElementById("winModal"));
    instructionsBtn.addEventListener("click", function(){
      rulesModal.show();
    });
    function checkVictory(player){
      let finished = player.tokens.filter(t => t.progress === 57).length;
      if(finished === 4){
        winModal.show();
        addMessage(player.name + " ha vinto la partita!");
      }
    }

    /**********************************************************
     * PULSANTE "PASSA TURNO"
     **********************************************************/
    document.getElementById("nextTurnBtn").addEventListener("click", function(){
      endTurn();
    });
    function endTurn(){
      game.diceRolled = false;
      nextTurn();
    }
    function nextTurn(){
      game.currentTurn = (game.currentTurn + 1) % game.players.length;
      game.dice = 0;
      diceResultEl.textContent = "";
      updateTurnDisplay();
      addMessage("Ora tocca a " + currentPlayer().name + ".");
      if(currentPlayer().type === "bot"){
        setTimeout(botTurn, 1000);
      }
    }

    /**********************************************************
     * TURNO DEL BOT – GESTIONE AUTOMATICA
     **********************************************************/
    function botTurn(){
      if(currentPlayer().type !== "bot") return;
      console.log("BotTurn per:", currentPlayer().name);
      if(!game.diceRolled){
        rollDice();
        setTimeout(botTurn, 600);
        return;
      }
      let moves = validTokens(currentPlayer());
      if(moves.length === 0){
        diceResultEl.textContent += " - Nessuna mossa possibile.";
        addMessage(currentPlayer().name + " (Bot) non ha mosse possibili.");
        setTimeout(endTurn, 1500);
        return;
      }
      let choice = moves[Math.floor(Math.random() * moves.length)];
      setTimeout(() => {
        moveToken(currentPlayer(), choice);
        drawGame();
        if(currentPlayer().type === "bot" && game.diceRolled){
          setTimeout(botTurn, 1000);
        }
      }, 1000);
    }
    
    /**********************************************************
     * BONUS: Timeout per il turno dei giocatori umani (15 sec)
     **********************************************************/
    // Se il giocatore umano non muove entro 15 secondi, il turno viene saltato.
    function setHumanTimeout(){
      if(currentPlayer().type === "human"){
        humanMoveTimeout = setTimeout(() => {
          if(game.awaitingMove && currentPlayer().type === "human"){
            addMessage("Tempo scaduto, turno saltato.");
            endTurn();
          }
        },15000);
      }
    }

    // Richiama setHumanTimeout ogni volta che un giocatore umano inizia il turno (in rollDiceBtn)
    rollDiceBtn.addEventListener("click", function(){
      // Se è il turno di un giocatore umano, dopo aver tirato il dado, se ci sono mosse possibili, impostiamo il timeout
      if(currentPlayer().type === "human" && game.diceRolled){
        let moves = validTokens(currentPlayer());
        if(moves.length > 0){
          game.awaitingMove = true;
          setHumanTimeout();
        }
      }
    });

    /**********************************************************
     * CICLO DI DISEGNO (GAME LOOP)
     **********************************************************/
    function gameLoop(){
      drawGame();
      requestAnimationFrame(gameLoop);
    }
    gameLoop();
