//　ブラックジャックルール
// 21を超えないようにかつ21に近く　ハウスのハンドを上回る　→　勝ち
// キング、クイーン、ジャックは10と数える
// エースは1,10都合の良い方を選べる (A,K) -> 11,10 のように


// 手順
/**
 * 1 ベット
 * ゲームが始まる前に各プレイヤーがゲームに掛ける金額をベット
 * 2 カード入手
 * ハウスは各プレイヤーに2枚ずつカードを配る、　ハウスは1枚表向き1枚は裏向き
 * 3 アクション
 * 各プレイヤーは手札を変えるさまざまなアクションを取れる　アクションが全て終了した後、ハウスは裏向きを表向きにする
 * 4 評価
 * 各プレイヤーとハウスの手札比較　
 */

// アクション詳細
/**
 * サレンダー
 * 最初に配られた２枚のカードの時点で、負けを認める　ゲームに掛けた金額の半分が戻ってくる
 * 
 * スタンド
 * カードの追加をストップ　現在のハンド（手持ちカード）で勝負
 * 
 * ヒット
 * 手札に1枚のカードを追加すること　手札の合計が21を超えた時点でバストと呼び　プレイヤーの負けが確定
 * 
 * タブル
 * ベットを2倍にしてもう1枚のカードを引く　2枚のカードが配られてから実施可能
 */
// ヒットした後にバストしなかった場合
//　もう一度ヒットするかスタンドするか選択

// 各プレイヤーのアクション終了後、ハウスは裏向きのカードを公開　2枚の合計値が17以上であればスタンド、17未満であれば17以上になるまでカードを引く


// 評価
/**バストしてないかつチップが残っているプレイヤーとハウスの手札比較
 * プレイヤーのカード合計値がハウスのカード合計値より大きい　または、　ハウスがバストした場合プレイヤーの勝ち
 * ハウスのカードがプレイヤーより大きい場合、プレイヤーの負け
 * ハウスとプレイヤーの合計値が等しい場合、プッシュと呼ばれベットしたチップは失わない　→引き分け
 * 
 * 例外の存在
 * プレイヤーの手札が2枚のみ　一枚がエースで一枚がフェースカード（J,Q,K）の場合　→最強手札
 * 
 */

// チップの調整
/**
 * ハウスがブラックジャックの場合
 * プレイヤーがブラックジャック　→　プッシュ　（引き分け）
 * プレイヤーがブラックジャックでない場合
 *      ダブルの場合　ベット額の2倍失う
 *      スタンドの場合、ベット額の1倍失う
 * 
 * ハウスがバスト、プレイヤーの手札がハウスの手札より大きい場合
 * プレイヤーがブラックジャックの場合　ベット額の1.5倍手に入れる
 *          ダブルの場合、ベット額に２倍手に入れる
 *          スタンドの場合、ベット額の1倍手に入れる
 * 
 * ハウスがバストしていないかつハウスの手札がプレイヤーより大きい場合
 * プレイヤーがダブルの場合、ベット額の2倍失う
 *          スタンドの場合、ベット額の1倍失う
 */




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
        this.hand = [];

        // プレイヤーが所持しているチップ
        this.chips = chips;

        // 現在のラウンドでのベットしているチップ
        this.bet = 0

        // 勝利金額。正の数にも負の数にも
        this.winAmount = 0 

        // プレイヤーのゲームの状態やアクションを表す
        // ブラックジャックの場合、最初の状態は「betting」
        // bust, double, stand, surrender, hit, 
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
    promptPlayer(userData) {
        if (userData === undefined) {
            let option = ['surrender', 'stand', 'hit', 'double'];
            if (this.gameStatus === 'betting') {
                let index = Player.getRandomInteger(option.length, 0);
                this.gameStatus = option[index];
                // doubleが選択された場合、ベット金額を2倍にした額が所持しているチップを超えていないか確認
                if (this.gameStatus === 'double' && this.chips >= this.bet * 2) {
                    this.bet *= 2;
                }
                else {
                    let index = Player.getRandomInteger(option.length -1, 0);
                    this.gameStatus = option[index];
                }
            }
            else if (this.gameStatus === 'stand') {
                let index = Player.getRandomInteger(2, 1);
                this.gameStatus = option[index];
            }
        }
        else {
            this.gameStatus = userData[0];
            this.bet = userData[1];
        }

        return new GameDecision(this.gameStatus, this.bet);
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
        
        // プレイしているゲームに応じて、プレイヤー、gamePhases、ハウスの表現が異なるかも。
        // 今回はとりあえず3人のAIプレイヤーとハウス、「betting」フェースの始まりにコミット
        this.players = [];
        // Player 初期化

        // AI 
        for (let i = 1; i <= 2; i++) {
            let aiPlayer = new Player(`AI${i}`, 'ai', this.gameType);
            aiPlayer.hand = [new Card('?',0), new Card('?',0)];
            this.players.push(aiPlayer);
        }
        // User
        let user = new Player(userName, 'user', this.gameType);
        user.hand = [new Card('?',0), new Card('?',0)];
        this.players.push(user);

        this.house = new Player('house', 'house', this.gameType);
        this.house.hand = [new Card('?',0), new Card('?',0)];

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


    evaluateMove(player) {
        let minimum = Math.min(...this.betDenominations);
        while (true) {
            let i = Math.floor(Math.random() * this.betDenominations.length);
            player.bet = this.betDenominations[i];
            if (player.bet <= player.chips || player.chips < minimum) break;
        }

        let decision = player.promptPlayer();
        if (decision.action === 'hit') {
            player.hand.push(this.deck.drawOne());
            let score = player.getHandScore();
            if (score > 21) {
                player.gameStatus = 'bust';
                // player.bet = -1 * player.bet;
                player.winAmount = -1 * player.bet;
            }
        }
        else if (decision.action === 'double' || decision.action === 'stand') {
            player.gameStatus = decision.action;
        }
        else if (decision.action === 'surrender') {
            player.gameStatus = decision.action;
            // player.bet = -1 * player.bet / 2;
            player.winAmount = -1 * player.bet / 2;
        }
    }

    /*
        return String : 新しいターンが始まる直前の全プレイヤーの状態を表す文字列
        NOTE: このメソッドの出力は、各ラウンドの終了時にテーブルのresultsLogメンバを更新するために使用
    */
    blackjackEvaluateAndGetRoundResults() {
        let houseHandScore = this.house.getHandScore();
        this.resultsLog.push(`Round ${this.roundCounter}`)
        // ハウスがブラックジャックの場合
        let playerResult = "";

        let hasHouseBlackJack = this.house.getHandScore() === 21 && this.house.hand.length === 2;
        for (let player of this.players) {
            let hasPlayerBlackJack = player.getHandScore() === 21 && player.hand.length === 2;
            if (player.gameStatus === 'surrender' || player.gameStatus === 'bust') {
                ;
            }
            else if (hasHouseBlackJack) {
                if (!hasPlayerBlackJack) {
                    player.winAmount = -1 * player.bet;
                }
                // playerがブラックジャックの場合　引き分け
                else {
                    player.winAmount = 0;
                }
            }
            else if (this.house.getHandScore() === player.getHandScore()) {
                player.winAmount = 0;
            }
            else if (this.house.gameStatus === 'bust' || player.getHandScore() > houseHandScore) {
                if (hasPlayerBlackJack) {
                    player.winAmount = player.bet * 1.5;
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
        this.gamePhase = 'betting';

        // Round 更新
        this.roundCounter++;
    }

    /*
        return null : デッキから2枚のカードを手札に加えることで、全プレイヤーの状態を更新
        NOTE: プレイヤーのタイプが「ハウス」の場合は、別の処理を行う
    */
    blackjackAssignPlayerHands(player) {
        if (player != undefined) {
            if (player.gameStatus === "betting") player.hand = [this.deck.drawOne(), this.deck.drawOne()];
        }
        if (this.house.gameStatus === "betting") this.house.hand = [this.deck.drawOne(), this.deck.drawOne()];
        while (this.house.getHandScore() < 17) {
            this.house.hand.push(this.deck.drawOne());
        }
        this.house.gameStatus = this.house.getHandScore() > 21 ? 'bust' : 'stand';
    }

    /*
        return null : テーブル内のすべてのプレイヤーの状態を更新し、手札を空の配列に、ベットを0に設定
    */
    blackjackClearPlayerHandsAndBets() {
        // broken -> chip消失したユーザー　ゲームへ参加できない
        for (let player of this.players) {
            player.hand = [new Card('?',0), new Card('?',0)];
            player.gameStatus = player.chips > 0 ? 'betting' : 'broken';
            player.bet = 0;
        }

        this.house.hand = [new Card('?',0), new Card('?',0)];
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
            this.gamePhase = 'roundOver';
        }
        else if (this.allPlayerActionsResolved()) {
            this.deck.resetDeck();
            this.deck.shuffle();
            this.gamePhase = 'evaluation';
        }
        else {
            let player = this.getTurnPlayer();
            this.blackjackAssignPlayerHands(player);
            this.evaluateMove(player);

            if (this.onLastPlayer()) {
                this.gamePhase === 'acting';
            }
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
            'broken' : true
        }
        for (let player of this.players) {
            if (hashMap[player.gameStatus] != undefined) return true;
        }
        return false;
    }
}

/**
 * MVC
 * Model -> game logic
 * View -> UI
 * Controller -> crossLink
 */


const gameList = ['Blackjack'];
const config = {
    gameDiv : document.getElementById('gameDiv'),
    gameStart : document.getElementById('game-start'),
    players : document.getElementById('players'),
    house : document.getElementById('house'),
}


// UI
class View {


    static display_none(ele) {
        ele.classList.add("d-none");
        ele.classList.remove("d-block");
    }

    static display_block(ele) {
        ele.classList.add("d-block");
        ele.classList.remove("d-none");
    }


    // option tag  
    // choose game type
    static optionTagForChoice(gameList) {
        // <div class="choose-game-type">
        //     <select class="col-12" id='options'>
        //         <option value="blackjack">Blackjack</option>
        //         <option value="poker">Poker</option>
        //     </select>
        // </div>

        let chooseGameContainer = document.createElement('div');
        chooseGameContainer.classList.add('choose-game-type');

        let selectTag = document.createElement("select");
        selectTag.classList.add('col-12');
        selectTag.name = 'choice';

        for (let game of gameList) {
            let option = `<option value="${game}">${game}</option>`
            selectTag.innerHTML += option;
        }
        
        chooseGameContainer.append(selectTag);
        return chooseGameContainer;
    }

    static initialScreen(gameList) {
        let titleAndTextArea = 
        `
            <p class="text-white text-center">Welcome to Card Game!</p>
            <form name="form1" action="">
                <input type="text" name="userName" class="col-12" placeholder="name" value="" maxlength='8'>
            </form>
        `

        let container = document.createElement('div');
        container.id = 'initial-screen';
        container.innerHTML = titleAndTextArea;

        let option = View.optionTagForChoice(gameList);

        // start button
        let btndiv = document.createElement('div');
        btndiv.classList.add('mt-2', 'd-flex', 'justify-content-center');
        let btn = `<button id='start-game' class="btn btn-success">Start Game</button>`
        btndiv.innerHTML += btn;

        container.append(option, btndiv);

        return config.gameDiv.append(container);
    }


    // Card Object card.suit card.rank
    static createCardDiv(hand) {
        // <div class="bg-white border mx-2">
        //     <div class="text-center">
        //         <img src="/img/dashboard/lessons/projects/diamond.png" alt="" width="50" height="50">
        //     </div>
        //     <div class="text-center">
        //         <p class="m-0">8</p>
        //     </div>
        // </div>
        const suitImg = {
            "H" : "https://recursionist.io/img/dashboard/lessons/projects/heart.png",
            "D" : "https://recursionist.io/img/dashboard/lessons/projects/diamond.png",
            "C" : "https://recursionist.io/img/dashboard/lessons/projects/clover.png",
            "S" : "https://recursionist.io/img/dashboard/lessons/projects/spade.png",
            "?" : "https://recursionist.io/img/questionMark.png"
        }

        let cardContainer = document.createElement('div');
        cardContainer.classList.add('d-flex', 'justify-content-center');
        for (let Card of hand) {
            let card = document.createElement('div');
            card.classList.add('bg-white', 'border', 'mx-2');
    
            let imgFrame = document.createElement('div');
            imgFrame.classList.add('text-center');
    
            imgFrame.innerHTML = `<img src="${suitImg[Card.suit]}" alt="" width="50" height="50">`
    
            let rankFrame = document.createElement('div')
            rankFrame.classList.add('text-center');
    
            let rank = Card.rank === 0 ? '?' : Card.rank;
            rankFrame.innerHTML = `<p>${rank}</p>`;
    
            card.append(imgFrame, rankFrame);
            cardContainer.append(card);
        }
        return cardContainer;
    }


    static playerDiv(position) {
        // <div id="player1" class="flex-column"></div>

        let playerDiv = document.createElement('div');
        playerDiv.id = `player${position}`;

        return playerDiv;
    }

    static userNameTag(playerName) {
        let userNameTag = document.createElement('p');
        userNameTag.classList.add('text-white', 'text-center');
        userNameTag.innerHTML = `<b>${playerName}</b>`;

        return userNameTag;
    }

    // info = ['action', 'bet', 'chip'] -> case of player
    // info = ['action'] -> case of house
    static playerInfoDiv(infoMap) {
        //     <div class="text-white d-flex flex-column align-items-center">
        //         <p class="rem1 text-left">action:BUST </p>
        //         <p class="rem1 text-left">bet:0 </p>
        //         <p class="rem1 text-left">chip:255 </p>
        //     </div>

        let playerInfoTag = document.createElement('div');
        playerInfoTag.classList.add('text-white', 'd-flex', 'flex-column', 'align-items-center');

        Object.keys(infoMap).forEach(key => {
            let p = document.createElement('p');
            p.classList.add(key);
            p.innerHTML = `${key} : ${infoMap[key]}`; 
            playerInfoTag.append(p);
        })

        return playerInfoTag;
    }

    static actionAndBetDiv() {
        let actionAndBet = document.createElement('div');
        actionAndBet.id = 'actionsAndBets';
        actionAndBet.classList.add('d-flex', 'mt-3', 'justify-content-center');

        return actionAndBet;
    }

    static actionBtn() {
        let actionAndBet = View.actionAndBetDiv();
        actionAndBet.innerHTML = '';

        let actions = 
        `
            <div id ="actionAndBet" class="d-flex">
                <div class="m-2">
                    <button class="btn btn-light">Surrender</button>
                </div>
                <div class="m-2">
                    <button class="btn btn-success">Stand</button>
                </div>
                <div class="m-2">
                    <button class="btn btn-warning">&emsp;Hit&emsp;</button>
                </div>
                <div class="m-2">
                    <button class="btn btn-danger">Double</button>
                </div>
            </div>
        `
        return actionAndBet.append(actions);
    }

    static wagerBtn(amounts) {
        /**
         *  <div class="d-flex mt-3 justify-content-center" id='actionsAndbets'>
                <div class="m-2 d-flex flex-column align-items-center bet">
                    <button type='button' class="btn btn-primary">5</button>
                    <input class="input_number mt-2" type="number" style="text-align: right;" min="0" value="0">
                </div>
                ・
                ・
                ・
         *  </div>
         */ 
        let actionAndBet = View.actionAndBetDiv();
        actionAndBet.innerHTML = '';
        for (let amount of amounts) {
            let wagerContainer = document.createElement('div');
            wagerContainer.classList.add('m-2', 'd-flex', 'flex-column', 'align-items-center', 'wager');
            wagerContainer.innerHTML = `
            <button type='button' class="btn btn-primary wager-btn">${amount}</button>
            <input class="input_number mt-2" type="number" style="text-align: right;" min="0" value="0">
            `
            actionAndBet.append(wagerContainer);
        }
        return actionAndBet;
    }

    static dealBtn() {
        let deal = document.createElement('div');
        deal.classList.add("d-flex", 'flex-column', 'align-items-center', 'mt-2');
        deal.innerHTML = 
        `       
            <div class="text-white" id="total-wager">
                <font size='5'>Total : 0</font>
            </div>
            <button type='button' class="btn btn-light bet-btn mt-2">
                <font size='5'>deal</font>
            </button>
        `
        return deal;
    }

    static renderTable(table) {
        if (table.gamePhase === 'betting') View.playerRow(table);
        if (table.getTurnPlayer().type === 'user') {
            if (table.gamePhase === 'betting') {

            }
        }
    }

    static refleshTable() {
        config.players.innerHTML = "";
        config.house.innerHTML = "";
    }

    static playerRow(table) {
        let players = table.players;

        let playersDiv = config.players;

        let userPosition = 1;
        for (let i = 1; i <= players.length; i++) {
            let status = {
                'action' : players[i-1].gameStatus,
                'chips' : players[i-1].chips,
                'bet' : players[i-1].bet
            }
            userPosition = players[i-1].type === 'user' ? i : userPosition;

            let playerStatus = View.playerInfoDiv(status);
            let row = View.playerDiv(i);
            let card = View.createCardDiv(players[i-1].hand);
            let userTag = View.userNameTag(players[i-1].name);
            row.append(userTag, playerStatus, card);
            playersDiv.append(row);
        }

        let user = document.getElementById(`player${userPosition}`)
        user.append(View.wagerBtn([5,20,50,100]), View.dealBtn());

        View.houseRow(table);
    }

    static houseRow(table) {
        let houseDiv = config.house;

        let status = {
            'action' : table.house.gameStatus,
        }
        let row = document.createElement('div');
        let playerStatus = View.playerInfoDiv(status);
        let card = View.createCardDiv(table.house.hand);
        let userTag = View.userNameTag('House');

        row.append(userTag, playerStatus, card);
        houseDiv.append(row);
    }
}


// event lisnner
class Controller {

    // return [width, height]
    static getWindowSize() {
        return [window.innerWidth, window.innerHeight];
    }

    static gameStart() {
        document.getElementById('start-game').addEventListener('click', function() {
            let userName = document.querySelector('#initial-screen form input[name="userName"]').value;
            if (userName.length === 0) {
                alert("Please enter User Name");
                return ;
            }
            let choiceGame = document.querySelector('#initial-screen .choose-game-type select[name="choice"]').value;

            // 初期画面削除
            document.getElementById('initial-screen').remove();

            let table = new Table(choiceGame, userName);
            View.display_block(config.gameStart);
            View.renderTable(table);
        })
    }

    static createIinitailScreen(gameList) {
        let windowSize = Controller.getWindowSize();
        // if (windowSize[0] < 1024 && windowSize[1] < 1366) {
        //     alert('Do not support a window size \nPlease resize a window');
        // }
        // else {
            View.initialScreen(gameList);
            Controller.gameStart();
        // }
    }

}

// config.gameDiv.append(View.createCard('H','K'));
Controller.createIinitailScreen(gameList);


// let table1 = new Table("blackjack");
// while(table1.gamePhase != 'roundOver') {
//     table1.haveTurn();

//     if (table1.gamePhase === 'evaluation') {
//         table1.blackjackEvaluateAndGetRoundResults();
//         table1.blackjackClearPlayerHandsAndBets();
//     }
// }
// console.log(table1.resultsLog);
