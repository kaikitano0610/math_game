document.addEventListener('DOMContentLoaded', function () {
    const createProblemBtn = document.getElementById('create-problem-btn');
    const solveProblemBtn = document.getElementById('solve-problem-btn');
    const backToTitleBtn1 = document.getElementById('back-to-title-btn1');
    const backToTitleBtn2 = document.getElementById('back-to-title-btn2');
    const addItemBtn = document.getElementById('add-item-btn');
    const generateProblemBtn = document.getElementById('generate-problem-btn');
    const paymentAmountInput = document.getElementById('payment-amount');
    const paymentDisplay = document.getElementById('payment-display');
    const problemFormContainer = document.getElementById('problem-form-container');
    const generatedProblem = document.getElementById('generated-problem');
    const randomProblem = document.getElementById('random-problem');
    const errorMessage = document.getElementById('error-message');

    let itemCount = 0;
    const maxItems = 5;

    // 初期化
    function resetForm() {
        problemFormContainer.innerHTML = '';
        generatedProblem.innerHTML = '';
        errorMessage.textContent = '';
        itemCount = 0;
        addItemForm();
        checkGenerateButtonState();
        // 商品追加ボタンと他の要素を初期状態に戻す
        problemFormContainer.style.display = 'block';
        addItemBtn.style.display = 'block';
        generateProblemBtn.style.display = 'block';
        paymentAmountInput.style.display = 'block'; // 支払う金額フォームを再表示
        paymentDisplay.style.display = 'block'; // 支払う金額の表示を再表示
        generateProblemBtn.disabled = true;  // ボタンを無効化する
    }

    // 画面の切り替え
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    createProblemBtn.addEventListener('click', function () {
        resetForm();  // 初期状態にリセット
        showScreen('create-problem-screen');
    });

    solveProblemBtn.addEventListener('click', function () {
        showScreen('solve-problem-screen');
        generateRandomProblem();
    });

    backToTitleBtn1.addEventListener('click', function () {
        showScreen('title-screen');
        resetForm();  // タイトルに戻るときにリセット
    });

    backToTitleBtn2.addEventListener('click', function () {
        showScreen('title-screen');
        resetForm();  // タイトルに戻るときにリセット
    });

    // 支払う金額の表示更新
    paymentAmountInput.addEventListener('input', function () {
        paymentDisplay.textContent = `${paymentAmountInput.value}円`;
        checkGenerateButtonState();
    });

    // 商品の追加
    addItemBtn.addEventListener('click', function () {
        if (itemCount < maxItems) {
            addItemForm();
        }
    });

    // 商品フォームを追加
    function addItemForm() {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <input type="text" placeholder="商品名" class="item-name">
            <input type="range" min="10" max="1000" step="5" value="10" class="item-price">
            <span class="price-display">10円</span>
            <button class="btn remove-item-btn">削除</button>
        `;
        problemFormContainer.appendChild(itemRow);
        itemCount++;

        const priceInput = itemRow.querySelector('.item-price');
        const priceDisplay = itemRow.querySelector('.price-display');
        const removeItemBtn = itemRow.querySelector('.remove-item-btn');

        priceInput.addEventListener('input', function () {
            priceDisplay.textContent = `${priceInput.value}円`;
            checkGenerateButtonState();
        });

        removeItemBtn.addEventListener('click', function () {
            itemRow.remove();
            itemCount--;
            checkGenerateButtonState();
            addItemBtn.disabled = itemCount >= maxItems;
        });

        checkGenerateButtonState();
        addItemBtn.disabled = itemCount >= maxItems;
    }

    // 問題の作成ボタンの状態確認
    function checkGenerateButtonState() {
        let totalAmount = 0;
        let allFieldsFilled = true;

        document.querySelectorAll('.item-row').forEach(itemRow => {
            const itemName = itemRow.querySelector('.item-name').value.trim();
            const itemPrice = parseInt(itemRow.querySelector('.item-price').value);
            if (itemName === '') allFieldsFilled = false;
            totalAmount += itemPrice;
        });

        if (allFieldsFilled && totalAmount < parseInt(paymentAmountInput.value)) {
            generateProblemBtn.disabled = false;
            errorMessage.textContent = '';
        } else {
            generateProblemBtn.disabled = true;
            if (!allFieldsFilled) {
                errorMessage.textContent = '商品名、金額を順番に入力してください。';
            } else if (totalAmount >= parseInt(paymentAmountInput.value)) {
                errorMessage.textContent = '支払う金額は商品の合計額より多くする必要があります。';
            } else {
                errorMessage.textContent = '';
            }
        }
    }

    // 問題を作成
    generateProblemBtn.addEventListener('click', function () {
        const paymentAmount = parseInt(paymentAmountInput.value);
        let totalAmount = 0;
        let problemText = '';
        let detailedTotal = '(';

        document.querySelectorAll('.item-row').forEach(itemRow => {
            const itemName = itemRow.querySelector('.item-name').value;
            const itemPrice = parseInt(itemRow.querySelector('.item-price').value);
            totalAmount += itemPrice;
            problemText += `${itemPrice}円の${itemName}と`;
            detailedTotal += `${itemPrice}+`;
        });

        detailedTotal = detailedTotal.slice(0, -1) + ')';
        problemText = problemText.slice(0, -1) + `を買います。${paymentAmount}円を出すとお釣りはいくらですか？`;
        generatedProblem.innerHTML = `<p>${problemText}</p><input type="text" id="answer-input"><button id="check-answer-btn" class="btn">答えを確認</button>`;

        // 入力フォームやボタンを非表示にする
        problemFormContainer.style.display = 'none';
        addItemBtn.style.display = 'none';
        generateProblemBtn.style.display = 'none';
        
        // 支払う金額フォームと表示も非表示にする
        paymentAmountInput.style.display = 'none';
        // paymentDisplay.style.display = 'none';

        const checkAnswerBtn = document.getElementById('check-answer-btn');
        checkAnswerBtn.addEventListener('click', function () {
            const answerInput = document.getElementById('answer-input');
            const userAnswer = parseInt(answerInput.value);
            const correctAnswer = paymentAmount - totalAmount;

            if (userAnswer === correctAnswer) {
                generatedProblem.innerHTML = `<p>${problemText}</p><p>正解です！ (${paymentAmount} - ${detailedTotal} = ${correctAnswer}) よって、お釣りは${correctAnswer}円です。</p>`;
            } else {
                generatedProblem.innerHTML = `<p>${problemText}</p><p>不正解です。 (${paymentAmount} - ${detailedTotal} = ${correctAnswer}) よって、お釣りは${correctAnswer}円です。</p>`;
            }
        });
    });


    // ランダム問題の生成
    function generateRandomProblem() {
        const randomItems = [
            // 食料品
            { name: 'りんご', price: 100 },
            { name: 'バナナ', price: 80 },
            { name: 'オレンジ', price: 120 },
            { name: 'ぶどう', price: 200 },
            { name: 'トマト', price: 90 },
            { name: 'きゅうり', price: 70 },
            { name: 'にんじん', price: 50 },
            { name: 'じゃがいも', price: 60 },
            { name: 'たまねぎ', price: 40 },
            { name: 'キャベツ', price: 150 },
            { name: 'ほうれんそう', price: 130 },
            { name: '牛乳', price: 150 },
            { name: 'ヨーグルト', price: 100 },
            { name: '食パン', price: 110 },
            { name: 'チーズ', price: 180 },
            { name: 'ハム', price: 200 },
            { name: '卵', price: 120 },
            { name: 'りんごジュース', price: 140 },
            { name: 'コーンフレーク', price: 300 },
            { name: 'チョコレート', price: 90 },
            
            // 文房具
            { name: 'ノート', price: 100 },
            { name: '鉛筆', price: 30 },
            { name: '消しゴム', price: 50 },
            { name: 'シャープペンシル', price: 200 },
            { name: '定規', price: 120 },
            { name: 'クレヨン', price: 150 },
            { name: '色鉛筆', price: 300 },
            { name: 'はさみ', price: 180 },
            { name: 'のり', price: 60 },
            { name: 'ホッチキス', price: 250 },
            
            // 雑貨
            { name: 'ハンカチ', price: 100 },
            { name: 'ティッシュ', price: 80 },
            { name: 'タオル', price: 200 },
            { name: '水筒', price: 500 },
            { name: '弁当箱', price: 400 },
            { name: 'マグカップ', price: 300 },
            { name: '時計', price: 700 },
            { name: '傘', price: 600 },
            { name: 'ランチマット', price: 150 },
            { name: 'リュックサック', price: 1000 },
            { name: 'スリッパ', price: 300 },
            { name: '靴下', price: 120 },
            { name: '帽子', price: 400 },
            { name: 'ぬいぐるみ', price: 800 },
            { name: '絵本', price: 500 },
            { name: 'おもちゃの車', price: 350 },
            { name: 'ボール', price: 200 },
            { name: '縄跳び', price: 150 },
            { name: 'けん玉', price: 300 },
            { name: '折り紙', price: 50 }
        ];
        

        let selectedItems = [];
        let itemCount = Math.floor(Math.random() * 4) + 2; // 2〜5個の商品をランダムに選択
        let totalAmount = 0;
        let problemText = '';
        let detailedTotal = '(';

        for (let i = 0; i < itemCount; i++) {
            const randomItem = randomItems[Math.floor(Math.random() * randomItems.length)];
            selectedItems.push(randomItem);
            totalAmount += randomItem.price;
            problemText += `${randomItem.price}円の${randomItem.name}と`;
            detailedTotal += `${randomItem.price}+`;
        }

        detailedTotal = detailedTotal.slice(0, -1) + ')';
        const paymentAmount = Math.ceil((totalAmount + 100) / 100) * 100; // 合計金額より多い金額を生成
        problemText = problemText.slice(0, -1) + `を買います。${paymentAmount}円を出すとお釣りはいくらですか？`;

        randomProblem.innerHTML = `<p>${problemText}</p><input type="text" id="random-answer-input"><button id="check-random-answer-btn" class="btn">答えを確認</button>`;

        const checkRandomAnswerBtn = document.getElementById('check-random-answer-btn');
        checkRandomAnswerBtn.addEventListener('click', function () {
            const answerInput = document.getElementById('random-answer-input');
            const userAnswer = parseInt(answerInput.value);
            const correctAnswer = paymentAmount - totalAmount;

            if (userAnswer === correctAnswer) {
                randomProblem.innerHTML = `<p>${problemText}</p><p>正解です！ (${paymentAmount} - ${detailedTotal} = ${correctAnswer}) よって、お釣りは${correctAnswer}円です。</p>`;
            } else {
                randomProblem.innerHTML = `<p>${problemText}</p><p>不正解です。 (${paymentAmount} - ${detailedTotal} = ${correctAnswer}) よって、お釣りは${correctAnswer}円です。</p>`;
            }
        });
    }

    // 初期状態でフォームを一つ表示
    addItemForm();
});
