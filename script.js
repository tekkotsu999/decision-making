class Criterion {
    constructor(name, order) {
        this.name = name;
        this.order = order;   // 順位
        this.weight = 0;  // 初期重みは0
        this.alternatives = [];  // 各クライテリアに対応する代替案のリスト
    }

    addAlternative(alternative) {
        this.alternatives.push(alternative);
    }

    // criterionのウェイト更新
    calculateWeight(totalOrderSum) {
        this.weight = this.findReversedValueFromTotal(totalOrderSum, this.order) / totalOrderSum;
        this.calculateAlternativesWeights();    // 各Alternativeのウェイトも更新
    }

    calculateAlternativesWeights() {
        const totalOrderSum = this.alternatives.reduce((sum, alt) => sum + alt.order, 0);
        this.alternatives.forEach(alt => {
            alt.weight = this.findReversedValueFromTotal(totalOrderSum, alt.order) / totalOrderSum;
            alt.calculateScore(this.weight);  // ここで各alternativeのスコアを計算
        });
    }
    
    // orderとtotalOrderSumから、順位を逆順にした場合の値を解く
    findReversedValueFromTotal(total, a) {
        let n = this.findNFromTotal(total); //totalから、数列の最大値nを求める
        if (n === -1 || a < 1 || a > n) {
            return null; // 無効な入力値
        }
        // 逆からa番目の値は、n-a+1
        let valueAtA = n - a + 1;
        return valueAtA;
    }
    
    findNFromTotal(total) {
        // 二次方程式 n^2 + n - 2*total = 0 を解く
        let discriminant = 1 + 8 * total;
        if (discriminant < 0) {
            return -1; // 解なし
        }
        let n = Math.floor((-1 + Math.sqrt(discriminant)) / 2);
        return n;
    }
}

class Alternative {
    constructor(name, order) {
        this.name = name;
        this.order = order;
        this.weight = 0;  // 初期重みは0
        this.score = 0;   // スコアの初期値
    }

    calculateWeight(totalOrderSum) {
        this.weight = this.order / totalOrderSum;
    }
    
    calculateScore(criterionWeight) {
        this.score = this.weight * criterionWeight;  // スコアを計算
    }
}

class AHPApp {
    constructor() {
        this.leftPanel = document.getElementById('left-panel');
        this.rightPanel = document.getElementById('right-panel');
        this.criteria = [];
        this.alternatives = [];
    }

    // テキストエリアに入っている文字列から、criteriaとalternativesにデータを格納する関数を更新
    parseInput(criteriaInput, alternativesInput) {
        const criteriaItems = criteriaInput.split('\n').map(item => item.trim()).filter(item => item.length > 0);
        
        const alternativeItems = alternativesInput.split('\n').map(item => item.trim()).filter(item => item.length > 0);

        this.criteria = criteriaItems.map((name, index) => new Criterion(name, index + 1));
        this.alternatives = alternativeItems.map((name, index) => new Alternative(name, index + 1));

        // 各クライテリアに代替案を追加
        this.criteria.forEach(criterion => {
            this.alternatives.forEach(alt => criterion.addAlternative(new Alternative(alt.name, alt.order)));
        });

        // 各criterionの重みと、代替案のスコアを計算
        const totalOrderSum = this.criteria.reduce((sum, criterion) => sum + criterion.order, 0);
        this.criteria.forEach(criterion => criterion.calculateWeight(totalOrderSum));
    }


    // デバッグ用関数: 各クライテリアとその代替案のリストを出力
    debugCriteria() {
        console.log("Debugging Criteria and Alternatives:");
        this.criteria.forEach(criterion => {
            console.log(`  Criterion: ${criterion.name}, Order: ${criterion.order}`);
            criterion.alternatives.forEach(alternative => {
                console.log(`    - Alternative: ${alternative.name}, Order: ${alternative.order}, Weight: ${alternative.weight}`);
            });
        });
    }

    // ***** UIをセットアップするメソッド *****
    // ドラッグアンドドロップで入れ替えが行われるたびに実行される
    setupUI() {
        this.leftPanel.innerHTML = ''; // 左側のパネルをクリア
        this.rightPanel.innerHTML = ''; // 左側のパネルをクリア

        // クライテリアのリストを設定
        const crList = this.createList('「評価基準」の順位：', this.criteria, false);

        this.leftPanel.appendChild(crList);
        this.setupDraggableList(crList, this.criteria, false);
        
        // 各クライテリアごとに代替案のリストを設定 
        this.criteria.forEach(criterion => { 
            const alList = this.createList("評価基準「" + criterion.name + "」での順位：", criterion.alternatives, true); 
            this.leftPanel.appendChild(alList);
            this.setupDraggableList(alList, criterion.alternatives, true); 
        }); 
        
        // グラフの凡例を表示
        this.displayLegend(this.criteria, this.rightPanel);
        
        // すべてのalternativeの最終スコアを表示
        this.displayAllAlternativesFinalScores(this.rightPanel);
 
        // this.debugCriteria();
    }


    // リストを生成するメソッド
    createList(title, items, isAlternativeList) {
        const ul = document.createElement('ol');
        ul.className = 'sortable-list';
        ul.dataset.listType = isAlternativeList ? 'alternatives' : 'criteria';

        const header = document.createElement('ul');
        header.className = 'list-title';
        header.textContent = title;
        ul.appendChild(header);

        // orderの最小値から最大値までループ
        for (let order_ = 1; order_ <= items.length; order_++) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].order === order_) {
                    const li = document.createElement('li');
                    li.className = 'draggable';
                    li.draggable = true;
                    
                    // アイテムの名前、順序、および重みを表示する
                    const displayText = isAlternativeList ?
                        `${items[i].name}`:  // - Weight: ${items[i].weight.toFixed(3)}, Score: ${items[i].score.toFixed(4)}` :
                        `${items[i].name}`;  // - Weight: ${items[i].weight.toFixed(3)}`;
                    li.textContent = displayText;
                    
                    li.dataset.index = i;  // ここでindexを設定
                    ul.appendChild(li);
                    break;  // 見つかったら内側のループを抜ける
                }
            }
        }
        return ul;
    }

    // ***** ドラッグ可能なリストをセットアップするメソッド *****
    setupDraggableList(list, items, isAlternativeList) {
        list.addEventListener('dragstart', e => {
            if (e.target.className.includes('draggable')) {
                e.target.classList.add('dragging');
            }
        });

       list.addEventListener('dragover', e => {
            e.preventDefault();
            const dragging = list.querySelector('.dragging');
            const afterElement = this.getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                list.appendChild(dragging);
            } else {
                list.insertBefore(dragging, afterElement);
            }
        });

        list.addEventListener('dragend', e => {
            e.target.classList.remove('dragging');
            this.updateOrderAndWeights(list, items, isAlternativeList);
        });
    }

    getDragAfterElement(list, y) {
        const draggableElements = [...list.querySelectorAll('.draggable:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;  // 中心からの距離を計算
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };  // 最も近い要素を返す
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;  // 最も近い要素を特定
    }

    // ***** ドラッグ終了後の要素の順番を更新、各アイテムのweightを計算 *****
    updateOrderAndWeights(list, items, isAlternativeList) {        
        // ドラッグ終了後の要素の順番を読み取り、それに基づいてorderを更新
        const draggableItems = Array.from(list.querySelectorAll('.draggable'));
        draggableItems.forEach((item, index) => {
            const original = items[parseInt(item.dataset.index)];  // 元々のアイテムのインデックスを取得
            original.order = index + 1;  // 新しい順序でorderを更新
        });

        // 全アイテムの合計orderを計算し、各アイテムのweightを再計算
        const totalOrderSum = items.reduce((sum, item) => sum + item.order, 0);
        items.forEach(item => item.calculateWeight(totalOrderSum));  // weightを更新

        // クライテリアの代替案の重みも再計算する必要がある場合
        if (isAlternativeList) {
            const fullTitle = list.querySelector('.list-title').textContent;
            const criterionName = fullTitle.slice(5, -6); // "評価基準「" と "」での順位：" を削除（邪道な方法な気がするから、後で根本的に修正したい）
            const criterion = this.criteria.find(c => c.name === criterionName);
            criterion.calculateAlternativesWeights();
        }
        this.setupUI();  // UIをセットアップしなおす
        // console.log("Order and weights updated.");
    }
    
    
    // 最終スコア表示部分に凡例を追加する関数
    displayLegend(criteria, container) {
        const legend = document.createElement('div');
        legend.className = 'legend';
        legend.style.display = 'flex';
        legend.style.justifyContent = 'space-around';
        legend.style.padding = '10px';
        legend.style.backgroundColor = '#f0f0f0';
        legend.style.marginTop = '10px';

        criteria.forEach((criterion, index) => {
            const entry = document.createElement('div');
            const colorBox = document.createElement('div');
            colorBox.style.width = '20px';
            colorBox.style.height = '20px';
            colorBox.style.backgroundColor = this.getColorForCriterion(index);
            colorBox.style.display = 'inline-block';
            colorBox.style.marginRight = '5px';

            const text = document.createElement('span');
            text.textContent = criterion.name;
            text.style.verticalAlign = 'middle';

            entry.appendChild(colorBox);
            entry.appendChild(text);
            legend.appendChild(entry);
        });

        container.appendChild(legend);  // コンテナに凡例を追加
    }
    
    displayAllAlternativesFinalScores(container) {
        const alternativeScores = this.calculateAllAlternativesFinalScores();  // 各alternativeの最終スコアを計算
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'alternatives-final-scores';

        // 各alternativeの合計スコアを計算
        const scoresArray = Array.from(alternativeScores).map(([name, scoresMap]) => ({
            name,
            totalScore: Array.from(scoresMap.values()).reduce((sum, score) => sum + score, 0),
            scoresMap
        }));

        // スコアが大きい順にソート
        scoresArray.sort((a, b) => b.totalScore - a.totalScore);

        // 最高スコアを計算してグラフのスケールを正規化する
        const maxScore = Math.max(...scoresArray.map(item => item.totalScore));

        // ソートされた順に各alternativeのスコアをグラフで表示
        scoresArray.forEach(({ name, scoresMap }) => {
            const scoreEntry = document.createElement('div');
            const bar = document.createElement('div');
            bar.className = 'bar';
            let totalWidth = 0;

            Array.from(scoresMap).forEach(([criterionName, score], index) => {
                const segment = document.createElement('div');
                segment.className = `bar-segment criterion-${index + 1}`; // 色を割り当てるためのクラス
                segment.style.backgroundColor = this.getColorForCriterion(index); // 色を動的に割り当てる関数を呼び出す
                const width = (score / maxScore) * 80;
                segment.style.width = `${width}%`;
                segment.textContent = `${criterionName}: ${score.toFixed(3)}`; // クライテリア名とスコアを表示
                segment.textContent = `${score.toFixed(3)}`; // クライテリア名とスコアを表示
                totalWidth += width;
                bar.appendChild(segment);
            });

            const label = document.createElement('div');
            label.textContent = `${name}`;
            label.style.padding = '5px';
            label.style.backgroundColor = '#f0f0f0';

            scoreEntry.appendChild(label);
            scoreEntry.appendChild(bar);
            scoreDisplay.appendChild(scoreEntry);
        });

        container.appendChild(scoreDisplay);  // 最終スコアをコンテナに追加
    }


    getColorForCriterion(index) {
        // 色を定義した配列から色を取得する（ここで色の配列を定義する）
        const colors = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD', '#E9967A', '#7B68EE', '#3CB371', '#FFA500', '#DA70D6'];
        return colors[index % colors.length];
    }

    
    // ***** 最終scoreの計算 *****
    calculateAllAlternativesFinalScores() {
        const alternativeScores = new Map();  // alternativeの名前をキーとしたMap

        // すべてのクライテリアとその代替案のスコアを集計
        this.criteria.forEach(criterion => {
            criterion.alternatives.forEach(alt => {
                if (!alternativeScores.has(alt.name)) {
                    alternativeScores.set(alt.name, new Map());
                }
                const scoresByCriterion = alternativeScores.get(alt.name);
                scoresByCriterion.set(criterion.name, alt.score);
            });
        });

        return alternativeScores;
    }
}

// ***** AHPAppの初期化関数 *****
function initializeApp() {
    const criteriaInput = document.getElementById('criteria-lists-input').value;
    const alternativesInput = document.getElementById('alternative-lists-input').value;
    //app.parseInput(document.getElementById('lists-input').value);
    app.parseInput(criteriaInput, alternativesInput);
    app.setupUI();
}

// ***** データ保存関数 *****
// seveDataButtonクリックのイベントリスナー定義
const saveDataButton = document.getElementById('saveDataButton');
saveDataButton.addEventListener('click', async () => {
    const data = {
        criteria: app.criteria,
        alternatives: app.alternatives
    };
    const result = await window.electronAPI.saveFileDialog(data);
    if (result.success) {
        console.log('File saved to:', result.path);
    } else {
        console.log('File save canceled or failed');
    }
});

// ***** ファイル読み込み処理 *****
// loadDataButtonクリックのイベントリスナー定義
const loadDataButton = document.getElementById('loadDataButton');
loadDataButton.addEventListener('click', async () => {
    // electronと通信
    // ファイルダイアログを使って、読み込む対象のファイルパスを取得
    const result = await window.electronAPI.openFileDialog();
    if (result.success) {
        // そのファイルパスのデータを読み込む
        // electronに、そのデータの内容のロードをリクエスト
        window.electronAPI.loadData(result.path);
    } else {
        console.log('No file selected');
    }
});

// electronからロードデータを取得する（非同期処理）
window.electronAPI.receiveLoadDataResponse((event, { success, message, data }) => {
    if (success) {
        console.log('Data loaded:', data);

        // Criterion と Alternative オブジェクトを再構築
        app.criteria = data.criteria.map(c => {
            let criterion = new Criterion(c.name, c.order);
            criterion.weight = c.weight;
            criterion.alternatives = c.alternatives.map(a => {
                let alternative = new Alternative(a.name, a.order);
                alternative.weight = a.weight;
                alternative.score = a.score;
                return alternative;
            });
            return criterion;
        });

        // Alternative オブジェクトは独立しているので別途構築
        app.alternatives = data.alternatives.map(a => new Alternative(a.name, a.order));

        // UI 更新
        app.setupUI();

    } else {
        console.error('Failed to load data:', message);
    }
});


// ***** script.jsの実行処理 *****
const app = new AHPApp();
