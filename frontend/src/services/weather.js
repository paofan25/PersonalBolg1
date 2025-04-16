class WeatherService {
  constructor() {
    // 使用环境变量或默认值
    this.key = process.env.VUE_APP_WEATHER_KEY || '20ad4f9133c94ac69f48192ef755f473';
    this.baseUrl = process.env.VUE_APP_WEATHER_URL || 'https://kv436fwcq8.re.qweatherapi.com/v7';
    
    // 城市缓存，格式: { cityName: { data, timestamp } }
    this.weatherCache = new Map();
    // 缓存有效期（5分钟）
    this.cacheExpiration = 5 * 60 * 1000;
    
    // 默认城市列表（包含全国省会城市）
    this.defaultCities = [
      // 直辖市
      { id: '101010100', name: '北京' },
      { id: '101020100', name: '上海' },
      { id: '101030100', name: '天津' },
      { id: '101040100', name: '重庆' },
      // 省会城市
      { id: '101190101', name: '南京', province: '江苏' },
      { id: '101210101', name: '杭州', province: '浙江' },
      { id: '101280101', name: '广州', province: '广东' },
      { id: '101200101', name: '武汉', province: '湖北' },
      { id: '101180101', name: '郑州', province: '河南' },
      { id: '101110101', name: '西安', province: '陕西' },
      { id: '101270101', name: '成都', province: '四川' },
      { id: '101230101', name: '福州', province: '福建' },
      { id: '101220101', name: '合肥', province: '安徽' },
      { id: '101240101', name: '南昌', province: '江西' },
      { id: '101250101', name: '长沙', province: '湖南' },
      { id: '101050101', name: '哈尔滨', province: '黑龙江' },
      { id: '101060101', name: '长春', province: '吉林' },
      { id: '101070101', name: '沈阳', province: '辽宁' },
      { id: '101100101', name: '太原', province: '山西' },
      { id: '101090101', name: '石家庄', province: '河北' },
      { id: '101120101', name: '济南', province: '山东' },
      { id: '101150101', name: '西宁', province: '青海' },
      { id: '101160101', name: '兰州', province: '甘肃' },
      { id: '101170101', name: '银川', province: '宁夏' },
      { id: '101130101', name: '乌鲁木齐', province: '新疆' },
      { id: '101140101', name: '拉萨', province: '西藏' },
      { id: '101290101', name: '昆明', province: '云南' },
      { id: '101300101', name: '南宁', province: '广西' },
      { id: '101310101', name: '海口', province: '海南' },
      { id: '101320101', name: '香港' },
      { id: '101330101', name: '澳门' },
      // 浙江省主要城市
      { id: '101210201', name: '湖州', province: '浙江' },
      { id: '101210301', name: '嘉兴', province: '浙江' },
      { id: '101210401', name: '宁波', province: '浙江' },
      { id: '101210501', name: '绍兴', province: '浙江' },
      { id: '101210601', name: '台州', province: '浙江' },
      { id: '101210701', name: '温州', province: '浙江' },
      { id: '101210801', name: '丽水', province: '浙江' },
      { id: '101210901', name: '金华', province: '浙江' },
      { id: '101211001', name: '衢州', province: '浙江' },
      { id: '101211101', name: '舟山', province: '浙江' }
    ];

    console.log('WeatherService initialized with API Host:', this.baseUrl);
  }

  // 获取指定城市的天气
  async getCityWeather(cityName) {
    try {
      console.log('获取城市天气:', cityName);
      
      // 检查缓存
      const cached = this.weatherCache.get(cityName);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
        console.log('使用缓存的天气数据:', cached.data);
        return cached.data;
      }

      // 查找城市ID
      const city = this.defaultCities.find(c => c.name === cityName);
      if (!city) {
        console.log('未找到城市:', cityName);
        throw new Error(`抱歉，暂不支持查询${cityName}的天气`);
      }

      // 构建请求URL
      const url = `${this.baseUrl}/weather/now?location=${city.id}&key=${this.key}`;
      console.log('请求天气URL:', url);
      
      const weatherData = await this.fetchWeatherData(url);
      weatherData.cityName = cityName; // 确保使用请求时的城市名
      
      // 更新缓存
      this.weatherCache.set(cityName, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('获取城市天气失败:', error);
      throw error;
    }
  }

  // 获取当前位置天气
  async getLocationWeather() {
    try {
      console.log('获取当前位置天气');
      
      const position = await this.getCurrentPosition();
      console.log('获取到位置:', position);

      // 构建请求URL，使用经纬度
      const url = `${this.baseUrl}/weather/now?location=${position.longitude},${position.latitude}&key=${this.key}`;
      return await this.fetchWeatherData(url);
    } catch (error) {
      console.error('获取当前位置天气失败:', error);
      // 降级使用默认城市
      return this.getCityWeather(this.defaultCities[0].name);
    }
  }

  // 获取当前位置
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('地理定位失败:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  // 统一的天气数据获取方法
  async fetchWeatherData(url) {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      }
    });
    
    if (!response.ok) {
      throw new Error(`天气API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API返回的天气数据:', data);
    
    if (data.code === '200') {
      const { temp, text, icon } = data.now;
      const locationId = data.location?.id;
      const city = this.defaultCities.find(c => c.id === locationId);
      
      const weatherData = {
        temperature: temp,
        condition: this.getWeatherCondition(icon),
        description: text,
        cityName: city ? city.name : (data.location?.name || '当前位置'),
        cityId: locationId || 'current',
        updateTime: data.updateTime
      };
      
      console.log('处理后的天气数据:', weatherData);
      return weatherData;
    } else {
      throw new Error(`天气API返回错误: ${data.code}`);
    }
  }

  // 获取当前天气
  async getNowWeather() {
    try {
      // 使用默认城市（南京）
      const defaultCity = this.defaultCities[0];
      console.log('使用默认城市:', defaultCity.name);

      // 构建请求URL
      const url = `${this.baseUrl}/weather/now?location=${defaultCity.id}&key=${this.key}`;
      console.log('请求天气URL:', url);
      
      // 发送请求，添加必要的请求头
      const weatherResponse = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });
      
      // 检查HTTP响应状态
      console.log('响应状态:', weatherResponse.status);
      if (!weatherResponse.ok) {
        const responseText = await weatherResponse.text();
        console.error('响应内容:', responseText);
        throw new Error(`HTTP error! status: ${weatherResponse.status}, response: ${responseText}`);
      }
      
      // 解析JSON响应
      const weatherData = await weatherResponse.json();
      console.log('天气信息响应:', JSON.stringify(weatherData, null, 2));

      // 检查API返回码
      if (weatherData.code === '200') {
        const { temp, text, icon } = weatherData.now;
        console.log('解析到的天气数据:', temp, text, icon);
        return {
          temperature: temp,
          condition: this.getWeatherCondition(icon),
          description: text,
          cityName: defaultCity.name,
          updateTime: weatherData.updateTime
        };
      } else {
        console.error('获取天气失败, 错误码:', weatherData.code);
        return this.getDefaultWeather();
      }
    } catch (error) {
      console.error('获取天气出错:', error);
      return this.getDefaultWeather();
    }
  }

  // 生成天气描述
  generateWeatherDescription(weather) {
    if (!weather) {
      console.error('天气数据为空');
      return '抱歉，暂时无法获取天气信息';
    }

    const { temperature, description, cityName } = weather;
    console.log('生成天气描述，使用的数据:', weather);
    
    let suggestion = '';

    // 根据温度给出建议
    const temp = parseInt(temperature);
    if (temp < 10) {
      suggestion = '天气有点冷，要注意保暖哦~ 🧥';
    } else if (temp > 30) {
      suggestion = '天气有点热，记得防晒补水哦~ 🌞';
    } else {
      suggestion = '天气很舒适，适合出门活动呢~ 🌈';
    }

    // 根据天气状况添加特定建议
    if (description.includes('雨')) {
      suggestion += ' 记得带伞！☔';
    } else if (description.includes('晴')) {
      suggestion += ' 防晒要做好！🧴';
    }

    return `${cityName}现在气温${temperature}°C，${description}。${suggestion}`;
  }

  // 获取天气状况
  getWeatherCondition(icon) {
    const conditions = {
      sunny: ['100', '101', '102', '103'],
      cloudy: ['104', '150', '151', '152', '153'],
      rainy: ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '399'],
      snowy: ['400', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '499'],
      foggy: ['500', '501', '502', '503', '504', '507', '508', '509', '510', '511', '512', '513', '514', '515']
    };

    for (const [condition, icons] of Object.entries(conditions)) {
      if (icons.includes(icon)) {
        return condition;
      }
    }
    return 'cloudy'; // 默认返回多云
  }

  // 获取默认天气数据
  getDefaultWeather() {
    const defaultCity = this.defaultCities[0];
    return {
      temperature: '25',  // 注意这里返回字符串以保持一致性
      condition: 'cloudy',
      description: '多云',
      cityName: defaultCity.name,
      updateTime: new Date().toISOString()
    };
  }

  // 切换城市
  async switchCity(cityId) {
    try {
      console.log('切换城市, ID:', cityId);
      
      // 构建URL
      const url = `${this.baseUrl}/weather/now?location=${cityId}&key=${this.key}`;
      console.log('切换城市请求URL:', url);
      
      // 发送请求
      const weatherResponse = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });
      
      // 检查HTTP响应状态
      console.log('响应状态:', weatherResponse.status);
      if (!weatherResponse.ok) {
        const responseText = await weatherResponse.text();
        console.error('响应内容:', responseText);
        throw new Error(`HTTP error! status: ${weatherResponse.status}, response: ${responseText}`);
      }
      
      // 解析JSON响应
      const weatherData = await weatherResponse.json();
      console.log('切换城市天气响应:', JSON.stringify(weatherData, null, 2));

      // 检查API返回码
      if (weatherData.code === '200') {
        const { temp, text, icon } = weatherData.now;
        console.log('解析到的天气数据:', temp, text, icon);
        const city = this.defaultCities.find(c => c.id === cityId) || { name: '未知城市' };
        return {
          temperature: temp,
          condition: this.getWeatherCondition(icon),
          description: text,
          cityName: city.name,
          updateTime: weatherData.updateTime
        };
      } else {
        console.error('获取天气失败, 错误码:', weatherData.code);
        return this.getDefaultWeather();
      }
    } catch (error) {
      console.error('切换城市出错:', error);
      return this.getDefaultWeather();
    }
  }

  // 解析城市名称
  parseCityName(text) {
    // 处理省份
    for (const city of this.defaultCities) {
      if (city.province && text === city.province) {
        return city; // 返回该省的省会城市
      }
    }
    
    // 处理具体城市
    for (const city of this.defaultCities) {
      if (text.includes(city.name)) {
        return city;
      }
    }
    return null;
  }
}

export default new WeatherService();