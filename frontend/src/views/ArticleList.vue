<template>
  <div class="article-list">
    <div class="header">
      <h1>文章列表</h1>
      <router-link to="/article/create" class="create-btn" v-if="isLoggedIn">
        <el-button type="primary">写文章</el-button>
      </router-link>
    </div>

    <div class="filters">
      <el-select v-model="category" placeholder="选择分类" clearable @change="handleFilter">
        <el-option
          v-for="item in categories"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
      
      <el-select v-model="sortBy" placeholder="排序方式" @change="handleFilter">
        <el-option label="最新发布" value="-createdAt" />
        <el-option label="最多浏览" value="-viewCount" />
        <el-option label="最多点赞" value="-likeCount" />
        <el-option label="最多收藏" value="-favoriteCount" />
      </el-select>
    </div>

    <el-row :gutter="20" class="article-grid">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="article in articles" :key="article._id">
        <el-card class="article-card" :body-style="{ padding: '0px' }">
          <div class="image-wrapper">
            <img :src="article.coverImage" class="cover-image">
            <div class="category-tag">{{ article.category }}</div>
          </div>
          
          <div class="card-content">
            <router-link :to="'/article/' + article._id" class="title">
              {{ article.title }}
            </router-link>
            
            <div class="author-info">
              <el-avatar :size="24" :src="article.author.avatar" />
              <span class="author-name">{{ article.author.username }}</span>
              <span class="publish-date">{{ formatDate(article.createdAt) }}</span>
            </div>
            
            <div class="article-stats">
              <span class="stat-item">
                <i class="el-icon-view"></i>
                {{ article.viewCount }}
              </span>
              <span class="stat-item">
                <i class="el-icon-star-on"></i>
                {{ article.favoriteCount }}
              </span>
              <span class="stat-item">
                <i class="el-icon-thumb"></i>
                {{ article.likeCount }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="pagination-wrapper">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="limit"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { getArticles } from '@/api/article'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ElMessage } from 'element-plus'

export default {
  name: 'ArticleList',
  
  setup() {
    const store = useStore()
    const articles = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const limit = ref(12)
    const category = ref('')
    const sortBy = ref('-createdAt')
    const loading = ref(false)
    
    const categories = ['生活', '技术', '随想', '其他']

    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])

    const fetchArticles = async () => {
      try {
        loading.value = true
        const params = {
          page: currentPage.value,
          limit: limit.value,
          sort: sortBy.value
        }
        
        if (category.value) {
          params.category = category.value
        }

        const response = await getArticles(params)
        articles.value = response.data.data
        total.value = response.data.total
      } catch (error) {
        console.error('获取文章列表失败:', error)
        ElMessage.error('获取文章列表失败')
      } finally {
        loading.value = false
      }
    }

    const handlePageChange = (page) => {
      currentPage.value = page
      fetchArticles()
    }

    const handleFilter = () => {
      currentPage.value = 1
      fetchArticles()
    }

    const formatDate = (date) => {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: zhCN 
      })
    }

    onMounted(() => {
      fetchArticles()
    })

    return {
      articles,
      total,
      currentPage,
      limit,
      category,
      sortBy,
      categories,
      isLoggedIn,
      loading,
      handlePageChange,
      handleFilter,
      formatDate
    }
  }
}
</script>

<style scoped>
.article-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  background: linear-gradient(45deg, var(--primary-purple), var(--primary-pink));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.article-grid {
  margin-bottom: 30px;
}

.article-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-5px);
}

.image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.card-content {
  padding: 15px;
}

.title {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 10px;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.author-name {
  font-size: 14px;
  color: var(--text-regular);
}

.publish-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.article-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-item i {
  font-size: 14px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .image-wrapper {
    height: 150px;
  }
}
</style>