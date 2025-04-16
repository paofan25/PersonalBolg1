// 动画管理器
class AnimationManager {
  constructor() {
    this.animations = new Map();
  }

  // 注册动画
  register(name, keyframes, options = {}) {
    this.animations.set(name, { keyframes, options });
  }

  // 播放动画
  play(element, name, customOptions = {}) {
    const animation = this.animations.get(name);
    if (!animation) {
      console.warn(`Animation ${name} not found`);
      return null;
    }

    const options = {
      ...animation.options,
      ...customOptions
    };

    const instance = element.animate(animation.keyframes, options);
    return instance;
  }
}

// 创建动画实例
const animationManager = new AnimationManager();

// 预定义动画
const ANIMATIONS = {
  BOUNCE: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-20px)' },
      { transform: 'translateY(0)' }
    ],
    options: {
      duration: 1000,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      iterations: 1
    }
  },
  SHAKE: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(5deg)' },
      { transform: 'rotate(-5deg)' },
      { transform: 'rotate(5deg)' },
      { transform: 'rotate(0deg)' }
    ],
    options: {
      duration: 500,
      easing: 'ease-in-out',
      iterations: 1
    }
  },
  PULSE: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.1)' },
      { transform: 'scale(1)' }
    ],
    options: {
      duration: 800,
      easing: 'ease-in-out',
      iterations: 1
    }
  },
  FLOAT: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0)' }
    ],
    options: {
      duration: 2000,
      easing: 'ease-in-out',
      iterations: Infinity
    }
  },
  SPIN: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ],
    options: {
      duration: 1000,
      easing: 'linear',
      iterations: 1
    }
  },
  WAVE: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(14deg)' },
      { transform: 'rotate(-8deg)' },
      { transform: 'rotate(14deg)' },
      { transform: 'rotate(-4deg)' },
      { transform: 'rotate(10deg)' },
      { transform: 'rotate(0deg)' }
    ],
    options: {
      duration: 2500,
      easing: 'ease-in-out',
      iterations: 1
    }
  }
};

// 注册预定义动画
for (const [name, animation] of Object.entries(ANIMATIONS)) {
  animationManager.register(name, animation.keyframes, animation.options);
}

export default animationManager;