import axios from 'axios';

class WeatherService {
  constructor() {
    this.apiKey = '1234567890abcdef1234567890abcdef'; // 请替换为实际的和风天气API密钥
    this.apiUrl = 'https://devapi.qweather.com/v7';
  }

  /**
   * 获取当前天气信息
   * @param {string} location - 位置ID，默认为北京(101010100)
   * @returns {Promise<Object>} 天气数据对象
   */
  async getNowWeather(location = '101010100') {
    try {
      console.log(`正在获取位置 ${location} 的天气数据...`);
      
      const response = await axios.get(`${this.apiUrl}/weather/now`, {
        params: {
          location,
          key: this.apiKey
        }
      });
      
      console.log('获取天气数据成功:', response.data);
      
      if (response.data.code === '200') {
        const weatherData = {
          city: this.getCityNameByCode(location),
          temp: response.data.now.temp,
          condition: response.data.now.text,
          humidity: response.data.now.humidity,
          windSpeed: response.data.now.windSpeed,
          windDir: response.data.now.windDir,
          updateTime: response.data.updateTime
        };
        
        return {
          success: true,
          data: weatherData,
          description: this.generateWeatherDescription(weatherData)
        };
      } else {
        console.error('和风天气API返回错误:', response.data);
        return {
          success: false,
          error: `和风天气API返回错误: ${response.data.code}`,
          // 返回一个默认的天气数据
          data: this.getDefaultWeatherData(location)
        };
      }
    } catch (error) {
      console.error('获取天气数据失败:', error);
      return {
        success: false,
        error: error.message,
        // 返回一个默认的天气数据
        data: this.getDefaultWeatherData(location)
      };
    }
  }

  /**
   * 根据位置代码获取城市名称
   * @param {string} code - 位置代码
   * @returns {string} 城市名称
   */
  getCityNameByCode(code) {
    const cityMap = {
      '101010100': '北京',
      '101020100': '上海',
      '101280101': '广州',
      '101280601': '深圳',
      '101210101': '杭州',
      '101190101': '南京',
      '101200101': '武汉',
      '101110101': '西安',
      '101230101': '福州',
      '101270101': '成都'
    };
    
    return cityMap[code] || '未知城市';
  }

  /**
   * 获取默认天气数据（API失败时使用）
   * @param {string} location - 位置ID
   * @returns {Object} 默认天气数据
   */
  getDefaultWeatherData(location) {
    const cityName = this.getCityNameByCode(location);
    const now = new Date();
    const temp = Math.floor(15 + Math.random() * 10); // 15-25度之间的随机温度
    
    const conditions = ['晴', '多云', '阴', '小雨', '晴间多云'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      city: cityName,
      temp: temp,
      condition: condition,
      humidity: '60',
      windSpeed: '3',
      windDir: '东南风',
      updateTime: now.toISOString()
    };
  }

  /**
   * 生成天气描述文本
   * @param {Object} weatherData - 天气数据
   * @returns {string} 天气描述
   */
  generateWeatherDescription(weatherData) {
    if (!weatherData) return '无法获取天气信息';

    const { city, temp, condition } = weatherData;
    
    let description = `${city}当前天气${condition}，气温${temp}℃`;
    
    // 根据温度和天气状况给出穿衣建议
    if (temp >= 30) {
      description += '。天气炎热，注意防暑降温，建议穿轻薄透气的衣物。';
    } else if (temp >= 20) {
      description += '。天气温暖，建议穿短袖或薄外套。';
    } else if (temp >= 10) {
      description += '。天气微凉，建议穿长袖衣物或薄外套。';
    } else {
      description += '。天气寒冷，注意保暖，建议穿厚外套。';
    }
    
    // 根据天气状况添加额外建议
    if (condition.includes('雨')) {
      description += '外出记得带伞哦！';
    } else if (condition.includes('晴')) {
      description += '阳光不错，记得防晒！';
    } else if (condition.includes('雪')) {
      description += '路面可能湿滑，出行注意安全！';
    } else if (condition.includes('雾') || condition.includes('霾')) {
      description += '空气质量不佳，建议戴口罩出行。';
    }
    
    return description;
  }
}

export default new WeatherService();