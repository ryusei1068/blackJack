class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank
    }

    getRankNumber() {
        let hashMap = {
            'J' : 10, 
            'Q' : 10, 
            'K' : 10
        };

        if (this.rank === 'A') return 11;
        else if (hashMap[this.rank] != undefined) return hashMap[this.rank];
        else return parseInt(this.rank);
    }
}

class Deck {
    constructor(gameType) {
        this.gameType = gameType;
        this.cards = gameType === "blackjack" ? Deck.generateDeck() : [];

    }
    
    static generateDeck() {
        let newDeck = [];
        const suits = ["H", "D", "C", "S"];
        const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < values.length; j++) {
                newDeck.push(new Card(suits[i], values[j]));
            }
        }
        return newDeck;
    }

    shuffle(){
        let deckSize = this.cards.length;
        for (let i = deckSize-1; i >= 0 ; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }

    resetDeck(gameType) {
        this.cards = null;
        this.cards = gameType === "blackjack" ? Deck.generateDeck() : [];
    }
    
    drawOne(){
        return this.cards.pop();
    }
}

class Player {
    constructor(name, type, gameType, chips = 400) {
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.hand = [new Card('?', '?'), new Card('?', '?')];
        this.chips = chips;
        this.bet = 0
        this.winAmount = 0 
        this.gameStatus = 'betting' 
    }

    static getRandomInteger(max, min) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    promptPlayer(userAction) {
        let act = this.gameStatus;
        if (this.type === 'ai') {
            let actions = ['surrender', 'stand', 'hit', 'double'];
            if (this.gameStatus === 'acting') {
                let index = Player.getRandomInteger(actions.length, 0);
                act = actions[index];
                if (this.getHandScore() === 21) {
                    act = 'black jack';
                }
                else if (act === 'double' && this.chips < this.bet * 2) {
                    let index = Player.getRandomInteger(actions.length -1, 0);
                    act = actions[index];
                }
            }
            else if (act === 'hit') {
                let index = Player.getRandomInteger(3, 1);
                act = actions[index];
            }
        }
        else {
            act = userAction;
        }
        return act;
    }

    decisionBet(betDenominations) {
        while (true) {
            let i = Math.floor(Math.random() * betDenominations.length);
            this.bet = betDenominations[i];
            if (this.bet <= this.chips) break;
        }
    }

    getHandScore() {
        let total = 0;
        let ace = 0;
        for (let card of this.hand) {
            total += card.getRankNumber();
            ace = card.rank === 'A' ? ace + 1 : ace;
        }

        while (ace >= 1 && total > 21) {
            total -= 10;
            ace--;
        }

        return total;
    }
}


class Table {
    constructor(gameType, userName, type, betDenominations = [1, 5,20,50,100]) {
        this.gameType = gameType;

        this.betDenominations = betDenominations;
        
        this.deck = new Deck(this.gameType);
        this.deck.shuffle();
        
        this.players = [];

        this.players.push(new Player("ai1", "ai", this.gameType));
        this.players.push(new Player(userName, type, this.gameType));
        this.players.push(new Player("ai2", "ai", this.gameType));

        this.house = new Player('house', 'house', this.gameType);

        this.gamePhase = 'betting'

        this.resultsLog = [];

        this.turnCounter = 0;

        this.roundCounter = 1;
        
    }


    evaluateMove(player, userData) {
        player.gameStatus = player.promptPlayer(userData);;

        if (player.gameStatus === 'hit') {
            player.hand.push(this.deck.drawOne());
            let score = player.getHandScore();
            if (score > 21) {
                player.gameStatus = 'bust';
                player.winAmount = -1 * player.bet;
            }
        }
        else if (player.gameStatus === 'double' && player.hand.length === 2) {
            player.hand.push(this.deck.drawOne());
            player.bet *= 2;
        }
        else if (player.gameStatus === 'surrender') {
            player.winAmount = Math.floor(-1 * player.bet / 2);
        }
    }

    blackjackEvaluateAndGetRoundResults() {
        while (this.house.getHandScore() < 17) {
            this.house.hand.push(this.deck.drawOne());
        }

        let houseHandScore = this.house.getHandScore();
        this.house.gameStatus = houseHandScore > 21 ? 'bust' : 'stand';
        let hasHouseBlackJack = houseHandScore === 21 && this.house.hand.length === 2;

        this.resultsLog.push(`Round: ${this.roundCounter}`);

        let playerResult = "";
        for (let player of this.players) {
            let hasPlayerBlackJack = player.getHandScore() === 21 && player.hand.length === 2;
            if (player.gameStatus === 'surrender' || player.gameStatus === 'bust') {
                ;
            }
            else if (hasPlayerBlackJack) {
                player.winAmount = hasHouseBlackJack ? 0 : Math.floor(player.bet * 1.5);
            }
            else if (hasHouseBlackJack) {
                player.winAmount = hasPlayerBlackJack ? 0 : -1 * player.bet;
            }
            else if (this.house.gameStatus === 'bust' || player.getHandScore() > houseHandScore) {
                player.winAmount = player.bet;
            }
            else if (player.getHandScore() > 21 || houseHandScore > player.getHandScore()) {
                player.winAmount = -1 * player.bet;
            }
            else if (houseHandScore === player.getHandScore()) {
                player.winAmount = 0;
            }

            playerResult += `<li>name : ${player.name}, action : ${player.gameStatus}, won : ${player.winAmount}, chips : ${player.chips}, bet ${player.bet}</li>`;
        }
        this.resultsLog.push(playerResult);
    }

    blackjackAssignPlayerHands() {
        for (let player of this.players) {
            if (player.gameStatus === "betting") {
                player.hand = [this.deck.drawOne(), this.deck.drawOne()];
                player.gameStatus = 'acting';
            }
        }
        if (this.house.gameStatus === 'betting') {
            this.house.hand = [this.deck.drawOne()];
            this.house.gameStatus = 'waiting for actions'
        }
    }


    blackjackClearPlayerHandsAndBets() {
        for (let player of this.players) {
            player.chips += player.winAmount;
            player.gameStatus = player.chips > 0 ? 'betting' : 'gameOver';
            player.hand = player.gameStatus === 'betting' ? [new Card('?', '?'), new Card('?', '?')] : [];
            player.bet = 0;
            player.winAmount = 0;
        }

        this.house.hand = [new Card('?', '?'), new Card('?', '?')];
        this.house.gameStatus = 'betting';
    }

    getTurnPlayer() {
        return this.players[this.turnCounter % this.players.length];
    }

    getCurIndex() {
        return this.turnCounter % this.players.length;
    }

    haveTurn(userData) {
        if (this.allPlayerActionsResolved()) {
            this.deck.resetDeck(this.gameType);
            this.deck.shuffle();
            this.gamePhase = 'evaluation';
        }
        else {
            let player = this.getTurnPlayer();
            this.evaluateMove(player, userData);
        }
        this.turnCounter++;
    }

    
    allPlayerActionsResolved() {
        let hashMap = {
            'bust' : true,
            'stand' : true,
            'surrender' : true,
            'double' : true,
            'gameOver' : true,
            'black jack' : true,
        };
        for (let player of this.players) {
            if (hashMap[player.gameStatus] === undefined) return false;
        }
        return true;
    }

    isGameOver(type) {
        for (let player of this.players) {
            if (player.type === type && player.gameStatus === 'gameOver') {
                this.gamePhase = 'gameOver';
                return true;
            }
        }
        return false;
    }

    setUserBet(bet) {
        for (let player of this.players) {
            if (player.type === 'user') player.bet = bet;
        }
    }

    getUserChips() {
        for (let player of this.players) {
            if (player.type === 'user') return player.chips;
        }
    }

    setGamePhase(phase) {
        this.gamePhase = phase;
    } 

    increaseTurnCounter(){
        this.turnCounter++;
    }

    resetTurnCounter() {
        this.turnCounter = 0;
    }

    increaseRoundCounter() {
        this.roundCounter++;
    }

    resetRoundCounter() {
        this.roundCounter = 1;
    } 

    resetTableStatus() {
        this.setGamePhase('betting');
        this.resetRoundCounter();
        this.resetTurnCounter();
        this.resultsLog = [];
        for (let player of this.players) {
            player.gameStatus = 'betting';
            player.hand = [new Card('?', '?'), new Card('?', '?')];
            player.winAmount = 0;
            player.chips = 400;
            player.bet = 0;
        }

        this.house.hand = [new Card('?', '?'), new Card('?', '?')];
        this.house.gameStatus = 'betting';
    }

    decisionBetOfAI() {
        for (let player of this.players) {
            if (player.type === 'ai' && player.gameStatus != 'gameOver') {
                player.decisionBet(this.betDenominations);
            }
        }
    }

    getUserObj() {
        for (let player of table.players) {
            if (player.type === 'user') return player;
        }
        return null;
    }
}

const config = {
    gameDiv : document.getElementById('gameDiv'),
    judgmentTime : 3000,
    actionInterval : 2000,
}

const ids = {
    acitionsAndBetsDiv : 'acitionsAndBetsDiv',
    table : 'table',
    playerSide : 'player-side',
    betsDiv : 'betsDiv', 
    logPage : 'logPage',
}

const suitImg = {
    "H" : "https://recursionist.io/img/dashboard/lessons/projects/heart.png",
    "D" : "https://recursionist.io/img/dashboard/lessons/projects/diamond.png",
    "C" : "https://recursionist.io/img/dashboard/lessons/projects/clover.png",
    "S" : "https://recursionist.io/img/dashboard/lessons/projects/spade.png",
    "?" : "https://recursionist.io/img/questionMark.png"
}

class View {

    static initialize(ele) {
        ele.innerHTML = "";
    }
    
    static loginPage() {
        let div = document.createElement('div');
        div.innerHTML += `
            <p class="text-white"> Welcome to Card Game!</p>
            <div class="userName">
                <input type="text" name="userName" placeholder="name" maxlength='10'>
            </div>
            <div class="gameType">
                <select class="w-100" name="choice">
                    <option value="blackjack">Blackjack</option>
                </select>
            </div>
            <div>
                <button class="btn btn-success start-game">Start Game</button>
            </div>
        `

        config.gameDiv.append(div);
    }

    static renderTable(table, curIndex, gameResults=null) {
        if (table.gamePhase === 'gameOver') {
            View.initialize(config.gameDiv);
            View.setLogPage();
            View.renderLogPage(table, gameResults);
        }
        else {
            View.viewOperation(table, curIndex);
        }
    }

    static viewOperation(table, curIndex) {
        View.initialize(config.gameDiv);
        View.setTable();
        View.renderHouse(table.house);
        View.setPlayerSide();
        View.renderPlayers(table, curIndex);
        View.setActionsAndBet();
        View.renderActionsAndBet(table);
    }

    static renderHouse(house) {
        let houseDiv = document.createElement('div');
        houseDiv.classList.add('pt-5', 'house');
        
        houseDiv.innerHTML = `
                <p class="m-0 text-center text-white rem3">Dealer</p>
                <div class="text-white d-flex m-0 p-0 justify-content-center">
                    <p class="rem1 text-left">Status:  ${house.gameStatus}</p>
                </div>
                `

        let houseCardDiv = document.createElement('div');
        houseCardDiv.id = 'houseCardRow';
        houseCardDiv.classList.add('d-flex', 'justify-content-center', 'pb-5');
    
        houseCardDiv.append(View.cardDiv(house));
        houseDiv.append(houseCardDiv);
        document.getElementById(ids.table).append(houseDiv);
    }

    static renderPlayers(table, curIndex) {
        let playersDiv = document.createElement('div');
        playersDiv.id = 'playersDiv';
        playersDiv.classList.add('d-flex', 'justify-content-around');

        for (let i = 0; i < table.players.length; i++) {
            let player = table.players[i];
            let playerDiv = document.createElement('div');
            playerDiv.id = `player${i}`;
            let bgColor = curIndex === i ? "bg-warning" : "";
            playerDiv.innerHTML = `<p class="m-0 text-white text-center rem3 ${bgColor}">${player.name}</p>`;
            playerDiv.append(View.playerInfo(player));
            playerDiv.append(View.cardDiv(player));

            playersDiv.append(playerDiv);

        }
        document.getElementById(ids.playerSide).append(playersDiv);
    }

    static setTable() {
        let table = document.createElement('div');
        table.id = ids.table;
        table.classList.add('col-12');

        config.gameDiv.append(table);
    }

    static setPlayerSide() {
        let playerSide = document.createElement('div');
        playerSide.id = ids.playerSide;

        document.getElementById(ids.table).append(playerSide);
    }

    static playerInfo(player) {
        let div = document.createElement('div');
        div.classList.add('text-white', 'd-flex', 'm-0', 'p-0', 'flex-column', 'align-items-center');

        div.innerHTML = 
                `
                <p class="text-left">Status: ${player.gameStatus} </p>
                <p class="rem1 text-left">Bet: ${player.bet} </p>
                <p class="rem1 text-left">Chips: ${player.chips} </p>
                <p class="rem1 text-left">Won: ${player.winAmount} </p>
                `

        return div;
    }

    static cardDiv(player) {
        let cardDiv = document.createElement('div');
        cardDiv.classList.add('d-flex', 'justify-content-center');

        for (let hand of player.hand) {
            let card = `
                    <div class="bg-white border mx-2">
                        <div class="text-center">
                            <img src="${suitImg[hand.suit]}" alt="" width="50" height="50">
                        </div>
                        <div class="text-center">
                            <p class="m-0">${hand.rank}</p>
                        </div>
                    </div>
                    `
            cardDiv.innerHTML += card;
        }

        return cardDiv;
    }

    static renderTotalBet() {
        let bets = document.querySelectorAll('.bet');
        let total = 0;
        for (let bet of bets) {
            total += parseInt(bet.querySelector('.input-number').value) * parseInt(bet.querySelector('.amount').innerHTML);
        }
        document.querySelector('.total-bet').innerHTML = `Bet: ${total}`
    }

    static renderActionsAndBet(table) {
        if (table.gamePhase === 'betting') {
            View.renderBetsBtn(table);
        }
        else  {
            View.renderActionsBtn(table);
        }
    }

    static renderBetsBtn(table) {
        let betsDiv = document.createElement('div');
        betsDiv.classList.add('d-flex', 'flex-column', 'w-50');
        betsDiv.id = ids.betsDiv;

        let betsBtn = document.createElement('div');
        betsBtn.classList.add('py-2', 'h-60', 'd-flex', 'justify-content-center');

        for (let betDenomination of table.betDenominations) {
            let div = document.createElement('div');
            div.classList.add('mx-3', 'bet');

            div.innerHTML = 
                        `
                        <div class="input-group" >
                            <span class="input-group-btn">
                                <button type="button" class="btn btn-danger btn-number">
                                    -
                                </button>
                            </span>
                            <input type="text" class="input-number text-center" size="2" maxlength="5" value="0" readonly>
                            <span class="input-group-btn">
                                <button type="button" class="btn btn-success btn-number">
                                    +
                                </button>
                            </span>
                        </div>
                        <p class="text-white text-center amount">${betDenomination}</p>
                        `

            betsBtn.append(div);
        }

        let dealBtn = document.createElement('div');
        dealBtn.classList.add('d-flex', 'flex-column', 'align-items-center');

        dealBtn.innerHTML = 
                        `
                        <h3 class="total-bet text-white mb-3">Bet: 0</h3>
                        <button class="btn btn-success rem5 deal-btn">
                            Deal
                        </button>
                        `

        betsDiv.append(betsBtn, dealBtn);
        document.getElementById(ids.acitionsAndBetsDiv).append(betsDiv);
    }

    static renderActionsBtn(table) {
        let user = table.getUserObj();

        let div = document.createElement('div');
        div.classList.add('d-flex');
        div.id = 'actionsDiv';
        
        div.innerHTML = 
                    `
                    <div class="py-2">
                        <button class="text-dark btn btn-light px-5 py-1 action-btn surrender">Surrender</button>
                    </div>
                    <div class="py-2">
                        <button class="btn btn-success px-5 py-1 action-btn">Stand</button>
                    </div>
                    <div class="py-2">
                        <button class="btn btn-warning px-5 py-1 action-btn">Hit</button>
                    </div>
                    <div class="py-2">
                        <button class="btn btn-danger px-5 py-1 action-btn double">Double</button>
                    </div>
                    `

        if (user != null) {
            if (user.bet * 2 > user.chips) {
                div.querySelector('.double').disabled = true;
            }
            if (user.gameStatus === 'hit') {
                div.querySelector('.surrender').disabled = true;
                div.querySelector('.double').disabled = true;
            }
    
            if (table.gamePhase === 'evaluation') div.innerHTML = "";
            document.getElementById(ids.acitionsAndBetsDiv).append(div);
        }
    }

    static setActionsAndBet() {
        let div = document.createElement('div');
        div.id = ids.acitionsAndBetsDiv;
        div.classList.add('d-flex', 'pb-5', 'pt-4', 'justify-content-center');

        document.getElementById(ids.table).append(div);
    }

    static setLogPage()  {
        let div = document.createElement('div')
        div.id = ids.logPage;
        div.classList.add('d-flex', 'flex-column', 'align-items-center');
        config.gameDiv.append(div);        
    }

    static renderLogPage(table, gameResults) {
        let h2 = document.createElement('h2');
        h2.classList.add('text-white', 'pb-3');
        h2.innerHTML = table.gameType;

        document.getElementById(ids.logPage).append(h2);

        let logDiv = document.createElement('div');
        logDiv.classList.add('text-white', 'd-flex', 'flex-column', 'align-items-center', 'log');

        for (let i = 0; i < gameResults.length; i++) {
            let tag = null;
            tag = i % 2 === 0 ? document.createElement('h4') : document.createElement('ul');
            tag.innerHTML = gameResults[i];
            logDiv.append(tag);
        }

        let btnsDiv = document.createElement('div');
        btnsDiv.classList.add('w-50', 'd-flex', 'justify-content-around', 'mt-5', 'pt-3');
        btnsDiv.innerHTML = 
                        `
                        <div class="py-2">
                            <button class="btn btn-primary px-5 py-1 btn-continue-or-end">LoginPage</button>
                        </div>
                        <div class="py-2">
                            <button class="btn btn-light px-5 py-1 btn-continue-or-end">Continue</button>
                        </div>
                        `
        document.getElementById(ids.logPage).append(logDiv, btnsDiv);
    }
}

class Controller {
    static initialScreen() {
        View.loginPage();
        Controller.pushStartBtn()
    }

    static pushStartBtn() {
        document.querySelector('.start-game').addEventListener('click', function() {
            let userName = document.querySelector('.userName input[name="userName"]').value;
            if (userName.length === 0) {
                alert("Please put User Name");
                return ;
            }
            let gameType = document.querySelector('.gameType select[name="choice"]').value;
            let type = userName === 'ai' ? 'ai' : 'user';
            let table = new Table(gameType, userName, type);
            let existsUser = type === 'user' ? true : false;
            Controller.manageTable(table, existsUser);
        })
    }

    static manageTable(table, existsUser) {
        console.log(table.gamePhase);
        if (table.gamePhase === 'betting') {
            View.renderTable(table);
            Controller.pushIncreaseOrDecreaseBtn();
            Controller.pushDealBtn(table, existsUser);
            table.blackjackAssignPlayerHands();
        }
        else if (table.gamePhase === 'acting') {
            let curIndex = table.getCurIndex();
            let curplayer = table.getTurnPlayer();

            View.renderTable(table, curIndex);
            if (curplayer.type === 'user') {
                if (curplayer.gameStatus === 'acting' || curplayer.gameStatus === 'hit') {
                    Controller.decisionAction(table, existsUser);
                }
                else {
                    table.increaseTurnCounter();
                    Controller.manageTable(table, existsUser);
                }
            }
            else {
                table.haveTurn();
                setTimeout(function() {
                    Controller.manageTable(table, existsUser);
                }, config.actionInterval);
            }
        }
        else if (table.gamePhase === 'evaluation') {
            table.blackjackEvaluateAndGetRoundResults();
            View.renderTable(table);
            table.blackjackClearPlayerHandsAndBets();
            table.increaseRoundCounter();

            if (existsUser && !table.isGameOver('user')) {
                table.setGamePhase('betting');
                table.resetTurnCounter();
            }
            else if (!existsUser && !table.isGameOver('ai')) {
                table.setGamePhase('betting');
                table.resetTurnCounter();
            }

            setTimeout(function() {
                Controller.manageTable(table, existsUser);
            }, config.judgmentTime);
        }
        else if (table.gamePhase === 'gameOver') {
            View.renderTable(table, undefined, table.resultsLog);
            Controller.continueOrEnd(table, existsUser);
        }
    }

    static pushDealBtn(table, existsUser) {
        table.decisionBetOfAI();
        table.setGamePhase('acting');

        if (existsUser) {
            document.querySelector('.deal-btn').addEventListener('click', function () {
                let totalBet = parseInt(document.querySelector('.total-bet').innerHTML.replace(/[^0-9]/g, ''));
                if (totalBet === 0 || totalBet > table.getUserChips()) {
                    alert('invalid value');
                    return ;
                }
                table.setUserBet(totalBet);
                Controller.manageTable(table, existsUser);
            })
        }
        else  {
            Controller.manageTable(table, existsUser);
        }
    }

    static pushIncreaseOrDecreaseBtn() {
        let increaseOrdecrease = document.querySelectorAll('.input-group-btn');
        let bets = document.querySelectorAll('.bet');
        for (let i = 0; i < increaseOrdecrease.length; i++) {
            increaseOrdecrease[i].addEventListener('click', function () {
                let inputTag = bets[Math.floor(i / 2)].querySelector('input');
                let curValue = parseInt(inputTag.value); 
                inputTag.value = i % 2 === 0 ? curValue - 1 : curValue + 1;
                if (inputTag.value < 0) {
                    alert('invalid value');
                    inputTag.value = 0;
                    return ;
                }
                View.renderTotalBet();
            })
        }
    }

    static decisionAction(table, existsUser) {
        document.querySelectorAll('.action-btn').forEach(action => {
            action.addEventListener('click', function () {
                table.haveTurn(action.innerHTML.toLowerCase());
                Controller.manageTable(table, existsUser);
            })
        });
    }

    static continueOrEnd(table, existsUser) {
        document.querySelectorAll('.btn-continue-or-end').forEach(ele => {
            ele.addEventListener('click', function () {
                if (ele.innerHTML.toLowerCase() === 'loginpage') {
                    View.initialize(config.gameDiv);
                    Controller.initialScreen();
                }
                else {
                    table.resetTableStatus();
                    Controller.manageTable(table, existsUser);
                }
            });
        });
    }
}

Controller.initialScreen();


// CLI Mode
// let table1 = new Table('blackjack', 'ai', 'ai');
// while (table1.gamePhase != 'gameOver') {
//     if (table1.gamePhase === 'betting') {
//         table1.blackjackAssignPlayerHands();
//         table1.decisionBetOfAI();
//         table1.setGamePhase('acting');
//     }
//     if (table1.gamePhase === 'acting') {
//         table1.haveTurn();
//     }
//     else if (table1.gamePhase === 'evaluation') {
//         table1.blackjackEvaluateAndGetRoundResults();
//         table1.blackjackClearPlayerHandsAndBets();
//         table1.increaseRoundCounter();
//         if (!table1.isGameOver('ai')) {
//             table1.setGamePhase('betting');
//             table1.resetTurnCounter();
//         }
//     }
// }
// console.log(table1.resultsLog);
