<template>
  <div class="article-edit">
    <div class="edit-header">
      <h1>{{ isEdit ? '编辑文章' : '创建文章' }}</h1>
    </div>

    <el-form 
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="edit-form"
      v-loading="loading"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入文章标题" />
      </el-form-item>

      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择文章分类">
          <el-option
            v-for="item in categories"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请输入标签（可多选）"
        >
          <el-option
            v-for="tag in commonTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="封面图" prop="coverImage">
        <el-upload
          class="cover-uploader"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleCoverSuccess"
          :before-upload="beforeUpload"
        >
          <img v-if="form.coverImage" :src="form.coverImage" class="cover-image">
          <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="内容" prop="content">
        <div class="editor-container">
          <div class="editor-toolbar">
            <el-button-group>
              <el-button @click="insertMarkdown('**', '**')" title="加粗">B</el-button>
              <el-button @click="insertMarkdown('*', '*')" title="斜体">I</el-button>
              <el-button @click="insertMarkdown('### ', '')" title="标题">H</el-button>
              <el-button @click="insertMarkdown('> ', '')" title="引用">Q</el-button>
              <el-button @click="insertMarkdown('`', '`')" title="代码">C</el-button>
              <el-button @click="insertMarkdown('- ', '')" title="列表">L</el-button>
            </el-button-group>
          </div>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="15"
            placeholder="请输入文章内容（支持Markdown格式）"
            resize="none"
            ref="contentEditor"
          />
        </div>
        <div class="markdown-preview markdown-body" v-html="renderedContent"></div>
      </el-form-item>

      <el-form-item label="相关图片">
        <el-upload
          class="image-uploader"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :on-success="handleImageSuccess"
          :before-upload="beforeUpload"
          multiple
          list-type="picture-card"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="published">立即发布</el-radio>
          <el-radio label="draft">保存草稿</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">
          {{ isEdit ? '更新' : '发布' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createArticle, updateArticle, getArticle } from '@/api/article'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'ArticleEdit',
  components: { Plus },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const formRef = ref(null)
    const contentEditor = ref(null)
    const loading = ref(false)

    const isEdit = computed(() => !!route.params.id)

    const form = ref({
      title: '',
      category: '',
      tags: [],
      coverImage: '',
      content: '',
      images: [],
      status: 'published'
    })

    const categories = ['生活', '技术', '随想', '其他']
    const commonTags = ['Vue', 'React', 'JavaScript', '生活记录', '学习笔记', '随想']

    const rules = {
      title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 2, max: 100, message: '标题长度在2到100个字符之间', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择文章分类', trigger: 'change' }
      ],
      content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' }
      ],
      coverImage: [
        { required: true, message: '请上传封面图片', trigger: 'change' }
      ]
    }

    const uploadUrl = `${process.env.VUE_APP_BASE_API}/upload`
    const uploadHeaders = {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }

    const renderedContent = computed(() => {
      return marked(form.value.content || '')
    })

    const fetchArticle = async () => {
      if (!isEdit.value) return

      try {
        loading.value = true
        const response = await getArticle(route.params.id)
        const article = response.data.data
        form.value = {
          title: article.title,
          category: article.category,
          tags: article.tags || [],
          coverImage: article.coverImage,
          content: article.content,
          images: article.images || [],
          status: article.status
        }
      } catch (error) {
        console.error('获取文章失败:', error)
        ElMessage.error('获取文章失败')
        router.push('/articles')
      } finally {
        loading.value = false
      }
    }

    const beforeUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    }

    const handleCoverSuccess = (response) => {
      form.value.coverImage = response.data.url
    }

    const handleImageSuccess = (response) => {
      form.value.images.push(response.data.url)
    }

    const insertMarkdown = (prefix, suffix) => {
      const textarea = contentEditor.value.$el.querySelector('textarea')
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = form.value.content
      const selection = text.substring(start, end)
      
      const newText = text.substring(0, start) + 
                     prefix + selection + suffix +
                     text.substring(end)
      
      form.value.content = newText
      
      // 恢复光标位置
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(
          start + prefix.length,
          end + prefix.length
        )
      })
    }

    const handleSubmit = async () => {
      if (!formRef.value) return

      try {
        await formRef.value.validate()
        
        loading.value = true
        if (isEdit.value) {
          await updateArticle(route.params.id, form.value)
          ElMessage.success('文章更新成功')
        } else {
          await createArticle(form.value)
          ElMessage.success('文章发布成功')
        }
        
        router.push('/articles')
      } catch (error) {
        console.error('保存文章失败:', error)
        ElMessage.error(error.response?.data?.message || '保存失败')
      } finally {
        loading.value = false
      }
    }

    const handleCancel = () => {
      router.back()
    }

    onMounted(() => {
      fetchArticle()
    })

    return {
      formRef,
      contentEditor,
      form,
      loading,
      isEdit,
      categories,
      commonTags,
      rules,
      uploadUrl,
      uploadHeaders,
      renderedContent,
      beforeUpload,
      handleCoverSuccess,
      handleImageSuccess,
      insertMarkdown,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.article-edit {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.edit-header {
  margin-bottom: 30px;
}

.edit-header h1 {
  font-size: 24px;
  color: var(--text-primary);
}

.edit-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.cover-uploader {
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 300px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover-uploader:hover {
  border-color: var(--primary-color);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 40px;
  height: 40px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.editor-container {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 20px;
}

.editor-toolbar {
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
  background: #f5f7fa;
}

.editor-toolbar .el-button {
  padding: 8px 12px;
  font-weight: bold;
}

.markdown-preview {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .article-edit {
    padding: 10px;
  }

  .edit-form {
    padding: 15px;
  }

  .cover-uploader {
    width: 100%;
    height: 150px;
  }
}
</style> 