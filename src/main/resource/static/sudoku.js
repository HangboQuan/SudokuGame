// 数独游戏状态
let sudokuBoard = [];
let originalBoard = [];
let selectedCell = null;
let selectedNumber = null;
let timerInterval = null;
let startTime = null;
let elapsedSeconds = 0;

// DOM 元素
const boardElement = document.getElementById('sudokuBoard');
const newGameBtn = document.getElementById('newGameBtn');
const startGameBtn = document.getElementById('startGameBtn');
const difficultySelect = document.getElementById('difficulty');
const messageDiv = document.getElementById('message');
const timerElement = document.getElementById('timer');
const numButtons = document.querySelectorAll('.num-btn');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，开始初始化...');
    setupEventListeners();
    // 先渲染一个空面板
    renderEmptyBoard();
    // 然后加载游戏
    initializeGame();
});

// 设置事件监听器
function setupEventListeners() {
    newGameBtn.addEventListener('click', () => {
        const difficulty = difficultySelect.value;
        generateNewGame(difficulty);
    });

    // 难度切换时，相当于点击新游戏
    difficultySelect.addEventListener('change', () => {
        const difficulty = difficultySelect.value;
        generateNewGame(difficulty);
    });

    startGameBtn.addEventListener('click', () => {
        if (!timerInterval) {
            startTimer();
            startGameBtn.disabled = true;
            startGameBtn.textContent = '游戏中';
            showMessage('游戏开始！加油！', 'info');
        }
    });

    numButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const num = parseInt(btn.dataset.num);
            selectNumber(num);
        });
    });
}

// 初始化游戏
function initializeGame() {
    generateNewGame('medium');
}

// 渲染空面板（用于初始化显示）
function renderEmptyBoard() {
    if (!boardElement) {
        console.error('boardElement 不存在！');
        return;
    }
    
    boardElement.innerHTML = '';
    console.log('开始渲染空面板...');
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // 添加3x3网格的边框样式
            if (j === 2 || j === 5) {
                cell.style.borderRight = '3px solid #1a252f';
            }
            if (i === 2 || i === 5) {
                cell.style.borderBottom = '3px solid #1a252f';
            }
            
            cell.addEventListener('click', () => selectCell(i, j));
            boardElement.appendChild(cell);
        }
    }
    console.log('空面板渲染完成，共创建了', boardElement.children.length, '个单元格');
}

// 生成新游戏
async function generateNewGame(difficulty = 'medium') {
    console.log('开始生成新游戏，难度:', difficulty);
    
    try {
        const apiUrl = `/api/sudoku/generate?difficulty=${difficulty}`;
        console.log('请求URL:', apiUrl);
        console.log('发送fetch请求...');
        console.log('当前时间:', new Date().toISOString());
        
        // 添加超时处理
        const timeout = 30000; // 30秒超时
        const fetchStartTime = Date.now();
        let response;
        
        try {
            const fetchPromise = fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('请求超时，超过30秒未响应')), timeout);
            });
            
            console.log('等待响应（最多30秒）...');
            response = await Promise.race([fetchPromise, timeoutPromise]);
            const fetchDuration = Date.now() - fetchStartTime;
            console.log(`✅ fetch请求完成，耗时: ${fetchDuration}ms`);
            console.log('Response对象:', response);
        } catch (fetchError) {
            const fetchDuration = Date.now() - fetchStartTime;
            console.error(`❌ fetch请求失败，耗时: ${fetchDuration}ms`);
            console.error('fetch错误名称:', fetchError.name);
            console.error('fetch错误消息:', fetchError.message);
            console.error('fetch错误堆栈:', fetchError.stack);
            console.error('完整fetch错误:', fetchError);
            
            // 检查是否是网络错误
            if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
                console.error('这可能是网络连接问题，请检查：');
                console.error('1. 后端服务是否已启动？');
                console.error('2. 后端服务是否在正确的端口运行？');
                console.error('3. 浏览器控制台的Network标签是否有错误？');
            }
            
            throw fetchError;
        }
        console.log('API响应状态:', response.status, response.statusText);
        console.log('响应头:', response.headers);
        console.log('Content-Type:', response.headers.get('content-type'));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ HTTP错误响应内容:', errorText);
            throw new Error(`HTTP错误! 状态: ${response.status}, 内容: ${errorText}`);
        }
        
        console.log('开始解析JSON响应...');
        const responseText = await response.text();
        console.log('响应原始文本:', responseText);
        console.log('响应文本长度:', responseText.length);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('✅ JSON解析成功');
        } catch (parseError) {
            console.error('❌ JSON解析失败:', parseError);
            console.error('尝试解析的内容:', responseText);
            throw new Error('JSON解析失败: ' + parseError.message);
        }
        console.log('========== API返回的完整数据 ==========');
        console.log('完整响应:', JSON.stringify(data, null, 2));
        console.log('========================================');
        
        if (data.success && data.board) {
            sudokuBoard = data.board;
            
            // 打印完整的数独数据
            console.log('========== 从后端读取的数独数据 ==========');
            console.log('数独面板数据:', sudokuBoard);
            console.log('数据类型:', typeof sudokuBoard, Array.isArray(sudokuBoard));
            if (Array.isArray(sudokuBoard)) {
                console.log('行数:', sudokuBoard.length);
                console.log('第一行数据:', sudokuBoard[0]);
                console.log('第一行类型:', typeof sudokuBoard[0], Array.isArray(sudokuBoard[0]));
                
                // 打印完整的9x9数组
                console.log('完整的9x9数独数组:');
                for (let i = 0; i < 9; i++) {
                    console.log(`行${i}:`, sudokuBoard[i]);
                }
            }
            console.log('========================================');
            
            // 确保数据是二维数组
            if (!Array.isArray(sudokuBoard) || !Array.isArray(sudokuBoard[0])) {
                console.error('❌ 数据格式错误，不是二维数组');
                console.error('sudokuBoard:', sudokuBoard);
                throw new Error('数据格式错误');
            }
            
            // 深拷贝原始面板
            originalBoard = sudokuBoard.map(row => [...row]);
            console.log('✅ 原始面板已保存:', originalBoard);
            renderBoard();
            clearMessage();
            selectedCell = null;
            selectedNumber = null;
            updateNumberButtons();
            stopTimer(); // 停止之前的计时器
            resetTimer(); // 重置计时器
            startGameBtn.disabled = false;
            startGameBtn.textContent = '开始游戏';
            console.log('游戏加载成功！');
        } else {
            const errorMsg = data.message || '未知错误';
            console.error('生成游戏失败:', errorMsg);
            showMessage('生成游戏失败: ' + errorMsg, 'error');
            // 即使失败也渲染空面板
            renderEmptyBoard();
        }
    } catch (error) {
        console.error('========== 发生错误 ==========');
        console.error('错误类型:', error.name);
        console.error('错误消息:', error.message);
        console.error('错误堆栈:', error.stack);
        console.error('完整错误对象:', error);
        console.error('================================');
        showMessage('网络错误: ' + error.message + '。请检查后端服务是否启动。', 'error');
        // 即使出错也渲染空面板
        renderEmptyBoard();
    }
}

// 渲染数独面板
function renderBoard() {
    if (!boardElement) {
        console.error('boardElement 不存在！');
        return;
    }
    
    if (!sudokuBoard || sudokuBoard.length !== 9) {
        console.error('数独面板数据无效:', sudokuBoard);
        renderEmptyBoard();
        return;
    }
    
    console.log('========== 开始渲染数独面板 ==========');
    console.log('sudokuBoard:', sudokuBoard);
    console.log('originalBoard:', originalBoard);
    boardElement.innerHTML = '';
    
    let filledCount = 0; // 统计填充的单元格数量
    
    for (let i = 0; i < 9; i++) {
        if (!sudokuBoard[i] || sudokuBoard[i].length !== 9) {
            console.error(`❌ 第 ${i} 行数据无效:`, sudokuBoard[i]);
            continue;
        }
        
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            const value = sudokuBoard[i][j];
            
            // 显示数字（包括0，但0显示为空）
            let numValue;
            if (value === null || value === undefined) {
                numValue = 0;
            } else if (typeof value === 'string') {
                numValue = parseInt(value, 10);
            } else {
                numValue = Number(value);
            }
            
            // 打印所有单元格的值（方便调试）
            console.log(`单元格 [${i}][${j}]: 原始值=${value}, 类型=${typeof value}, 数字值=${numValue}`);
            
            // 如果值有效且不为0，显示数字
            if (!isNaN(numValue) && numValue !== 0) {
                filledCount++;
                cell.textContent = numValue;
                console.log(`  ✅ 显示数字: ${numValue} 在 [${i}][${j}]`);
                
                // 如果是原始题目中的数字，标记为固定
                if (originalBoard && originalBoard[i] && originalBoard[i][j] !== 0) {
                    cell.classList.add('fixed');
                    console.log(`    -> 固定数字 (原始值: ${originalBoard[i][j]})`);
                }
            } else {
                // 值为0或空，不显示内容
                cell.textContent = '';
            }
            
            // 添加3x3网格的边框样式
            if (j === 2 || j === 5) {
                cell.style.borderRight = '3px solid #1a252f';
            }
            if (i === 2 || i === 5) {
                cell.style.borderBottom = '3px solid #1a252f';
            }
            
            cell.addEventListener('click', () => selectCell(i, j));
            boardElement.appendChild(cell);
        }
    }
    
    console.log('========== 渲染完成 ==========');
    console.log('总单元格数:', boardElement.children.length);
    console.log('填充的单元格数:', filledCount);
    console.log('================================');
    
    // 清除错误标记
    clearErrors();
}

// 选择单元格
function selectCell(row, col) {
    // 如果是固定单元格，不允许修改
    if (originalBoard[row][col] !== 0) {
        return;
    }
    
    // 清除之前的选择
    if (selectedCell) {
        const prevCell = document.querySelector(
            `[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`
        );
        if (prevCell) {
            prevCell.classList.remove('selected');
        }
    }
    
    // 选择新单元格
    selectedCell = { row, col };
    const cellElement = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );
    if (cellElement) {
        cellElement.classList.add('selected');
        
        // 如果已选择数字，尝试填入（会进行实时验证）
        if (selectedNumber !== null && selectedNumber !== 0) {
            checkAndPlaceNumber(row, col, selectedNumber);
        }
    }
}

// 选择数字
function selectNumber(num) {
    // 如果选择了清除按钮
    if (num === 0) {
        if (selectedCell) {
            updateCell(selectedCell.row, selectedCell.col, 0);
        }
        selectedNumber = null;
        updateNumberButtons();
        return;
    }
    
    selectedNumber = num;
    updateNumberButtons();
    
    // 如果已选择单元格，尝试填入（会进行实时验证）
    if (selectedCell) {
        checkAndPlaceNumber(selectedCell.row, selectedCell.col, num);
    }
}

// 检查并放置数字（实时验证）
async function checkAndPlaceNumber(row, col, value) {
    // 先临时设置值以进行检查
    const oldValue = sudokuBoard[row][col];
    sudokuBoard[row][col] = value;
    
    try {
        const response = await fetch('/api/sudoku/canPlace', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board: sudokuBoard,
                row: row,
                col: col,
                value: value
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.canPlace) {
            // 可以放置，更新单元格
            updateCell(row, col, value);
            // 清除数字选中状态
            selectedNumber = null;
            updateNumberButtons();
        } else {
            // 不能放置，恢复原值并显示错误
            sudokuBoard[row][col] = oldValue;
            const cellElement = document.querySelector(
                `[data-row="${row}"][data-col="${col}"]`
            );
            if (cellElement) {
                cellElement.classList.add('error');
                setTimeout(() => {
                    cellElement.classList.remove('error');
                }, 1000);
            }
            showMessage('这个数字不能放在这里！', 'error');
        }
    } catch (error) {
        // 如果API调用失败，恢复原值
        sudokuBoard[row][col] = oldValue;
        console.error('验证失败:', error);
        // 降级处理：直接填入，不验证
        updateCell(row, col, value);
        selectedNumber = null;
        updateNumberButtons();
    }
}




// 更新单元格
function updateCell(row, col, value) {
    // 如果是固定单元格，不允许修改
    if (originalBoard[row][col] !== 0) {
        return;
    }
    
    // 更新数据
    sudokuBoard[row][col] = value;
    
    // 更新界面
    const cellElement = document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );
    if (cellElement) {
        if (value === 0) {
            cellElement.textContent = '';
        } else {
            cellElement.textContent = value;
        }
        cellElement.classList.remove('error');
        
        // 检查是否完成
        checkGameComplete();
    }
}

// 更新数字按钮状态
function updateNumberButtons() {
    numButtons.forEach(btn => {
        if (parseInt(btn.dataset.num) === selectedNumber) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 清除错误标记
function clearErrors() {
    document.querySelectorAll('.sudoku-cell.error').forEach(cell => {
        cell.classList.remove('error');
    });
}


// 检查游戏是否完成
async function checkGameComplete() {
    // 检查是否所有格子都填满了
    let allFilled = true;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (sudokuBoard[i][j] === 0) {
                allFilled = false;
                break;
            }
        }
        if (!allFilled) break;
    }
    
    if (allFilled) {
        // 验证解答
        try {
            const response = await fetch('/api/sudoku/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    board: sudokuBoard
                })
            });
            
            const data = await response.json();
            if (data.success && data.solved) {
                stopTimer();
                showMessage(`恭喜完成！用时: ${formatTime(elapsedSeconds)}`, 'success');
            }
        } catch (error) {
            console.error('验证失败:', error);
        }
    }
}

// 计时器功能
function startTimer() {
    stopTimer(); // 先停止之前的计时器
    elapsedSeconds = 0;
    startTime = Date.now();
    updateTimerDisplay();
    
    if (timerElement) {
        timerElement.classList.add('running');
    }
    
    timerInterval = setInterval(() => {
        elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (timerElement) {
        timerElement.classList.remove('running');
    }
}

function resetTimer() {
    stopTimer();
    elapsedSeconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    if (timerElement) {
        timerElement.textContent = formatTime(elapsedSeconds);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// 显示消息
function showMessage(message, type = 'info') {
    messageDiv.textContent = message;
    messageDiv.className = `message show ${type}`;
    setTimeout(() => {
        if (type === 'info') {
            clearMessage();
        }
    }, 3000);
}

// 清除消息
function clearMessage() {
    messageDiv.classList.remove('show');
}

// 直接测试API
async function testApiDirectly() {
    console.log('========== 测试API连接 ==========');
    const apiUrl = `/api/sudoku/generate?difficulty=easy`;
    console.log('测试URL:', apiUrl);
    
    try {
        console.log('方法1: 使用fetch测试...');
        const startTime = Date.now();
        
        // 测试1: 简单的fetch
        fetch(apiUrl)
            .then(response => {
                console.log('✅ Fetch成功! 状态:', response.status);
                console.log('耗时:', Date.now() - startTime, 'ms');
                return response.text();
            })
            .then(text => {
                console.log('响应文本长度:', text.length);
                console.log('响应文本前500字符:', text.substring(0, 500));
                try {
                    const data = JSON.parse(text);
                    console.log('✅ JSON解析成功:', data);
                    if (data.board) {
                        console.log('数独数据存在!', data.board);
                        // 直接显示
                        sudokuBoard = data.board;
                        originalBoard = sudokuBoard.map(row => [...row]);
                        renderBoard();
                        showMessage('API测试成功！数据已加载', 'success');
                    }
                } catch (e) {
                    console.error('JSON解析失败:', e);
                }
            })
            .catch(error => {
                console.error('❌ Fetch失败:', error);
                showMessage('API测试失败: ' + error.message, 'error');
            });
            
        // 测试2: 使用XMLHttpRequest
        console.log('方法2: 使用XMLHttpRequest测试...');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl, true);
        xhr.timeout = 10000; // 10秒超时
        xhr.onload = function() {
            console.log('✅ XHR成功! 状态:', xhr.status);
            console.log('响应:', xhr.responseText.substring(0, 500));
        };
        xhr.onerror = function() {
            console.error('❌ XHR错误');
        };
        xhr.ontimeout = function() {
            console.error('❌ XHR超时');
        };
        xhr.send();
        
    } catch (error) {
        console.error('测试出错:', error);
    }
}

// 键盘支持
document.addEventListener('keydown', (e) => {
    if (!selectedCell) return;
    
    const key = e.key;
    if (key >= '1' && key <= '9') {
        updateCell(selectedCell.row, selectedCell.col, parseInt(key));
        selectNumber(parseInt(key));
    } else if (key === 'Backspace' || key === 'Delete' || key === '0') {
        updateCell(selectedCell.row, selectedCell.col, 0);
        selectNumber(0);
    } else if (key === 'ArrowUp' && selectedCell.row > 0) {
        selectCell(selectedCell.row - 1, selectedCell.col);
    } else if (key === 'ArrowDown' && selectedCell.row < 8) {
        selectCell(selectedCell.row + 1, selectedCell.col);
    } else if (key === 'ArrowLeft' && selectedCell.col > 0) {
        selectCell(selectedCell.row, selectedCell.col - 1);
    } else if (key === 'ArrowRight' && selectedCell.col < 8) {
        selectCell(selectedCell.row, selectedCell.col + 1);
    }
});


