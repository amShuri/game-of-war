import { saveToLocalStorage, loadFromLocalStorage } from './localStorage.js'

const newDeckBtn = document.getElementById('new-deck')
const drawCardBtn = document.getElementById('draw-card')

const computerSlot = document.getElementById('computer-slot')
const playerSlot = document.getElementById('player-slot')
const computerCount = document.getElementById('computer-count')
const playerCount = document.getElementById('player-count')
const roundResult = document.getElementById('round-result')

const CARD_VALUES = [
    "2", "3", "4", "5", "6", "7", "8", "9", 
    "10", "JACK", "QUEEN", "KING", "ACE"
]

const game = loadFromLocalStorage('gameObj') || {
    playerDeck: [],
    computerDeck: [],
    cardPile: [],
    cardsAtStake: 0,
    roundWinner: ""
}

drawCardBtn.addEventListener('click', () => {
    if (game.playerDeck.length && game.computerDeck.length) {
        handleDrawCardClick()
    }
})

newDeckBtn.addEventListener('click', () => {
    // Reset the game and remove any existing data loaded from LocalStorage
    resetGame()
    
    fetch("https://apis.scrimba.com/deckofcards/api/deck/new/draw/?count=52")
        .then(res => res.json())
        .then(data => {
            dealDeck(data.cards)
            updateDeckCount()
            updateGameControls()

            roundResult.textContent = 'GETTING NEW DECK ...'
            setTimeout(() => {
                roundResult.textContent = 'ALL READY!'
            }, 3000);
            
            saveToLocalStorage('gameObj', game)
    })
})

function handleDrawCardClick() {
    const playerCard = game.playerDeck.shift()
    const computerCard = game.computerDeck.shift()

    playRound(playerCard, computerCard)
    updateGameControls()
    updateGameStatus()
    updateDeckCount()
    displayPlayedCards(playerCard, computerCard)

    saveToLocalStorage('gameObj', game)
}

function playRound(playerCard, computerCard) { 
    const playerCardValue = CARD_VALUES.indexOf(playerCard.value)
    const computerCardValue = CARD_VALUES.indexOf(computerCard.value)

    game.roundWinner = ""
    game.cardPile.push(playerCard, computerCard)
    
    if (playerCardValue > computerCardValue) {
        game.cardsAtStake = game.cardPile.length
        game.roundWinner = 'player'
        game.playerDeck.push(...game.cardPile.splice(0))
    }
    else if (playerCardValue < computerCardValue)
    {
        game.cardsAtStake = game.cardPile.length
        game.roundWinner = 'computer'
        game.computerDeck.push(...game.cardPile.splice(0))
    }
    else
    {
        game.cardPile.push(
            ...game.playerDeck.splice(0, 3),
            ...game.computerDeck.splice(0, 3)
        )
        game.cardsAtStake = game.cardPile.length
    }
}

function isGameOver() {
    return !game.playerDeck.length || !game.computerDeck.length
}

function dealDeck(cards) {
    cards.forEach((card, index) => {
        if (index % 2 === 0) {
            game.playerDeck.push(card)
        }
        else {
            game.computerDeck.push(card)
        }
    })  
}

function resetGame() {
    game.playerDeck = []
    game.computerDeck = []
    game.cardPile = []
    game.cardsAtStake = 0
    game.roundWinner = ""

    localStorage.removeItem('gameObj')
}

function displayPlayedCards(playerCard, computerCard) {
    playerSlot.innerHTML = `<img src="${playerCard.image}">`
    computerSlot.innerHTML = `<img src="${computerCard.image}">`
}

function updateGameControls() {
    if (isGameOver()) {
        drawCardBtn.disabled = true
        newDeckBtn.disabled = false
    }
    else {
        drawCardBtn.disabled = false
        newDeckBtn.disabled = true
    }
}

function updateGameStatus() {
    if (!game.playerDeck.length) {
        roundResult.textContent = `Computer wins the game! Player has 0 cards left.\n${game.cardPile.length ? `${game.cardPile.length} cards remained on the table.` : ''}`
    }
    else if (!game.computerDeck.length) {
        roundResult.textContent = `Player wins the game! Computer has 0 cards left.\n${game.cardPile.length ? `${game.cardPile.length} cards remained on the table.` : ''}`
    }
    else if (game.roundWinner) {
        roundResult.textContent = `${game.roundWinner} wins and takes ${game.cardsAtStake} cards!`
    }
    else {
        roundResult.textContent = `IT'S A WAR! There are ${game.cardsAtStake} cards at stake.`
    }
}

function updateDeckCount() {
    computerCount.textContent = `CPU: ${game.computerDeck.length}`
    playerCount.textContent = `YOU: ${game.playerDeck.length}`
}

// Restore UI from saved state
updateDeckCount()