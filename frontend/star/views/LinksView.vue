<script setup>
/**
 * 影云CMS 2.0 | 基于 PHP + Node.js 的轻量内容管理系统
 * Copyright © 2026 影云网络科技（石家庄）有限公司
 * 开源协议：AGPLv3 License
 * GitHub：https://github.com/sjzyingyunkeji/yinyun-cms
 * 本程序遵循 AGPLv3 协议：公网提供服务、衍生分发时，必须同步开放对应源码；
 * 如有商用授权、定制合作需求，欢迎联系：info@sjzyingyun.cn
 */


import { onMounted, ref } from 'vue'
import { linkApi } from '../../core/api/index.js'
import EmptyState from '../../shared/components/EmptyState.vue'
import LoadingSpinner from '../../shared/components/LoadingSpinner.vue'

const links = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await linkApi.list()
    links.value = Array.isArray(data) ? data : []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-enter relative pt-28 pb-10">
    <div class="max-w-5xl mx-auto px-5">
      <header class="mb-12 animate-fade-up">
        <div class="text-[11px] tracking-[0.3em] text-star-dim mb-3">FRIENDS</div>
        <h1 class="font-serif text-3xl md:text-4xl font-bold text-white mb-3">友情链接</h1>
        <p class="text-sm text-slate-400">感谢这些站点的陪伴，愿星光彼此照亮</p>
      </header>

      <LoadingSpinner v-if="loading" text="正在加载友邻…" />

      <div v-else-if="links.length" class="grid sm:grid-cols-2 gap-4">
        <a
          v-for="link in links"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="glass p-5 flex items-center gap-4 group hover-lift"
        >
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-star-violet/25 to-star-cyan/15 border border-white/[0.08] flex items-center justify-center font-serif font-bold text-star-glow flex-shrink-0">
            {{ link.name.charAt(0) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium text-slate-200 group-hover:text-white transition-colors duration-300 truncate">{{ link.name }}</div>
            <div class="text-xs text-star-dim mt-1 truncate">{{ link.description || link.url }}</div>
          </div>
          <svg class="w-4 h-4 text-star-dim group-hover:text-star-cyan transition-colors duration-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>

      <div v-else class="glass p-4">
        <EmptyState icon="link" text="还没有添加友链" />
      </div>
    </div>
  </div>
</template>
