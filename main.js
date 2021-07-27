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
        return Number : カードのランクを基準とした整数のスコア。
        
        2-10はそのまま数値を返します。
    　  {"J", "Q", "K"}を含む、フェースカードは10を返します。
        "A」が1なのか11なのかを判断するには手札全体の知識が必要なので、「A」はとりあえず11を返します。
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
        // ゲームタイプによって、カードを初期化してください。

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
    カードがランダムな順番になるようにデッキをシャッフル。
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
    return Card : ポップされたカードを返します。
    カード配列から先頭のカード要素をポップして返します。
*/
    drawOne(){
        return this.cards.pop();
    }
}


class Player {
    /*
        String name : プレイヤーの名前
        String type : プレイヤータイプ。{'ai', 'user', 'house'}から選択。
        String gameType : {'blackjack'}から選択。プレイヤーの初期化方法を決定するために使用されます。
        ?Number chips : ゲーム開始に必要なチップ。デフォルトは400。
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

        // プレイヤーが所持しているチップ。
        this.chips = chips;

        // 現在のラウンドでのベットしているチップ
        this.bet = 0

        // 勝利金額。正の数にも負の数にもなります。
        this.winAmount = 0 

        // プレイヤーのゲームの状態やアクションを表します。
        // ブラックジャックの場合、最初の状態は「betting」です。
        // bust, double, stand, surrender, hit, 
        this.gameStatus = 'betting' 

    }

/*
    Number userData : モデル外から渡されるパラメータ。nullになることもあります。
    return GameDecision : 状態を考慮した上で、プレイヤーが行った決定。

    このメソッドは、どのようなベットやアクションを取るべきかというプレイヤーの決定を取得します。プレイヤーのタイプ、ハンド、チップの状態を読み取り、GameDecisionを返します。パラメータにuserData使うことによって、プレイヤーが「user」の場合、このメソッドにユーザーの情報を渡すことができますし、プレイヤーが 「ai」の場合、 userDataがデフォルトとしてnullを使います。
*/
    promptPlayer(userData) {
        if (userData === undefined) {
            let option = ['surrender', 'stand', 'hit', 'double'];
            if (this.gameStatus === 'betting') {
                let index = Math.floor(Math.random() * option.length);
                this.gameStatus = option[index];
                // doubleが選択された場合、ベット金額を2倍にした額が所持しているチップを超えていないか確認
                if (this.gameStatus === 'double' && this.chips >= this.bet * 2) {
                    this.bet *= 2;
                }
                else {
                    let index = Math.floor(Math.random() * (option.length - 1));
                    this.gameStatus = option[index];
                }
            }
            else if (this.gameStatus === 'stand') {
                let index = Math.floor(Math.random() * (2 - 1) + 1);
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

    合計が21を超える場合、手札の各エースについて、合計が21以下になるまで10を引きます。
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
    String action : プレイヤーのアクションの選択。（ブラックジャックでは、hit、standなど。）
    Number amount : プレイヤーがベットする数値。

    これはPlayer.promptPlayer()は常にreturnする、標準化されたフォーマットです。
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
        String gameType : {"blackjack"}から選択。
        Array betDenominations : プレイヤーが選択できるベットの単位。デフォルトは[5,20,50,100]。
        return Table : ゲームフェーズ、デッキ、プレイヤーが初期化されたテーブル
    */
    constructor(gameType, betDenominations = [5,20,50,100]) {
        // ゲームタイプを表します。
        this.gameType = gameType;
        
        // プレイヤーが選択できるベットの単位。
        this.betDenominations = betDenominations;
        
        // テーブルのカードのデッキ
        this.deck = new Deck(this.gameType);
        
        // プレイしているゲームに応じて、プレイヤー、gamePhases、ハウスの表現が異なるかもしれません。
        // 今回はとりあえず3人のAIプレイヤーとハウス、「betting」フェースの始まりにコミットしましょう。
        this.players = [];
        // Player 初期化
        for (let i = 0; i < 3; i++) {
            this.players.push(new Player(`AI${i+1}`, 'ai', this.gameType));
        }
        this.house = new Player('house', 'house', this.gameType);

        // {'betting', 'acting', 'roundOver', gameOver'} 
        this.gamePhase = 'betting'

        // これは各ラウンドの結果をログに記録するための文字列の配列です。
        this.resultsLog = [];

        this.turnCounter = 0;
        
        // round counter
        this.roundCounter = 1;
    }
    /*
        Player player : テーブルは、player.promptPlayer()を使用してGameDecisionを取得し、GameDecisionとgameTypeに応じてPlayerの状態を更新します。
        return Null : このメソッドは、プレーヤの状態を更新するだけです。

        EX:
        プレイヤーが「ヒット」し、手札が21以上の場合、gameStatusを「バスト」に設定し、チップからベットを引きます。
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
                player.winAmount = -1 * player.bet;
            }
        }
        else if (decision.action === 'double' || decision.action === 'stand') {
            player.gameStatus = decision.action;
        }
        else if (decision.action === 'surrender') {
            player.gameStatus = 'surrender';
            player.winAmount = -1 * player.bet / 2;
        }
    }

    /*
        return String : 新しいターンが始まる直前の全プレイヤーの状態を表す文字列。
        NOTE: このメソッドの出力は、各ラウンドの終了時にテーブルのresultsLogメンバを更新するために使用。
    */
    blackjackEvaluateAndGetRoundResults() {
        let houseHandScore = this.house.getHandScore();
        this.resultsLog.push(`Round ${this.roundCounter}`)
        // ハウスがブラックジャックの場合
        for (let player of this.players) {
            let hasPlayerBlackJack = player.getHandScore() === 21 && player.hand.length === 2;
            let hasHouseBlackJack = this.house.getHandScore() === 21 && this.house.hand.length === 2;
            if (hasHouseBlackJack) {
                if (!hasPlayerBlackJack) {
                    if (player.gameStatus === 'double') {
                        player.winAmount = -1 * player.bet * 2;
                    }
                    else if (player.gameStatus === 'stand') {
                        player.winAmount = -1 * player.bet;
                    }
                }
                // playerがブラックジャックの場合　引き分け
                else {
                    player.winAmount = 0;
                }
            }
            else if (this.house.gameStatus === 'bust' || player.getHandScore() > houseHandScore) {
                if (hasPlayerBlackJack) {
                    player.winAmount = player.bet * 1.5;
                }
                else if (player.gameStatus === 'double') {
                    player.winAmount = player.bet * 2;
                }
                else if (player.gameStatus === 'stand') {
                    player.winAmount = player.bet;
                }
            }
            else if (this.house.gameStatus != 'bust' && houseHandScore > player.getHandScore()) {
                if (player.gameStatus === 'double') {
                    player.winAmount = -1 * player.bet * 2;
                }
                else if (player.gameStatus === 'stand') {
                    player.winAmount = -1 * player.bet;
                }
            }
            
            
            let playerInfo = `name : ${player.name}, action : ${player.gameStatus}, winAmount : ${player.winAmount}, chips : ${player.chips}, bet ${player.bet}`;
            // 各プレイヤーの結果ログ　userName, final Action, winAmount
            this.resultsLog.push(playerInfo);

            // chipの更新
            player.chips += player.winAmount;
        }
        this.gamePhase = 'betting';

        // Round 更新
        this.roundCounter++;
    }

    /*
        return null : デッキから2枚のカードを手札に加えることで、全プレイヤーの状態を更新します。
        NOTE: プレイヤーのタイプが「ハウス」の場合は、別の処理を行う必要があります。
    */
    blackjackAssignPlayerHands() {
        this.deck.resetDeck();
        this.deck.shuffle();
        for (let player of this.players) {
            // 各プレイヤー2枚ずつ
            player.hand = [this.deck.drawOne(), this.deck.drawOne()];
        }

        this.house.hand = [this.deck.drawOne(), this.deck.drawOne()];
        while (this.house.getHandScore() < 17) {
            this.house.hand.push(this.deck.drawOne());
        }
        this.house.gameStatus = this.house.getHandScore() > 21 ? 'bust' : 'stand';
    }

    /*
        return null : テーブル内のすべてのプレイヤーの状態を更新し、手札を空の配列に、ベットを0に設定します。
    */
    blackjackClearPlayerHandsAndBets() {
        // broken -> chip消失したユーザー　ゲームへ参加できない
        for (let player of this.players) {
            player.hand = [];
            player.gameStatus = player.chips > 0 ? 'betting' : 'broken';
            player.bet = 0;
        }

        this.house.hand = [];
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
        return Null : このメソッドはテーブルの状態を更新するだけで、値を返しません。
    */
    haveTurn(userData) {
        if (this.allPlayerActionsBroken()) {
            this.gamePhase = 'roundOver';
        }
        else if (this.allPlayerActionsResolved()) {
            this.gamePhase = 'acting';
        }
        else {
            this.blackjackAssignPlayerHands();
            let player = this.getTurnPlayer();
            this.evaluateMove(player);
        }
        this.turnCounter++;
    }

    /*
        return Boolean : テーブルがプレイヤー配列の最初のプレイヤーにフォーカスされている場合はtrue、そうでない場合はfalseを返します。
    */
    onFirstPlayer() {
        let numberOfPlayers = this.players.length;
        return this.turnCounter % numberOfPlayers === 0 ? true : false;
    }

    /*
        return Boolean : テーブルがプレイヤー配列の最後のプレイヤーにフォーカスされている場合はtrue、そうでない場合はfalseを返します。
    */
    onLastPlayer() {
        let numberOfPlayers = this.players.length;
        return this.turnCounter % numberOfPlayers === numberOfPlayers ? true : false;
    }
    
    /*
        全てのプレイヤーがセット{'broken', 'bust', 'stand', 'surrender'}のgameStatusを持っていればtrueを返し、持っていなければfalseを返します。
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


let table1 = new Table('blackjack');
while(table1.gamePhase != 'roundOver') {
    table1.haveTurn();

    if (table1.gamePhase === 'acting') {
        table1.blackjackEvaluateAndGetRoundResults();
        table1.blackjackClearPlayerHandsAndBets();
        table1.blackjackAssignPlayerHands();
    }
}
console.log(table1.resultsLog);

/**
 * MVC
 * Model -> game logic
 * View -> UI
 * Controller -> crossLink
 */


const gameList = ['Blackjack'];
const config = {
    gameDiv : document.getElementById('gameDiv'),
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
    static createOptionTagForChoiceGame(gameList) {
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

        for (let game of gameList) {
            let option = `<option value="${game}">${game}</option>`
            selectTag.innerHTML += option;
        }
        
        chooseGameContainer.appendChild(selectTag);
        return chooseGameContainer;
    }

    static createButton(btnName, btnColor) {
        // <div class="mt-2 d-flex justify-content-center">
        //     <a href="" class="btn btn-success">Start Game</a>
        // </div>
        let div = document.createElement('div');
        div.classList.add('mt-2', 'd-flex', 'justify-content-center');

        let btn = `<a href="" class="btn ${btnColor}">${btnName}</a>`

        div.innerHTML += btn;
        return div;
    }



    static initialScreen(gameList, btnName, btnColor) {
        let titleAndTextArea = 
        `
            <p class="text-white text-center"> Welcome to Card Game! </p>
            <div class="name-field">
                <input type="text" class="col-12" placeholder="name">
            </div>
        `

        let container = document.createElement('div');
        container.id = 'initial-screen';
        container.innerHTML = titleAndTextArea;

        let option = this.createOptionTagForChoiceGame(gameList);
        let btn = this.createButton(btnName, btnColor);

        container.appendChild(option);
        container.appendChild(btn);

        config.gameDiv.appendChild(container);
    }
}


// event lisnner
class Controller {

    

}


View.initialScreen(gameList, 'StartGame', 'btn-success');
