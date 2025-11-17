// ----------------------
// 核心變數 (來自 circlePacking 專案)
// ----------------------
let t = 0.0;
let vel = 0.02;
let num;
let paletteSelected;
let paletteSelected1;
let paletteSelected2;
let packedPoints = []; // 用於儲存 circlePacking 結果的變數

// ----------------------
// 粒子背景變數 (DynamicShape)
// ----------------------
let objs = [];
let dynamicColors = ['#f71735', '#f7d002', '#1A53C0', '#232323']; // 重新命名以避免與調色盤衝突

function setup() {
	// 畫布全螢幕
	createCanvas(windowWidth, windowHeight); 
	pixelDensity(2)
	angleMode(DEGREES);
	rectMode(CENTER); // DynamicShape 需要這個模式
	num = random(100000);
	paletteSelected = random(palettes);
	paletteSelected1 = random(palettes);
	paletteSelected2 = random(palettes);

	// 粒子背景初始化
	objs.push(new DynamicShape());

	// 初始化 circlePacking 一次
	calculateCirclePacking();

	// 建立隱藏式左側選單
	createSidebar();
}

function draw() {
	// 1. 繪製粒子背景 (DynamicShape)
	drawDynamicBackground();

	// 2. 繪製主要的 circlePacking 圖案
	stroke("#355070");
	drawPackedCircles();
}

// ----------------------
// DynamicShape 背景邏輯
// ----------------------
function drawDynamicBackground() {
    // 使用白色背景，讓粒子圖層疊加在上面 (您也可以改為您喜歡的單色背景)
    background(255); 
    
    // 更新和繪製粒子
    for (let i of objs) {
        i.run();
    }

    // 粒子新增邏輯
    if (frameCount % int(random([15, 30])) == 0) {
        let addNum = int(random(1, 30));
        for (let i = 0; i < addNum; i++) {
            objs.push(new DynamicShape());
        }
    }
    // 粒子刪除邏輯
    for (let i = objs.length - 1; i >= 0; i--) {
        if (objs[i].isDead) {
            objs.splice(i, 1);
        }
    }
}

function easeInOutExpo(x) {
	return x === 0 ? 0 :
		x === 1 ?
		1 :
		x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
		(2 - Math.pow(2, -20 * x + 10)) / 2;
}

class DynamicShape {
	constructor() {
		this.x = random(0.3, 0.7) * width;
		this.y = random(0.3, 0.7) * height;
		this.reductionRatio = 1;
		this.shapeType = int(random(4));
		this.animationType = 0;
		this.maxActionPoints = int(random(2, 5));
		this.actionPoints = this.maxActionPoints;
		this.elapsedT = 0;
		this.size = 0;
		this.sizeMax = min(width, height) * random(0.01, 0.05); // 調整大小以適應全螢幕
		this.fromSize = 0;
		this.init();
		this.isDead = false;
		this.clr = random(dynamicColors); // 使用 DynamicShape 的顏色
		this.changeShape = true;
		this.ang = int(random(2)) * PI * 0.25;
		this.lineSW = 0;
	}

	show() {
		push();
		translate(this.x, this.y);
		if (this.animationType == 1) scale(1, this.reductionRatio);
		if (this.animationType == 2) scale(this.reductionRatio, 1);
		fill(this.clr);
		stroke(this.clr);
		strokeWeight(this.size * 0.05);
		if (this.shapeType == 0) {
			noStroke();
			circle(0, 0, this.size);
		} else if (this.shapeType == 1) {
			noFill();
			circle(0, 0, this.size);
		} else if (this.shapeType == 2) {
			noStroke();
			rect(0, 0, this.size, this.size);
		} else if (this.shapeType == 3) {
			noFill();
			rect(0, 0, this.size * 0.9, this.size * 0.9);
		} else if (this.shapeType == 4) {
			line(0, -this.size * 0.45, 0, this.size * 0.45);
			line(-this.size * 0.45, 0, this.size * 0.45, 0);
		}
		pop();
		strokeWeight(this.lineSW);
		stroke(this.clr);
		line(this.x, this.y, this.fromX, this.fromY);
	}

	move() {
		let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
		if (0 < this.elapsedT && this.elapsedT < this.duration) {
			if (this.actionPoints == this.maxActionPoints) {
				this.size = lerp(0, this.sizeMax, n);
			} else if (this.actionPoints > 0) {
				if (this.animationType == 0) {
					this.size = lerp(this.fromSize, this.toSize, n);
				} else if (this.animationType == 1) {
					this.x = lerp(this.fromX, this.toX, n);
					this.lineSW = lerp(0, this.size / 5, sin(n * PI));
				} else if (this.animationType == 2) {
					this.y = lerp(this.fromY, this.toY, n);
					this.lineSW = lerp(0, this.size / 5, sin(n * PI));
				} else if (this.animationType == 3) {
					if (this.changeShape == true) {
						this.shapeType = int(random(5));
						this.changeShape = false;
					}
				}
				this.reductionRatio = lerp(1, 0.3, sin(n * PI));
			} else {
				this.size = lerp(this.fromSize, 0, n);
			}
		}

		this.elapsedT++;
		if (this.elapsedT > this.duration) {
			this.actionPoints--;
			this.init();
		}
		if (this.actionPoints < 0) {
			this.isDead = true;
		}
	}

	run() {
		this.show();
		this.move();
	}

	init() {
		this.elapsedT = 0;
		this.fromSize = this.size;
		this.toSize = this.sizeMax * random(0.5, 1.5);
		this.fromX = this.x;
		this.toX = this.fromX + (width / 10) * random([-1, 1]) * int(random(1, 4));
		this.fromY = this.y;
		this.toY = this.fromY + (height / 10) * random([-1, 1]) * int(random(1, 4));
		this.animationType = int(random(3));
		this.duration = random(20, 50);
	}
}


// ----------------------
// 核心作品：circlePacking 邏輯 (未更動)
// ----------------------

function calculateCirclePacking() {
	randomSeed(num);
	packedPoints = []; 
	let count = 1000; 

	for (let i = 0; i < count; i++) {
		let a = random(360);
		let maxDim = min(width, height) * 0.35;
		let d = random(maxDim); 
		let s = random(200);
		let x = cos(a) * (d - s / 2);
		let y = sin(a) * (d - s / 2);
		let add = true;
		for (let j = 0; j < packedPoints.length; j++) {
			let p = packedPoints[j];
			if (dist(x, y, p.x, p.y) < (s + p.z) * 0.6) {
				add = false;
				break;
			}
		}
		if (add) packedPoints.push(createVector(x, y, s));
	}
	randomSeed();
}

function drawPackedCircles() {
	push();
	translate(width / 2, height / 2)

	for (let i = 0; i < packedPoints.length; i++) {

		let p = packedPoints[i];
		let rot = 0; 
		
		push();
		translate(p.x, p.y);
		rotate(rot);
		blendMode(OVERLAY)
		let r = p.z - 5;
		gradient(r)
		shape(0, 0, r)
		pop();
	}
	pop();
}

// ----------------------
// 輔助函式：圖形繪製與顏色 (未更動)
// ----------------------
function shape(x, y, r) {
	push();
	noStroke();
	translate(x, y);
	let radius = r; 
	let nums = 8
	for (let i = 0; i < 360; i += 360 / nums) {
		let ex = radius * sin(i);
		let ey = radius * cos(i);
		push();
		translate(ex, ey)
		rotate(atan2(ey, ex))
		distortedCircle(0, 0, r);

		pop();
		stroke(randomCol())
		strokeWeight(0.5)
		line(0, 0, ex, ey)
		ellipse(ex, ey, 2)
	}


	pop();
}

function distortedCircle(x, y, r) {
	push();
	translate(x, y)
	//points
	let p1 = createVector(0, -r / 2);
	let p2 = createVector(r / 2, 0);
	let p3 = createVector(0, r / 2);
	let p4 = createVector(-r / 2, 0)
	//anker
	let val = 0.3;
	let random_a8_1 = random(-r * val, r * val)
	let random_a2_3 = random(-r * val, r * val)
	let random_a4_5 = random(-r * val, r * val)
	let random_a6_7 = random(-r * val, r * val)
	let ran_anker_lenA = r * random(0.2, 0.5)
	let ran_anker_lenB = r * random(0.2, 0.5)
	let a1 = createVector(ran_anker_lenA, -r / 2 + random_a8_1);
	let a2 = createVector(r / 2 + random_a2_3, -ran_anker_lenB);
	let a3 = createVector(r / 2 - random_a2_3, ran_anker_lenA);
	let a4 = createVector(ran_anker_lenB, r / 2 + random_a4_5);
	let a5 = createVector(-ran_anker_lenA, r / 2 - random_a4_5);
	let a6 = createVector(-r / 2 + random_a6_7, ran_anker_lenB);
	let a7 = createVector(-r / 2 - random_a6_7, -ran_anker_lenA);
	let a8 = createVector(-ran_anker_lenB, -r / 2 - random_a8_1);
	beginShape();
	vertex(p1.x, p1.y);
	bezierVertex(a1.x, a1.y, a2.x, a2.y, p2.x, p2.y)
	bezierVertex(a3.x, a3.y, a4.x, a4.y, p3.x, p3.y)
	bezierVertex(a5.x, a5.y, a6.x, a6.y, p4.x, p4.y)
	bezierVertex(a7.x, a7.y, a8.x, a8.y, p1.x, p1.y)
	endShape();
	pop();
}

function mouseClicked() {
	shuffle(paletteSelected, true);
	shuffle(bgpalette, true);
	calculateCirclePacking(); 
}

function randomCol() {
	let randoms = int(random(1, paletteSelected.length));
	return color(paletteSelected[randoms]);
}

function bgCol() {
	let randoms = int(random(0, bgpalette.length));
	return color(bgpalette[randoms]);
}

function gradient(r) {
	col1 = color(random(paletteSelected1));
	col2 = random(paletteSelected2);

	noStroke();
	let gradientFill = drawingContext.createLinearGradient(
		0,
		-r,
		0,
		r
	);
	gradientFill.addColorStop(0, color(col1));
	gradientFill.addColorStop(1, color(col2));
	drawingContext.fillStyle = gradientFill;
}

// ----------------------
// 調色盤定義 (未更動)
// ----------------------
let bgpalette = ["#488a50", "#bf5513", "#3b6fb6", "#4f3224", "#9a7f6e", "#1c3560", '#4a4e69', "#333", "#413e49", "#5da4a9"]
let palettes = [
	["#e9dbce", "#ea526f", "#fceade", "#e2c290", "#6b2d5c", "#25ced1"],
	["#e9dbce", "#d77a61", "#223843", "#eff1f3", "#dbd3d8", "#d8b4a0"],
	["#e29578", "#006d77", "#83c5be", "#ffddd2", "#edf6f9"],
	["#e9dbce", "#cc3528", "#028090", "#00a896", "#f8c522"],
	["#e9dbce", "#92accc", "#f8f7c1", "#f46902", "#da506a", "#fae402"],
	["#e42268", "#fb8075", "#761871", "#5b7d9c", "#a38cb4", "#476590"],
	['#f9b4ab', '#679186', '#fdebd3', '#264e70', '#bbd4ce'],
	['#1f306e', '#c7417b', '#553772', '#8f3b76', '#f5487f'],
	['#e0f0ea', '#95adbe', '#574f7d', '#503a65', '#3c2a4d'],
	['#413e4a', '#b38184', '#73626e', '#f0b49e', '#f7e4be'],
	['#ff4e50', '#fc913a', '#f9d423', '#ede574', '#e1f5c4'],
	['#99b898', '#fecea8', '#ff847c', '#e84a5f', '#2a363b'],
	['#69d2e7', '#a7dbd8', '#e0e4cc', '#f38630', '#fa6900'],
	['#fe4365', '#fc9d9a', '#f9cdad', '#c8c8a9', '#83af9b'],
	['#ecd078', '#d95b43', '#c02942', '#542437', '#53777a'],
	['#556270', '#4ecdc4', '#c7f464', '#ff6b6b', '#c44d58'],
	['#774f38', '#e08e79', '#f1d4af', '#ece5ce', '#c5e0dc'],
	['#e8ddcb', '#cdb380', '#036564', '#033649', '#031634'],
	['#490a3d', '#bd1550', '#e97f02', '#f8ca00', '#8a9b0f'],
	['#594f4f', '#9de0ad', '#547980', '#45ada8', '#e5fcc2'],
	['#00a0b0', '#cc333f', '#6a4a3c', '#eb6841', '#edc951'],
	['#5bc0eb', '#fde74c', '#9bc53d', '#e55934', '#fa7921'],
	['#ed6a5a', '#9bc1bc', '#f4f1bb', '#5ca4a9', '#e6ebe0'],
	['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'],
	['#22223b', '#c9ada7', '#4a4e69', '#9a8c98', '#f2e9e4'],
	['#114b5f', '#1a936f', '#88d498', '#c6dabf', '#f3e9d2'],
	['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241'],
	['#06aed5', '#f0c808', '#086788', '#fff1d0', '#dd1c1a'],
	['#540d6e', '#ee4266', '#ffd23f', '#3bceac', '#0ead69'],
	['#c9cba3', '#e26d5c', '#ffe1a8', '#723d46', '#472d30'],
	["#3c4cad", "#5FB49C", "#e8a49c"],
	["#1c3560", "#ff6343", "#f2efdb", "#fea985"],
	["#e0d7c5", "#488a50", "#b59a55", "#bf5513", "#3b6fb6", "#4f3224", "#9a7f6e"], //o-ball
	["#DEEFB7", "#5FB49C", "#ed6a5a"],
	["#2B2B2B", "#91B3E1", "#2F5FB3", "#3D4B89", "#AE99E8", "#DBE2EC"], //clipper_tea.snore&peace.
	["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
	["#A8C25D", "#5B7243", "#FFA088", "#FFFB42", "#a9cff0", "#2D6EA6"], //2025/07/08
	["#F9F9F1", "#191A18", "#E15521", "#3391CF", "#E4901C", "#F5B2B1", "#009472"]//reference :: @posterlad :: https://x.com/posterlad/status/1963188864446566493
];

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	// 重新計算粒子大小和 circlePacking
	// DynamicShape 的 sizeMax 已更新為 min(width, height) * random(0.01, 0.05)
	calculateCirclePacking();
}

// ----------------------
// 隱藏式側邊選單函式 (未更動)
// ----------------------
function createSidebar() {
	// ... (CSS 和 HTML/JS 邏輯未變動) ...
	const style = document.createElement('style');
	style.innerHTML = `
	.sidebar {
		position: fixed;
		left: -320px;
		top: 0;
		width: 320px;
		height: 100vh;
		background: rgba(18, 18, 20, 0.95);
		color: #fff;
		transition: left 0.28s ease;
		z-index: 9999;
		padding-top: 40px;
		box-sizing: border-box;
		-webkit-font-smoothing: antialiased;
	}
	.sidebar ul { list-style: none; padding: 0 20px; margin: 0; }
	.sidebar li {
		padding: 18px 10px;
		font-size: 32px; 
		cursor: pointer;
		user-select: none;
		border-bottom: 1px solid rgba(255,255,255,0.04);
		color: #ffffff;
		transition: color 0.18s ease, background 0.18s ease;
	}
	.sidebar li:hover {
		color: #ffd166;
		background: rgba(255,255,255,0.03);
	}
	.iframe-overlay {
		position: fixed;
		inset: 0;
		display: none;
		align-items: center;
		justify-content: center;
		background: rgba(0,0,0,0.6);
		z-index: 10010;
		padding: 20px;
		box-sizing: border-box;
	}
	.iframe-wrap {
		width: 70vw; 
		height: 85vh;
		background: #ffffff;
		box-shadow: 0 10px 40px rgba(0,0,0,0.5);
		position: relative;
		border-radius: 8px;
		overflow: hidden;
	}
	.iframe-wrap iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}
	.iframe-close {
		position: absolute;
		top: 8px;
		right: 8px;
		background: rgba(0,0,0,0.6);
		color: #fff;
		border: 0;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
	}
	`;
	document.head.appendChild(style);

	const sb = document.createElement('div');
	sb.className = 'sidebar';
	sb.innerHTML = `
		<ul>
			<li id="opt1">第一單元作品</li>
			<li id="opt2">第一單元講義</li>
			<li id="opt3">測驗系統</li>
			<li id="opt5">期中考筆記</li>
			<li id="opt6">淡江大學</li>
			<li id="opt4">回首頁</li>
		</ul>
	`;
	document.body.appendChild(sb);

	const overlay = document.createElement('div');
	overlay.className = 'iframe-overlay';
	overlay.innerHTML = `
		<div class="iframe-wrap" role="dialog" aria-modal="true">
			<button class="iframe-close" aria-label="關閉">&times;</button>
			<iframe src="" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
		</div>
	`;
	document.body.appendChild(overlay);

	const iframe = overlay.querySelector('iframe');
	const closeBtn = overlay.querySelector('.iframe-close');

	function showIframe(url) {
		iframe.src = url;
		overlay.style.display = 'flex';
	}
	function hideIframe() {
		iframe.src = '';
		overlay.style.display = 'none';
	}

	let hideTimeout = null;
	const openWhen = 24; 
	const sidebarWidth = 320;

	window.addEventListener('mousemove', (e) => {
		if (e.clientX <= openWhen) {
			sb.style.left = '0';
			if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
		} else {
			if (e.clientX > sidebarWidth + 20) {
				if (hideTimeout) clearTimeout(hideTimeout);
				hideTimeout = setTimeout(() => {
					sb.style.left = `-${sidebarWidth}px`;
				}, 420);
			}
		}
	});

	sb.addEventListener('mouseenter', () => {
		if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
	});
	sb.addEventListener('mouseleave', () => {
		sb.style.left = `-${sidebarWidth}px`;
	});

	document.getElementById('opt1').addEventListener('click', () => {
        showIframe('https://a09128577391122-commits.github.io/20251020/');
    });
    document.getElementById('opt2').addEventListener('click', () => {
        showIframe('https://hackmd.io/@eke3iKvTStyqwC8LrXhR2g/rJu1vQAiex');
    });
    document.getElementById('opt3').addEventListener('click', () => { showIframe('https://a09128577391122-commits.github.io/20251103/'); });
    document.getElementById('opt5').addEventListener('click', () => {
        showIframe('https://hackmd.io/@eke3iKvTStyqwC8LrXhR2g/B1nzTaRkZl');
    });
    document.getElementById('opt6').addEventListener('click', () => {
        showIframe('https://www.tku.edu.tw/');
    });
    document.getElementById('opt4').addEventListener('click', () => {
        // 關閉任何開啟的 iframe overlay
        hideIframe();
        // 收起側邊欄
        sb.style.left = `-${sidebarWidth}px`;
        // 重置 canvas/內容到初始狀態
        // 重新計算 circle packing
        if (typeof calculateCirclePacking === 'function') calculateCirclePacking();
        // 清空並重新初始化背景粒子
        if (typeof objs !== 'undefined') {
            objs.length = 0;
            if (typeof DynamicShape === 'function') objs.push(new DynamicShape());
        }
    });

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) hideIframe();
	});
	closeBtn.addEventListener('click', hideIframe);

	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && overlay.style.display === 'flex') hideIframe();
	});
}