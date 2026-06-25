"use strict";

/* =========================================================
   一、最常修改的内容：标题、奖励、角色手感
   ========================================================= */
const GAME_CONFIG = {
  title: "甜度补给站",
  subtitle: "一款轻量横版跳跃闯关 Demo",
  maxHealth: 3,
  player: {
    moveSpeed: 285,
    boostSpeed: 390,
    acceleration: 1900,
    friction: 2300,
    jumpForce: 690,
    secondJumpForce: 630,
    gravity: 1850,
    maxFallSpeed: 920,
    invincibleSeconds: 1.5,
  },
  rewardText: {
    level1: "冰淇淋奖励券 × 1",
    level2: "小蛋糕奖励券 × 1",
    level3: "奶茶奖励券 × 1",
    final: "奖励已经存档。至于怎么兑换，可以等一个合适的时机再决定。",
  },
  failMessages: [
    "差一点点，再来一次。",
    "这个跳跃有点难，但不是过不去。",
    "奶茶还在前面，继续。",
    "刚才那一下不算，重新来。",
    "这不是失败，是甜度校准。",
  ],
};

const PLAYER_SKIN = {
  name: "甜度补给猫",
  primary: "#ffffff",
  outline: "#405267",
  blue: "#b9dcf3",
  deepBlue: "#609ac8",
  scarf: "#dc6f68",
  blush: "#f6b7c8",
  milkTea: "#b88763",
};

const AUDIO_CONFIG = {
  masterVolume: 0.35,
  bgmVolume: 0.22,
  sfxVolume: 0.45,
  bpm: 112,
};
const AUDIO_SETTINGS_KEY = "sweet-supply-station-audio-v1";

const GAME_STATE = {
  HOME: "home",
  LEVEL_SELECT: "levelSelect",
  PLAYING: "playing",
  PAUSED: "paused",
  CELEBRATING: "celebrating",
  LEVEL_COMPLETE: "levelComplete",
  FINAL_REWARD: "finalReward",
};

const PROGRESS_KEY = "sweet-supply-station-progress-v2";
const DEFAULT_PROGRESS = {
  level1Cleared: false,
  level2Cleared: false,
  level3Cleared: false,
  level1BestMilkTea: 0,
  level2BestMilkTea: 0,
  level3BestMilkTea: 0,
  level1BestTime: null,
  level2BestTime: null,
  level3BestTime: null,
  rewards: {
    iceCream: false,
    cake: false,
    milkTea: false,
  },
};

/*
 * 关卡坐标以左上角为原点。platforms / milkTeas / enemies / traps /
 * checkpoints / goal 都可以直接增删或改坐标。
 *
 * 平台 type:
 * - solid：普通平台
 * - moving：在 x/y 与 toX/toY 之间往返
 * - shaky：站上去一段时间后下落，离开后复位
 */
const LEVELS = [
  {
    name: "冰淇淋小路",
    chapter: "第 1 关",
    theme: "day",
    width: 7600,
    requiredMilkTea: 5,
    requiredKey: false,
    reward: GAME_CONFIG.rewardText.level1,
    goalLabel: "冰淇淋小摊",
    start: { x: 120, y: 510 },
    platforms: [
      { x: 0, y: 620, w: 980, h: 100, type: "solid" },
      { x: 1110, y: 620, w: 740, h: 100, type: "solid" },
      { x: 1970, y: 620, w: 930, h: 100, type: "solid" },
      { x: 3060, y: 620, w: 800, h: 100, type: "solid" },
      { x: 4050, y: 620, w: 840, h: 100, type: "solid" },
      { x: 5110, y: 620, w: 960, h: 100, type: "solid" },
      { x: 6270, y: 620, w: 1330, h: 100, type: "solid" },
      { x: 450, y: 495, w: 170, h: 22, type: "solid" },
      { x: 720, y: 405, w: 180, h: 22, type: "solid" },
      { x: 1230, y: 505, w: 190, h: 22, type: "solid" },
      { x: 1510, y: 420, w: 180, h: 22, type: "solid" },
      { x: 2050, y: 490, w: 180, h: 22, type: "solid" },
      { x: 2380, y: 405, w: 180, h: 22, type: "moving", toX: 2760, toY: 405, speed: 95 },
      { x: 3180, y: 505, w: 170, h: 22, type: "solid" },
      { x: 3460, y: 415, w: 180, h: 22, type: "solid" },
      { x: 4130, y: 500, w: 190, h: 22, type: "solid" },
      { x: 4470, y: 400, w: 175, h: 22, type: "moving", toX: 4670, toY: 330, speed: 80 },
      { x: 5190, y: 495, w: 150, h: 22, type: "solid" },
      { x: 5450, y: 385, w: 145, h: 22, type: "solid" },
      { x: 5680, y: 290, w: 145, h: 22, type: "solid" },
      { x: 6360, y: 510, w: 180, h: 22, type: "solid" },
      { x: 6650, y: 420, w: 180, h: 22, type: "solid" },
    ],
    milkTeas: [
      { x: 520, y: 440 }, { x: 790, y: 350 }, { x: 1310, y: 450 },
      { x: 2520, y: 345 }, { x: 3545, y: 360 }, { x: 5540, y: 330 },
      { x: 6735, y: 365 },
    ],
    enemies: [
      { x: 1730, y: 574, w: 48, h: 46, minX: 1540, maxX: 1800, speed: 58, kind: "pearl" },
      { x: 3690, y: 574, w: 52, h: 46, minX: 3470, maxX: 3820, speed: 68, kind: "cup" },
      { x: 5920, y: 574, w: 50, h: 46, minX: 5700, maxX: 6030, speed: 72, kind: "pearl" },
    ],
    traps: [
      { x: 890, y: 598, w: 32, h: 22, kind: "spikes" },
      { x: 1760, y: 598, w: 32, h: 22, kind: "spikes" },
      { x: 2800, y: 598, w: 38, h: 22, kind: "spikes" },
      { x: 3765, y: 598, w: 32, h: 22, kind: "spikes" },
      { x: 4795, y: 598, w: 36, h: 22, kind: "spikes" },
      { x: 5980, y: 598, w: 34, h: 22, kind: "spikes" },
    ],
    checkpoints: [
      { x: 60, y: 550 }, { x: 4130, y: 550 },
    ],
    decorations: [
      { x: 340, kind: "bush" }, { x: 1850, kind: "cart" },
      { x: 3900, kind: "tree" }, { x: 6150, kind: "cart" },
    ],
    goal: { x: 7200, y: 455, w: 250, h: 165, kind: "icecream" },
  },
  {
    name: "糖霜高地",
    chapter: "第 2 关",
    theme: "frosting",
    width: 8000,
    requiredMilkTea: 7,
    requiredKey: false,
    reward: GAME_CONFIG.rewardText.level2,
    goalLabel: "小蛋糕终点门",
    start: { x: 120, y: 510 },
    platforms: [
      { x: 0, y: 620, w: 820, h: 100, type: "solid" },
      { x: 960, y: 620, w: 690, h: 100, type: "solid" },
      { x: 1810, y: 620, w: 720, h: 100, type: "solid" },
      { x: 2700, y: 620, w: 760, h: 100, type: "solid" },
      { x: 3640, y: 620, w: 690, h: 100, type: "solid" },
      { x: 4520, y: 620, w: 760, h: 100, type: "solid" },
      { x: 5480, y: 620, w: 710, h: 100, type: "solid" },
      { x: 6380, y: 620, w: 680, h: 100, type: "solid" },
      { x: 7240, y: 620, w: 760, h: 100, type: "solid" },
      { x: 360, y: 505, w: 175, h: 22, type: "solid" },
      { x: 650, y: 405, w: 165, h: 22, type: "solid" },
      { x: 1050, y: 505, w: 170, h: 22, type: "moving", toX: 1370, toY: 455, speed: 88 },
      { x: 1880, y: 500, w: 175, h: 22, type: "solid" },
      { x: 2180, y: 395, w: 165, h: 22, type: "solid" },
      { x: 2390, y: 300, w: 150, h: 22, type: "shaky" },
      { x: 2790, y: 500, w: 170, h: 22, type: "solid" },
      { x: 3090, y: 390, w: 160, h: 22, type: "moving", toX: 3370, toY: 330, speed: 84 },
      { x: 3710, y: 505, w: 170, h: 22, type: "solid" },
      { x: 4010, y: 405, w: 155, h: 22, type: "shaky" },
      { x: 4590, y: 500, w: 175, h: 22, type: "solid" },
      { x: 4880, y: 390, w: 160, h: 22, type: "solid" },
      { x: 5170, y: 295, w: 150, h: 22, type: "moving", toX: 5420, toY: 350, speed: 92 },
      { x: 5560, y: 500, w: 170, h: 22, type: "solid" },
      { x: 5870, y: 395, w: 155, h: 22, type: "shaky" },
      { x: 6460, y: 505, w: 170, h: 22, type: "solid" },
      { x: 6760, y: 390, w: 160, h: 22, type: "moving", toX: 7010, toY: 325, speed: 96 },
      { x: 7320, y: 490, w: 180, h: 22, type: "solid" },
    ],
    milkTeas: [
      { x: 445, y: 450 }, { x: 735, y: 350 }, { x: 1135, y: 445 },
      { x: 1965, y: 445 }, { x: 2465, y: 245 }, { x: 3170, y: 335 },
      { x: 4090, y: 350 }, { x: 5250, y: 240 }, { x: 6840, y: 335 },
    ],
    enemies: [
      { x: 1480, y: 574, w: 48, h: 46, minX: 1240, maxX: 1600, speed: 66, kind: "cream" },
      { x: 3300, y: 574, w: 48, h: 46, minX: 3060, maxX: 3430, speed: 72, kind: "pearl" },
      { x: 5060, y: 574, w: 52, h: 46, minX: 4780, maxX: 5230, speed: 76, kind: "cup" },
      { x: 6870, y: 574, w: 50, h: 46, minX: 6590, maxX: 7040, speed: 82, kind: "cream" },
    ],
    traps: [
      { x: 745, y: 598, w: 32, h: 22, kind: "spikes" },
      { x: 1570, y: 598, w: 34, h: 22, kind: "spikes" },
      { x: 2450, y: 598, w: 34, h: 22, kind: "spikes" },
      { x: 3375, y: 598, w: 36, h: 22, kind: "spikes" },
      { x: 4240, y: 598, w: 34, h: 22, kind: "spikes" },
      { x: 5190, y: 598, w: 36, h: 22, kind: "spikes" },
      { x: 6100, y: 598, w: 36, h: 22, kind: "spikes" },
      { x: 6980, y: 598, w: 34, h: 22, kind: "spikes" },
    ],
    checkpoints: [
      { x: 60, y: 550 }, { x: 3710, y: 550 },
    ],
    decorations: [
      { x: 230, kind: "cakeBush" }, { x: 1690, kind: "cakeTower" },
      { x: 3480, kind: "cakeBush" }, { x: 4370, kind: "cakeTower" },
      { x: 6240, kind: "cakeBush" }, { x: 7080, kind: "cakeTower" },
    ],
    goal: { x: 7610, y: 440, w: 250, h: 180, kind: "cake" },
  },
  {
    name: "奶茶补给站",
    chapter: "第 3 关",
    theme: "dusk",
    width: 9000,
    requiredMilkTea: 9,
    requiredKey: true,
    keyName: "吸管钥匙",
    reward: GAME_CONFIG.rewardText.level3,
    goalLabel: "奶茶补给站",
    start: { x: 120, y: 510 },
    platforms: [
      { x: 0, y: 620, w: 820, h: 100, type: "solid" },
      { x: 970, y: 620, w: 700, h: 100, type: "solid" },
      { x: 1830, y: 620, w: 770, h: 100, type: "solid" },
      { x: 2810, y: 620, w: 760, h: 100, type: "solid" },
      { x: 3800, y: 620, w: 830, h: 100, type: "solid" },
      { x: 4850, y: 620, w: 690, h: 100, type: "solid" },
      { x: 5770, y: 620, w: 740, h: 100, type: "solid" },
      { x: 6740, y: 620, w: 790, h: 100, type: "solid" },
      { x: 7790, y: 620, w: 1210, h: 100, type: "solid" },
      { x: 330, y: 500, w: 170, h: 22, type: "solid" },
      { x: 610, y: 405, w: 155, h: 22, type: "solid" },
      { x: 1060, y: 490, w: 160, h: 22, type: "moving", toX: 1430, toY: 430, speed: 105 },
      { x: 1910, y: 500, w: 170, h: 22, type: "solid" },
      { x: 2190, y: 395, w: 165, h: 22, type: "solid" },
      { x: 2440, y: 295, w: 155, h: 22, type: "solid" },
      { x: 2880, y: 500, w: 165, h: 22, type: "solid" },
      { x: 3180, y: 390, w: 160, h: 22, type: "shaky" },
      { x: 3870, y: 500, w: 160, h: 22, type: "solid" },
      { x: 4170, y: 390, w: 165, h: 22, type: "moving", toX: 4500, toY: 320, speed: 90 },
      { x: 4930, y: 500, w: 155, h: 22, type: "solid" },
      { x: 5260, y: 395, w: 155, h: 22, type: "solid" },
      { x: 5850, y: 500, w: 165, h: 22, type: "solid" },
      { x: 6160, y: 380, w: 160, h: 22, type: "moving", toX: 6400, toY: 300, speed: 100 },
      { x: 6820, y: 505, w: 155, h: 22, type: "solid" },
      { x: 7100, y: 395, w: 150, h: 22, type: "shaky" },
      { x: 7350, y: 300, w: 150, h: 22, type: "solid" },
      { x: 7870, y: 500, w: 145, h: 22, type: "solid" },
      { x: 8110, y: 390, w: 145, h: 22, type: "moving", toX: 8370, toY: 330, speed: 105 },
      { x: 8510, y: 270, w: 150, h: 22, type: "solid" },
      { x: 3530, y: 205, w: 170, h: 22, type: "solid" },
      { x: 3290, y: 270, w: 135, h: 22, type: "solid" },
    ],
    milkTeas: [
      { x: 410, y: 445 }, { x: 680, y: 350 }, { x: 1150, y: 410 },
      { x: 2270, y: 340 }, { x: 2965, y: 445 }, { x: 3615, y: 150 },
      { x: 4270, y: 325 }, { x: 5340, y: 340 }, { x: 6250, y: 325 },
      { x: 7425, y: 245 }, { x: 8585, y: 215 },
    ],
    enemies: [
      { x: 720, y: 574, w: 50, h: 46, minX: 530, maxX: 790, speed: 72, kind: "cloud" },
      { x: 1500, y: 574, w: 48, h: 46, minX: 1250, maxX: 1630, speed: 82, kind: "pearl" },
      { x: 2320, y: 574, w: 52, h: 46, minX: 2070, maxX: 2550, speed: 76, kind: "cup" },
      { x: 3430, y: 574, w: 50, h: 46, minX: 3170, maxX: 3520, speed: 88, kind: "pearl" },
      { x: 4450, y: 574, w: 52, h: 46, minX: 4140, maxX: 4580, speed: 90, kind: "cloud" },
      { x: 5420, y: 574, w: 48, h: 46, minX: 5160, maxX: 5490, speed: 96, kind: "pearl" },
      { x: 6400, y: 574, w: 52, h: 46, minX: 6130, maxX: 6470, speed: 86, kind: "cup" },
      { x: 7390, y: 574, w: 50, h: 46, minX: 7080, maxX: 7480, speed: 100, kind: "pearl" },
      { x: 8420, y: 574, w: 52, h: 46, minX: 8090, maxX: 8600, speed: 105, kind: "cloud" },
    ],
    traps: [
      { x: 745, y: 598, w: 34, h: 22, kind: "spikes" },
      { x: 1580, y: 598, w: 36, h: 22, kind: "spikes" },
      { x: 2510, y: 598, w: 36, h: 22, kind: "spikes" },
      { x: 3470, y: 598, w: 38, h: 22, kind: "spikes" },
      { x: 4535, y: 598, w: 36, h: 22, kind: "spikes" },
      { x: 5460, y: 598, w: 36, h: 22, kind: "spikes" },
      { x: 6430, y: 598, w: 38, h: 22, kind: "spikes" },
      { x: 7440, y: 598, w: 36, h: 22, kind: "spikes" },
      { x: 8610, y: 598, w: 38, h: 22, kind: "spikes" },
    ],
    checkpoints: [
      { x: 60, y: 550 }, { x: 3880, y: 550 }, { x: 7870, y: 550 },
    ],
    decorations: [
      { x: 250, kind: "lamp" }, { x: 1710, kind: "shop" }, { x: 2710, kind: "lamp" },
      { x: 3710, kind: "shop" }, { x: 4700, kind: "lamp" }, { x: 5620, kind: "shop" },
      { x: 6600, kind: "lamp" }, { x: 7640, kind: "shop" },
    ],
    key: { x: 3600, y: 145 },
    boost: { x: 5020, y: 555 },
    goal: { x: 8650, y: 430, w: 270, h: 190, kind: "milktea" },
  },
];

/* =========================================================
   二、运行状态与页面元素
   ========================================================= */
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const screens = [...document.querySelectorAll(".screen")];
const ui = {
  home: document.querySelector("#homeScreen"),
  levelSelect: document.querySelector("#levelSelectScreen"),
  game: document.querySelector("#gameScreen"),
  complete: document.querySelector("#levelCompleteScreen"),
  final: document.querySelector("#finalScreen"),
  levelEyebrow: document.querySelector("#levelEyebrow"),
  levelName: document.querySelector("#levelName"),
  health: document.querySelector("#healthValue"),
  tea: document.querySelector("#teaValue"),
  keyChip: document.querySelector("#keyChip"),
  key: document.querySelector("#keyValue"),
  toast: document.querySelector("#toast"),
  tutorial: document.querySelector("#tutorialHint"),
  dialog: document.querySelector("#dialogBackdrop"),
  dialogContent: document.querySelector("#dialogContent"),
  pause: document.querySelector("#pauseOverlay"),
  mapToast: document.querySelector("#mapToast"),
};

document.title = GAME_CONFIG.title;
document.querySelector("#finalRewardText").textContent = GAME_CONFIG.rewardText.final;

let currentLevelIndex = 0;
let selectedLevelIndex = 0;
let level = null;
let player = null;
let gameState = GAME_STATE.HOME;
let progress = loadProgress();
let cameraX = 0;
let lastTime = 0;
let levelStartTime = 0;
let elapsedBeforePause = 0;
let animationId = 0;
let toastTimer = 0;
let particles = [];
let floatTexts = [];
let celebrationTimer = 0;
let audioContext = null;
let masterGain = null;
let bgmGain = null;
let sfxGain = null;
let bgmTimer = 0;
let bgmStep = 0;
let isBgmPlaying = false;
let audioSettings = loadAudioSettings();

const keys = { left: false, right: false, jump: false };
const pressed = { jump: false };

function loadAudioSettings() {
  try {
    return { muted: false, ...JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY) || "{}") };
  } catch (_) {
    return { muted: false };
  }
}

function saveAudioSettings() {
  try { localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(audioSettings)); } catch (_) {}
}

function initAudio() {
  if (audioContext) {
    if (audioContext.state === "suspended") audioContext.resume();
    if (!audioSettings.muted) startBgm();
    return;
  }
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    bgmGain = audioContext.createGain();
    sfxGain = audioContext.createGain();
    masterGain.gain.value = audioSettings.muted ? 0 : AUDIO_CONFIG.masterVolume;
    bgmGain.gain.value = AUDIO_CONFIG.bgmVolume;
    sfxGain.gain.value = AUDIO_CONFIG.sfxVolume;
    bgmGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(audioContext.destination);
    if (!audioSettings.muted) startBgm();
  } catch (_) {
    audioContext = null;
  }
}

function playOscillator(frequency, duration, type = "triangle", volume = .16, delay = 0, target = "sfx") {
  if (!audioContext || audioSettings.muted) return;
  const output = target === "bgm" ? bgmGain : sfxGain;
  const start = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(output);
  oscillator.start(start);
  oscillator.stop(start + duration + .03);
}

function scheduleBgmStep() {
  if (!audioContext || audioSettings.muted) return;
  const melody = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 988, 880, 698, 659, 587];
  const bass = [131, 147, 165, 147];
  const note = melody[bgmStep % melody.length];
  playOscillator(note, .24, "triangle", .055, 0, "bgm");
  if (bgmStep % 4 === 0) playOscillator(bass[(bgmStep / 4) % bass.length], .42, "sine", .045, 0, "bgm");
  if (bgmStep % 2 === 1) playOscillator(1300, .035, "sine", .018, 0, "bgm");
  bgmStep = (bgmStep + 1) % melody.length;
}

function startBgm() {
  if (!audioContext || isBgmPlaying || audioSettings.muted) return;
  isBgmPlaying = true;
  scheduleBgmStep();
  const stepMs = 60000 / AUDIO_CONFIG.bpm / 2;
  bgmTimer = window.setInterval(scheduleBgmStep, stepMs);
}

function stopBgm() {
  window.clearInterval(bgmTimer);
  isBgmPlaying = false;
  bgmTimer = 0;
}

function updateAudioButtons() {
  document.querySelectorAll("[data-audio-toggle]").forEach((button) => {
    button.classList.toggle("muted", audioSettings.muted);
    button.setAttribute("aria-label", audioSettings.muted ? "开启声音" : "关闭声音");
    if (button.classList.contains("splash-sound-toggle")) {
      button.querySelector(".music-icon").textContent = audioSettings.muted ? "♩" : "♪";
      button.querySelector(".music-text").textContent = audioSettings.muted ? "音乐关" : "音乐开";
    } else if (button.classList.contains("splash-bottom-music")) {
      button.querySelector(".circle-icon").textContent = audioSettings.muted ? "♩" : "♪";
      button.querySelector(".circle-label").textContent = audioSettings.muted ? "音乐关" : "音乐开";
    } else {
      button.textContent = button.classList.contains("pause-audio-toggle")
        ? (audioSettings.muted ? "🔇 开启声音" : "♪ 关闭声音")
        : (audioSettings.muted ? "🔇" : "♪");
    }
  });
}

function toggleMute() {
  initAudio();
  audioSettings.muted = !audioSettings.muted;
  saveAudioSettings();
  if (masterGain) masterGain.gain.setTargetAtTime(audioSettings.muted ? 0 : AUDIO_CONFIG.masterVolume, audioContext.currentTime, .03);
  if (audioSettings.muted) stopBgm(); else startBgm();
  updateAudioButtons();
}

function playJumpSfx() { playOscillator(390, .09, "triangle", .12); playOscillator(520, .08, "sine", .08, .04); }
function playDoubleJumpSfx() { playOscillator(560, .08, "triangle", .13); playOscillator(820, .12, "sine", .11, .05); }
function playCollectSfx() { playOscillator(760, .08, "sine", .14); playOscillator(980, .13, "triangle", .1, .06); }
function playHurtSfx() { playOscillator(230, .16, "sawtooth", .07); playOscillator(170, .17, "triangle", .07, .06); }
function playClearSfx() { [523, 659, 784, 1047].forEach((note, i) => playOscillator(note, .2, "triangle", .13, i * .11)); }
function playButtonSfx() { playOscillator(520, .055, "sine", .06); }

function cloneLevel(source) {
  return {
    ...source,
    platforms: source.platforms.map((p) => ({
      ...p, baseX: p.x, baseY: p.y, dir: 1, shakeTime: 0, fallSpeed: 0, dx: 0, dy: 0,
    })),
    milkTeas: source.milkTeas.map((t) => ({ ...t, collected: false, phase: Math.random() * Math.PI * 2 })),
    enemies: source.enemies.map((e) => ({ ...e, alive: true, dir: Math.random() > .5 ? 1 : -1 })),
    traps: source.traps.map((t) => ({ ...t })),
    checkpoints: source.checkpoints.map((c, index) => ({
      ...c, active: false, triggered: false, activationGlow: 0, phase: index * 1.7,
    })),
    decorations: source.decorations.map((d) => ({ ...d })),
    key: source.key ? { ...source.key, collected: false } : null,
    boost: source.boost ? { ...source.boost, collected: false } : null,
  };
}

function createPlayer(start) {
  return {
    x: start.x, y: start.y, w: 42, h: 62,
    vx: 0, vy: 0, facing: 1, grounded: false, standingPlatform: null,
    jumps: 0, health: GAME_CONFIG.maxHealth, tea: 0, hasKey: false,
    checkpoint: { ...start }, invincible: 0, boost: 0, hurtFlash: 0,
    animState: "idle", animTime: 0, doubleJumpTriggered: false,
    doubleJumpTimer: 0, landingTimer: 0, turnTimer: 0,
    isHurt: false, isClearing: false,
  };
}

function showScreen(screen) {
  screens.forEach((item) => item.classList.toggle("active", item === screen));
  window.setTimeout(scheduleViewportRefresh, 0);
}

function createDefaultProgress() {
  return {
    ...DEFAULT_PROGRESS,
    rewards: { ...DEFAULT_PROGRESS.rewards },
  };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (!saved || typeof saved !== "object") return createDefaultProgress();
    return {
      ...createDefaultProgress(),
      ...saved,
      rewards: { ...DEFAULT_PROGRESS.rewards, ...(saved.rewards || {}) },
    };
  } catch (_) {
    return createDefaultProgress();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (_) {
    // 某些 file:// 隐私设置会禁用 localStorage，游戏仍然可以正常游玩。
  }
}

function resetProgress() {
  progress = createDefaultProgress();
  selectedLevelIndex = 0;
  saveProgress();
  renderLevelMap();
  showMapToast("挑战进度已重置。");
}

function isLevelUnlocked(index) {
  if (index === 0) return true;
  return Boolean(progress[`level${index}Cleared`]);
}

function lockedLevelMessage(index) {
  return index === 2
    ? "先通过糖霜高地，再去奶茶补给站。"
    : "先通过冰淇淋小路，再来挑战这一关。";
}

function selectLevel(index, notifyLocked = true) {
  if (!isLevelUnlocked(index)) {
    if (notifyLocked) showMapToast(lockedLevelMessage(index));
    return false;
  }
  selectedLevelIndex = index;
  playButtonSfx();
  requestLandscapeMode();
  startLevel(index);
  return true;
}

function renderLevelNode(index) {
  const node = document.querySelector(`#levelNode${index}`);
  const levelNumber = index + 1;
  const cleared = Boolean(progress[`level${levelNumber}Cleared`]);
  const unlocked = isLevelUnlocked(index);
  const bestTea = Math.min(progress[`level${levelNumber}BestMilkTea`] || 0, LEVELS[index].requiredMilkTea);
  const bestTime = progress[`level${levelNumber}BestTime`];
  const required = LEVELS[index].requiredMilkTea;
  node.classList.toggle("locked", !unlocked);
  node.classList.toggle("cleared", cleared);
  document.querySelector(`#levelTea${index}`).textContent = `🧋 ${bestTea} / ${required}`;
  document.querySelector(`#levelBest${index}`).textContent = !unlocked
    ? "完成上一关后解锁"
    : cleared
      ? `已完成 · 最佳 ${formatTime(bestTime)}`
      : "尚未通关";
}

function renderLevelMap() {
  LEVELS.forEach((_, index) => renderLevelNode(index));
  const totalTea = LEVELS.reduce((sum, data, index) => {
    return sum + Math.min(progress[`level${index + 1}BestMilkTea`] || 0, data.requiredMilkTea);
  }, 0);
  const rewardCount = Number(progress.rewards.iceCream) + Number(progress.rewards.cake) + Number(progress.rewards.milkTea);
  document.querySelector("#mapTeaTotal").textContent = `${totalTea} / 21`;
  document.querySelector("#mapRewardTotal").textContent = `${rewardCount} / 3`;
  document.querySelector("#mapStatus").textContent = progress.level3Cleared ? "全部完成" : "可挑战";
}

function showMapToast(message) {
  clearTimeout(showMapToast.timer);
  ui.mapToast.textContent = message;
  ui.mapToast.classList.add("show");
  showMapToast.timer = setTimeout(() => ui.mapToast.classList.remove("show"), 2400);
}

function showLevelSelect() {
  cancelAnimationFrame(animationId);
  gameState = GAME_STATE.LEVEL_SELECT;
  level = null;
  player = null;
  ui.pause.classList.remove("open");
  ui.pause.setAttribute("aria-hidden", "true");
  if (!isLevelUnlocked(selectedLevelIndex)) selectedLevelIndex = 0;
  renderLevelMap();
  showScreen(ui.levelSelect);
}

function startLevel(index) {
  if (!isLevelUnlocked(index)) {
    showLevelSelect();
    showMapToast(lockedLevelMessage(index));
    return;
  }
  currentLevelIndex = index;
  level = cloneLevel(LEVELS[index]);
  player = createPlayer(level.start);
  const startingCheckpoint = level.checkpoints[0];
  if (startingCheckpoint && player.x >= startingCheckpoint.x) {
    startingCheckpoint.active = true;
    startingCheckpoint.triggered = true;
  }
  cameraX = 0;
  particles = [];
  floatTexts = [];
  celebrationTimer = 0;
  elapsedBeforePause = 0;
  levelStartTime = performance.now();
  gameState = GAME_STATE.PLAYING;
  showScreen(ui.game);
  // 游戏页此前处于 display:none，必须在显示后重新读取实际尺寸。
  resizeCanvas();
  scheduleViewportRefresh();
  ui.levelEyebrow.textContent = level.chapter;
  ui.levelName.textContent = level.name;
  ui.keyChip.classList.toggle("hidden", !level.requiredKey);
  ui.tutorial.style.opacity = "1";
  updateHud();
  showToast(level.requiredKey
    ? `目标：收集 ${level.requiredMilkTea} 杯奶茶，拿到吸管钥匙并抵达终点`
    : `目标：收集 ${level.requiredMilkTea} 杯奶茶并抵达终点`, 3200);
  clearTimeout(startLevel.tutorialTimer);
  startLevel.tutorialTimer = setTimeout(() => { ui.tutorial.style.opacity = "0"; }, 6000);
  lastTime = performance.now();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
}

function restartLevel() {
  closePause();
  startLevel(currentLevelIndex);
  showToast(randomFailMessage());
}

function updateHud() {
  ui.health.textContent = Array.from({ length: GAME_CONFIG.maxHealth }, (_, i) => i < player.health ? "♥" : "♡").join(" ");
  ui.tea.textContent = `🧋 ${player.tea} / ${level.requiredMilkTea}`;
  if (level.requiredKey) {
    ui.key.textContent = player.hasKey ? "已获得" : "未获得";
  }
}

function showToast(message, duration = 2200) {
  clearTimeout(toastTimer);
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  toastTimer = setTimeout(() => ui.toast.classList.remove("show"), duration);
}

function randomFailMessage() {
  return GAME_CONFIG.failMessages[Math.floor(Math.random() * GAME_CONFIG.failMessages.length)];
}

/* =========================================================
   三、输入
   ========================================================= */
window.addEventListener("keydown", (event) => {
  initAudio();
  const code = event.code;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyA", "KeyD", "KeyW"].includes(code)) {
    event.preventDefault();
  }
  if (code === "ArrowLeft" || code === "KeyA") keys.left = true;
  if (code === "ArrowRight" || code === "KeyD") keys.right = true;
  if (code === "ArrowUp" || code === "KeyW" || code === "Space") {
    if (!keys.jump) pressed.jump = true;
    keys.jump = true;
  }
  if (code === "KeyP" || code === "Escape") togglePause();
});

window.addEventListener("keyup", (event) => {
  const code = event.code;
  if (code === "ArrowLeft" || code === "KeyA") keys.left = false;
  if (code === "ArrowRight" || code === "KeyD") keys.right = false;
  if (code === "ArrowUp" || code === "KeyW" || code === "Space") keys.jump = false;
});

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;
  const down = (event) => {
    event.preventDefault();
    initAudio();
    button.classList.add("pressed");
    if (control === "jump" && !keys.jump) pressed.jump = true;
    keys[control] = true;
  };
  const up = (event) => {
    event.preventDefault();
    button.classList.remove("pressed");
    keys[control] = false;
  };
  button.addEventListener("pointerdown", down);
  button.addEventListener("pointerup", up);
  button.addEventListener("pointercancel", up);
  button.addEventListener("pointerleave", up);
});

window.addEventListener("blur", () => {
  keys.left = keys.right = keys.jump = false;
  if (gameState === GAME_STATE.PLAYING) openPause();
});

/* =========================================================
   四、游戏更新
   ========================================================= */
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  if (gameState === GAME_STATE.PLAYING) update(dt);
  draw(now / 1000);
  if ([GAME_STATE.PLAYING, GAME_STATE.PAUSED, GAME_STATE.CELEBRATING].includes(gameState)) {
    animationId = requestAnimationFrame(loop);
  }
}

function update(dt) {
  updatePlatforms(dt);
  updatePlayer(dt);
  updateEnemies(dt);
  updateItems(dt);
  updateParticles(dt);
  updateCheckpoints(dt);
  updateCamera(dt);

  if (player.invincible > 0) player.invincible -= dt;
  if (player.boost > 0) player.boost -= dt;
  if (player.y > 800) hurtPlayer("掉进小水坑啦，回到最近的安全位置。", true);
  pressed.jump = false;
}

function updatePlayer(dt) {
  const stats = GAME_CONFIG.player;
  const wasGrounded = player.grounded;
  const oldFacing = player.facing;
  const supportPlatform = player.standingPlatform;
  player.animTime += dt;
  player.doubleJumpTimer = Math.max(0, player.doubleJumpTimer - dt);
  player.landingTimer = Math.max(0, player.landingTimer - dt);
  player.turnTimer = Math.max(0, player.turnTimer - dt);
  if (player.doubleJumpTimer === 0) player.doubleJumpTriggered = false;
  player.isHurt = player.invincible > 0;
  const targetSpeed = player.boost > 0 ? stats.boostSpeed : stats.moveSpeed;
  const direction = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);

  if (direction !== 0) {
    player.vx = approach(player.vx, direction * targetSpeed, stats.acceleration * dt);
    player.facing = direction;
    if (oldFacing !== player.facing) player.turnTimer = .16;
  } else {
    player.vx = approach(player.vx, 0, stats.friction * dt);
  }

  // 先继承脚下平台本帧的位移，再处理起跳。
  // 否则起跳帧会少走一帧平台位移，横向移动的平台会让角色看起来突然回退。
  if (supportPlatform) {
    player.x += supportPlatform.dx;
    player.y += supportPlatform.dy;
  }

  if (pressed.jump && player.jumps < 2) {
    const isDoubleJump = player.jumps === 1;
    player.vy = -(player.jumps === 0 ? stats.jumpForce : stats.secondJumpForce);
    if (!isDoubleJump && supportPlatform?.type === "moving" && dt > 0) {
      const platformVelocityX = supportPlatform.dx / dt;
      player.vx += clamp(platformVelocityX * 0.3, -45, 45);
    }
    player.jumps += 1;
    player.doubleJumpTriggered = isDoubleJump;
    player.doubleJumpTimer = isDoubleJump ? .42 : 0;
    player.grounded = false;
    player.standingPlatform = null;
    burst(player.x + player.w / 2, player.y + player.h, "#f7d7a4", 7, 110);
    if (isDoubleJump) {
      emitDoubleJumpParticles(player.x + player.w / 2, player.y + player.h / 2);
      playDoubleJumpSfx();
    } else {
      playJumpSfx();
    }
  }

  if (!keys.jump && player.vy < -260) player.vy += stats.gravity * 1.45 * dt;
  player.vy = Math.min(player.vy + stats.gravity * dt, stats.maxFallSpeed);

  const previousX = player.x;
  player.x += player.vx * dt;
  resolveHorizontal(previousX);
  const previousY = player.y;
  player.y += player.vy * dt;
  const impactVelocity = player.vy;
  player.grounded = false;
  player.standingPlatform = null;
  resolveVertical(previousY);
  if (!wasGrounded && player.grounded && impactVelocity > 260) {
    player.landingTimer = .18;
    burst(player.x + player.w / 2, player.y + player.h - 2, "rgba(205,229,242,.9)", 5, 75);
  }
  player.x = clamp(player.x, 0, level.width - player.w);
}

function resolveHorizontal(previousX) {
  for (const platform of level.platforms) {
    // 跳台是单向落脚面，不应该在侧面把角色顶停或推回。
    if (platform.h <= 30) continue;
    if (!intersects(player, platform)) continue;
    const previousRight = previousX + player.w;
    const previousLeft = previousX;
    if (player.vx > 0 && previousRight <= platform.x + 4) {
      player.x = platform.x - player.w;
    } else if (player.vx < 0 && previousLeft >= platform.x + platform.w - 4) {
      player.x = platform.x + platform.w;
    } else {
      continue;
    }
    player.vx = 0;
  }
}

function resolveVertical(previousY) {
  let landingPlatform = null;
  const previousBottom = previousY + player.h;
  const currentBottom = player.y + player.h;

  for (const platform of level.platforms) {
    const overlapsX = player.x + player.w > platform.x + 2
      && player.x < platform.x + platform.w - 2;
    const landingTolerance = 12 + Math.abs(platform.dy || 0);
    const crossesTop = previousBottom <= platform.y + landingTolerance
      && currentBottom >= platform.y;

    if (player.vy >= 0 && overlapsX && crossesTop) {
      if (!landingPlatform || platform.y < landingPlatform.y) landingPlatform = platform;
    } else if (player.vy < 0 && platform.h > 30 && intersects(player, platform)) {
      player.y = platform.y + platform.h;
      player.vy = 0;
    }
  }

  if (!landingPlatform) return;
  player.y = landingPlatform.y - player.h;
  player.vy = 0;
  player.grounded = true;
  player.jumps = 0;
  player.standingPlatform = landingPlatform;
  if (landingPlatform.type === "shaky") landingPlatform.shakeTime += 0.03;
}

function updatePlatforms(dt) {
  for (const p of level.platforms) {
    const oldX = p.x;
    const oldY = p.y;
    if (p.type === "moving") {
      const targetX = p.dir > 0 ? p.toX : p.baseX;
      const targetY = p.dir > 0 ? p.toY : p.baseY;
      const dx = targetX - p.x;
      const dy = targetY - p.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 3) p.dir *= -1;
      else {
        p.x += dx / distance * p.speed * dt;
        p.y += dy / distance * p.speed * dt;
      }
    }
    if (p.type === "shaky") {
      const standing = player?.standingPlatform === p;
      if (standing) p.shakeTime += dt;
      else if (p.shakeTime < 1) p.shakeTime = Math.max(0, p.shakeTime - dt * 2);
      if (p.shakeTime > .65) {
        p.fallSpeed += 900 * dt;
        p.y += p.fallSpeed * dt;
      }
      if (p.y > 820) {
        p.y = p.baseY;
        p.fallSpeed = 0;
        p.shakeTime = 0;
      }
    }
    p.dx = p.x - oldX;
    p.dy = p.y - oldY;
  }
}

function updateEnemies(dt) {
  for (const enemy of level.enemies) {
    if (!enemy.alive) continue;
    enemy.x += enemy.speed * enemy.dir * dt;
    if (enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) enemy.dir *= -1;
    if (!intersects(player, enemy)) continue;
    const playerBottom = player.y + player.h;
    if (player.vy > 120 && playerBottom - enemy.y < 28) {
      enemy.alive = false;
      player.vy = -390;
      burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#e8b5a5", 12, 190);
      addFloatText(enemy.x, enemy.y, "小麻烦解决", "#fff4d9");
      tone(680, .09, "triangle");
    } else {
      hurtPlayer("被小麻烦碰到了，先退一步。");
    }
  }

  for (const trap of level.traps) {
    const hitbox = { x: trap.x + 3, y: trap.y + 2, w: trap.w - 6, h: trap.h - 2 };
    if (intersects(player, hitbox)) hurtPlayer("碰到路障啦，甜度需要重新校准。");
  }
}

function updateItems() {
  for (const tea of level.milkTeas) {
    if (tea.collected) continue;
    const hitbox = { x: tea.x - 19, y: tea.y - 25, w: 38, h: 50 };
    if (intersects(player, hitbox)) {
      tea.collected = true;
      player.tea += 1;
      updateHud();
      burst(tea.x, tea.y, "#ffd77a", 12, 170);
      addFloatText(tea.x - 18, tea.y - 20, "+1 奶茶", "#fff5c5");
      playCollectSfx();
    }
  }

  if (level.key && !level.key.collected &&
      intersects(player, { x: level.key.x - 22, y: level.key.y - 28, w: 44, h: 56 })) {
    level.key.collected = true;
    player.hasKey = true;
    updateHud();
    burst(level.key.x, level.key.y, "#f7a4b7", 18, 210);
    addFloatText(level.key.x - 38, level.key.y - 30, "吸管钥匙已获得", "#ffe6ef");
    showToast("找到吸管钥匙了，奶茶店的门可以打开啦！");
    tone(520, .12, "triangle");
    setTimeout(() => tone(720, .12, "triangle"), 120);
  }

  if (level.boost && !level.boost.collected &&
      intersects(player, { x: level.boost.x - 20, y: level.boost.y - 20, w: 40, h: 40 })) {
    level.boost.collected = true;
    player.boost = 5;
    burst(level.boost.x, level.boost.y, "#9ee8dd", 16, 220);
    showToast("甜度加速中！持续 5 秒");
    tone(850, .1, "sine");
  }

  if (intersects(player, level.goal)) tryGoal();
}

function updateCheckpoints(dt) {
  level.checkpoints.forEach((checkpoint) => {
    checkpoint.activationGlow = Math.max(0, checkpoint.activationGlow - dt);
  });

  const reachedCheckpoint = [...level.checkpoints]
    .reverse()
    .find((checkpoint) => !checkpoint.triggered && player.x + player.w >= checkpoint.x);
  if (!reachedCheckpoint) return;

  level.checkpoints.forEach((checkpoint) => { checkpoint.active = false; });
  reachedCheckpoint.active = true;
  reachedCheckpoint.triggered = true;
  reachedCheckpoint.activationGlow = .85;
  player.checkpoint = { x: reachedCheckpoint.x + 20, y: reachedCheckpoint.y - 20 };
  burst(reachedCheckpoint.x + 17, reachedCheckpoint.y - 5, PLAYER_SKIN.blue, 8, 90);
  playOscillator(720, .12, "sine", .065);
  showToast("复活点已记录。", 1200);
}

function tryGoal() {
  if (celebrationTimer > 0) return;
  if (player.tea < level.requiredMilkTea) {
    showToast(currentLevelIndex === 0
      ? `还差一点甜度，再收集 ${level.requiredMilkTea - player.tea} 杯奶茶吧。`
      : `奶茶还没集齐，还差 ${level.requiredMilkTea - player.tea} 杯。`);
    player.x = level.goal.x - player.w - 15;
    player.vx = -120;
    return;
  }
  if (level.requiredKey && !player.hasKey) {
    showToast("还差一根吸管钥匙，奶茶店的门暂时打不开。");
    player.x = level.goal.x - player.w - 15;
    player.vx = -120;
    return;
  }
  finishLevel();
}

function hurtPlayer(message, fell = false) {
  if (player.invincible > 0 || gameState !== GAME_STATE.PLAYING) return;
  player.health -= 1;
  player.invincible = GAME_CONFIG.player.invincibleSeconds;
  player.hurtFlash = .35;
  updateHud();
  burst(player.x + player.w / 2, player.y + player.h / 2, "#f49a9a", 9, 180);
  playHurtSfx();
  if (player.health <= 0) {
    showToast(randomFailMessage(), 1500);
    gameState = GAME_STATE.PAUSED;
    setTimeout(() => startLevel(currentLevelIndex), 1200);
    return;
  }
  showToast(message);
  if (fell) respawn();
  else {
    player.vx = -player.facing * 250;
    player.vy = -330;
  }
}

function respawn() {
  player.x = player.checkpoint.x;
  player.y = player.checkpoint.y;
  player.vx = 0;
  player.vy = 0;
}

function finishLevel() {
  gameState = GAME_STATE.CELEBRATING;
  player.isClearing = true;
  celebrationTimer = 1.1;
  player.vx = 0;
  player.vy = -420;
  burst(player.x + player.w / 2, player.y, "#ffd77a", 28, 280);
  playClearSfx();
  const elapsed = elapsedBeforePause + (performance.now() - levelStartTime);
  setTimeout(() => completeLevel(currentLevelIndex, elapsed), 1050);
}

function updateCamera(dt) {
  const target = clamp(player.x - canvas.width * .34, 0, Math.max(0, level.width - canvas.width));
  cameraX += (target - cameraX) * Math.min(1, dt * 5.5);
}

function updateParticles(dt) {
  particles.forEach((p) => {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 420 * dt;
  });
  particles = particles.filter((p) => p.life > 0);
  floatTexts.forEach((t) => { t.life -= dt; t.y -= 34 * dt; });
  floatTexts = floatTexts.filter((t) => t.life > 0);
}

/* =========================================================
   五、Canvas 绘制（所有图形均为原创程序绘制）
   ========================================================= */
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = clamp(rect.width / Math.max(rect.height, 1), .72, 4);
  canvas.height = 720;
  canvas.width = Math.round(720 * ratio);
}

let viewportRefreshTimer = 0;
function updateMobileOrientationLayout() {
  const needsLandscape = window.innerWidth <= 700 && window.innerHeight > window.innerWidth;
  document.body.classList.toggle("needs-landscape", needsLandscape);
  document.querySelector("#orientationGate").setAttribute("aria-hidden", needsLandscape ? "false" : "true");
}

function scheduleViewportRefresh() {
  clearTimeout(viewportRefreshTimer);
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${Math.round(viewportHeight)}px`);
  updateMobileOrientationLayout();
  resizeCanvas();
  viewportRefreshTimer = window.setTimeout(resizeCanvas, 180);
  window.setTimeout(resizeCanvas, 480);
}

function isTouchPhone() {
  const touchCapable = navigator.maxTouchPoints > 0 ||
    window.matchMedia("(hover: none), (pointer: coarse)").matches;
  return touchCapable &&
    Math.min(window.screen.width, window.screen.height) < 900;
}

async function requestLandscapeMode() {
  if (!isTouchPhone()) return;
  document.body.classList.add("mobile-game-mode");
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
    if (screen.orientation?.lock) await screen.orientation.lock("landscape");
  } catch (_) {
    // iOS Safari 等浏览器不开放方向锁定；保留旋转提示并在实际旋转后重排画面。
  } finally {
    scheduleViewportRefresh();
  }
}

window.addEventListener("resize", scheduleViewportRefresh);
window.addEventListener("orientationchange", scheduleViewportRefresh);
window.visualViewport?.addEventListener("resize", scheduleViewportRefresh);
resizeCanvas();

function draw(time) {
  if (!level || !player) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(time);
  ctx.save();
  ctx.translate(-cameraX, 0);
  drawDecorations();
  level.platforms.forEach(drawPlatform);
  level.checkpoints.forEach((point) => drawCheckpointFlag(point, time));
  level.traps.forEach(drawTrap);
  level.milkTeas.forEach((tea) => { if (!tea.collected) drawMilkTea(tea, time); });
  if (level.key && !level.key.collected) drawKey(level.key, time);
  if (level.boost && !level.boost.collected) drawBoost(level.boost, time);
  level.enemies.forEach((enemy) => { if (enemy.alive) drawEnemy(enemy, time); });
  drawGoal(level.goal, time);
  drawPlayer(time);
  drawEffects();
  ctx.restore();
}

function drawBackground(time) {
  const dusk = level.theme === "dusk";
  const frosting = level.theme === "frosting";
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (dusk) {
    gradient.addColorStop(0, "#7d88b5");
    gradient.addColorStop(.58, "#efb0a3");
    gradient.addColorStop(1, "#f8d8b3");
  } else if (frosting) {
    gradient.addColorStop(0, "#d9e9ff");
    gradient.addColorStop(.54, "#f7dff0");
    gradient.addColorStop(1, "#ffd8df");
  } else {
    gradient.addColorStop(0, "#bde7e8");
    gradient.addColorStop(.68, "#fff0ce");
    gradient.addColorStop(1, "#ffe3b7");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (dusk) {
    ctx.fillStyle = "rgba(255,244,207,.9)";
    circle(canvas.width - 130, 105, 38);
    ctx.fillStyle = "rgba(255,255,255,.48)";
    for (let i = 0; i < 14; i++) {
      const x = (i * 173 - cameraX * .08) % (canvas.width + 100);
      circle(x, 70 + (i % 4) * 37, 1.8);
    }
    drawCityLayer(.12, 430, "#6c6f91");
    drawCityLayer(.2, 500, "#5a617d");
    drawDuskAtmosphere(time);
  } else if (frosting) {
    ctx.fillStyle = "rgba(255,250,229,.88)";
    circle(canvas.width - 132, 108, 48);
    drawCloudLayer(time, .08, 142);
    drawHills(.1, 500, "#f3c2d4");
    drawHills(.18, 555, "#e9a9c1");
    drawFrostingAtmosphere(time);
  } else {
    ctx.fillStyle = "rgba(255,243,183,.92)";
    circle(canvas.width - 120, 112, 52);
    drawCloudLayer(time, .1, 150);
    drawHills(.12, 480, "#b9d6b4");
    drawHills(.2, 545, "#91c29b");
    drawDayAtmosphere(time);
  }
}

function drawFrostingAtmosphere(time) {
  ctx.save();
  ctx.translate(-(cameraX * .06 % 480), 0);
  ctx.globalAlpha = .28;
  for (let i = -1; i < 6; i++) {
    const x = i * 480 + 110;
    ctx.fillStyle = "#fff7f2";
    circle(x, 424, 39); circle(x + 42, 408, 52); circle(x + 92, 430, 36);
    ctx.fillStyle = "#ef8fae";
    circle(x + 26, 392, 8); circle(x + 75, 395, 7);
    ctx.fillStyle = "#c86f86";
    ctx.fillRect(x + 23, 368, 5, 22);
  }
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.3)";
  for (let i = 0; i < 12; i++) {
    const x = (i * 157 - cameraX * .08 + time * 4) % (canvas.width + 80);
    circle(x, 325 + (i % 4) * 37, 2 + (i % 3));
  }
}

function drawDayAtmosphere(time) {
  // 远景只使用圆润植被轮廓，避免任何横条形状被误认为平台。
  ctx.save();
  ctx.translate(-(cameraX * .055 % 520), 0);
  ctx.globalAlpha = .18;
  for (let i = -1; i < 5; i++) {
    const x = i * 520 + 120;
    ctx.fillStyle = "#7da88b";
    circle(x, 437, 34); circle(x + 35, 424, 45); circle(x + 78, 440, 31);
    ctx.fillStyle = "#a6c7a6";
    circle(x + 18, 410, 20); circle(x + 61, 414, 24);
  }
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,.22)";
  for (let i = 0; i < 9; i++) {
    const x = (i * 191 - cameraX * .09 + time * 3) % (canvas.width + 80);
    circle(x, 350 + (i % 3) * 39, 2 + (i % 2));
  }
}

function drawDuskAtmosphere(time) {
  // 暖色窗光和远处灯串建立街区纵深，保持在角色活动区之外。
  ctx.save();
  ctx.globalAlpha = .22;
  ctx.strokeStyle = "#ffe1a0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 285);
  for (let x = 0; x <= canvas.width; x += 90) {
    ctx.quadraticCurveTo(x + 45, 296, x + 90, 284);
  }
  ctx.stroke();
  for (let i = 0; i < 14; i++) {
    const x = i * 94 - (cameraX * .08 % 94);
    ctx.fillStyle = `rgba(255,225,160,${.36 + Math.sin(time * 2 + i) * .08})`;
    circle(x, 289 + (i % 2) * 4, 4);
  }
  ctx.restore();

  const haze = ctx.createLinearGradient(0, 370, 0, 620);
  haze.addColorStop(0, "rgba(255,206,183,0)");
  haze.addColorStop(1, "rgba(255,206,183,.14)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 360, canvas.width, 260);
}

function drawCloudLayer(time, parallax, y) {
  ctx.fillStyle = "rgba(255,255,255,.7)";
  for (let i = 0; i < 7; i++) {
    const x = ((i * 360 - cameraX * parallax + time * 7) % (canvas.width + 450)) - 100;
    const yy = y + (i % 3) * 72;
    roundRect(x, yy, 130, 35, 20);
    circle(x + 35, yy, 30);
    circle(x + 83, yy + 2, 24);
  }
}

function drawHills(parallax, baseY, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = -180; x <= canvas.width + 220; x += 180) {
    const shifted = x - (cameraX * parallax % 180);
    ctx.quadraticCurveTo(shifted + 90, baseY - 110, shifted + 180, baseY);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fill();
}

function drawCityLayer(parallax, baseY, color) {
  ctx.fillStyle = color;
  for (let i = -1; i < 10; i++) {
    const w = 100 + (i % 3) * 35;
    const h = 120 + (i % 4) * 40;
    const x = i * 160 - (cameraX * parallax % 160);
    ctx.fillRect(x, baseY - h, w, h + 220);
    ctx.fillStyle = "rgba(255,225,160,.45)";
    for (let wy = baseY - h + 24; wy < baseY - 20; wy += 35) {
      ctx.fillRect(x + 18, wy, 12, 16);
      ctx.fillRect(x + 48, wy, 12, 16);
    }
    ctx.fillStyle = color;
  }
}

function drawDecorations() {
  for (const d of level.decorations) {
    if (d.kind === "cart") drawCart(d.x, 520);
    if (d.kind === "tree") drawTree(d.x, 470);
    if (d.kind === "lamp") drawLamp(d.x, 475);
    if (d.kind === "shop") drawShopFront(d.x, 478);
    if (d.kind === "bush") drawBushCluster(d.x, 570);
    if (d.kind === "cakeBush") drawCakeBush(d.x, 566);
    if (d.kind === "cakeTower") drawCakeTower(d.x, 475);
  }
}

function drawPlatform(p) {
  const ground = p.h > 50;
  const frosting = level.theme === "frosting";
  ctx.save();
  if (p.type === "shaky" && p.shakeTime > .25) ctx.translate(Math.sin(performance.now() * .06) * 3, 0);
  if (ground) {
    ctx.fillStyle = level.theme === "dusk" ? "#665b63" : frosting ? "#fff4f1" : "#7eb37c";
    roundRect(p.x, p.y, p.w, 28, 9);
    ctx.fillStyle = level.theme === "dusk" ? "#4e464e" : frosting ? "#d990ad" : "#a8795c";
    ctx.fillRect(p.x, p.y + 22, p.w, p.h - 22);
    ctx.fillStyle = level.theme === "dusk" ? "rgba(255,255,255,.05)" : frosting ? "rgba(255,255,255,.36)" : "rgba(255,233,197,.18)";
    for (let x = p.x + 20; x < p.x + p.w; x += 70) ctx.fillRect(x, p.y + 42, 34, 8);
  } else {
    ctx.fillStyle = frosting
      ? (p.type === "moving" ? "#f197b6" : p.type === "shaky" ? "#f1bdd0" : "#fff1e7")
      : (p.type === "moving" ? "#e8a89a" : p.type === "shaky" ? "#e6c582" : "#f1d9a3");
    roundRect(p.x, p.y, p.w, p.h, 9);
    ctx.fillStyle = "rgba(112,76,58,.22)";
    ctx.fillRect(p.x + 12, p.y + 6, p.w - 24, 4);
    if (p.type === "moving") {
      ctx.fillStyle = "rgba(255,255,255,.75)";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("↔", p.x + p.w / 2, p.y + 16);
    }
  }
  ctx.restore();
}

function drawMilkTea(tea, time) {
  const bob = Math.sin(time * 3 + tea.phase) * 5;
  ctx.save();
  ctx.translate(tea.x, tea.y + bob);
  ctx.shadowColor = "rgba(255,220,126,.9)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#fff8e8";
  roundRect(-17, -22, 34, 43, 7);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#c58b68";
  roundRect(-14, -9, 28, 27, 4);
  ctx.fillStyle = "#5d3c33";
  circle(-7, 11, 3.2); circle(1, 14, 3.2); circle(8, 9, 3.2);
  ctx.fillStyle = "#6e4a3e";
  roundRect(-20, -25, 40, 7, 4);
  ctx.strokeStyle = "#f09cad";
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(8, -24); ctx.lineTo(13, -42); ctx.stroke();
  ctx.restore();
}

function drawKey(key, time) {
  const bob = Math.sin(time * 3.2) * 6;
  ctx.save();
  ctx.translate(key.x, key.y + bob);
  ctx.rotate(-.18);
  ctx.shadowColor = "#ffcada";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "#f08da6";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-13, -24); ctx.lineTo(10, 19); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffe3eb";
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 12, 17, 12);
  ctx.beginPath(); ctx.arc(-15, -26, 10, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawBoost(boost, time) {
  ctx.save();
  ctx.translate(boost.x, boost.y + Math.sin(time * 5) * 4);
  ctx.rotate(time);
  ctx.fillStyle = "#a2e7dc";
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    roundRect(-6, -18, 12, 25, 5);
  }
  ctx.restore();
}

function drawTrap(trap) {
  if (trap.kind === "spikes") {
    ctx.fillStyle = "#d47b78";
    const count = Math.max(2, Math.floor(trap.w / 18));
    const part = trap.w / count;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.moveTo(trap.x + i * part, trap.y + trap.h);
      ctx.lineTo(trap.x + i * part + part / 2, trap.y);
      ctx.lineTo(trap.x + (i + 1) * part, trap.y + trap.h);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = "#d28666";
    roundRect(trap.x, trap.y, trap.w, trap.h, 4);
    ctx.strokeStyle = "#fff0c7";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(trap.x + 8, trap.y + 4); ctx.lineTo(trap.x + trap.w - 8, trap.y + trap.h - 4);
    ctx.moveTo(trap.x + trap.w - 8, trap.y + 4); ctx.lineTo(trap.x + 8, trap.y + trap.h - 4);
    ctx.stroke();
  }
}

function drawEnemy(enemy, time) {
  ctx.save();
  ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
  ctx.scale(enemy.dir, 1);
  const bounce = Math.sin(time * 6 + enemy.x) * 2;
  ctx.translate(0, bounce);
  if (enemy.kind === "pearl") {
    ctx.fillStyle = "#5f4a57"; circle(0, 2, 21);
    ctx.fillStyle = "#f4a2a9";
    ctx.beginPath(); ctx.moveTo(-15, -12); ctx.lineTo(-7, -27); ctx.lineTo(-2, -14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -15); ctx.lineTo(13, -29); ctx.lineTo(16, -10); ctx.fill();
  } else if (enemy.kind === "cloud") {
    ctx.fillStyle = "#ddd8e8";
    circle(-12, 5, 15); circle(2, -2, 20); circle(17, 6, 14);
  } else if (enemy.kind === "cream") {
    ctx.fillStyle = "#fff4f0";
    circle(-12, 6, 14); circle(0, -4, 19); circle(14, 7, 13);
    ctx.fillStyle = "#ef91ad";
    circle(0, -19, 5);
  } else {
    ctx.fillStyle = "#dbb38e";
    roundRect(-20, -20, 40, 39, 7);
    ctx.fillStyle = "#f5dfbd";
    roundRect(-23, -23, 46, 7, 4);
  }
  ctx.fillStyle = "#4d3940";
  circle(-7, 2, 2.8); circle(7, 2, 2.8);
  ctx.strokeStyle = "#4d3940"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-7, 11); ctx.quadraticCurveTo(0, 6, 7, 11); ctx.stroke();
  ctx.restore();
}

function getPlayerState(subject) {
  if (subject.isClearing) return "clear";
  if (subject.isHurt || subject.invincible > 0) return "hurt";
  if (!subject.grounded && subject.doubleJumpTriggered && subject.doubleJumpTimer > 0) return "doubleJump";
  if (!subject.grounded && subject.vy < 0) return "jump";
  if (!subject.grounded && subject.vy >= 0) return "fall";
  if (Math.abs(subject.vx) > 35) return "run";
  return gameState === GAME_STATE.PAUSED ? "pauseIdle" : "idle";
}

function drawCatFace(expression) {
  ctx.fillStyle = PLAYER_SKIN.outline;
  ctx.strokeStyle = PLAYER_SKIN.outline;
  ctx.lineWidth = 2.1;
  ctx.lineCap = "round";
  if (expression === "hurt") {
    ctx.beginPath();
    ctx.moveTo(-11, -8); ctx.lineTo(-5, -3); ctx.moveTo(-5, -8); ctx.lineTo(-11, -3);
    ctx.moveTo(5, -8); ctx.lineTo(11, -3); ctx.moveTo(11, -8); ctx.lineTo(5, -3);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 4, 3, Math.PI, Math.PI * 2); ctx.stroke();
    return;
  }
  const blink = (expression === "idle" || expression === "pauseIdle") &&
    Math.sin(player.animTime * 1.65) > .986;
  if (blink) {
    ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(-5, -6); ctx.moveTo(5, -6); ctx.lineTo(10, -6); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.ellipse(-8, -7, 2.5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, -7, 2.5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(-2.6, -1); ctx.lineTo(2.6, -1); ctx.lineTo(0, 2.3); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  if (expression === "jump" || expression === "doubleJump") {
    ctx.arc(0, 5, 2.7, 0, Math.PI * 2);
  } else {
    ctx.moveTo(0, 2); ctx.quadraticCurveTo(-3, 6, -6, 4);
    ctx.moveTo(0, 2); ctx.quadraticCurveTo(3, 6, 6, 4);
  }
  ctx.stroke();
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(-13, 0); ctx.lineTo(-23, -2); ctx.moveTo(-13, 4); ctx.lineTo(-23, 6);
  ctx.moveTo(13, 0); ctx.lineTo(23, -2); ctx.moveTo(13, 4); ctx.lineTo(23, 6);
  ctx.stroke();
  ctx.fillStyle = PLAYER_SKIN.blush;
  ctx.globalAlpha *= .7;
  circle(-15, 3, 3); circle(15, 3, 3);
  ctx.globalAlpha /= .7;
}

function drawCatScarf(state, t) {
  ctx.fillStyle = PLAYER_SKIN.scarf;
  ctx.strokeStyle = PLAYER_SKIN.outline;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(-24, -2, 48, 9, 4); ctx.fill(); ctx.stroke();
  const speedLift = Math.min(8, Math.abs(player.vx) / 42);
  const lift = state === "fall" ? -10 : state === "jump" ? 5 :
    Math.sin(t * (state === "run" ? 11 : 4)) * 2 - speedLift * .35;
  ctx.beginPath();
  ctx.moveTo(16, 4);
  ctx.quadraticCurveTo(29, 5 + lift, 38, 8 + lift);
  ctx.lineTo(33, 17 + lift);
  ctx.quadraticCurveTo(25, 10 + lift, 15, 8);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
}

function drawPlayerCat(time) {
  const state = getPlayerState(player);
  player.animState = state;
  const blinkAlpha = player.invincible > 0 && Math.floor(player.invincible * 9) % 2 === 0 ? .42 : 1;
  const speedRatio = clamp(Math.abs(player.vx) / GAME_CONFIG.player.moveSpeed, 0, 1);
  const runPhase = player.animTime * (10 + speedRatio * 8);
  const stride = Math.sin(runPhase);
  const contact = Math.abs(Math.cos(runPhase));
  const landingRatio = player.landingTimer / .18;
  const landingSquash = landingRatio > 0 ? Math.sin(landingRatio * Math.PI) : 0;
  const turnLean = player.turnTimer > 0 ? Math.sin(player.turnTimer / .16 * Math.PI) * .12 : 0;
  let rotation = 0;
  let scaleX = 1;
  let scaleY = 1;
  let vertical = 0;

  if (state === "idle" || state === "pauseIdle") vertical = Math.sin(time * 2.8) * 1.2;
  if (state === "run") {
    rotation = -.075 + turnLean;
    vertical = contact * 1.8;
    scaleX = 1.02 + contact * .025;
    scaleY = .99 - contact * .025;
  }
  if (state === "jump") { rotation = -.055; scaleX = .94; scaleY = 1.08; vertical = -1; }
  if (state === "fall") { rotation = .045; scaleX = 1.05; scaleY = .96; vertical = 1; }
  if (state === "doubleJump") {
    const spinProgress = 1 - player.doubleJumpTimer / .42;
    rotation = Math.sin(spinProgress * Math.PI) * .24;
    scaleX = .96; scaleY = 1.05;
  }
  if (state === "hurt") { rotation = -.18; scaleX = 1.05; scaleY = .95; }
  if (state === "clear") { rotation = Math.sin(time * 8) * .07; vertical = Math.sin(time * 8) * 5 - 3; }
  scaleX += landingSquash * .1;
  scaleY -= landingSquash * .12;
  vertical += landingSquash * 4;

  ctx.save();
  ctx.globalAlpha = blinkAlpha;
  ctx.translate(player.x + player.w / 2, player.y + player.h / 2 + vertical);
  ctx.scale(player.facing, 1);
  ctx.rotate(rotation);
  ctx.scale(scaleX, scaleY);

  ctx.fillStyle = "rgba(55,84,105,.17)";
  ctx.beginPath(); ctx.ellipse(0, 31, 23, 5, 0, 0, Math.PI * 2); ctx.fill();

  // 蓬松尾巴跟随步态反向摆动。
  ctx.strokeStyle = PLAYER_SKIN.outline;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  const tailWave = state === "run" ? -stride * 7 : Math.sin(time * 4) * 4;
  ctx.beginPath();
  ctx.moveTo(15, 12);
  ctx.quadraticCurveTo(34, 14 + tailWave, 31, -2 + tailWave * .25);
  ctx.stroke();
  ctx.strokeStyle = PLAYER_SKIN.primary;
  ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.moveTo(16, 11); ctx.quadraticCurveTo(31, 12 + tailWave, 29, -2 + tailWave * .25); ctx.stroke();

  // 独立双腿：奔跑交替触地，起跳收腿，下落伸腿准备落地。
  const leftFootX = state === "run" ? -9 + stride * 7 : -9;
  const rightFootX = state === "run" ? 9 - stride * 7 : 9;
  const legHeight = state === "run" ? 14 - contact * 2 : 15;
  ctx.fillStyle = PLAYER_SKIN.primary;
  ctx.strokeStyle = PLAYER_SKIN.outline;
  ctx.lineWidth = 3;
  if (state === "jump" || state === "doubleJump") {
    ctx.beginPath(); ctx.roundRect(-18, 16, 14, 14, 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(4, 16, 14, 14, 6); ctx.fill(); ctx.stroke();
  } else if (state === "fall") {
    ctx.beginPath(); ctx.roundRect(-16, 17, 12, 15, 5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(4, 17, 12, 15, 5); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.roundRect(leftFootX - 6, 17, 13, legHeight, 5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(rightFootX - 6, 17, 13, legHeight, 5); ctx.fill(); ctx.stroke();
  }

  // 短圆身体和小背包。
  ctx.fillStyle = PLAYER_SKIN.deepBlue;
  ctx.beginPath(); ctx.roundRect(13, 0, 17, 27, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = PLAYER_SKIN.primary;
  ctx.beginPath(); ctx.roundRect(-21, -3, 42, 31, 15); ctx.fill(); ctx.stroke();

  // 圆脸白猫、分离猫耳与原创浅蓝额头斑。
  ctx.fillStyle = PLAYER_SKIN.primary;
  ctx.beginPath(); ctx.moveTo(-20, -24); ctx.lineTo(-17, -39); ctx.lineTo(-6, -29); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(20, -24); ctx.lineTo(17, -39); ctx.lineTo(6, -29); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-25, -32, 50, 41, 18); ctx.fill(); ctx.stroke();
  ctx.fillStyle = PLAYER_SKIN.blue;
  ctx.beginPath();
  ctx.moveTo(-18, -29); ctx.quadraticCurveTo(-7, -34, 2, -28);
  ctx.quadraticCurveTo(-5, -20, -17, -22); ctx.closePath(); ctx.fill();
  drawCatFace(state === "hurt" ? "hurt" : state);

  // 浅蓝针织帽、白帽檐和绒球。
  ctx.fillStyle = PLAYER_SKIN.deepBlue;
  ctx.beginPath();
  ctx.moveTo(-19, -34); ctx.quadraticCurveTo(-5, -53, 15, -43);
  ctx.quadraticCurveTo(23, -39, 20, -31); ctx.lineTo(-18, -29); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f4fbff";
  ctx.beginPath(); ctx.roundRect(-21, -34, 43, 8, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f4fbff";
  circle(-15, -47, 6);
  ctx.beginPath(); ctx.arc(-15, -47, 6, 0, Math.PI * 2); ctx.stroke();

  ctx.save(); ctx.translate(0, -2); drawCatScarf(state, time); ctx.restore();

  // 奶茶挂饰和随步态摆动的小手。
  ctx.fillStyle = PLAYER_SKIN.milkTea;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-7, 8, 14, 17, 4); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = PLAYER_SKIN.blue;
  ctx.beginPath(); ctx.moveTo(3, 8); ctx.lineTo(6, 1); ctx.stroke();
  ctx.fillStyle = PLAYER_SKIN.primary;
  ctx.strokeStyle = PLAYER_SKIN.outline;
  ctx.lineWidth = 3;
  const armSwing = state === "run" ? stride * 8 : state === "jump" ? -7 : 0;
  ctx.beginPath(); ctx.ellipse(-18, 6 + armSwing * .2, 8, 5, -.45 + armSwing * .025, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(18, 6 - armSwing * .2, 8, 5, .45 - armSwing * .025, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  if (state === "clear") {
    ctx.beginPath(); ctx.ellipse(-24, -8 + Math.sin(time * 12) * 3, 8, 5, -.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawPlayer(time) {
  drawPlayerCat(time);
}

function emitDoubleJumpParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI * 2 * i / 8;
    particles.push({
      x, y,
      color: i % 2 ? PLAYER_SKIN.blue : "#ffffff",
      size: 3 + Math.random() * 2,
      vx: Math.cos(angle) * (90 + Math.random() * 70),
      vy: Math.sin(angle) * (90 + Math.random() * 70),
      life: .42, maxLife: .42,
    });
  }
}

function drawCheckpointFlag(point, time) {
  const active = point.active;
  const wave = Math.sin(time * 3 + point.phase) * 2.5;
  const poleTop = point.y - 33;
  ctx.save();

  if (active) {
    const glow = ctx.createRadialGradient(point.x + 18, point.y - 8, 3, point.x + 18, point.y - 8, 43);
    glow.addColorStop(0, `rgba(142,205,246,${.22 + point.activationGlow * .35})`);
    glow.addColorStop(1, "rgba(142,205,246,0)");
    ctx.fillStyle = glow;
    circle(point.x + 18, point.y - 8, 43);
  }

  // 浅蓝灰圆杆和顶部圆点。
  ctx.strokeStyle = active ? "#6faed9" : "rgba(102,139,165,.55)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(point.x, 620); ctx.lineTo(point.x, poleTop); ctx.stroke();
  ctx.fillStyle = active ? "#a9dcf8" : "#b8cad5";
  circle(point.x, poleTop - 3, 6);

  // 奶盖形圆角旗面，柔和摆动但不类似赛车终点旗。
  ctx.translate(point.x + 1, poleTop + 7);
  ctx.fillStyle = active ? "#eaf8ff" : "rgba(224,238,246,.78)";
  ctx.strokeStyle = active ? "#5d9bc8" : "rgba(100,139,164,.58)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(18, -3 + wave, 38, 3 + wave);
  ctx.quadraticCurveTo(43, 5 + wave, 39, 12 + wave);
  ctx.quadraticCurveTo(29, 24 + wave, 15, 18 + wave);
  ctx.quadraticCurveTo(8, 15 + wave, 0, 17);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // 猫爪印：一个掌垫加三个小趾垫。
  ctx.fillStyle = active ? PLAYER_SKIN.deepBlue : "rgba(91,132,160,.48)";
  ctx.beginPath(); ctx.ellipse(22, 10 + wave, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
  circle(15, 4 + wave, 2.4); circle(22, 2 + wave, 2.4); circle(29, 4 + wave, 2.4);

  if (active) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(18, 10 + wave); ctx.lineTo(21, 13 + wave); ctx.lineTo(27, 7 + wave); ctx.stroke();
  }
  ctx.restore();
}

function drawGoal(goal, time) {
  ctx.save();
  ctx.translate(goal.x, goal.y);
  const open = player.tea >= level.requiredMilkTea && (!level.requiredKey || player.hasKey);
  const frosting = level.theme === "frosting";
  ctx.fillStyle = level.theme === "dusk" ? "#705768" : frosting ? "#f4c1d2" : "#f7d9bd";
  roundRect(0, 22, goal.w, goal.h - 22, 12);
  ctx.fillStyle = level.theme === "dusk" ? "#f0a1a6" : frosting ? "#fff0eb" : "#f1a7ad";
  ctx.beginPath();
  ctx.moveTo(-10, 30); ctx.lineTo(25, 0); ctx.lineTo(goal.w - 25, 0); ctx.lineTo(goal.w + 10, 30); ctx.closePath(); ctx.fill();
  for (let x = 15; x < goal.w; x += 42) {
    ctx.fillStyle = (x / 42) % 2 < 1 ? "#fff4df" : "#e9989f";
    ctx.fillRect(x, 1, 22, 31);
  }
  ctx.fillStyle = open ? "#9ed8c4" : "#6e514d";
  roundRect(goal.w - 77, 70, 55, goal.h - 70, 8);
  // 终点只用高识别图标和发光门表达，不再依赖文字招牌。
  if (open) {
    ctx.strokeStyle = "rgba(170,235,214,.55)";
    ctx.lineWidth = 9 + Math.sin(time * 4) * 2;
    ctx.strokeRect(goal.w - 82, 65, 65, goal.h - 60);
  }
  ctx.font = "26px sans-serif";
  ctx.textAlign = "center";
  const goalIcon = goal.kind === "icecream" ? "🍦" : goal.kind === "cake" ? "🍰" : "🧋";
  ctx.fillText(goalIcon, 55, 115 + Math.sin(time * 3) * 2);
  ctx.restore();
}

function drawEffects() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    circle(p.x, p.y, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  ctx.font = "bold 15px sans-serif";
  for (const text of floatTexts) {
    ctx.globalAlpha = Math.max(0, text.life);
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
  }
  ctx.globalAlpha = 1;
}

function drawCart(x, y) {
  ctx.save();
  ctx.globalAlpha = .54;
  ctx.fillStyle = "#f4e4cd"; roundRect(x, y + 18, 112, 74, 10);
  ctx.fillStyle = "#d9a6a5";
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 20); ctx.lineTo(x + 12, y); ctx.lineTo(x + 100, y); ctx.lineTo(x + 116, y + 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f8f0e2";
  for (let stripe = 5; stripe < 110; stripe += 28) ctx.fillRect(x + stripe, y + 2, 13, 18);
  ctx.fillStyle = "#725b56"; circle(x + 23, y + 95, 10); circle(x + 89, y + 95, 10);
  ctx.fillStyle = "rgba(255,255,255,.38)";
  roundRect(x + 15, y + 37, 82, 28, 7);
  ctx.restore();
}
function drawTree(x, y) {
  ctx.fillStyle = "#805c48"; roundRect(x + 32, y + 65, 18, 90, 7);
  ctx.fillStyle = "#92bd91"; circle(x + 40, y + 45, 52); circle(x + 4, y + 68, 35); circle(x + 80, y + 70, 37);
}
function drawLamp(x, y) {
  ctx.save();
  ctx.globalAlpha = .62;
  ctx.fillStyle = "#54576a"; roundRect(x, y, 8, 145, 4);
  ctx.fillStyle = "#ffe1a0"; circle(x + 4, y, 14);
  ctx.strokeStyle = "rgba(255,225,160,.18)"; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(x + 4, y, 21, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
function drawShopFront(x, y) {
  ctx.save();
  ctx.globalAlpha = .46;
  ctx.fillStyle = "#696478"; roundRect(x, y + 18, 145, 124, 10);
  ctx.fillStyle = "#d5a8aa";
  ctx.beginPath(); ctx.moveTo(x - 5, y + 24); ctx.lineTo(x + 13, y); ctx.lineTo(x + 132, y); ctx.lineTo(x + 150, y + 24); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,220,174,.55)";
  roundRect(x + 16, y + 55, 48, 45, 5); roundRect(x + 82, y + 55, 48, 45, 5);
  ctx.fillStyle = "#5b5669"; roundRect(x + 59, y + 102, 28, 40, 5);
  ctx.restore();
}

function drawBushCluster(x, y) {
  ctx.save();
  ctx.globalAlpha = .66;
  ctx.fillStyle = level.theme === "dusk" ? "#626f7c" : "#75a884";
  circle(x, y, 25); circle(x + 24, y - 8, 31); circle(x + 52, y + 2, 23);
  ctx.fillStyle = level.theme === "dusk" ? "#80919a" : "#9bc29a";
  circle(x + 16, y - 13, 14); circle(x + 43, y - 10, 13);
  ctx.restore();
}

function drawCakeBush(x, y) {
  ctx.save();
  ctx.globalAlpha = .62;
  ctx.fillStyle = "#f3b5ca";
  circle(x, y, 24); circle(x + 25, y - 7, 30); circle(x + 52, y + 3, 22);
  ctx.fillStyle = "#fff4ee";
  circle(x + 15, y - 13, 12); circle(x + 43, y - 11, 13);
  ctx.fillStyle = "#d96d88";
  circle(x + 12, y - 20, 4); circle(x + 47, y - 19, 4);
  ctx.restore();
}

function drawCakeTower(x, y) {
  ctx.save();
  ctx.globalAlpha = .42;
  ctx.fillStyle = "#e7a7bd";
  roundRect(x, y + 45, 130, 98, 13);
  ctx.fillStyle = "#fff5ed";
  roundRect(x - 7, y + 28, 144, 34, 15);
  ctx.fillStyle = "#f2bfd0";
  circle(x + 18, y + 57, 7); circle(x + 66, y + 53, 8); circle(x + 108, y + 58, 7);
  ctx.fillStyle = "#cf6f89";
  circle(x + 66, y + 16, 10);
  ctx.fillRect(x + 63, y - 4, 5, 16);
  ctx.restore();
}

/* =========================================================
   六、页面流程、暂停与结算
   ========================================================= */
function openPause() {
  if (gameState !== GAME_STATE.PLAYING) return;
  gameState = GAME_STATE.PAUSED;
  elapsedBeforePause += performance.now() - levelStartTime;
  ui.pause.classList.add("open");
  ui.pause.setAttribute("aria-hidden", "false");
}

function closePause() {
  if (!ui.pause.classList.contains("open")) return;
  ui.pause.classList.remove("open");
  ui.pause.setAttribute("aria-hidden", "true");
  if (level && ui.game.classList.contains("active")) {
    gameState = GAME_STATE.PLAYING;
    levelStartTime = performance.now();
    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
  }
}

function togglePause() {
  if (gameState === GAME_STATE.PLAYING) openPause();
  else if (gameState === GAME_STATE.PAUSED) closePause();
}

function completeLevel(index, elapsedMs) {
  const levelNumber = index + 1;
  const clearedKey = `level${levelNumber}Cleared`;
  const teaKey = `level${levelNumber}BestMilkTea`;
  const timeKey = `level${levelNumber}BestTime`;
  progress[clearedKey] = true;
  progress[teaKey] = Math.max(progress[teaKey] || 0, Math.min(player.tea, LEVELS[index].requiredMilkTea));
  progress[timeKey] = progress[timeKey] === null
    ? elapsedMs
    : Math.min(progress[timeKey], elapsedMs);
  if (index === 0) progress.rewards.iceCream = true;
  if (index === 1) progress.rewards.cake = true;
  if (index === 2) progress.rewards.milkTea = true;
  saveProgress();
  showLevelResult(elapsedMs);
}

function showLevelResult(elapsedMs) {
  cancelAnimationFrame(animationId);
  const data = LEVELS[currentLevelIndex];
  document.querySelector("#resultIcon").textContent = ["🍦", "🍰", "🧋"][currentLevelIndex];
  document.querySelector("#resultTitle").textContent = `${data.name}通过！`;
  document.querySelector("#resultTea").textContent = `${player.tea} 杯`;
  document.querySelector("#resultTime").textContent = formatTime(elapsedMs);
  document.querySelector("#resultReward").textContent = data.reward;
  const note = document.querySelector("#resultNote");
  const next = document.querySelector("#nextLevelButton");
  if (currentLevelIndex === 0) {
    note.innerHTML = "这个奖励不急着兑换，<br>但它已经被认真记录下来了。";
    next.innerHTML = "下一关 <span>→</span>";
  } else if (currentLevelIndex === 1) {
    note.innerHTML = "甜度升级成功，<br>下一站才是真正的奶茶补给站。";
    next.innerHTML = "下一关 <span>→</span>";
  } else {
    note.innerHTML = "三站甜度路线全部完成，<br>三份奖励都已经认真记录。";
    next.innerHTML = "查看最终奖励 <span>→</span>";
  }
  gameState = GAME_STATE.LEVEL_COMPLETE;
  showScreen(ui.complete);
}

function showFinal() {
  gameState = GAME_STATE.FINAL_REWARD;
  document.querySelector("#saveMessage").textContent = "";
  showScreen(ui.final);
}

function showHome() {
  cancelAnimationFrame(animationId);
  gameState = GAME_STATE.HOME;
  level = null;
  player = null;
  ui.pause.classList.remove("open");
  ui.pause.setAttribute("aria-hidden", "true");
  showScreen(ui.home);
}

function openInfoDialog(type) {
  const content = type === "rewards"
    ? `<p class="eyebrow">SWEET REWARDS</p><h2>奖励预览</h2>
       <p>完成三关后，将解锁最终奖励。</p>
       <p>具体内容，通关后揭晓。</p>`
    : `<p class="eyebrow">HOW TO PLAY</p><h2>操作说明</h2>
       <p><strong>电脑端：</strong>A / D 或方向键移动，W / 空格跳跃。</p>
       <p><strong>手机端：</strong>使用屏幕下方按钮移动和跳跃。</p>
       <p><strong>声音：</strong>点击右上角音乐按钮开启或关闭。</p>
       <p>建议横屏体验。</p>`;
  ui.dialogContent.innerHTML = content;
  ui.dialog.classList.add("open");
  ui.dialog.setAttribute("aria-hidden", "false");
}

document.querySelector("#startButton").addEventListener("click", () => {
  initAudio();
  playButtonSfx();
  showLevelSelect();
});
document.querySelector("#mapHomeButton").addEventListener("click", showHome);
document.querySelectorAll("[data-level-node]").forEach((button) => {
  button.addEventListener("click", () => selectLevel(Number(button.dataset.levelNode)));
});
document.querySelector("#resetProgressButton").addEventListener("click", resetProgress);
document.querySelector("#pauseButton").addEventListener("click", openPause);
document.querySelector("#orientationAction").addEventListener("click", requestLandscapeMode);
document.querySelector("#resumeButton").addEventListener("click", closePause);
document.querySelector("#restartButton").addEventListener("click", restartLevel);
document.querySelector("#quitButton").addEventListener("click", showLevelSelect);
document.querySelector("#nextLevelButton").addEventListener("click", () => {
  if (currentLevelIndex < LEVELS.length - 1) {
    selectedLevelIndex = currentLevelIndex + 1;
    showLevelSelect();
  }
  else showFinal();
});
document.querySelector("#resultMapButton").addEventListener("click", showLevelSelect);
document.querySelector("#finalMapButton").addEventListener("click", showLevelSelect);
document.querySelector("#replayButton").addEventListener("click", () => {
  selectedLevelIndex = 0;
  showLevelSelect();
});
document.querySelector("#saveRewardButton").addEventListener("click", () => {
  progress.rewardSavedAt = new Date().toISOString();
  saveProgress();
  document.querySelector("#saveMessage").textContent = "奖励已保存。这份记录暂时不会过期。";
  tone(650, .12, "sine");
});
document.querySelectorAll("[data-dialog]").forEach((button) => {
  button.addEventListener("click", () => openInfoDialog(button.dataset.dialog));
});
document.querySelectorAll("[data-audio-toggle]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMute();
  });
});
document.querySelectorAll("button:not([data-audio-toggle]):not([data-level-node]):not(#startButton)").forEach((button) => {
  button.addEventListener("click", () => {
    initAudio();
    playButtonSfx();
  });
});
document.querySelector("#dialogClose").addEventListener("click", () => ui.dialog.classList.remove("open"));
ui.dialog.addEventListener("click", (event) => {
  if (event.target === ui.dialog) ui.dialog.classList.remove("open");
});

renderLevelMap();
updateAudioButtons();
scheduleViewportRefresh();

/* =========================================================
   七、小工具
   ========================================================= */
function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function approach(value, target, amount) {
  if (value < target) return Math.min(value + amount, target);
  return Math.max(value - amount, target);
}
function roundRect(x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
function circle(x, y, radius) {
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
}
function burst(x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * (.35 + Math.random() * .65);
    particles.push({
      x, y, color, size: 2 + Math.random() * 4,
      vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity - 40,
      life: .45 + Math.random() * .35, maxLife: .8,
    });
  }
}
function addFloatText(x, y, text, color) {
  floatTexts.push({ x, y, text, color, life: 1 });
}
function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function tone(frequency, duration, type) {
  playOscillator(frequency, duration, type, .1);
}

// 只读调试信息，方便本地验收和后续扩展。
window.__sweetGame = {
  config: GAME_CONFIG,
  levels: LEVELS,
  getState: () => ({
    gameState, currentLevelIndex, selectedLevelIndex,
    progress: {
      ...progress,
      rewards: { ...progress.rewards },
    },
    player: player ? { x: player.x, y: player.y, health: player.health, tea: player.tea, hasKey: player.hasKey } : null,
  }),
};
