// ========== CÁC BỘ KÝ TỰ ==========
const LETTER_SETS = [
    ['A','B','C','D'],
    ['D','E','F','G'],
    ['E','F','G','H'],
    ['H','I','J','K'],
    ['P','Q','R','S'],
    ['U','T','X','V']
];

// ========== HÀM TIỆN ÍCH ==========
function dist(p1, p2, points) {
    const a = points.find(p => p.id == p1);
    const b = points.find(p => p.id == p2);
    if (!a || !b) return NaN;
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function dist2(p1, p2, points) {
    const a = points.find(p => p.id == p1);
    const b = points.find(p => p.id == p2);
    if (!a || !b) return NaN;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx*dx + dy*dy;
}

function evaluate(expr, points) {
    const fn = new Function('points', `
        function dist(a,b) {
            const p1 = points.find(p => p.id == a);
            const p2 = points.find(p => p.id == b);
            if (!p1 || !p2) return NaN;
            return Math.hypot(p1.x - p2.x, p1.y - p2.y);
        }
        function dist2(a,b) {
            const p1 = points.find(p => p.id == a);
            const p2 = points.find(p => p.id == b);
            if (!p1 || !p2) return NaN;
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            return dx*dx + dy*dy;
        }
        function isMidpoint(m, a, b) {
            const pm = points.find(p => p.id == m);
            const pa = points.find(p => p.id == a);
            const pb = points.find(p => p.id == b);
            if (!pm || !pa || !pb) return false;
            const midX = Math.round((pa.x + pb.x) / 2);
            const midY = Math.round((pa.y + pb.y) / 2);
            return pm.x === midX && pm.y === midY;
        }
        return (${expr});
    `);
    try {
        return fn(points);
    } catch (e) {
        return false;
    }
}

// Thay thế các số 1,2,3,4 trong chuỗi bằng ký tự theo map
function replaceNumbers(text, map) {
    let result = text;
    for (let i = 1; i <= 4; i++) {
        const regex = new RegExp(i, 'g');
        result = result.replace(regex, map[i]);
    }
    return result;
}

// ========== BIẾN TOÀN CỤC ==========
let questions = [];
let currentQuestion = null;
let points = [];
let dragging = null;
let letterMap = {};

// Biến thống kê
let totalAttempts = 0;
let correctAttempts = 0;
let isCorrect = false; // trạng thái đúng/sai hiện tại

const SVG = document.getElementById('svg-grid');
const NS = 'http://www.w3.org/2000/svg';
const GRID_SIZE = 40;
const NUM_CELLS = 10;
const MARGIN = 50;

// ========== THAM CHIẾU NÚT ==========
const btnCheck = document.getElementById('btn-check');
const btnReset = document.getElementById('btn-reset');

// ========== VẼ ==========
function drawGrid() {
    while (SVG.firstChild) SVG.removeChild(SVG.firstChild);

    for (let i = 0; i <= NUM_CELLS; i++) {
        const x = MARGIN + i * GRID_SIZE;
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', MARGIN);
        line.setAttribute('x2', x);
        line.setAttribute('y2', MARGIN + NUM_CELLS * GRID_SIZE);
        line.setAttribute('class', (i % 5 === 0) ? 'grid-line-major' : 'grid-line');
        SVG.appendChild(line);

        const y = MARGIN + i * GRID_SIZE;
        const line2 = document.createElementNS(NS, 'line');
        line2.setAttribute('x1', MARGIN);
        line2.setAttribute('y1', y);
        line2.setAttribute('x2', MARGIN + NUM_CELLS * GRID_SIZE);
        line2.setAttribute('y2', y);
        line2.setAttribute('class', (i % 5 === 0) ? 'grid-line-major' : 'grid-line');
        SVG.appendChild(line2);
    }
}

function drawShape() {
    if (!currentQuestion) return;
    const verts = currentQuestion.vertices;
    if (verts.length < 3) return;

    for (let i = 0; i < verts.length; i++) {
        const j = (i + 1) % verts.length;
        const p1 = points.find(p => p.id == verts[i]);
        const p2 = points.find(p => p.id == verts[j]);
        if (!p1 || !p2) continue;
        const x1 = MARGIN + p1.x * GRID_SIZE;
        const y1 = MARGIN + p1.y * GRID_SIZE;
        const x2 = MARGIN + p2.x * GRID_SIZE;
        const y2 = MARGIN + p2.y * GRID_SIZE;
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'shape-line');
        SVG.appendChild(line);
    }

    if (verts.length === 3 && currentQuestion.medians) {
        const median = currentQuestion.medians[0];
        if (median) {
            const mPoint = points.find(p => p.id == median.point);
            if (mPoint) {
                const ends = median.endpoints;
                const opposite = verts.find(v => v !== ends[0] && v !== ends[1]);
                const opp = points.find(p => p.id == opposite);
                if (opp) {
                    const x1 = MARGIN + opp.x * GRID_SIZE;
                    const y1 = MARGIN + opp.y * GRID_SIZE;
                    const x2 = MARGIN + mPoint.x * GRID_SIZE;
                    const y2 = MARGIN + mPoint.y * GRID_SIZE;
                    const line = document.createElementNS(NS, 'line');
                    line.setAttribute('x1', x1);
                    line.setAttribute('y1', y1);
                    line.setAttribute('x2', x2);
                    line.setAttribute('y2', y2);
                    line.setAttribute('class', 'median-line');
                    SVG.appendChild(line);
                }
            }
        }
    }
}

function drawPoints() {
    const toRemove = [];
    SVG.childNodes.forEach(child => {
        if (child.tagName === 'circle' || child.tagName === 'text') {
            toRemove.push(child);
        }
    });
    toRemove.forEach(el => el.remove());

    points.forEach(p => {
        const cx = MARGIN + p.x * GRID_SIZE;
        const cy = MARGIN + p.y * GRID_SIZE;

        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('class', 'point-circle');
        circle.setAttribute('data-id', p.id);
        SVG.appendChild(circle);

        let labelText = p.id;
        if (typeof p.id === 'number' && letterMap && letterMap[p.id]) {
            labelText = letterMap[p.id];
        }
        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', cx);
        label.setAttribute('y', cy);
        label.setAttribute('class', 'point-label');
        label.textContent = labelText;
        SVG.appendChild(label);

        circle.addEventListener('mousedown', startDrag);
    });
}

function render() {
    drawGrid();
    drawShape();
    drawPoints();
}

// ========== KÉO THẢ ==========
function startDrag(e) {
    // Nếu đang đúng, khi bắt đầu kéo thì bỏ trạng thái đúng, kích hoạt nút
    if (isCorrect) {
        isCorrect = false;
        btnCheck.disabled = false;
        btnReset.disabled = false;
        document.getElementById('result-text').innerHTML = '';
    }

    const circle = e.target;
    const id = circle.getAttribute('data-id');
    const point = points.find(p => p.id == id);
    if (!point) return;

    const rect = SVG.getBoundingClientRect();
    const scaleX = SVG.getAttribute('width') / rect.width;
    const scaleY = SVG.getAttribute('height') / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    dragging = {
        point: point,
        offsetX: mouseX - (MARGIN + point.x * GRID_SIZE),
        offsetY: mouseY - (MARGIN + point.y * GRID_SIZE)
    };

    SVG.style.cursor = 'grabbing';
    e.preventDefault();
}

document.addEventListener('mousemove', (e) => {
    if (!dragging) return;

    const rect = SVG.getBoundingClientRect();
    const scaleX = SVG.getAttribute('width') / rect.width;
    const scaleY = SVG.getAttribute('height') / rect.height;

    let mouseX = (e.clientX - rect.left) * scaleX;
    let mouseY = (e.clientY - rect.top) * scaleY;

    let gridX = Math.round((mouseX - MARGIN - dragging.offsetX) / GRID_SIZE);
    let gridY = Math.round((mouseY - MARGIN - dragging.offsetY) / GRID_SIZE);

    gridX = Math.max(0, Math.min(NUM_CELLS, gridX));
    gridY = Math.max(0, Math.min(NUM_CELLS, gridY));

    dragging.point.x = gridX;
    dragging.point.y = gridY;

    render();
    e.preventDefault();
});

document.addEventListener('mouseup', () => {
    if (dragging) {
        SVG.style.cursor = 'default';
        dragging = null;
    }
});

// ========== HIỂN THỊ ĐỀ ==========
function displayQuestion() {
    const el = document.getElementById('question-text');
    let text = currentQuestion ? currentQuestion.label : 'Chưa có câu hỏi';
    if (currentQuestion) {
        text = replaceNumbers(text, letterMap);
    }
    el.textContent = text;
    document.getElementById('result-text').innerHTML = '';
    updateStats();
}

// ========== CẬP NHẬT THỐNG KÊ ==========
function updateStats() {
    const statsEl = document.getElementById('stats');
    if (totalAttempts === 0) {
        statsEl.textContent = '✅ 0/0 (Chưa có dữ liệu)';
    } else {
        const percent = (correctAttempts / totalAttempts * 100).toFixed(1);
        statsEl.textContent = `✅ ${correctAttempts}/${totalAttempts} (${percent}%)`;
    }
}

// ========== KHỞI TẠO ĐIỂM ==========
function initPoints() {
    if (!currentQuestion) return;
    const ids = new Set();
    currentQuestion.vertices.forEach(v => ids.add(v));
    currentQuestion.medians.forEach(m => ids.add(m.point));

    points = [];
    const usedPositions = new Set();
    ids.forEach(id => {
        let x, y, key;
        let attempts = 0;
        do {
            x = Math.floor(Math.random() * (NUM_CELLS - 2)) + 1;
            y = Math.floor(Math.random() * (NUM_CELLS - 2)) + 1;
            key = x + ',' + y;
            attempts++;
        } while (usedPositions.has(key) && attempts < 50);
        usedPositions.add(key);
        points.push({ id: id, x: x, y: y });
    });
}

// ========== KIỂM TRA ==========
function check() {
    if (!currentQuestion) {
        document.getElementById('result-text').innerHTML = '<span class="error">Chưa có câu hỏi!</span>';
        return;
    }

    totalAttempts++;
    let allPass = true;
    const errors = [];

    currentQuestion.conditions.forEach(cond => {
        const result = evaluate(cond.expr, points);
        if (!result) {
            allPass = false;
            errors.push(cond.message);
        }
    });

    const resultEl = document.getElementById('result-text');

    if (allPass) {
        correctAttempts++;
        isCorrect = true;
        resultEl.innerHTML = '<span class="success">✅ Đúng!</span>';
        // Vô hiệu hóa cả hai nút
        btnCheck.disabled = true;
        btnReset.disabled = true;
    } else {
        isCorrect = false;
        resultEl.innerHTML = '<span class="error">❌ ' + errors.join('; ') + '</span>';
        // Kích hoạt lại cả hai nút (đề phòng đang bị disable)
        btnCheck.disabled = false;
        btnReset.disabled = false;
    }

    updateStats();
}

// ========== CHỌN CÂU HỎI NGẪU NHIÊN ==========
function pickRandomQuestion() {
    if (questions.length === 0) {
        alert('Không có câu hỏi nào!');
        return;
    }
    const idx = Math.floor(Math.random() * questions.length);
    currentQuestion = questions[idx];

    const setIdx = Math.floor(Math.random() * LETTER_SETS.length);
    const letters = LETTER_SETS[setIdx];
    letterMap = {};
    for (let i = 1; i <= 4; i++) {
        letterMap[i] = letters[i-1];
    }

    // Reset trạng thái và kích hoạt lại các nút
    isCorrect = false;
    btnCheck.disabled = false;
    btnReset.disabled = false;

    initPoints();
    displayQuestion();
    render();
}

// ========== RESET ==========
function resetPoints() {
    if (!currentQuestion) return;
    if (isCorrect) {
        // Nếu đã đúng thì không cho reset (nút đã bị disable, nhưng để an toàn)
        return;
    }
    initPoints();
    render();
    document.getElementById('result-text').innerHTML = '';
    // Không reset thống kê
}

// ========== KHỞI TẠO ==========
function init() {
    document.getElementById('btn-random').addEventListener('click', pickRandomQuestion);
    btnReset.addEventListener('click', resetPoints);
    btnCheck.addEventListener('click', check);

    fetch('data.json')
        .then(res => {
            if (!res.ok) throw new Error('Không tìm thấy data.json');
            return res.json();
        })
        .then(data => {
            questions = data;
            if (questions.length === 0) {
                alert('Dữ liệu trống!');
                return;
            }
            pickRandomQuestion();
        })
        .catch(err => {
            alert('Lỗi tải dữ liệu: ' + err.message);
        });
}

init();