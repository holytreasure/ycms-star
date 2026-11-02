<script setup>
/**
 * 影云CMS 2.0 | 基于 PHP + Node.js 的轻量内容管理系统
 * Copyright © 2026 影云网络科技（石家庄）有限公司
 * 开源协议：AGPLv3 License
 * GitHub：https://github.com/sjzyingyunkeji/yinyun-cms
 * 本程序遵循 AGPLv3 协议：公网提供服务、衍生分发时，必须同步开放对应源码；
 * 如有商用授权、定制合作需求，欢迎联系：info@sjzyingyun.cn
 */


import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postApi, categoryApi } from '../../core/api/index.js'
import Pagination from '../../shared/components/Pagination.vue'
import EmptyState from '../../shared/components/EmptyState.vue'
import LoadingSpinner from '../../shared/components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

const posts = ref([])
const categories = ref([])
const loading = ref(true)
const page = ref(1)
const pages = ref(1)
const total = ref(0)

// 排序方式：latest 按发布时间 / hot 按热度
const sort = ref('latest')
const sortOptions = [
  { value: 'latest', label: '最新发布' },
  { value: 'hot', label: '热门阅读' },
]

const isCategory = () => route.name === 'category-posts'
const isTag = () => route.name === 'tag-posts'

const title = ref('全部文章')

async function loadPosts(p = 1) {
  loading.value = true
  try {
    const params = { page: p, size: 10, sort: sort.value }
    if (isCategory()) {
      params.category_id = route.params.id
    } else if (isTag()) {
      params.tag_id = route.params.id
    }
    const data = await postApi.list(params)
    posts.value = data.items || []
    page.value = data.page || p
    pages.value = data.pages || 1
    total.value = data.total || 0

    if (isCategory()) {
      const cat = categories.value.find((c) => c.id === Number(route.params.id))
      title.value = cat ? `分类 · ${cat.name}` : '分类文章'
    } else if (isTag()) {
      title.value = '标签文章'
    } else {
      title.value = '全部文章'
    }
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

function onPageChange(p) {
  loadPosts(p)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function setSort(value) {
  if (sort.value === value) return
  sort.value = value
  loadPosts(1)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goCategory(id) {
  if (id) {
    router.push({ name: 'category-posts', params: { id } })
  } else {
    router.push({ name: 'posts' })
  }
}

onMounted(async () => {
  try {
    const cats = await categoryApi.list()
    categories.value = Array.isArray(cats) ? cats : []
  } finally { /* ignore */ }
  await loadPosts(1)
})

watch(
  () => route.params.id,
  () => loadPosts(1)
)
</script>

<template>
  <div class="page-enter relative pt-28 pb-10">
    <div class="max-w-6xl mx-auto px-5">
      <header class="mb-10 animate-fade-up">
        <div class="text-[11px] tracking-[0.3em] text-star-dim mb-3">ARTICLES</div>
        <h1 class="font-serif text-3xl md:text-4xl font-bold text-white mb-3">{{ title }}</h1>
        <p class="text-sm text-slate-400">
          共 <span class="text-star-glow">{{ total }}</span> 篇文章，按{{ sort === 'hot' ? '热度' : '时间' }}排列
        </p>
      </header>

      <!-- 筛选 -->
      <div class="flex flex-wrap items-center gap-2 mb-8">
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          class="chip"
          :class="sort === opt.value ? 'chip-active' : ''"
          @click="setSort(opt.value)"
        >
          {{ opt.label }}
        </button>

        <span class="w-px h-4 bg-white/10 mx-1" />

        <button class="chip" :class="!isCategory() && !isTag() ? 'chip-active' : ''" @click="goCategory(null)">全部</button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="chip"
          :class="isCategory() && Number(route.params.id) === cat.id ? 'chip-active' : ''"
          @click="goCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>

      <LoadingSpinner v-if="loading" text="正在加载文章…" />

      <div v-else-if="posts.length" class="space-y-4">
        <router-link
          v-for="post in posts"
          :key="post.id"
          :to="post.slug ? { name: 'post-detail-slug', params: { slug: post.slug } } : { name: 'post-detail', params: { id: post.id } }"
          class="block group"
        >
          <article class="glass p-6 md:p-7 hover-lift">
            <div class="flex items-center gap-2.5 mb-3">
              <span class="tag-category">{{ post.category_name || '未分类' }}</span>
              <span v-if="post.is_top" class="tag-pinned">置顶</span>
              <span class="text-meta">{{ formatDate(post.published_at || post.created_at) }}</span>
              <span class="text-meta flex items-center gap-1 ml-auto">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {{ post.views }}
              </span>
            </div>

            <h2 class="font-serif text-xl md:text-2xl font-bold text-slate-100 group-hover:text-star-glow transition-colors duration-300 mb-2.5 leading-snug">
              {{ post.title }}
            </h2>

            <p class="text-sm text-slate-400 leading-relaxed line-clamp-2">{{ post.summary || '暂无摘要。' }}</p>

            <div v-if="post.tags && post.tags.length" class="mt-4 flex flex-wrap items-center gap-2">
              <span v-for="tag in post.tags" :key="tag.id || tag.name" class="tag-post">{{ tag.name }}</span>
            </div>
          </article>
        </router-link>
      </div>

      <div v-else class="glass p-4">
        <EmptyState icon="file" text="该分类下还没有文章" />
      </div>

      <div v-if="pages > 1" class="mt-12 flex justify-center">
        <Pagination :page="page" :pages="pages" :total="total" @change="onPageChange" />
      </div>
    </div>
  </div>
</template>
