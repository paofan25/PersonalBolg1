class WeatherService {
  constructor() {
    // 使用正确的API KEY和域名
    this.key = '20ad4f9133c94ac69f48192ef755f473';
    
    // 注意：这里应该使用你控制台中的专属API Host
    this.baseUrl = 'https://kv436fwcq8.re.qweatherapi.com/v7';
    
    // 默认城市列表
    this.defaultCities = [
      { id: '101190101', name: '南京' },
      { id: '101020100', name: '上海' },
      { id: '101010100', name: '北京' }
    ];

    console.log('WeatherService initialized with API Host');
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
    const { temperature, description, cityName } = weather;
    console.log('生成天气描述:', weather);
    
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
    for (const city of this.defaultCities) {
      if (text.includes(city.name)) {
        return city;
      }
    }
    return null;
  }
}

export default new WeatherService();