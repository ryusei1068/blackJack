class Card {
    /*
    String suit : {"H", "D", "C", "S"}から選択
    String rank : {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}から選択
    */
    constructor(suit, rank) {
        // スート
        this.suit = suit
        // ランク
        this.rank = rank
    }

    /*
        return Number : カードのランクを基準とした整数のスコア
        
        2-10はそのまま数値を返す
    　  {"J", "Q", "K"}を含む、フェースカードは10を返す
        "A」が1なのか11なのかを判断するには手札全体の知識が必要、「A」はとりあえず11を返す
    */
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
/*
    String gameType : ゲームタイプの指定。{'blackjack'}から選択。
*/
    constructor(gameType) {
        // このデッキが扱うゲームタイプ
        this.gameType = gameType
        // カードの配列
        this.cards = gameType === "blackjack" ? Deck.generateDeck() : [];

    }
    
    // blackJack
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
/*
    return null : このメソッドは、デッキの状態を更新  | update condtion of Deck
    カードがランダムな順番になるようにデッキをシャッフル
*/
    shuffle(){
        let deckSize = this.cards.length;
        for (let i = deckSize-1; i >= 0 ; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }

/*
    String gameType : どのゲームにリセットするか
    return null : このメソッドは、デッキの状態を更新 
*/
    resetDeck(gameType) {
        this.cards = null;
        this.cards = Deck.generateDeck();
    }
    
/*
    return Card : ポップされたカードを返す
*/
    drawOne(){
        return this.cards.pop();
    }
}

class UserAction {
    constructor(action, bet) {
        this.action = action;
        this.bet = bet;
    }
}


class Player {
    /*
        String name : プレイヤーの名前
        String type : プレイヤータイプ。{'ai', 'user', 'house'}から選択
        String gameType : {'blackjack'}から選択。プレイヤーの初期化方法を決定するために使用
        ?Number chips : ゲーム開始に必要なチップ　デフォルトは400
    */
    constructor(name, type, gameType, chips = 400) {
        // プレイヤーの名前
        this.name = name;

        // プレイヤーのタイプ
        this.type = type;

        // 現在のゲームタイプ
        this.gameType = gameType;

        // プレイヤーの手札
        this.hand = [new Card('?', '?'), new Card('?', '?')];

        // プレイヤーが所持しているチップ
        this.chips = chips;

        // 現在のラウンドでのベットしているチップ
        this.bet = 0

        // 勝利金額。正の数にも負の数にも
        this.winAmount = 0 

        // プレイヤーのゲームの状態やアクションを表す
        // ブラックジャックの場合、最初の状態は「betting」
        // bust, double, stand, surrender, hit, gameOver
        this.gameStatus = 'betting' 

    }


    static getRandomInteger(max, min) {
        return Math.floor(Math.random() * (max - min) + min);
    }

/*
    Number userData : モデル外から渡されるパラメータ　nullになることも
    return GameDecision : 状態を考慮した上で、プレイヤーが行った決定
    このメソッドは、どのようなベットやアクションを取るべきかというプレイヤーの決定を取得 プレイヤーのタイプ、ハンド、チップの状態を読み取り、GameDecisionを返す　パラメータにuserData使うことによって、プレイヤーが「user」の場合、このメソッドにユーザーの情報を渡すことが可能、プレイヤーが 「ai」の場合、 userDataがデフォルトとしてnullを使う
*/
    promptPlayer(betDenominations, userData, table) {
        if (this.type === 'ai') {
            let option = ['surrender', 'stand', 'hit', 'double'];
            if (this.gameStatus === 'acting') {
                this.decisionBet(betDenominations);
                let index = Player.getRandomInteger(option.length, 0);
                this.gameStatus = option[index];
                // doubleが選択された場合、ベット金額を2倍にした額が所持しているチップを超えていないか確認
                if (this.gameStatus === 'double' && this.chips < this.bet * 2) {
                    let index = Player.getRandomInteger(option.length -1, 0);
                    this.gameStatus = option[index];
                }
                // else {
                //     let index = Player.getRandomInteger(option.length -1, 0);
                //     this.gameStatus = option[index];
                // }
            }
            else if (this.gameStatus === 'hit') {
                let index = Player.getRandomInteger(1, 3);
                console.log(index);
                this.gameStatus = option[index];
            }
        }
        else {
            this.gameStatus = userData.action;
        }
        return new GameDecision(this.gameStatus, this.bet);
    }

    decisionBet(betDenominations) {
        let minimum = Math.min(...betDenominations);
        while (true) {
            let i = Math.floor(Math.random() * betDenominations.length);
            this.bet = betDenominations[i];
            if (this.bet <= this.chips || this.chips < minimum) break;
        }
    }

/*
    return Number : 手札の合計
    合計が21を超える場合、手札の各エースについて、合計が21以下になるまで10を引く
*/
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

class GameDecision {
/*
    String action : プレイヤーのアクションの選択（ブラックジャックでは、hit、standなど。）
    Number amount : プレイヤーがベットする数値
    これはPlayer.promptPlayer()は常にreturnする、標準化されたフォーマット
*/
    constructor(action, amount) {
        // アクション
        this.action = action
        
        // プレイヤーがベットする数値
        this.amount = amount
    }
}

class Table {
    /*
        String gameType : {"blackjack"}から選択
        Array betDenominations : プレイヤーが選択できるベットの単位。デフォルトは[5,20,50,100]
        return Table : ゲームフェーズ、デッキ、プレイヤーが初期化されたテーブル
    */
    constructor(gameType, userName, betDenominations = [5,20,50,100]) {
        // ゲームタイプを表します。
        this.gameType = gameType;
        
        // プレイヤーが選択できるベットの単位。
        this.betDenominations = betDenominations;
        
        // テーブルのカードのデッキ
        this.deck = new Deck(this.gameType);
        this.deck.shuffle();
        
        // プレイしているゲームに応じて、プレイヤー、gamePhases、ハウスの表現が異なるかも。
        // 今回はとりあえず3人のAIプレイヤーとハウス、「betting」フェースの始まりにコミット
        this.players = [];
        // Player 初期化

        this.players.push(new Player("AI1", "ai", this.gameType));
        this.players.push(new Player(userName, "user", this.gameType));
        this.players.push(new Player("AI2", "ai", this.gameType));

        this.house = new Player('house', 'house', this.gameType);

        // {'betting', 'acting', 'roundOver', gameOver'} 
        this.gamePhase = 'betting'

        // これは各ラウンドの結果をログに記録するための文字列の配列
        this.resultsLog = [];

        this.turnCounter = 0;

        this.roundCounter = 1;
        
    }
    /*
        Player player : テーブルは、player.promptPlayer()を使用してGameDecisionを取得し、GameDecisionとgameTypeに応じてPlayerの状態を更新
        return Null : このメソッドは、プレーヤの状態を更新
        EX:
        プレイヤーが「ヒット」し、手札が21以上の場合、gameStatusを「バスト」に設定し、チップからベットを subtract
    */


    evaluateMove(player, userData) {
        let decision = player.promptPlayer(this.betDenominations, userData, this);

        // if (player.gameStatus === 'gameOver') return ;

        if (decision.action === 'hit') {
            player.hand.push(this.deck.drawOne());
            let score = player.getHandScore();
            if (score > 21) {
                player.gameStatus = 'bust';
                // player.bet = -1 * player.bet;
                player.winAmount = -1 * player.bet;
            }
        }
        else if (decision.action === 'double') {
            player.gameStatus = decision.action;
            player.hand.push(this.deck.drawOne());
            player.bet *= 2;
        }
        else if (decision.action === 'surrender') {
            player.gameStatus = decision.action;
            // player.bet = -1 * player.bet / 2;
            player.winAmount = Math.floor(-1 * player.bet / 2);
        }
        else {
            player.gameStatus = decision.action;
        }
    }

    /*
        return String : 新しいターンが始まる直前の全プレイヤーの状態を表す文字列
        NOTE: このメソッドの出力は、各ラウンドの終了時にテーブルのresultsLogメンバを更新するために使用
    */
    blackjackEvaluateAndGetRoundResults() {
        while (this.house.getHandScore() < 17) {
            this.house.hand.push(this.deck.drawOne());
        }
        this.house.gameStatus = this.house.getHandScore() > 21 ? 'bust' : 'stand';
        let houseHandScore = this.house.getHandScore();

        // ハウスがブラックジャックの場合
        let playerResult = "";
        let hasHouseBlackJack = houseHandScore === 21 && this.house.hand.length === 2;
        for (let player of this.players) {
            let hasPlayerBlackJack = player.getHandScore() === 21 && player.hand.length === 2;
            if (player.gameStatus === 'surrender' || player.gameStatus === 'bust') {
                ;
            }
            else if (hasHouseBlackJack) {
                this.house.gameStatus = 'black jack'
                if (!hasPlayerBlackJack) {
                    player.winAmount = -1 * player.bet;
                }
                // playerがブラックジャックの場合　引き分け
                else {
                    player.winAmount = 0;
                }
            }
            else if (houseHandScore === player.getHandScore()) {
                player.winAmount = 0;
            }
            else if (this.house.gameStatus === 'bust' || player.getHandScore() > houseHandScore) {
                if (hasPlayerBlackJack) {
                    player.winAmount = Math.floor(player.bet * 1.5);
                }
                else  {
                    player.winAmount = player.bet;
                }
            }
            else if (this.house.gameStatus != 'bust' && houseHandScore > player.getHandScore()) {
                player.winAmount = -1 * player.bet;
            }
            
            // chipの更新
            player.chips += player.winAmount;
            playerResult += `name : ${player.name}, action : ${player.gameStatus}, winAmount : ${player.winAmount}, chips : ${player.chips}, bet ${player.bet}, `;
            // 各プレイヤーの結果ログ　userName, final Action, winAmount
        }
        this.resultsLog.push(playerResult);
    }

    /*
        return null : デッキから2枚のカードを手札に加えることで、全プレイヤーの状態を更新
        NOTE: プレイヤーのタイプが「ハウス」の場合は、別の処理を行う
    */
    blackjackAssignPlayerHands() {
        for (let player of  this.players) {
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

    resetGamePhase() {
        this.gamePhase = 'betting';
    }

    /*
        return null : テーブル内のすべてのプレイヤーの状態を更新し、手札を空の配列に、ベットを0に設定
    */
    blackjackClearPlayerHandsAndBets() {
        // gameOver -> chip消失したユーザー　ゲームへ参加できない
        for (let player of this.players) {
            player.gameStatus = player.chips > 0 ? 'betting' : 'gameOver';
            player.hand = player.gameStatus === 'betting' ? [new Card('?', '?'), new Card('?', '?')] : [];
            player.bet = 0;
        }

        this.house.hand = [new Card('?', '?'), new Card('?', '?')];
        this.house.gameStatus = 'betting';
    }
    
    /*
        return Player : 現在のプレイヤー
    */
    getTurnPlayer() {
        let numberOfPlayers = this.players.length;
        let player = this.players[this.turnCounter % numberOfPlayers];
        return player;
    }

    /*
        return Null : このメソッドはテーブルの状態を更新する only
    */
    haveTurn(userData) {
        if (this.allPlayerActionsBroken()) {
            this.gamePhase = 'gameOver';
        }
        else if (this.allPlayerActionsResolved()) {
            this.deck.resetDeck();
            this.deck.shuffle();
            this.gamePhase = 'evaluation';
        }
        else {
            let player = this.getTurnPlayer();
            this.evaluateMove(player, userData);

        }
        this.turnCounter++;
    }

    /*
        return Boolean : テーブルがプレイヤー配列の最初のプレイヤーにフォーカスされている場合はtrue、そうでない場合はfalse
    */
    onFirstPlayer() {
        let numberOfPlayers = this.players.length;
        return this.turnCounter % numberOfPlayers === 0 ? true : false;
    }

    /*
        return Boolean : テーブルがプレイヤー配列の最後のプレイヤーにフォーカスされている場合はtrue、そうでない場合はfalse
    */
    onLastPlayer() {
        let numberOfPlayers = this.players.length;
        return this.turnCounter % numberOfPlayers === numberOfPlayers ? true : false;
    }
    
    /*
        全てのプレイヤーがセット{'broken', 'bust', 'stand', 'surrender'}のgameStatusを持っていればtrueを返し、持っていなければfalse
    */
    allPlayerActionsResolved() {
        let hashMap = {
            'bust' : true,
            'stand' : true,
            'surrender' : true,
            'double' : true
        };
        for (let player of this.players) {
            if (hashMap[player.gameStatus] === undefined) return false;
        }
        return true;
    }

    allPlayerActionsBroken() {
        let hashMap = {
            'gameOver' : true
        }
        for (let player of this.players) {
            // if (player.type === 'user' && hashMap[player.gameStatus] != undefined) return true;
            if (hashMap[player.gameStatus] != undefined) return true;
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
}

/**
 * MVC
 * Model -> game logic
 * View -> UI
 * Controller -> crossLink
 */

const config = {
    gameDiv : document.getElementById('gameDiv'),
}

const ids = {
    acitionsAndBetsDiv : 'acitionsAndBetsDiv',
    table : 'table',
    playerSide : 'player-side',
    betsDiv : 'betsDiv',
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
    
    static display_none(ele) {
        ele.classList.add("d-none");
        ele.classList.remove("d-block");
    }

    static display_block(ele) {
        ele.classList.add("d-block");
        ele.classList.remove("d-none");
    }

    static loginPage() {
        // <div>
            // <p class="text-white"> Welcome to Card Game! </p>
            // <div>
            //     <input type="text" placeholder="name">
            // </div>
            // <div>
            //     <select class="w-100">
            //         <option value="blackjack">Blackjack</option>
            //         <option value="poker">Poker</option>
            //     </select>
            // </div>
            // <div>
            //     <button class="btn btn-success start-game">Start Game </button>
            // </div>
        // </div> 

        let div = document.createElement('div');
        div.innerHTML += `
            <p class="text-white"> Welcome to Card Game!</p>
            <div class="userName">
                <input type="text" name="userName" placeholder="name">
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

    static renderTable(table) {
        if (table.gamePhase === 'betting') {
            // bet btn 作成 // house player 手札見せない
            View.viewOperation(table);
        }
        else if (table.gamePhase === 'acting' || table.gamePhase === 'evaluation') {
            View.viewOperation(table);
        }
        else if (table.gamePhase === 'gameOver') {
            // log page 作成  again btn, 

        }
    }

    static viewOperation(table) {
        View.initialize(config.gameDiv);
        View.setTable();
        View.renderHouse(table, table.house);
        View.setPlayerSide();
        View.renderPlayers(table);
        View.setActionsAndBet();
        View.renderActionsAndBet(table);
    }

    static renderHouse(table, house) {
        //`<div class="pt-5 house">
        
        //     <p class="m-0 text-center text-white rem3">Dealer</p>
        //     <div class="text-white d-flex m-0 p-0 justify-content-center">
        //         <p class="rem1 text-left">Status:  waitnig for actions </p>
        //     </div>
        //     <!-- House Card Row -->
        //     <div id="houeseCardRow" class="d-flex justify-content-center pb-5">
        //         <div class="bg-white border mx-2">
        //             <div class="text-center">
        //                 <img src="https://recursionist.io/img/questionMark.png" alt="" width="50" height="50">
        //             </div>
        //             <div class="text-center">
        //                 <p class="m-0 ">?</p>
        //             </div>
        //         </div>
        //     </div>
        // </div>`
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

    static renderPlayers(table) {
        // ` <div id="playersDiv" class="d-flex justify-content-around">`
        let playersDiv = document.createElement('div');
        playersDiv.id = 'playersDiv';
        playersDiv.classList.add('d-flex', 'justify-content-around');

        for (let i = 0; i < table.players.length; i++) {
            let player = table.players[i];
            let playerDiv = document.createElement('div');
            playerDiv.id = `player${i}`;

            playerDiv.innerHTML = `<p class="m-0 text-white text-center rem3">${player.name}</p>`;
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
        // <div class="text-white d-flex m-0 p-0 flex-column align-items-center">
            // <p class="text-left">Status: betting </p>
            // <p class="rem1 text-left">Bet: 0 </p>
            // <p class="rem1 text-left">Chips: 255 </p>
        // </div>

        let div = document.createElement('div');
        div.classList.add('text-white', 'd-flex', 'm-0', 'p-0', 'flex-column', 'align-items-center');

        div.innerHTML = 
                `
                <p class="text-left">Status: ${player.gameStatus} </p>
                <p class="rem1 text-left">Bet: ${player.bet} </p>
                <p class="rem1 text-left">Chips: ${player.chips} </p>
                `

        return div;
    }

    static cardDiv(player) {
        // <div class="d-flex justify-content-center"></div>
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
        // <div id="betsDiv" class="d-flex flex-column w-50"></div>
        let betsDiv = document.createElement('div');
        betsDiv.classList.add('d-flex', 'flex-column', 'w-50');
        betsDiv.id = ids.betsDiv;

        // <div class="py-2 h-60 d-flex justify-content-center"></div>
        let betsBtn = document.createElement('div');
        betsBtn.classList.add('py-2', 'h-60', 'd-flex', 'justify-content-center');


        /**
        <div class="mx-3 bet">
            <div class="input-group" >
                <span class="input-group-btn">
                    <button type="button" class="btn btn-danger btn-number">
                        -
                    </button>
                </span>
                <input type="text" class="input-number text-center" size="2" maxlength="5" value="3" readonly>
                <span class="input-group-btn">
                    <button type="button" class="btn btn-success btn-number">
                        +
                    </button>
                </span>
            </div><!--end input group div -->
            <p class="text-white text-center amount">5</p>
        </div> <!-- end betChoiceDiv -->
         */

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
                        </button><
                        `

        betsDiv.append(betsBtn, dealBtn);
        document.getElementById(ids.acitionsAndBetsDiv).append(betsDiv);
    }

    static renderActionsBtn(table) {
        // <div id ="actionsDiv" class="d-flex">
        //     <div class="py-2">
        //         <button class="text-dark btn btn-light px-5 py-1">Surrender</button>
        //     </div>
        //     <div class="py-2">
        //         <button class="btn btn-success px-5 py-1">Stand</button>
        //     </div>
        //     <div class="py-2">
        //         <button class="btn btn-warning px-5 py-1">Hit</button>
        //     </div>
        //     <div class="py-2">
        //         <button class="btn btn-danger px-5 py-1">Double</button>
        //     </div>
        // </div> 

        let user = null;
        for (let player of table.players) {
            if (player.type === 'user') {
                user = player;
                break;
            }
        }

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

        div.querySelector('.surrender').disabled = user.gameStatus === 'hit' ? true : false;
        div.querySelector('.double').disabled = user.gameStatus === 'hit' ? true : false;

        document.getElementById(ids.acitionsAndBetsDiv).append(div);
    }

    static setActionsAndBet() {
        let div = document.createElement('div');
        div.id = ids.acitionsAndBetsDiv;
        div.classList.add('d-flex', 'pb-5', 'pt-4', 'justify-content-center');

        document.getElementById(ids.table).append(div);
    }
}

class Controller {

    isUserTurn = false;

    static initialScreen() {
        View.loginPage();
        Controller.pushStartBtn()
    }

    static pushStartBtn() {
        document.querySelector('.start-game').addEventListener('click', function() {
            let userName = document.querySelector('.userName input[name="userName"]').value;
            if (userName.length === 0) {
                alert("Please enter User Name");
                return ;
            }
            let gameType = document.querySelector('.gameType select[name="choice"]').value;

            let table = new Table(gameType, userName);

            Controller.manageTable(table, 1);
        })
    }

    // phaseによってモデルを変更する
    static manageTable(table) {
        console.log(table.gamePhase);
        if (table.gamePhase === 'betting') {
            View.renderTable(table);
            Controller.pushIncreaseOrDecreaseBtn();
            Controller.pushDealBtn(table);
        }
        else if (table.gamePhase === 'acting') {
            table.blackjackAssignPlayerHands();
            if (table.getTurnPlayer().type === 'user') {
                Controller.decisionAction(table, table.getTurnPlayer());
                return ;
            }
            else {
                View.renderTable(table);
                table.haveTurn();
                setTimeout(function() {
                    Controller.manageTable(table);
                }, 1500);
            }
        }
        else if (table.gamePhase === 'evaluation') {
            table.blackjackEvaluateAndGetRoundResults();
            View.renderTable(table);
            table.blackjackClearPlayerHandsAndBets();
            table.resetGamePhase();
            table.resetTurnCounter();

            setTimeout(function() {
                Controller.manageTable(table);
            }, 3000);
        }
        else if (table.gamePhase === 'gameOver') {
            // gameOver 

            return ;
        }

        // while(table.gamePhase != 'gameOver') {
        //     table.haveTurn();
        //     if (table.gamePhase === 'evaluation') {
        //         table.blackjackEvaluateAndGetRoundResults();
        //         table.blackjackClearPlayerHandsAndBets();
        //         table.blackjackAssignPlayerHands();
        //     }
        // }
        // console.log(table.resultsLog);
    }


    static pushDealBtn(table) {
        document.querySelector('.deal-btn').addEventListener('click', function () {
            let totalBet = parseInt(document.querySelector('.total-bet').innerHTML.replace(/[^0-9]/g, ''));

            if (totalBet === 0 || totalBet > table.getUserChips()) {
                alert('test');
                return ;
            }
            table.setUserBet(totalBet);
            table.setGamePhase('acting');
            return Controller.manageTable(table);
        })
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
                    alert('test');
                    inputTag.value = 0;
                    return ;
                }
                View.renderTotalBet();
                
            })
        }
    }

    static decisionAction(table, player) {
        if (player.gameStatus === 'acting' || player.gameStatus === 'hit') {
            alert('your turn')
            let actions = document.querySelectorAll('.action-btn');
            for (let action of actions) {
                action.addEventListener('click', function () {
                    let act = new UserAction(action.innerHTML.toLowerCase(), player.bet);
                    table.increaseTurnCounter();
                    table.evaluateMove(player, act);
                    console.log(act);
                    return Controller.manageTable(table);
                })
            }
        }
        else {
            table.increaseTurnCounter();
            return Controller.manageTable(table);
        }
    }


}


// const gameList = ['Blackjack'];
// const config = {
//     gameDiv : document.getElementById('gameDiv'),
//     gameStart : document.getElementById('game-start'),
//     players : document.getElementById('players'),
//     house : document.getElementById('house'),
// }


// let table1 = new Table("blackjack");
// while(table1.gamePhase != 'roundOver') {
//     table1.haveTurn();
//     if (table1.gamePhase === 'evaluation') {
//         table1.blackjackEvaluateAndGetRoundResults();
//         table1.blackjackClearPlayerHandsAndBets();
//         table1.blackjackAssignPlayerHands();
//     }
// }
// console.log(table1.resultsLog);

Controller.initialScreen();


for (let i = 0;  i< 10; i++) {
    console.log(Player.getRandomInteger(1, 3));
}
