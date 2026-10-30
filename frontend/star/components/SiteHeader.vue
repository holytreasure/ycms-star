<script setup>
/**
 * YCMS 2.0 | 基于 PHP + Node.js 的轻量内容管理系统
 * Copyright © 2026 影云网络科技（石家庄）有限公司
 * 开源协议：AGPLv3 License
 * GitHub：https://github.com/sjzyingyunkeji/ycms-2.0
 * 本程序遵循 AGPLv3 协议：公网提供服务、衍生分发时，必须同步开放对应源码；
 * 如有商用授权、定制合作需求，欢迎联系：info@sjzyingyun.cn
 */


import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSiteStore } from '../../core/stores/site.js'
import { pageApi } from '../../core/api/index.js'
import BrandLogo from './BrandLogo.vue'

const site = useSiteStore()
const route = useRoute()
const router = useRouter()

const pages = ref([])
const mobileOpen = ref(false)
const linksOpen = ref(false)
const linksRef = ref(null)
const scrolled = ref(false)

const navItems = [
  { name: 'home', label: '首页' },
  { name: 'posts', label: '文章' },
  { name: 'archive', label: '归档' },
  { name: 'links', label: '友链' },
]

// 导航栏友站链接（后台「站点设置」中配置，新标签页打开）
const navLinks = computed(() => (Array.isArray(site.settings.nav_links) ? site.settings.nav_links : []))

// 导航项是否高亮（含分类/标签/页面路由的归属判断）
function isActive(name) {
  if (name === 'posts') {
    return ['posts', 'post-detail', 'post-detail-slug', 'category-posts', 'tag-posts'].includes(route.name)
  }
  if (name === 'home') {
    return route.name === 'home'
  }
  return route.name === name
}

function isPageActive(slug) {
  return route.name === 'page' && route.params.slug === slug
}

onMounted(async () => {
  try {
    const data = await pageApi.list()
    pages.value = Array.isArray(data) ? data : []
  } catch { /* ignore */ }
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleDocClick)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleDocClick)
})

function handleScroll() {
  scrolled.value = window.scrollY > 8
}

function handleDocClick(e) {
  if (linksRef.value && !linksRef.value.contains(e.target)) {
    linksOpen.value = false
  }
}

function go(name) {
  router.push({ name })
  mobileOpen.value = false
}

function goPage(slug) {
  router.push({ name: 'page', params: { slug } })
  mobileOpen.value = false
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
    <div
      class="border-b transition-colors duration-300"
      :class="scrolled ? 'border-white/[0.06] bg-space-950/60 backdrop-blur-xl' : 'border-transparent'"
    >
      <div class="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <!-- Logo -->
        <router-link :to="{ name: 'home' }" class="flex items-center gap-3 group flex-shrink-0">
          <BrandLogo size="md" />
          <span class="hidden lg:inline text-[10px] tracking-[0.25em] text-star-dim/70 uppercase">Blog</span>
        </router-link>

        <!-- 桌面导航 -->
        <nav class="hidden md:flex items-center gap-1">
          <button
            v-for="item in navItems"
            :key="item.name"
            class="relative px-4 py-2 text-sm rounded-lg transition-all duration-300"
            :class="isActive(item.name) ? 'text-white' : 'text-slate-400 hover:text-slate-200'"
            @click="go(item.name)"
          >
            {{ item.label }}
            <span
              v-if="isActive(item.name)"
              class="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-star-violet to-star-cyan shadow-glow"
            />
          </button>
          <button
            v-for="p in pages"
            :key="p.id"
            class="relative px-4 py-2 text-sm rounded-lg transition-all duration-300"
            :class="isPageActive(p.slug) ? 'text-white' : 'text-slate-400 hover:text-slate-200'"
            @click="goPage(p.slug)"
          >
            {{ p.title }}
            <span
              v-if="isPageActive(p.slug)"
              class="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-star-violet to-star-cyan shadow-glow"
            />
          </button>

          <!-- 友站下拉 -->
          <div v-if="navLinks.length" ref="linksRef" class="relative">
            <button
              class="flex items-center gap-1 px-4 py-2 text-sm rounded-lg transition-all duration-300"
              :class="linksOpen ? 'text-white bg-white/[0.06]' : 'text-slate-400 hover:text-slate-200'"
              @click="linksOpen = !linksOpen"
            >
              友站
              <svg
                class="w-3.5 h-3.5 transition-transform duration-300"
                :class="linksOpen ? 'rotate-180' : ''"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <transition name="page">
              <div v-if="linksOpen" class="absolute right-0 top-12 w-56 glass-strong p-2 z-50">
                <div class="px-3 py-1.5 text-[10px] tracking-widest text-star-dim">其他站点</div>
                <a
                  v-for="link in navLinks"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors duration-300 group"
                  @click="linksOpen = false"
                >
                  <span class="truncate">{{ link.name }}</span>
                  <svg class="w-3.5 h-3.5 text-star-dim group-hover:text-star-cyan transition-colors duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              </div>
            </transition>
          </div>
        </nav>

        <div class="flex items-center gap-3">
          <a href="/admin/" class="hidden sm:inline-flex btn-ghost !px-4 !py-1.5 !text-xs">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
            后台
          </a>

          <!-- 移动端菜单按钮 -->
          <button class="md:hidden text-slate-300 p-2" @click="mobileOpen = !mobileOpen">
            <svg v-if="!mobileOpen" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端导航 -->
    <transition name="page">
      <nav v-if="mobileOpen" class="md:hidden border-t border-white/[0.06] px-5 py-3 flex flex-wrap gap-2 bg-space-950/90 backdrop-blur-xl">
        <button
          v-for="item in navItems"
          :key="item.name"
          class="chip"
          :class="isActive(item.name) ? 'chip-active' : ''"
          @click="go(item.name)"
        >
          {{ item.label }}
        </button>
        <button
          v-for="p in pages"
          :key="p.id"
          class="chip"
          :class="isPageActive(p.slug) ? 'chip-active' : ''"
          @click="goPage(p.slug)"
        >
          {{ p.title }}
        </button>

        <span v-if="navLinks.length" class="w-full mt-1 text-[10px] tracking-widest text-star-dim">其他站点</span>
        <a
          v-for="link in navLinks"
          :key="link.url"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="chip"
          @click="mobileOpen = false"
        >
          {{ link.name }}
          <svg class="w-3 h-3 text-star-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </nav>
    </transition>
  </header>
</template>
