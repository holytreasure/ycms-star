<script setup>
/**
 * YCMS 2.0 | 基于 PHP + Node.js 的轻量内容管理系统
 * Copyright © 2026 影云网络科技（石家庄）有限公司
 * 开源协议：AGPLv3 License
 * GitHub：https://github.com/sjzyingyunkeji/ycms-2.0
 * 本程序遵循 AGPLv3 协议：公网提供服务、衍生分发时，必须同步开放对应源码；
 * 如有商用授权、定制合作需求，欢迎联系：info@sjzyingyun.cn
 */


import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { postApi } from '../../core/api/index.js'
import LoadingSpinner from '../../shared/components/LoadingSpinner.vue'
import EmptyState from '../../shared/components/EmptyState.vue'

const router = useRouter()
const posts = ref([])
const loading = ref(true)

// 按年份分组
const grouped = computed(() => {
  const groups = []
  const map = new Map()
  for (const post of posts.value) {
    const dateStr = post.published_at || post.created_at || ''
    const year = dateStr.slice(0, 4) || '未知年份'
    if (!map.has(year)) {
      map.set(year, [])
      groups.push({ year, items: map.get(year) })
    }
    map.get(year).push(post)
  }
  return groups.sort((a, b) => b.year.localeCompare(a.year))
})

const totalPosts = computed(() => posts.value.length)

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(5, 10)
}

function goPost(post) {
  if (post.slug) {
    router.push({ name: 'post-detail-slug', params: { slug: post.slug } })
  } else {
    router.push({ name: 'post-detail', params: { id: post.id } })
  }
}

onMounted(async () => {
  try {
    const data = await postApi.list({ page: 1, size: 100 })
    posts.value = data.items || []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-enter relative pt-28 pb-10">
    <div class="max-w-3xl mx-auto px-5">
      <header class="mb-12 animate-fade-up">
        <div class="text-[11px] tracking-[0.3em] text-star-dim mb-3">ARCHIVE</div>
        <h1 class="font-serif text-3xl md:text-4xl font-bold text-white mb-3">时间归档</h1>
        <p class="text-sm text-slate-400">共 <span class="text-star-glow">{{ totalPosts }}</span> 篇文章，按发布时间倒序</p>
      </header>

      <LoadingSpinner v-if="loading" text="正在整理时间线…" />

      <div v-else-if="grouped.length" class="relative">
        <!-- 时间轴主线 -->
        <div class="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-star-violet/60 via-white/10 to-transparent" />

        <div v-for="group in grouped" :key="group.year" class="relative pl-8 mb-12">
          <!-- 年份节点 -->
          <div class="absolute left-0 top-2 w-[11px] h-[11px] rounded-full bg-star-glow shadow-glow ring-4 ring-star-violet/15" />
          <h2 class="font-serif text-xl font-bold text-slate-100 mb-5">{{ group.year }}</h2>

          <div class="space-y-1">
            <button
              v-for="post in group.items"
              :key="post.id"
              class="group flex items-baseline gap-4 w-full text-left px-3 py-2 -mx-3 rounded-xl hover:bg-white/[0.04] transition-colors duration-300"
              @click="goPost(post)"
            >
              <span class="text-xs font-mono text-star-dim flex-shrink-0 w-10">{{ formatDate(post.published_at || post.created_at) }}</span>
              <span class="text-sm text-slate-300 group-hover:text-star-glow transition-colors duration-300 line-clamp-1 flex-1">{{ post.title }}</span>
              <span v-if="post.is_top" class="tag-pinned flex-shrink-0">置顶</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="glass p-4">
        <EmptyState icon="clock" text="还没有文章，时间线等待第一条记录" />
      </div>
    </div>
  </div>
</template>
