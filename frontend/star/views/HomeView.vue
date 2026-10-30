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
import { useSiteStore } from '../../core/stores/site.js'
import { postApi, categoryApi, pageApi, linkApi } from '../../core/api/index.js'
import MarkdownView from '../../shared/components/MarkdownView.vue'
import LoadingSpinner from '../../shared/components/LoadingSpinner.vue'
import EmptyState from '../../shared/components/EmptyState.vue'

const router = useRouter()
const site = useSiteStore()

const posts = ref([])
const categories = ref([])
const aboutPage = ref(null)
const links = ref([])
const loading = ref(true)

const latestPosts = computed(() => posts.value.slice(0, 6))

// 首页排序方式：后台「站点设置 → 首页文章排序」可切换 热门 / 最新
const homeSort = computed(() => (site.settings.home_post_sort === 'latest' ? 'latest' : 'hot'))
const homeSortLabel = computed(() => (homeSort.value === 'hot' ? '热门文章' : '最新文章'))

// 导航友站（后台「站点设置 → 导航友站」配置，与顶部导航「友站」下拉同源）
const navLinks = computed(() => (Array.isArray(site.settings.nav_links) ? site.settings.nav_links : []))

onMounted(async () => {
  try {
    const [postsData, catsData, linksData] = await Promise.all([
      postApi.list({ page: 1, size: 6, sort: homeSort.value }),
      categoryApi.list(),
      linkApi.list(),
    ])
    posts.value = postsData.items || []
    categories.value = Array.isArray(catsData) ? catsData : []
    links.value = Array.isArray(linksData) ? linksData : []

    // 尝试获取关于页面
    const pages = await pageApi.list()
    const list = Array.isArray(pages) ? pages : []
    aboutPage.value = list.find((p) => p.slug === 'about') || list[0] || null
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}
</script>

<template>
  <div class="page-enter relative">
    <!-- ============ Hero 首屏 ============ -->
    <section class="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-16">
      <div class="max-w-4xl mx-auto text-center animate-fade-up">
        <h1 class="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.15]">
          {{ site.settings.owner_name || '星尘' }}
          <span class="block md:inline bg-gradient-to-r from-star-violet via-star-glow to-star-cyan bg-clip-text text-transparent">
            {{ site.settings.hero_suffix || '的数字星空' }}
          </span>
        </h1>

        <p class="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {{ site.settings.site_description || '在代码与星空之间，记录每一次思考与发现。' }}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button class="btn-star !px-7 !py-3 !text-sm" @click="router.push({ name: 'posts' })">
            开始探索
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button class="btn-ghost !px-7 !py-3 !text-sm" @click="router.push({ name: 'archive' })">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
            时间归档
          </button>
        </div>

        <!-- 统计 -->
        <div class="grid grid-cols-3 gap-4 max-w-xl mx-auto">
          <div class="stat-card hover-lift">
            <div class="font-serif text-2xl md:text-3xl font-bold text-white">{{ posts.length }}<span class="text-star-glow">+</span></div>
            <div class="text-[11px] tracking-wider text-star-dim mt-1.5">篇文章</div>
          </div>
          <div class="stat-card hover-lift">
            <div class="font-serif text-2xl md:text-3xl font-bold text-white">{{ categories.length }}</div>
            <div class="text-[11px] tracking-wider text-star-dim mt-1.5">个分类</div>
          </div>
          <div class="stat-card hover-lift">
            <div class="font-serif text-2xl md:text-3xl font-bold text-white">{{ links.length }}</div>
            <div class="text-[11px] tracking-wider text-star-dim mt-1.5">位友邻</div>
          </div>
        </div>
      </div>

      <!-- 滚动提示 -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-star-dim animate-float">
        <span class="text-[10px] tracking-[0.3em]">SCROLL</span>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>

    <!-- ============ 关于 ============ -->
    <section v-if="aboutPage" class="relative max-w-6xl mx-auto px-5 -mt-6">
      <div class="glass-medium p-8 md:p-10 flex items-start gap-6 hover-lift">
        <div class="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-star-violet/25 to-star-cyan/15 border border-white/[0.08] items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-star-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 10-16 0" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[11px] tracking-[0.3em] text-star-dim mb-3">ABOUT</div>
          <MarkdownView :content="aboutPage.content.slice(0, 400)" />
          <button
            class="inline-flex items-center gap-1.5 text-sm text-star-glow hover:text-white transition-colors duration-300 mt-3"
            @click="router.push({ name: 'page', params: { slug: aboutPage.slug } })"
          >
            了解更多
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ============ 文章 ============ -->
    <section class="relative max-w-6xl mx-auto px-5 mt-20">
      <div class="flex items-end justify-between mb-8">
        <div>
          <div class="text-[11px] tracking-[0.3em] text-star-dim mb-2">WRITING</div>
          <h2 class="font-serif text-2xl md:text-3xl font-bold text-slate-100">{{ homeSortLabel }}</h2>
        </div>
        <router-link
          :to="{ name: 'posts' }"
          class="hidden sm:inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-star-glow transition-colors duration-300"
        >
          全部文章
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>

      <LoadingSpinner v-if="loading" text="正在汇聚星光…" />

      <div v-else-if="latestPosts.length" class="grid md:grid-cols-2 gap-5">
        <router-link
          v-for="(post, i) in latestPosts"
          :key="post.id"
          :to="post.slug ? { name: 'post-detail-slug', params: { slug: post.slug } } : { name: 'post-detail', params: { id: post.id } }"
          class="block group"
          :class="i === 0 ? 'md:col-span-2' : ''"
        >
          <div
            class="h-full hover-lift"
            :class="i === 0 ? 'glass-strong p-8 md:p-10' : 'glass p-6'"
          >
            <div class="flex items-center gap-2.5 mb-4">
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

            <h3
              class="font-serif font-bold text-slate-100 group-hover:text-star-glow transition-colors duration-300 mb-3 leading-snug"
              :class="i === 0 ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'"
            >
              {{ post.title }}
            </h3>

            <p class="text-sm text-slate-400 leading-relaxed" :class="i === 0 ? 'line-clamp-3' : 'line-clamp-2'">
              {{ post.summary || '暂无摘要。' }}
            </p>

            <div class="mt-5 flex items-center gap-1.5 text-xs text-star-dim group-hover:text-star-glow transition-colors duration-300">
              阅读全文
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>
      </div>

      <div v-else class="glass p-4">
        <EmptyState icon="file" text="还没有文章，去后台发布第一篇吧" />
      </div>
    </section>

    <!-- ============ 友邻 ============ -->
    <section v-if="links.length" class="relative max-w-6xl mx-auto px-5 mt-20">
      <div class="text-[11px] tracking-[0.3em] text-star-dim mb-2">FRIENDS</div>
      <h2 class="font-serif text-2xl md:text-3xl font-bold text-slate-100 mb-8">友情链接</h2>

      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <a
          v-for="link in links"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="glass p-4 flex items-center gap-3.5 group hover-lift"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-star-violet/25 to-star-cyan/15 border border-white/[0.08] flex items-center justify-center font-serif font-bold text-star-glow flex-shrink-0">
            {{ link.name.charAt(0) }}
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-slate-200 group-hover:text-white transition-colors duration-300 truncate">{{ link.name }}</div>
            <div class="text-xs text-star-dim truncate mt-0.5">{{ link.description || link.url }}</div>
          </div>
        </a>
      </div>
    </section>

    <!-- ============ 友站 ============ -->
    <section v-if="navLinks.length" class="relative max-w-6xl mx-auto px-5 mt-16">
      <div class="text-[11px] tracking-[0.3em] text-star-dim mb-2">SITES</div>
      <h2 class="font-serif text-2xl md:text-3xl font-bold text-slate-100 mb-8">其他站点</h2>

      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <a
          v-for="navSite in navLinks"
          :key="navSite.url"
          :href="navSite.url"
          target="_blank"
          rel="noopener"
          class="glass p-4 flex items-center gap-3.5 group hover-lift"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-star-violet/25 to-star-cyan/15 border border-white/[0.08] flex items-center justify-center font-serif font-bold text-star-glow flex-shrink-0">
            {{ navSite.name.charAt(0) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium text-slate-200 group-hover:text-white transition-colors duration-300 truncate">{{ navSite.name }}</div>
            <div class="text-xs text-star-dim truncate mt-0.5">{{ navSite.url }}</div>
          </div>
          <svg class="w-3.5 h-3.5 text-star-dim group-hover:text-star-cyan transition-colors duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>
    </section>

    <!-- ============ 底部入口 ============ -->
    <section class="relative max-w-6xl mx-auto px-5 mt-20 text-center">
      <router-link :to="{ name: 'posts' }" class="btn-ghost !px-6 !py-2.5 !text-sm">
        查看全部文章
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </router-link>
    </section>
  </div>
</template>
