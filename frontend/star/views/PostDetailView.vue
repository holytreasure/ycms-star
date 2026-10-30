<script setup>
/**
 * YCMS 2.0 | 基于 PHP + Node.js 的轻量内容管理系统
 * Copyright © 2026 影云网络科技（石家庄）有限公司
 * 开源协议：AGPLv3 License
 * GitHub：https://github.com/sjzyingyunkeji/ycms-2.0
 * 本程序遵循 AGPLv3 协议：公网提供服务、衍生分发时，必须同步开放对应源码；
 * 如有商用授权、定制合作需求，欢迎联系：info@sjzyingyun.cn
 */


import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postApi, commentApi } from '../../core/api/index.js'
import { useSiteStore } from '../../core/stores/site.js'
import { useAuthStore } from '../../core/stores/auth.js'
import MarkdownView from '../../shared/components/MarkdownView.vue'
import LoadingSpinner from '../../shared/components/LoadingSpinner.vue'
import EmptyState from '../../shared/components/EmptyState.vue'
import { showToast } from '../../core/utils/toast.js'
import { trackPage } from '../../core/utils/track.js'
import { applySeo, applyJsonLd, absoluteUrl } from '../../core/utils/seo.js'

const route = useRoute()
const router = useRouter()
const site = useSiteStore()
const auth = useAuthStore()

const post = ref(null)
const comments = ref([])
const loading = ref(true)
const viewCounted = ref(false)

const commentForm = ref({ nickname: '', email: '', content: '' })
const submitting = ref(false)

// 兼容两种详情路由：/posts/:id 与 /post/:slug
const identifier = computed(() => route.params.id || route.params.slug || '')

const relatedPosts = computed(() => (Array.isArray(post.value?.related_posts) ? post.value.related_posts : []))

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 16)
}

/** 文章规范地址（SEO 唯一地址） */
function canonicalUrl() {
  const slug = post.value?.slug
  return slug ? absoluteUrl(`/post/${slug}`) : absoluteUrl(route.path)
}

/** 跳转详情（优先使用可读 slug 地址） */
function goPost(target) {
  if (!target) return
  if (target.slug) {
    router.push({ name: 'post-detail-slug', params: { slug: target.slug } })
  } else {
    router.push({ name: 'post-detail', params: { id: target.id } })
  }
}

/** 应用 SEO 元信息 */
function applyPostSeo() {
  const p = post.value
  if (!p) return
  const siteName = site.settings.site_name || 'ycms2.0'
  const title = `${p.title} · ${siteName}`
  const description = (p.summary || '').slice(0, 160) || p.title
  const keywords = [
    p.title,
    p.category_name,
    ...(p.tags || []).map((t) => t.name),
    site.settings.site_keywords,
  ]
    .filter(Boolean)
    .join(',')

  applySeo({
    title,
    description,
    keywords,
    image: p.cover_image ? absoluteUrl(p.cover_image) : '',
    url: canonicalUrl(),
    type: 'article',
    publishedAt: p.published_at || p.created_at,
    author: p.author_name || site.settings.owner_name || '',
  })

  applyJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description,
    image: p.cover_image ? [absoluteUrl(p.cover_image)] : undefined,
    datePublished: p.published_at || p.created_at,
    dateModified: p.updated_at || p.published_at || p.created_at,
    author: { '@type': 'Person', name: p.author_name || site.settings.owner_name || '' },
    publisher: { '@type': 'Organization', name: siteName },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl() },
    keywords: p.summary || '',
    articleSection: p.category_name || '',
    wordCount: (p.content || '').length,
  })
}

async function loadPost() {
  loading.value = true
  try {
    post.value = await postApi.detail(identifier.value)
    await loadComments()
    if (!viewCounted.value) {
      viewCounted.value = true
      postApi.addView(post.value.id).catch(() => {})
      // 访问统计：文章页带上文章 ID，便于热门文章排行
      trackPage(route.path, post.value.id)
    }
    applyPostSeo()
  } catch {
    router.push({ name: 'not-found' })
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  try {
    const data = await commentApi.list({ post_id: identifier.value })
    comments.value = Array.isArray(data) ? data : []
  } catch { /* ignore */ }
}

async function submitComment() {
  if (!commentForm.value.content.trim()) {
    showToast('请填写评论内容', 'warning')
    return
  }
  submitting.value = true
  try {
    await commentApi.create({
      post_id: Number(post.value?.id || identifier.value),
      nickname: commentForm.value.nickname,
      email: commentForm.value.email,
      content: commentForm.value.content,
    })
    commentForm.value.content = ''
    showToast('评论已提交，审核通过后显示', 'success')
  } finally {
    submitting.value = false
  }
}

onMounted(loadPost)

// 上一篇/下一篇（同页面内切换）时重新加载
watch(() => route.params.id, loadPost)
watch(() => route.params.slug, loadPost)
</script>

<template>
  <div class="page-enter relative pt-28 pb-10">
    <div class="max-w-3xl mx-auto px-5">
      <LoadingSpinner v-if="loading" text="正在加载文章…" />

      <template v-else-if="post">
        <!-- 面包屑 -->
        <nav class="flex items-center gap-2 text-xs text-star-dim mb-8">
          <router-link :to="{ name: 'home' }" class="hover:text-star-glow transition-colors duration-300">首页</router-link>
          <span>/</span>
          <router-link :to="{ name: 'posts' }" class="hover:text-star-glow transition-colors duration-300">文章</router-link>
          <span>/</span>
          <span class="text-slate-400 truncate max-w-[240px]">{{ post.title }}</span>
        </nav>

        <!-- 头部 -->
        <header class="mb-10 animate-fade-up">
          <div class="flex flex-wrap items-center gap-3 mb-5">
            <router-link
              v-if="post.category_id"
              :to="{ name: 'category-posts', params: { id: post.category_id } }"
              class="tag-category"
            >
              {{ post.category_name || '未分类' }}
            </router-link>
            <span v-else class="tag-category">{{ post.category_name || '未分类' }}</span>
            <span v-if="post.is_top" class="tag-pinned">置顶</span>
            <span class="text-meta">{{ formatDate(post.published_at || post.created_at) }}</span>
            <span class="text-meta flex items-center gap-1">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {{ post.views }} 次阅读
            </span>
            <span v-if="post.author_name" class="text-meta">@{{ post.author_name }}</span>
          </div>

          <h1 class="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.25] mb-5">
            {{ post.title }}
          </h1>

          <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
            <router-link
              v-for="tag in post.tags"
              :key="tag.id"
              :to="{ name: 'tag-posts', params: { id: tag.id } }"
              class="tag-post hover:text-star-glow transition-colors duration-300"
            >
              #{{ tag.name }}
            </router-link>
          </div>
        </header>

        <!-- 封面 -->
        <div v-if="post.cover_image" class="mb-10 rounded-2xl overflow-hidden border border-white/[0.08]">
          <img :src="post.cover_image" :alt="post.title" class="w-full object-cover max-h-[420px]" />
        </div>

        <!-- 正文 -->
        <article class="glass p-7 md:p-10">
          <MarkdownView :content="post.content" />
        </article>

        <!-- 上一篇 / 下一篇 -->
        <div v-if="post.prev_post || post.next_post" class="grid md:grid-cols-2 gap-4 mt-8">
          <button
            v-if="post.prev_post"
            class="glass p-5 text-left group hover-lift"
            @click="goPost(post.prev_post)"
          >
            <div class="text-[10px] tracking-[0.25em] text-star-dim mb-2">上一篇</div>
            <div class="text-sm text-slate-300 group-hover:text-star-glow transition-colors duration-300 line-clamp-2">
              {{ post.prev_post.title }}
            </div>
          </button>
          <button
            v-if="post.next_post"
            class="glass p-5 text-left md:text-right group hover-lift"
            @click="goPost(post.next_post)"
          >
            <div class="text-[10px] tracking-[0.25em] text-star-dim mb-2">下一篇</div>
            <div class="text-sm text-slate-300 group-hover:text-star-glow transition-colors duration-300 line-clamp-2">
              {{ post.next_post.title }}
            </div>
          </button>
        </div>

        <!-- 相关文章 -->
        <section v-if="relatedPosts.length" class="mt-12">
          <div class="text-[11px] tracking-[0.3em] text-star-dim mb-4">RELATED</div>
          <div class="space-y-3">
            <router-link
              v-for="item in relatedPosts"
              :key="item.id"
              :to="item.slug ? { name: 'post-detail-slug', params: { slug: item.slug } } : { name: 'post-detail', params: { id: item.id } }"
              class="glass p-4 flex items-center justify-between gap-4 group hover-lift"
            >
              <span class="text-sm text-slate-300 group-hover:text-white transition-colors duration-300 line-clamp-1">{{ item.title }}</span>
              <span class="text-meta flex-shrink-0">{{ formatDate(item.published_at || item.created_at) }}</span>
            </router-link>
          </div>
        </section>

        <!-- 评论 -->
        <section class="mt-12">
          <div class="text-[11px] tracking-[0.3em] text-star-dim mb-4">COMMENTS · {{ comments.length }}</div>

          <div class="space-y-3 mb-6">
            <div v-for="c in comments" :key="c.id" class="glass p-5">
              <div class="flex items-center gap-2.5 mb-2">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-star-violet/30 to-star-cyan/20 border border-white/[0.08] flex items-center justify-center text-[11px] font-serif font-bold text-star-glow">
                  {{ (c.nickname || '访客').charAt(0) }}
                </div>
                <span class="text-sm text-slate-200">{{ c.nickname || '访客' }}</span>
                <span class="text-meta ml-auto">{{ formatDateTime(c.created_at) }}</span>
              </div>
              <p class="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{{ c.content }}</p>
            </div>

            <div v-if="!comments.length" class="glass p-2">
              <EmptyState icon="comment" text="还没有评论，来说点什么吧" />
            </div>
          </div>

          <!-- 评论表单 -->
          <div class="glass-medium p-6 md:p-8">
            <div class="font-serif text-lg text-slate-100 mb-4">留下你的足迹</div>
            <div class="grid sm:grid-cols-2 gap-3 mb-3">
              <input v-model="commentForm.nickname" class="input-star" type="text" placeholder="昵称（可选）" />
              <input v-model="commentForm.email" class="input-star" type="email" placeholder="邮箱（可选，不会公开）" />
            </div>
            <textarea
              v-model="commentForm.content"
              class="input-star w-full min-h-[110px] resize-y"
              placeholder="写点什么…"
            />
            <div class="flex items-center justify-between gap-3 mt-4">
              <p class="text-xs text-star-dim">评论审核通过后展示，请勿包含敏感信息。</p>
              <button class="btn-star !px-6 !py-2.5 !text-sm" :disabled="submitting" @click="submitComment">
                {{ submitting ? '提交中…' : '发表评论' }}
              </button>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
