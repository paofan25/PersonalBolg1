const https = require('https');
const fs = require('fs');
const path = require('path');

// 音效资源列表
const SOUND_RESOURCES = [
  {
    name: 'purr.mp3',
    url: 'https://freesound.org/data/previews/412/412015_5121236-lq.mp3',
    description: '猫咪呼噜声'
  },
  {
    name: 'rain.mp3',
    url: 'https://freesound.org/data/previews/346/346562_5121236-lq.mp3',
    description: '下雨声'
  },
  {
    name: 'music.mp3',
    url: 'https://freesound.org/data/previews/415/415129_5121236-lq.mp3',
    description: '轻音乐'
  },
  {
    name: 'click.mp3',
    url: 'https://freesound.org/data/previews/256/256116_5121236-lq.mp3',
    description: '点击音效'
  },
  {
    name: 'send.mp3',
    url: 'https://freesound.org/data/previews/320/320181_5121236-lq.mp3',
    description: '发送消息音效'
  }
];

// 创建sounds目录
const soundsDir = path.join(__dirname, '../public/sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// 下载音效文件
SOUND_RESOURCES.forEach(sound => {
  const filePath = path.join(soundsDir, sound.name);
  console.log(`开始下载 ${sound.description} (${sound.name})...`);

  https.get(sound.url, (response) => {
    if (response.statusCode !== 200) {
      console.error(`下载失败: ${sound.name}, 状态码: ${response.statusCode}`);
      return;
    }

    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`下载完成: ${sound.name}`);
    });
  }).on('error', (err) => {
    console.error(`下载出错: ${sound.name}`, err.message);
  });
});