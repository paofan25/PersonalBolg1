<template>
  <div class="article-detail" v-loading="loading">
    <template v-if="article">
      <div class="article-header">
        <h1 class="title">{{ article.title }}</h1>
        
        <div class="article-meta">
          <div class="author-info">
            <el-avatar :size="40" :src="article.author.avatar" />
            <div class="author-details">
              <span class="author-name">{{ article.author.username }}</span>
              <span class="publish-date">{{ formatDate(article.createdAt) }}</span>
            </div>
          </div>
          
          <div class="article-actions" v-if="isLoggedIn">
            <el-button 
              :type="article.isLiked ? 'primary' : 'default'"
              size="small"
              @click="handleLike"
            >
              <i class="el-icon-thumb"></i>
              {{ article.likeCount }} 点赞
            </el-button>
            
            <el-button
              :type="article.isFavorited ? 'primary' : 'default'"
              size="small"
              @click="handleFavorite"
            >
              <i class="el-icon-star-on"></i>
              {{ article.favoriteCount }} 收藏
            </el-button>
            
            <template v-if="isAuthor">
              <el-button 
                type="warning" 
                size="small"
                @click="handleEdit"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small"
                @click="handleDelete"
              >
                删除
              </el-button>
            </template>
          </div>
        </div>

        <div class="article-info">
          <el-tag size="small">{{ article.category }}</el-tag>
          <el-tag 
            v-for="tag in article.tags" 
            :key="tag"
            size="small"
            type="info"
            class="tag"
          >
            {{ tag }}
          </el-tag>
          <span class="view-count">
            <i class="el-icon-view"></i>
            {{ article.viewCount }} 阅读
          </span>
        </div>
      </div>

      <div class="article-cover">
        <img :src="article.coverImage" :alt="article.title">
      </div>

      <div class="article-content markdown-body" v-html="renderedContent"></div>

      <div class="article-images" v-if="article.images && article.images.length">
        <h3>相关图片</h3>
        <el-image
          v-for="(image, index) in article.images"
          :key="index"
          :src="image"
          :preview-src-list="article.images"
          fit="cover"
          class="gallery-image"
        />
      </div>
    </template>

    <el-empty v-else description="文章不存在或已被删除" />

    <el-dialog
      title="确认删除"
      v-model="deleteDialogVisible"
      width="30%"
    >
      <span>确定要删除这篇文章吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { getArticle, deleteArticle, likeArticle, unlikeArticle, favoriteArticle, unfavoriteArticle } from '@/api/article'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { marked } from 'marked'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ArticleDetail',

  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    const article = ref(null)
    const loading = ref(true)
    const deleteDialogVisible = ref(false)

    const currentUser = computed(() => store.getters['auth/currentUser'])
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
    const isAuthor = computed(() => {
      return article.value && currentUser.value && 
             article.value.author._id === currentUser.value._id
    })

    const renderedContent = computed(() => {
      if (!article.value) return ''
      return marked(article.value.content)
    })

    const fetchArticle = async () => {
      try {
        loading.value = true
        const response = await getArticle(route.params.id)
        article.value = response.data.data
      } catch (error) {
        console.error('获取文章详情失败:', error)
        ElMessage.error('获取文章详情失败')
      } finally {
        loading.value = false
      }
    }

    const handleLike = async () => {
      if (!isLoggedIn.value) {
        router.push('/login')
        return
      }

      try {
        if (article.value.isLiked) {
          await unlikeArticle(article.value._id)
          article.value.likeCount--
          article.value.isLiked = false
        } else {
          await likeArticle(article.value._id)
          article.value.likeCount++
          article.value.isLiked = true
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(error.response?.data?.message || '操作失败')
      }
    }

    const handleFavorite = async () => {
      if (!isLoggedIn.value) {
        router.push('/login')
        return
      }

      try {
        if (article.value.isFavorited) {
          await unfavoriteArticle(article.value._id)
          article.value.favoriteCount--
          article.value.isFavorited = false
        } else {
          await favoriteArticle(article.value._id)
          article.value.favoriteCount++
          article.value.isFavorited = true
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(error.response?.data?.message || '操作失败')
      }
    }

    const handleEdit = () => {
      router.push(`/article/edit/${article.value._id}`)
    }

    const handleDelete = () => {
      deleteDialogVisible.value = true
    }

    const confirmDelete = async () => {
      try {
        await deleteArticle(article.value._id)
        ElMessage.success('文章已删除')
        router.push('/articles')
      } catch (error) {
        console.error('删除文章失败:', error)
        ElMessage.error(error.response?.data?.message || '删除文章失败')
      } finally {
        deleteDialogVisible.value = false
      }
    }

    const formatDate = (date) => {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: zhCN
      })
    }

    onMounted(() => {
      fetchArticle()
    })

    return {
      article,
      loading,
      deleteDialogVisible,
      isLoggedIn,
      isAuthor,
      renderedContent,
      handleLike,
      handleFavorite,
      handleEdit,
      handleDelete,
      confirmDelete,
      formatDate
    }
  }
}
</script>

<style scoped>
.article-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.article-header {
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.publish-date {
  font-size: 14px;
  color: var(--text-secondary);
}

.article-actions {
  display: flex;
  gap: 10px;
}

.article-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.tag {
  margin-right: 8px;
}

.view-count {
  color: var(--text-secondary);
  font-size: 14px;
}

.article-cover {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.article-content {
  line-height: 1.8;
  color: var(--text-primary);
}

.article-images {
  margin-top: 40px;
}

.article-images h3 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

.gallery-image {
  width: 200px;
  height: 200px;
  margin: 10px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .article-detail {
    padding: 15px;
  }

  .title {
    font-size: 1.8rem;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .article-actions {
    width: 100%;
    justify-content: space-between;
  }

  .gallery-image {
    width: calc(50% - 20px);
    height: auto;
  }
}
</style>

<style>
.markdown-body {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
  border-radius: 4px;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: #57606a;
  border-left: 0.25em solid #d0d7de;
  margin: 0;
}
</style> 