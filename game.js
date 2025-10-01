// Initialisation du jeu lorsque le DOM est prêt
document.addEventListener('DOMContentLoaded', function () {

    // Dictionnaire de mots
    const WORDS = [
        'MAISON', 'JARDIN', 'SOLEIL', 'VOYAGE', 'NATURE', 'CHEVAL', 'DRAGON', 'MUSIQUE',
        'PLANETE', 'OCEAN', 'ETOILE', 'MONTAGE', 'GLACIER', 'PRAIRIE', 'FORETS', 'DESERT',
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
    const LETTER_STATES = { // Constantes pour les états des lettres
        CORRECT: 'correct', // lettre bien placée
        PRESENT: 'present', // lettre présente mais mal placée
        ABSENT: 'absent', // lettre absente
        EMPTY: 'empty' // case vide
    };

    // Variables musique
    let playing = false;

    // Variables sons du jeu
    const winSound = new Audio('motusWin.mp3'); // son pour la win
    const errorSound = new Audio('motusError.mp3'); // son pour l'erreur
    const loseSound = new Audio('motusLose.mp3'); // son pour la défaite

    function initGame() { // Initialisation d'une nouvelle partie
        // Choisir un mot aléatoire dans le dictionnaire WORDS prealablement défini en haut du fichier
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

        updateAttemptsDisplay(); // Met à jour l'affichage des tentatives restantes
        updateWordInfo(); // Met à jour les infos du mot (longueur et première lettre)
        hideAlert(); // Cacher les alertes lorsqu'elles ne sont pas nécessaires
        createGameBoard(); // Création du plateau de jeu
        createKeyboard(); // Création du clavier virtuel
        resetScore(); // AJOUTÉ : Remise à zéro du score

        document.getElementById('guess-input').focus(); // Met le focus sur le champ input (c'est les border blue autour du champ)
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
                cell.id = 'cell-' + row + '-' + col; //cell- est l'id de la cellule, row est le numéro de la ligne et col est le numéro de la colonne en gros ca donne une "adresse postale" unique à chaque case du plateau genre cell-0-0 = ligne 0, colonne 0 (première case)

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

        // ici on va utiliser forEach pour eviter de creer le clavier en dur dans le html

        rows.forEach(row => { // cette fonction va créer les touches du clavier en créant une div pour chaque ligne
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';

            row.forEach(key => { // cette fonction va créer chaque touche du clavier en créant un bouton pour chaque touche
                const keyElement = document.createElement('button');
                keyElement.className = 'key';
                keyElement.textContent = key;
                keyElement.onclick = function () { handleKeyPress(key); };

                if (key === '⌫') { // Ajouter une classe spéciale pour la touche backspace
                    keyElement.classList.add('backspace'); // on ajoute une classe spéciale pour la touche backspace pour pouvoir la styliser différemment dans le css
                    keyElement.setAttribute('aria-label', 'Effacer'); // Pour les lecteurs d'écran
                    keyElement.setAttribute('title', 'Effacer'); // Tooltip au survol ( un tooltip c'est un petit texte qui s'affiche quand on passe la souris sur un élément )
                }

                rowElement.appendChild(keyElement); // on ajoute la touche à la ligne
            });

            keyboard.appendChild(rowElement); // on ajoute la ligne au clavier
        });
    }

    function setupEventListeners() { // écouteurs d'événements
        document.getElementById('submit-btn').addEventListener('click', submitGuess); // écouteur d'événement pour le bouton de soumission
        document.getElementById('new-game-btn').addEventListener('click', initGame); // écouteur d'événement pour le bouton de nouvelle partie

        // Événements pour la popup des statistiques
        document.getElementById('statsBtn').addEventListener('click', showStats);
        document.getElementById('close-stats-btn').addEventListener('click', hideStats);
        document.getElementById('stats-popup').addEventListener('click', function(e) {
            if (e.target === this) {
                hideStats();
            }
        });

        // Empêcher la saisie normale dans le champ input
        const input = document.getElementById('guess-input');
        input.addEventListener('keydown', function (e) {
            e.preventDefault(); // Empêche la saisie directe dans l'input
        });

        // écouteur pour le clavier physique
        document.addEventListener('keydown', function (e) {
            if (gameWon || gameLost) return;

            if (e.key === 'Enter') { // Soumettre le mot proposé
                e.preventDefault(); // Empêche le comportement par défaut de la touche Enter
                submitGuess(); // Appelle la fonction de soumission du mot
            } else if (e.key === 'Backspace') { // Si la touche est backspace
                e.preventDefault(); // Empêche la saisie directe dans l'input
                handleKeyPress('⌫'); // Appelle la fonction de gestion de la touche backspace
            } else if (e.key.match(/[a-zA-Z]/)) { // Si la touche est une lettre de l'alphabet
                e.preventDefault(); // Empêche la saisie directe dans l'input
                handleKeyPress(e.key.toUpperCase()); // Convertit la lettre en majuscule avant de la traiter
            }
        });
    }

    function handleKeyPress(key) { // pressions sur les touches du clavier virtuel
        if (gameWon || gameLost) return;

        if (key === '⌫') { // si la touche est backspace
            if (currentCol > 1) { // on ne peut pas effacer la première lettre
                currentCol--; // on recule d'une colonne dans la ligne
                const cell = document.getElementById('cell-' + currentRow + '-' + currentCol); // on récupère la cellule correspondante
                cell.textContent = ''; // on efface le contenu de la cellule
                cell.classList.remove('filled'); // on enlève la classe remplie (filled) pour que la cellule redevienne vide
            }
        } else if (key.match(/[A-Z]/) && currentCol < currentWord.length) { // si la touche est une lettre et qu'on n'a pas encore rempli toute la ligne
            if (currentCol === 0) { // on ne peut pas écrire dans la première colonne
                currentCol = 1; // on commence à écrire à partir de la deuxième colonne
            }

            if (currentCol < currentWord.length) { // on vérifie encore une fois qu'on n'a pas dépassé la longueur du mot
                const cell = document.getElementById('cell-' + currentRow + '-' + currentCol); // on récupère la cellule correspondante
                cell.textContent = key; // on met la lettre dans la cellule
                cell.classList.add('filled'); // on ajoute la classe filled pour indiquer que la cellule est remplie
                currentCol++; // on avance d'une colonne dans la ligne
            }
        }

        updateInputField(); // Mise à jour du champ de l'input avec le mot actuel
    }

    function updateInputField() { // Mise à jour du champ input avec le mot actuel
        const word = getCurrentWord(); // Récupération du mot actuel dans la ligne
        document.getElementById('guess-input').value = word; // on met à jour la valeur de l'input avec le mot actuel
    }

    function getCurrentWord() { // Récupération du mot actuel dans la ligne 
        let word = currentWord[0]; // la première lettre est toujours affichée

        for (let col = 1; col < currentWord.length; col++) { // on parcourt chaque colonne à partir de la deuxième 
            const cell = document.getElementById('cell-' + currentRow + '-' + col); // on récupère la cellule correspondante
            word += cell.textContent || ''; // on ajoute le contenu de la cellule au mot (ou une chaîne vide si la cellule est vide)
        }

        return word; // on retourne le mot actuel
    }

    function submitGuess() { // Soumission du mot proposé
        if (gameWon || gameLost) return;

        const guess = getCurrentWord();

        if (guess.length !== currentWord.length) { // Vérification de la longueur du mot proposé
            // joue le son d'erreur
            errorSound.play();
            showAlert('Le mot doit faire ' + currentWord.length + ' lettres !', 'error');
            return;
        }

        if (!isValidWord(guess)) { // Vérification si le mot proposé est dans le dictionnaire
            // Joue le son d'erreur
            errorSound.play();
            showAlert('Ce mot n\'existe pas dans notre dictionnaire !', 'error');
            return;
        }

        analyzeGuess(guess); // Analyse du mot proposé et mise à jour de l'affichage

        // Vérification si le mot proposé est correct

        if (guess === currentWord) { // si le mot proposé est correct
            gameWon = true;
            stopTimer();
            handleVictory(); // AJOUTÉ : Calcul et affichage des points
            updateKeyboardFromGuess(guess, getLetterStates(guess)); // Mise à jour du clavier virtuel pour marquer toutes les lettres comme correctes
            return; // on arrête la fonction ici
        }

        // joue le son d'erreur si le mot n'est pas correct
        errorSound.play();

        currentRow++; // on passe à la ligne suivante
        currentCol = 0; // on remet la colonne à 0 pour la nouvelle ligne
        attemptsLeft--; // on décrémente le nombre de tentatives restantes donc -1 au compteur des attempts
        updateAttemptsDisplay(); // Met à jour l'affichage des tentatives restantes

        if (currentRow >= maxAttempts) { // si on a utilisé toutes les tentatives
            gameLost = true; // on a perdu
            stopTimer();
            
            // joue le son de défaite
            loseSound.play();
            
            // Réinitialiser le streak car le joueur a perdu
            const lostStreak = currentStreak; // Sauvegarder le streak perdu pour l'afficher
            resetStreak();
            
            // Enregistrer les statistiques de la partie perdue
            const attemptsUsed = maxAttempts;
            saveGameToHistory(false, attemptsUsed, currentWord, 0, timeLeft);
            updateGlobalStats(false, attemptsUsed);
            
            let loseMessage = '😞 Dommage ! Le mot était : ' + currentWord;
            if (lostStreak > 0) {
                loseMessage += '\n💔 Série de ' + lostStreak + ' victoires perdue...';
            }
            
            showAlert(loseMessage, 'error');
            return;
        }

        document.getElementById('guess-input').focus(); // Remet le focus sur le champ input après la soumission
    }

    function isValidWord(word) { // Vérification si le mot proposé est dans le dictionnaire
        return word.length === currentWord.length && word.match(/^[A-Z]+$/); // regex pour vérifier que le mot ne contient que des lettres majuscules
    }

    function analyzeGuess(guess) { // Analyse du mot proposé et mise à jour de l'affichage
        const states = getLetterStates(guess); // obtient les états des lettres (correct, présent, absent)

        // Animation de retournement des cellules
        for (let i = 0; i < guess.length; i++) { // on parcourt chaque lettre du mot proposé
            const cell = document.getElementById('cell-' + currentRow + '-' + i); // on récupère la cellule correspondante
            cell.classList.add(states[i]); // on ajoute la classe correspondant à l'état de la lettre (correct, present, absent)

            setTimeout(function () { // setTimeout créé un délai entre chaque lettre avant d'exécuter la fonction
                cell.classList.add('flip');
            }, i * 100); //délai de 100ms entre chaque lettre pour l'effet de flip
        }

        updateKeyboardFromGuess(guess, states); // mise à jour du clavier virtuel
    }

    function getLetterStates(guess) { // Obtention des états des lettres pour le mot proposé
        const states = new Array(guess.length);
        const wordLetters = currentWord.split('');
        const guessLetters = guess.split('');

        for (let i = 0; i < guess.length; i++) { // première étape pour les lettres correctes
            if (guessLetters[i] === wordLetters[i]) {
                states[i] = LETTER_STATES.CORRECT;
                wordLetters[i] = null;
                guessLetters[i] = null;
            }
        }

        for (let i = 0; i < guess.length; i++) { // deuxième étape pour les lettres présentes et absentes
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
                .find(function (key) { return key.textContent === letter; }); // on cherche la touche correspondant à la lettre

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
            setTimeout(function () {
                hideAlert();
            }, 3000); // 3000 ms = 3 secondes
        }
    }

    function hideAlert() {
        const alert = document.getElementById('alert');
        alert.classList.add('hidden');
    }

    // Fonctions du chronomètre
    function startTimer() { // Démarrage du chronomètre
        if (timerInterval) { // Si un intervalle existe déjà,
            clearInterval(timerInterval); // on le nettoie
        }

        timerInterval = setInterval(function () { // on crée un intervalle qui s'exécute toutes les secondes
            if (!gameActive) { // Si le jeu n'est plus actif, on arrête le chrono
                clearInterval(timerInterval); // on nettoie l'intervalle donc on arrête le chrono
                return; // on sort de la fonction
            }

            timeLeft--; // on décrémente le temps restant
            updateTimerDisplay(); // on met à jour l'affichage du chrono

            if (timeLeft <= 0) { // si le temps est écoulé
                timeUp(); // on appelle la fonction de gestion du temps écoulé
            }
        }, 1000); // 1000 ms = 1 seconde 
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
        
        // Jouer le son de défaite
        loseSound.play();
        
        // Réinitialiser le streak car le joueur a perdu
        const lostStreak = currentStreak; // Sauvegarder le streak perdu pour l'afficher
        resetStreak();
        
        // Enregistrer les statistiques de la partie perdue par temps
        const attemptsUsed = currentRow;
        saveGameToHistory(false, attemptsUsed, currentWord, 0, 0);
        updateGlobalStats(false, attemptsUsed);
        
        let timeUpMessage = '⏰ Temps écoulé ! Le mot était : ' + currentWord;
        if (lostStreak > 0) {
            timeUpMessage += '\n💔 Série de ' + lostStreak + ' victoires perdue...';
        }
        
        showAlert(timeUpMessage, 'error');
    }

    function stopTimer() { // Arrêt du chronomètre
        gameActive = false;
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    }

    // Gestion de la musique
    function initMusic() { // Initialisation de la musique
        const music = document.getElementById("motusMusic"); // on récupère l'élément audio
        const musicBtn = document.getElementById("musicBtn"); // on récupère le bouton de musique

        if (musicBtn && music) { // Si les éléments existent
            musicBtn.addEventListener("click", function () { // écouteur d'événement pour le bouton de musique
                if (!playing) { // si la musique n'est pas en train de jouer
                    music.play(); // on lance la musique
                    playing = true; // on met à jour l'état
                    musicBtn.textContent = "🔇 Désactiver la musique";
                    musicBtn.classList.add("off");
                } else { // si la musique est en train de jouer
                    music.pause(); // on met en pause la musique
                    playing = false; // on met à jour l'état
                    musicBtn.textContent = "🎵 Activer la musique";
                    musicBtn.classList.remove("off");
                }
            });
        }
    }

    // Gestion des règles audio
    function initRulesAudio() {
        const rulesAudio = document.getElementById("rulesAudio");
        const rulesBtn = document.getElementById("rulesBtn");
        let rulesPlaying = false;

        if (rulesBtn && rulesAudio) { // Si les éléments existent
            rulesBtn.addEventListener("click", function () { 
                if (!rulesPlaying) { // si l'audio n'est pas en train de jouer
                    rulesAudio.play(); // on lance l'audio
                    rulesPlaying = true; // on met à jour l'état
                    rulesBtn.textContent = "⏹️ Arrêter les règles"; // on change le texte du bouton
                } else { // si l'audio est en train de jouer
                    rulesAudio.pause(); // on met en pause l'audio
                    rulesAudio.currentTime = 0; // on remet l'audio au début
                    rulesPlaying = false; // on met à jour l'état
                    rulesBtn.textContent = "🔊​ Règles du jeu"; 
                }
            });

            // Quand l'audio se termine
            rulesAudio.addEventListener('ended', function() {
                rulesPlaying = false;
                rulesBtn.textContent = "🔊​ Règles du jeu";
            });
        }
    }
    // Système de points

// Variables de score (à ajouter aux autres variables du jeu)
let playerScore = 0; // score actuel du joueur
let bestScore = parseInt(localStorage.getItem('motus-best-score') || '0'); // meilleur score stocké dans le localStorage

// Variables pour les statistiques et l'historique
let gameHistory = JSON.parse(localStorage.getItem('motus-game-history') || '[]'); // tableau pour l'historique des parties en json pour le localStorage
let totalGames = parseInt(localStorage.getItem('motus-total-games') || '0'); // nombre total de parties jouées
let gamesWon = parseInt(localStorage.getItem('motus-games-won') || '0'); // nombre de parties gagnées
let totalAttempts = parseInt(localStorage.getItem('motus-total-attempts') || '0'); // nombre total de tentatives utilisées

// Variables pour le système de streak
let currentStreak = parseInt(localStorage.getItem('motus-current-streak') || '0'); // série de victoires actuelle
let bestStreak = parseInt(localStorage.getItem('motus-best-streak') || '0'); // meilleure série de victoires

// initialisation du système de points
function initScoreSystem() {
    updateScoreDisplay();
    loadBestScore();
    loadStreak(); // Charger le streak au démarrage
}

// calcul des points
function calculateScore() {
    let points = 0;
    
    // Points de base pour la victoire
    points += 1000;
    
    // Bonus selon le nombre de tentatives restantes
    points += attemptsLeft * 150; // 150 points par tentative restante
    
    // Bonus temps restant
    points += timeLeft * 3; // 3 points par seconde restante
    
    // Bonus selon la longueur du mot
    points += currentWord.length * 75; // 75 points par lettre
    
    // Bonus spécial si trouvé du premier coup
    if (currentRow === 0) {
        points += 500; // Bonus "fatalityyyyy"
    }
    
    // Bonus de streak
    points += getStreakBonus();
    
    return Math.max(points, 0); // retirer les scores négatifs (bugs parfois)
}

// mise à jour de l'affichage des scores
function updateScoreDisplay() { // Met à jour l'affichage du score et du meilleur score
    const scoreElement = document.getElementById('score-display');
    const bestScoreElement = document.getElementById('best-score-display');
    
    if (scoreElement) { 
        scoreElement.textContent = playerScore;
    }
    if (bestScoreElement) {
        bestScoreElement.textContent = bestScore;
    }
}

// sauvegarde du meilleur score dans le localStorage
function saveBestScore() { // sauvegarde le meilleur score dans le localStorage
    if (playerScore > bestScore) {
        bestScore = playerScore;
        localStorage.setItem('motus-best-score', bestScore.toString());
        return true; // Nouveau record
    }
    return false; // Pas de nouveau record
}

// chargement du meilleur score
function loadBestScore() { // Charger le meilleur score depuis le localStorage comme dans la todolist
    bestScore = parseInt(localStorage.getItem('motus-best-score') || '0');
    updateScoreDisplay();
}

// quand le joueur gagne (à mettre dans submitGuess)
function handleVictory() {
   
    
    // Jouer le son de victoire
    winSound.play();
    
    // Incrémenter le streak AVANT de calculer le score (pour que le bonus soit appliqué)
    const isNewStreakRecord = incrementStreak();
    
    playerScore = calculateScore();
    updateScoreDisplay();
    updateStreakDisplay(); // Mise à jour de l'affichage du streak
    
    const isNewRecord = saveBestScore();
    
    // enregistre les stats de la partie gagnée
    const attemptsUsed = maxAttempts - attemptsLeft + 1;
    saveGameToHistory(true, attemptsUsed, currentWord, playerScore, timeLeft);
    updateGlobalStats(true, attemptsUsed);
    
    let message = '🎉 Félicitations ! Score: ' + playerScore + ' points !';
    
    // Afficher le streak actuel
    if (currentStreak > 1) {
        message += '\n🔥 Série de ' + currentStreak + ' victoires !';
        const streakBonus = getStreakBonus();
        if (streakBonus > 0) {
            message += ' (+' + streakBonus + ' points bonus)';
        }
    }
    
    if (isNewStreakRecord) {
        message += '\n� NOUVEAU RECORD DE SÉRIE !';
    }
    
    if (isNewRecord) {
        message += '\n🏆 NOUVEAU RECORD DE SCORE !';
    }
    
    showAlert(message, 'success');
}

// remise à zéro du score (à appeler dans initGame)
function resetScore() {
    playerScore = 0;
    updateScoreDisplay();
}

 //  SYSTÈME DE STREAK 

 // Charger le streak depuis localStorage
 function loadStreak() {
    currentStreak = parseInt(localStorage.getItem('motus-current-streak') || '0');
    bestStreak = parseInt(localStorage.getItem('motus-best-streak') || '0');
    updateStreakDisplay();
 }

 // Incrémenter le streak (appelé quand le joueur gagne)
 function incrementStreak() {
    currentStreak++;
    localStorage.setItem('motus-current-streak', currentStreak.toString());
    
    // Vérifier si c'est un nouveau record de streak
    if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
        localStorage.setItem('motus-best-streak', bestStreak.toString());
        return true; // Nouveau record de streak
    }
    return false; // Pas de nouveau record
 }

 // Réinitialiser le streak (appelé quand le joueur perd)
 function resetStreak() {
    currentStreak = 0;
    localStorage.setItem('motus-current-streak', '0');
    updateStreakDisplay();
 }

 // Calculer le bonus de points selon le streak
 function getStreakBonus() {
    if (currentStreak === 0) return 0; // Pas de bonus pour la première victoire
    
    // Bonus progressif : 100 points de base + 50 points par victoire dans le streak
    return 100 + (currentStreak * 50);
 }

 // Mettre à jour l'affichage du streak
 function updateStreakDisplay() {
    const currentStreakElement = document.getElementById('current-streak-display');
    const bestStreakElement = document.getElementById('best-streak-display');
    
    if (currentStreakElement) {
        currentStreakElement.textContent = currentStreak;
    }
    if (bestStreakElement) {
        bestStreakElement.textContent = bestStreak;
    }
 }

 //  SYSTÈME DE STATISTIQUES 

 // Initialisation du système de statistiques
 function initStatsSystem() {
    loadStats();
    updateStatsDisplay();
 }

 // Enregistrer une partie dans l'historique
 function saveGameToHistory(won, attempts, word, score, timeUsed) {
    const gameData = {
        date: new Date().toLocaleString('fr-FR'), // date et heure en france de la partie
        won: won, // si la partie a été gagnée
        attempts: attempts, // nombre de tentatives utilisées
        word: word, // mot à deviner
        score: score, // score obtenu
        timeUsed: 120 - timeUsed, // temps utilisé en secondes
        timestamp: Date.now() // permet de classer les parties par ordre chronologique dans le temps
    }; 
    
    gameHistory.unshift(gameData); // Ajouter au début du tableau contrairement` à push qui ajoute à la fin
    
    // Garder seulement les 50 dernières parties dans le localStorage
    if (gameHistory.length > 50) {
        gameHistory = gameHistory.slice(0, 50);
    }
    
    localStorage.setItem('motus-game-history', JSON.stringify(gameHistory));
 }

 // Mettre à jour les statistiques globales
 function updateGlobalStats(won, attempts) {
    totalGames++;
    if (won) {
        gamesWon++;
    }
    totalAttempts += attempts;
    
    localStorage.setItem('motus-total-games', totalGames.toString());
    localStorage.setItem('motus-games-won', gamesWon.toString());
    localStorage.setItem('motus-total-attempts', totalAttempts.toString());
 }

 // Charger les statistiques depuis localStorage
 function loadStats() {
    gameHistory = JSON.parse(localStorage.getItem('motus-game-history') || '[]');
    totalGames = parseInt(localStorage.getItem('motus-total-games') || '0');
    gamesWon = parseInt(localStorage.getItem('motus-games-won') || '0');
    totalAttempts = parseInt(localStorage.getItem('motus-total-attempts') || '0');
 }

 // Calculer les statistiques
 function calculateStats() {
    const winRate = totalGames > 0 ? ((gamesWon / totalGames) * 100) : 0; // pourcentage de victoires
    const avgAttempts = totalGames > 0 ? (totalAttempts / totalGames) : 0; // moyenne de tentatives par partie
    
    return {
        totalGames: totalGames, // nombre total de parties jouées
        gamesWon: gamesWon, // nombre de parties gagnées
        winRate: winRate.toFixed(1), // taux de victoire en pourcentage avec une seule décimale pour plus de lisibilité (xp useeeeeer)
        avgAttempts: avgAttempts.toFixed(1) // moyenne de tentatives avec une seule décimale pour plus de lisibilité (xp useeeeeer)
    };
 }

 // Afficher les statistiques
 function showStats() {
    const stats = calculateStats();
    
    // Mettre à jour les statistiques dans le DOM
    document.getElementById('total-games').textContent = stats.totalGames; // nombre total de parties jouées
    document.getElementById('games-won').textContent = stats.gamesWon; // nombre de parties gagnées
    document.getElementById('win-rate').textContent = stats.winRate; // taux de victoire en pourcentage
    document.getElementById('avg-attempts').textContent = stats.avgAttempts; // moyenne de tentatives par partie
    
    // Mettre à jour l'historique
    const historyContainer = document.getElementById('game-history'); // conteneur de l'historique des parties
    
    if (gameHistory.length === 0) { // si aucune partie n'a été jouée
        historyContainer.innerHTML = '<p id="no-games">Aucune partie jouée pour le moment.</p>'; // message indiquant qu'aucune partie n'a été jouée
    } else {
        let historyHtml = ''; // variable pour stocker le HTML de l'historique
        
        gameHistory.slice(0, 10).forEach((game, index) => {  // Afficher seulement les 10 dernières parties dans l'historique visible
            const result = game.won ? '🏆 Gagné' : '❌ Perdu';
            const timeFormatted = Math.floor(game.timeUsed / 60) + ':' + (game.timeUsed % 60).toString().padStart(2, '0'); 
            
            historyHtml += `
                <div class="stats-game-item">
                    <strong>${result}</strong> - ${game.word}<br>  
                    📅 ${game.date}<br> 
                    🎯 ${game.attempts} essais - 🏆 ${game.score} points - ⏱️ ${timeFormatted}
                </div>
            `;
        }); // le $ est utilisé pour insérer des variables dans une chaîne de caractères (ici pour insérer les variables dans le HTML)
        
        historyContainer.innerHTML = historyHtml; // on met à jour le contenu HTML du conteneur de l'historique avec le HTML généré
    }
    
    // Afficher la popup
    document.getElementById('stats-popup').classList.remove('hidden');
 }

 // Masquer les statistiques
 function hideStats() {
    document.getElementById('stats-popup').classList.add('hidden');
 }

 
 function updateStatsDisplay() { // Met à jour l'affichage des statistiques dans le DOM (evite le bug de l'affichage vide au premier clic de la popup)

 }

 // Fonction pour initialiser le bonhomme interactif
 function initCharacter() { // Initialisation du bonhomme interactif
    const container = document.getElementById("character-container"); // conteneur du bonhomme
    const peek = document.getElementById("character-peek"); // bonhomme qui regarde
    const out = document.getElementById("character-out"); // bonhomme qui sort de sa cachette
    const speechBubble = document.getElementById("character-speech-bubble"); // bulle de dialogue
    const speechText = document.getElementById("speech-text"); // texte dans la bulle de dialogue

    if (!peek || !out || !container || !speechBubble) { // Si les éléments n'existent pas, on quitte la fonction
        return;
    }
    
    // Messages aléatoires pour la bulle
    const messages = [
        "Enchaine les flammes pour un max de points ! 💪",
        "Ne perds pas ton streak ! 🔥",
        "Un petit indice : trouve le mot ! 😂",
        "Tu peux battre ton record ! 🏆", 
    ]; 

    let speechTimeout; // Variable pour le timeout de la bulle
    
    // S'assurer que peek est visible au début
    peek.style.opacity = "1"; 
    out.style.opacity = "0";

    function showSpeechBubble() { // Afficher la bulle de dialogue avec un message aléatoire
        // Message aléatoire
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        speechText.textContent = randomMessage;
        
        // Afficher la bulle
        speechBubble.classList.add("show");
        
        // Cacher automatiquement après 3 secondes
        clearTimeout(speechTimeout);
        speechTimeout = setTimeout(() => {
            speechBubble.classList.remove("show");
        }, 3000); 
    }

    // Variable pour suivre l'état du bonhomme
    let isOut = false; // false = dans la cachette, true = dehors

    peek.addEventListener("click", (e) => { // Quand on clique sur le bonhomme qui regarde
        e.stopPropagation(); // Empêche la propagation de l'événement pour éviter de fermer la bulle immédiatement
        
        // Transition vers out (le bonhomme sort de sa cachette)
        peek.style.opacity = "0"; 
        peek.style.transform = "translateX(-150px)";
        peek.style.zIndex = "1";
        
        out.style.opacity = "1";
        out.style.transform = "translateX(0)";
        out.style.zIndex = "2";
        
        isOut = true;
    });

    out.addEventListener("click", (e) => { // Quand on clique sur le bonhomme qui est dehors
        e.stopPropagation(); // Empêche la propagation de l'événement pour éviter de fermer la bulle immédiatement
        
        // Si c'est le premier clic après être sorti, afficher la bulle
        if (isOut) {
            showSpeechBubble();
            isOut = false; // Marquer qu'on a parlé
        } else {
            // Sinon, retourner vers peek (rentrer dans la cachette)
            out.style.opacity = "0";
            out.style.transform = "translateX(-150px)";
            out.style.zIndex = "1";
            
            peek.style.opacity = "1";
            peek.style.transform = "translateX(0)";
            peek.style.zIndex = "2";
        }
    });

    // Cacher la bulle si on clique ailleurs
    document.addEventListener("click", () => {
        speechBubble.classList.remove("show");
    });
 }

    // Démarrer une nouvelle partie au chargement de la page
    initGame();
    setupEventListeners();
    initMusic();
    initRulesAudio(); 
    initScoreSystem(); // Initialiser les points
    initStatsSystem(); // Initialiser les statistiques
    initCharacter(); // Initialiser le bonhomme

}); // fin du domContentLoaded
