let currMoleTile;
let currPlantTile;
let score = 0;
let lives = 3;
let moleHit = false;
let gameOver = false;
let backgroundMusicStarted = false;
let isPaused = false;
let moleIntervalId = null;
let plantIntervalId = null;
let sfxVolume = 0.8; // Quản lý âm lượng riêng cho các hiệu ứng SFX
let currentSpeed = 1200;

const sounds = {
    hit: new Audio("./audio/whack-hit.mp3"), // hit the mole
    miss: new Audio("./audio/whack-miss.mp3"), // whack an empty tile
    plantRise: new Audio("./audio/plant-rise.mp3"), // plant appears
    moleDizzy: new Audio("./audio/mole-dizzy.mp3"), // mole is stunned
    moleAppear: new Audio("./audio/mole-appear.mp3"), // mole appears
    plantHit: new Audio("./audio/plant-hit.mp3"), // hit the plant
    gameOver: new Audio("./audio/game-over.mp3"), // game over
    background: new Audio("./audio/background-music.mp3") // looping music
};

sounds.background.loop = true;
sounds.background.volume = 0.8;
sounds.moleAppear.volume = 0.4;

function playSound(sound) {
    if (sound !== sounds.background) {
        sound.volume = sfxVolume;
    }
    sound.currentTime = 0;
    sound.play().catch(() => {
        // Missing files or browser autoplay restrictions should not stop the game.
    });
}

function startBackgroundMusic() {
    if (backgroundMusicStarted || gameOver || isPaused) {
        return;
    }
    backgroundMusicStarted = true;
    playSound(sounds.background);
}

window.onload = function() {
    setGame();
    initControls();
}

function startTimers() {
    stopTimers();
    moleIntervalId = setInterval(setMole, currentSpeed);
    plantIntervalId = setInterval(setPlant, currentSpeed * 2);
}

function stopTimers() {
    clearInterval(moleIntervalId);
    clearInterval(plantIntervalId);
    moleIntervalId = null;
    plantIntervalId = null;
}

function updateLivesDisplay() {
    let livesElem = document.getElementById("lives");
    if (!livesElem) return;
    
    let hearts = "";
    for (let i = 0; i < lives; i++) {
        hearts += "❤️";
    }
    livesElem.innerText = hearts;
}

function setGame() {
    //set up the grid in html
    for (let i = 0; i < 9; i++) { //i goes from 0 to 8, stops at 9
        //<div id="0-8"></div>
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        document.getElementById("board").appendChild(tile);
    }
    updateLivesDisplay();
    startTimers(); // Khởi động timer xuất hiện mole/plant
}

function getRandomTile() {
    //math.random --> 0-1 --> (0-1) * 9 = (0-9) --> round down to (0-8) integers
    let num = Math.floor(Math.random() * 9);
    return num.toString();
}

function setMole() {
    if (gameOver || isPaused) {
        return;
    }
    if (currMoleTile) {
        currMoleTile.innerHTML = "";
    }
    let mole = document.createElement("img");
    mole.src = "./monty-mole.png";

    let num = getRandomTile();
    if (currPlantTile && currPlantTile.id == num) {
        return;
    }
    currMoleTile = document.getElementById(num);
    currMoleTile.appendChild(mole);
    moleHit = false; // Chuột spawn chỗ khác thì đặt lại flag
    
    playSound(sounds.moleAppear);
}

function setPlant() {
    if (gameOver || isPaused) {
        return;
    }
    if (currPlantTile) {
        currPlantTile.innerHTML = "";
    }
    let plant = document.createElement("img");
    plant.src = "./piranha-plant.png";

    let num = getRandomTile();
    if (currMoleTile && currMoleTile.id == num) {
        return;
    }
    currPlantTile = document.getElementById(num);
    currPlantTile.appendChild(plant);
    playSound(sounds.plantRise);
}

function selectTile() {
    if (gameOver || isPaused) {
        return;
    }
    startBackgroundMusic();
    if (this == currMoleTile) {
        // Kiểm tra nếu vị trí chuột vẫn trùng với lúc chưa cộng điểm (đã đập rồi) thì không phát tiếng và không cộng điểm nữa
        if (moleHit) {
            return;
        }
        moleHit = true; // Gắn flag đã cộng điểm cho lần xuất hiện này
        score += 10;
        document.getElementById("score").innerText = score.toString(); //update score html
        playSound(sounds.hit);
        playSound(sounds.moleDizzy);
        updateSpeed();

        // Hiệu ứng chuột bị choáng nhẹ khi bị đập
        let moleImg = currMoleTile.querySelector("img");
        if (moleImg) {
            
            moleImg.style.filter = "brightness(0.7) contrast(1.3)";
        }
    }
    else if (this == currPlantTile) {
        lives -= 1;
        updateLivesDisplay();
        playSound(sounds.plantHit);

        // Xóa cây ngay lập tức sau khi bấm để tránh người dùng bấm liên tục vào cùng 1 cây
        currPlantTile.innerHTML = "";
        currPlantTile = null;

        if (lives <= 0) {
            document.getElementById("score").innerText = "GAME OVER: " + score.toString();
            gameOver = true;
            stopTimers();
            sounds.background.pause();
            playSound(sounds.gameOver);
        }
    }
    else {
        playSound(sounds.miss);
    }
}

function initControls() {
    initSlipper();
    document.getElementById("menu-btn").addEventListener("click", toggleMenu);
    document.getElementById("resume-btn").addEventListener("click", resumeGame);
    document.getElementById("restart-btn").addEventListener("click", restartGame);
    document.getElementById("help-btn").addEventListener("click", openInstruction);
    document.getElementById("close-instruction-btn").addEventListener("click", closeInstruction);

    const bgmSlider = document.getElementById("bgm-slider");
    if (bgmSlider) {
        bgmSlider.addEventListener("input", (e) => {
            sounds.background.volume = parseFloat(e.target.value);
            if (!backgroundMusicStarted && !gameOver) {
                backgroundMusicStarted = true;
                sounds.background.play().catch(() => {});
            }
        });
    }

    const sfxSlider = document.getElementById("sfx-slider");
    if (sfxSlider) {
        sfxSlider.addEventListener("input", (e) => {
            sfxVolume = parseFloat(e.target.value);
            Object.keys(sounds).forEach((key) => {
                if (key !== "background") {
                    sounds[key].volume = sfxVolume;
                }
            });
            sounds.hit.currentTime = 0;
            sounds.hit.volume = sfxVolume;
            sounds.hit.play().catch(() => {});
        });
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.code === "Escape" || e.keyCode === 27) {
            e.preventDefault(); 
            
            if (document.activeElement) {
                document.activeElement.blur();
            }

            toggleMenu();
        }
    });
}

function initSlipper() {
    const slipper = document.getElementById("slipper") || document.getElementById("hammer");
    if (!slipper) return;

    let slapTimeout = null;

    window.addEventListener("mousemove", (e) => {
        slipper.style.left = e.clientX + "px";
        slipper.style.top = e.clientY + "px";

        // Khôi phục con trỏ bình thường khi rê chuột vào menu, nút help hoặc các modal
        const target = e.target;
        if (target && (target.closest("#menu-modal") || target.closest("#instruction-modal") || target.closest("#menu-btn") || target.closest("#help-btn"))) {
            slipper.style.display = "none";
        } else {
            slipper.style.display = "block";
        }
    });

    window.addEventListener("mousedown", (e) => {
        if (e.target && (e.target.closest("#menu-modal") || e.target.closest("#instruction-modal") || e.target.closest("#menu-btn") || e.target.closest("#help-btn"))) {
            return;
        }
        slipper.classList.add("slap");
        clearTimeout(slapTimeout);
        slapTimeout = setTimeout(() => {
            slipper.classList.remove("slap");
        }, 120);
    });

    window.addEventListener("mouseup", () => {
        clearTimeout(slapTimeout);
        slapTimeout = setTimeout(() => {
            slipper.classList.remove("slap");
        }, 40);
    });

    document.addEventListener("mouseleave", () => {
        slipper.style.display = "none";
    });

    document.addEventListener("mouseenter", () => {
        slipper.style.display = "block";
    });
}

function openInstruction() {
    if (gameOver) return;
    isPaused = true;
    stopTimers();
    document.getElementById("menu-modal").classList.add("hidden");
    document.getElementById("instruction-modal").classList.remove("hidden");
}

function closeInstruction() {
    document.getElementById("instruction-modal").classList.add("hidden");
    if (!gameOver) {
        isPaused = false;
        startTimers();
        if (backgroundMusicStarted) sounds.background.play().catch(() => {});
    }
}

function pauseGame() {
    if (gameOver) return;
    isPaused = true;
    stopTimers();
    document.getElementById("instruction-modal").classList.add("hidden");
    document.getElementById("menu-modal").classList.remove("hidden");
}

function resumeGame() {
    if (gameOver) return;
    isPaused = false;
    document.getElementById("menu-modal").classList.add("hidden");
    document.getElementById("instruction-modal").classList.add("hidden");
    startTimers();
    if (backgroundMusicStarted) sounds.background.play().catch(() => {});
}

function toggleMenu() {
    if (gameOver) return;
    const instModal = document.getElementById("instruction-modal");
    if (instModal && !instModal.classList.contains("hidden")) {
        closeInstruction();
        return;
    }
    isPaused ? resumeGame() : pauseGame();
}

function restartGame() {
    stopTimers();
    score = 0;
    lives = 3;
    moleHit = false; // Đặt lại flag đã đập chuột
    currentSpeed = 1200;
    gameOver = false;
    isPaused = false;
    currMoleTile = null;
    currPlantTile = null;
    document.getElementById("score").innerText = "0";
    updateLivesDisplay();
    document.getElementById("menu-modal").classList.add("hidden");
    document.getElementById("instruction-modal").classList.add("hidden");
    document.getElementById("board").innerHTML = "";

    sounds.background.currentTime = 0;
    if (backgroundMusicStarted) {
        sounds.background.play().catch(() => {});
    }

    setGame();
}

function updateSpeed() {
    let newSpeed = 1300;
    if (score >= 400) {
        newSpeed = 600;  
    } else if (score >= 50) {
        newSpeed = 900;  
    } 

    if (newSpeed !== currentSpeed) {
        currentSpeed = newSpeed;
        if (!isPaused && !gameOver) {
            startTimers();
        }
    }
}