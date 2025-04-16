// 音效管理器
class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.context = null;
    this.initialized = false;
  }

  // 初始化音频上下文
  init() {
    if (this.initialized) return;
    
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
      this.initialized = true;
    } catch (e) {
      console.error('Web Audio API is not supported in this browser');
    }
  }

  // 加载音效
  async loadSound(name, url) {
    if (!this.initialized) this.init();
    if (!this.context) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (e) {
      console.error(`Error loading sound ${name}:`, e);
    }
  }

  // 播放音效
  play(name, options = {}) {
    if (!this.initialized || !this.context) return;
    
    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound ${name} not found`);
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = sound;

    // 创建音量控制
    const gainNode = this.context.createGain();
    gainNode.gain.value = options.volume || 1;

    // 连接节点
    source.connect(gainNode);
    gainNode.connect(this.context.destination);

    // 播放选项
    source.loop = options.loop || false;
    
    // 开始播放
    source.start(0);

    return {
      stop: () => source.stop(),
      setVolume: (value) => {
        gainNode.gain.value = value;
      }
    };
  }
}

// 创建音效实例
const soundManager = new SoundManager();

// 预定义的音效
const SOUNDS = {
  PURR: '/sounds/purr.mp3',
  RAIN: '/sounds/rain.mp3',
  MUSIC: '/sounds/music.mp3',
  CLICK: '/sounds/click.mp3',
  SEND: '/sounds/send.mp3'
};

// 预加载音效
export const initSounds = async () => {
  for (const [name, url] of Object.entries(SOUNDS)) {
    await soundManager.loadSound(name, url);
  }
};

export default soundManager;