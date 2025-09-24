// Initialisation du jeu lorsque le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
  
    // Dictionnaire de mots
    const WORDS = [
        'MAISON', 'JARDIN', 'SOLEIL', 'VOYAGE', 'NATURE', 'CHEVAL', 'DRAGON', 'MUSIQUE',
        'PLANETE', 'OCEANE', 'ETOILE', 'MONTAGE', 'GLACIER', 'PRAIRIE', 'FORETS', 'DESERT',
        'BANANE', 'ORANGE', 'CITRON', 'POMMES', 'FRAISE', 'CERISE', 'RAISIN', 'MELON',
        'FROMAGE', 'CHOCOLAT', 'GATEAU', 'BONBON', 'BISCUIT', 'CROISSANT', 'BRIOCHE', 'MUFFIN',
        'BUREAU', 'CHAISE', 'FENETRE', 'PLAFOND', 'PORTE', 'MIROIR', 'RIDEAU', 'TAPIS',
        'AMOUR', 'AMITIE', 'JOIE', 'RIRE', 'SOURIRE', 'PAIX', 'ESPOIR', 'REVE',
        'LIVRE', 'STYLO', 'PAPIER', 'CAHIER', 'CRAYON', 'GOMME', 'REGLE', 'CISEAUX',
        'VOITURE', 'VELO', 'TRAIN', 'AVION', 'BATEAU', 'METRO', 'AUTOBUS', 'MOTO'
    ];

    // Variables du jeu
    let currentWord = '';
    let currentRow = 0;
    let currentCol = 0;
    let gameWon = false;
    let gameLost = false;
    let maxAttempts = 6;
    let attemptsLeft = maxAttempts;

    // Variables du chronomètre
    let timeLeft = 120; // 2 minutes en secondes
    let timerInterval = null;
    let gameActive = false;

    // États des lettres
    const LETTER_STATES = {
        CORRECT: 'correct',
        PRESENT: 'present',
        ABSENT: 'absent',
        EMPTY: 'empty'
    };

    // Variables musique
    let playing = false;
    


    function initGame() { // Initialisation d'une nouvelle partie
        // Choisir un mot aléatoire dans le dictionnaire
        currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        //console.log('Mot à deviner:', currentWord); 
        
        currentRow = 0;
        currentCol = 0;
        gameWon = false;
        gameLost = false;
        attemptsLeft = maxAttempts;
        gameActive = true;
        
        // Réinitialiser le chrono
        timeLeft = 120;
        updateTimerDisplay(); // Met à jour l'affichage du chrono
        startTimer(); // Démarre le chrono
        
        updateAttemptsDisplay();
        updateWordInfo(); 
        hideAlert();
        createGameBoard();
        createKeyboard();
        
        document.getElementById('guess-input').focus();
    }
    gameActive = true;
    
    // Réinitialiser le chrono
    timeLeft = 120;
    updateTimerDisplay(); // Met à jour l'affichage du chrono
    startTimer(); // Démarre le chrono
    
    updateAttemptsDisplay();
    updateWordInfo(); 
    hideAlert();
    createGameBoard();
    createKeyboard();
    
    document.getElementById('guess-input').focus();
}

function createGameBoard() { // Création du plateau de jeu
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < maxAttempts; row++) { // on crée une ligne pour chaque tentative
        const rowElement = document.createElement('div'); // on crée un élément div pour la ligne
        rowElement.className = 'word-row';
        rowElement.id = 'row-' + row; //row- est l'id de la ligne et row est le numéro de la ligne
        
        for (let col = 0; col < currentWord.length; col++) { // on crée une cellule pour chaque lettre du mot
            const cell = document.createElement('div');
            cell.className = 'letter-cell';
            cell.id = 'cell-' + row + '-' + col; //cell- est l'id de la cellule, row est le numéro de la ligne et col est le numéro de la colonne
            
            // Afficher la première lettre du mot dans la première colonne de chaque ligne
            
            if (col === 0) { // si c'est la première colonne
                cell.textContent = currentWord[0]; // afficher la première lettre du mot
                cell.classList.add('first-letter'); // ajouter une classe spéciale pour la première lettre
            }
            
            rowElement.appendChild(cell); // on ajoute la cellule à la ligne
        }
        
        gameBoard.appendChild(rowElement); // on ajoute la ligne au plateau de jeu
    }
}

function createKeyboard() { // Création du clavier virtuel
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    
    const rows = [
        ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
        ['W', 'X', 'C', 'V', 'B', 'N', '⌫']
    ];
    
    rows.forEach(row => { // cette fonction sert à créer les lignes du clavier forEach sert à itérer (iterer veut dire parcourir) sur chaque élément du tableau rows
        const rowElement = document.createElement('div');
        rowElement.className = 'keyboard-row';
        
        row.forEach(key => { // cette fonction sert à créer chaque touche du clavier
            const keyElement = document.createElement('button');
            keyElement.className = 'key';
            keyElement.textContent = key;
            keyElement.onclick = function() { handleKeyPress(key); };
            
            if (key === '⌫') { // Ajouter une classe spéciale pour la touche backspace
                keyElement.classList.add('backspace');
            }
            
            rowElement.appendChild(keyElement);
        });
        
        keyboard.appendChild(rowElement);
    });
}

function setupEventListeners() { // Configuration des écouteurs d'événements
    document.getElementById('submit-btn').addEventListener('click', submitGuess); // écouteur d'événement pour le bouton de soumission
    document.getElementById('new-game-btn').addEventListener('click', initGame); // écouteur d'événement pour le bouton de nouvelle partie
    
    // Empêcher la saisie normale dans le champ input
    const input = document.getElementById('guess-input');
    input.addEventListener('keydown', function(e) {
        e.preventDefault(); // Empêche la saisie directe dans l'input
    });
    
    // Gestionnaire unique pour le clavier physique
    document.addEventListener('keydown', function(e) {
        if (gameWon || gameLost) return;
        
        if (e.key === 'Enter') { // Soumettre le mot proposé
            e.preventDefault(); // Empêche le comportement par défaut de la touche Enter
            submitGuess(); // Appelle la fonction de soumission du mot
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            handleKeyPress('⌫');
        } else if (e.key.match(/[a-zA-Z]/)) {
            e.preventDefault();
            handleKeyPress(e.key.toUpperCase());
        }
    });
}

function handleKeyPress(key) { // Gestion des pressions sur les touches du clavier virtuel
    if (gameWon || gameLost) return;
    
    if (key === '⌫') {
        if (currentCol > 1) {
            currentCol--;
            const cell = document.getElementById('cell-' + currentRow + '-' + currentCol);
            cell.textContent = '';
            cell.classList.remove('filled');
        }
    } else if (key.match(/[A-Z]/) && currentCol < currentWord.length) {
        if (currentCol === 0) {
            currentCol = 1;
        }
        
        if (currentCol < currentWord.length) {
            const cell = document.getElementById('cell-' + currentRow + '-' + currentCol);
            cell.textContent = key;
            cell.classList.add('filled');
            currentCol++;
        }
    }
    
    updateInputField();
}

function updateInputField() { // Mise à jour du champ input avec le mot actuel
    const word = getCurrentWord();
    document.getElementById('guess-input').value = word;
}

function getCurrentWord() { // Récupération du mot actuel dans la ligne courante
    let word = currentWord[0];
    
    for (let col = 1; col < currentWord.length; col++) {
        const cell = document.getElementById('cell-' + currentRow + '-' + col);
        word += cell.textContent || '';
    }
    
    return word;
}

function submitGuess() { // Soumission du mot proposé
    if (gameWon || gameLost) return;
    
    const guess = getCurrentWord();
    
    if (guess.length !== currentWord.length) { // Vérification de la longueur du mot proposé
        showAlert('Le mot doit faire ' + currentWord.length + ' lettres !', 'error');
        return;
    }
    
    if (!isValidWord(guess)) { // Vérification si le mot proposé est dans le dictionnaire
        showAlert('Ce mot n\'existe pas dans notre dictionnaire !', 'error');
        return;
    }
    
    analyzeGuess(guess);
    
    if (guess === currentWord) {
        gameWon = true;
        stopTimer();
        showAlert('🎉 Félicitations ! Vous avez trouvé le mot !', 'success');
        updateKeyboardFromGuess(guess, getLetterStates(guess));
        return;
    }
    
    currentRow++;
    currentCol = 0;
    attemptsLeft--;
    updateAttemptsDisplay();
    
    if (currentRow >= maxAttempts) {
        gameLost = true;
        stopTimer();
        showAlert('😞 Dommage ! Le mot était : ' + currentWord, 'error');
        return;
    }
    
    document.getElementById('guess-input').focus();
}

function isValidWord(word) {
    return word.length === currentWord.length && word.match(/^[A-Z]+$/);
}

function analyzeGuess(guess) { // Analyse du mot proposé et mise à jour de l'affichage
    const states = getLetterStates(guess); // obtient les états des lettres (correct, présent, absent)

    // Animation de retournement des cellules
    for (let i = 0; i < guess.length; i++) { // on parcourt chaque lettre du mot proposé
        const cell = document.getElementById('cell-' + currentRow + '-' + i); 
        cell.classList.add(states[i]); 
        
        setTimeout(function() { 
            cell.classList.add('flip');
        }, i * 100);
    }
    
    updateKeyboardFromGuess(guess, states); // mise à jour du clavier virtuel
}

function getLetterStates(guess) { // Obtention des états des lettres pour le mot proposé
    const states = new Array(guess.length);
    const wordLetters = currentWord.split('');
    const guessLetters = guess.split('');
    
    for (let i = 0; i < guess.length; i++) { // première passe pour les lettres correctes
        if (guessLetters[i] === wordLetters[i]) {
            states[i] = LETTER_STATES.CORRECT;
            wordLetters[i] = null;
            guessLetters[i] = null;
        }
    }
    
    for (let i = 0; i < guess.length; i++) { // deuxième passe pour les lettres présentes et absentes
        if (guessLetters[i] !== null) {
            const letterIndex = wordLetters.indexOf(guessLetters[i]);
            if (letterIndex !== -1) {
                states[i] = LETTER_STATES.PRESENT;
                wordLetters[letterIndex] = null;
            } else {
                states[i] = LETTER_STATES.ABSENT;
            }
        }
    }
    
    return states;
}

function updateKeyboardFromGuess(guess, states) { // Mise à jour du clavier virtuel en fonction du mot proposé
    for (let i = 0; i < guess.length; i++) { // on parcourt chaque lettre du mot proposé
        const letter = guess[i]; // on récupère la lettre à la position i
        const state = states[i]; // on récupère l'état de la lettre à la position i
        
        const keyElement = Array.from(document.querySelectorAll('.key')) // on transforme la NodeList en tableau pour pouvoir utiliser find
            .find(function(key) { return key.textContent === letter; }); // on cherche la touche correspondant à la lettre
        
        if (keyElement) { // si la touche existe
            const currentClass = keyElement.className; // on récupère la classe actuelle de la touche
            if (!currentClass.includes('correct') || state === LETTER_STATES.CORRECT) { // si la touche n'est pas déjà marquée comme correcte ou si l'état est correct
                keyElement.classList.remove('correct', 'present', 'absent'); // on enlève les classes d'état
                keyElement.classList.add(state); // on ajoute la nouvelle classe d'état
            }
        }
    }
}

function updateAttemptsDisplay() { // Mise à jour de l'affichage des tentatives restantes
    document.getElementById('attempts-count').textContent = attemptsLeft; // on met à jour le texte avec le nombre de tentatives restantes
}

function updateWordInfo() {
    document.getElementById('word-length-display').textContent = currentWord.length;
    document.getElementById('first-letter-display').textContent = currentWord[0];
}

function showAlert(message, type) { // Affichage d'une alerte
    const alert = document.getElementById('alert'); // on récupère l'élément d'alerte
    alert.textContent = message; // on met à jour le texte de l'alerte
    alert.className = 'alert ' + type; // on met à jour la classe de l'alerte pour le style (success ou error)
    alert.classList.remove('hidden'); // on enlève la classe hidden pour afficher l'alerte
    
    if (type === 'error') { // si c'est une erreur, on cache l'alerte après 3 secondes
        setTimeout(function() { 
            hideAlert();
        }, 3000); // 3000 ms = 3 secondes
    }
}

function hideAlert() {
    const alert = document.getElementById('alert');
    alert.classList.add('hidden');
}

// Fonctions du chronomètre
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(function() {
        if (!gameActive) {
            clearInterval(timerInterval);
            return;
        }
        
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() { // Mise à jour de l'affichage du chronomètre
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    document.getElementById('timer').textContent = display;
    
    // Changer la couleur si le temps devient critique
    const timerElement = document.getElementById('timer');
    if (timeLeft <= 30) {
        timerElement.classList.add('critical');
    } else if (timeLeft <= 60) {
        timerElement.classList.add('warning');
    } else {
        timerElement.classList.remove('critical', 'warning');
    }
}

function timeUp() { // Gestion du temps écoulé
    gameActive = false;
    gameLost = true;
    clearInterval(timerInterval);
    showAlert('⏰ Temps écoulé ! Le mot était : ' + currentWord, 'error');
}

function stopTimer() { // Arrêt du chronomètre
    gameActive = false;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

// Partie musique
    const music = document.getElementById("motusMusic");
    const musicBtn = document.getElementById("musicBtn");
    let playing = false;

    if (musicBtn && music) {
        musicBtn.addEventListener("click", () => {
            if (!playing) {
                music.play().catch(error => {
                    console.log("Erreur lors de la lecture de la musique:", error);
                    alert("Impossible de lire la musique. Vérifiez que le fichier audio existe.");
                });
                playing = true;
                musicBtn.textContent = "🔇 Désactiver la musique";
                musicBtn.classList.add("off");
            } else {
                music.pause();
                playing = false;
                musicBtn.textContent = "🎵 Activer la musique";
                musicBtn.classList.remove("off");
            }
        });
    }