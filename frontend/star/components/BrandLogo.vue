<script setup>
/**
 * YCMS 2.0 | 基于 PHP + Node.js 的轻量内容管理系统
 * Copyright © 2026 影云网络科技（石家庄）有限公司
 * 开源协议：AGPLv3 License
 * GitHub：https://github.com/sjzyingyunkeji/ycms-2.0
 * 本程序遵循 AGPLv3 协议：公网提供服务、衍生分发时，必须同步开放对应源码；
 * 如有商用授权、定制合作需求，欢迎联系：info@sjzyingyun.cn
 */


import { computed } from 'vue'
import { useSiteStore } from '../../core/stores/site.js'

defineProps({
  size: { type: String, default: 'md' },
})

const site = useSiteStore()

// 图片 Logo 的尺寸（文字 Logo 由字号控制）
const boxSizes = { sm: 'w-8 h-8 rounded-lg', md: 'w-9 h-9 rounded-xl', lg: 'w-12 h-12 rounded-2xl' }
const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

/** 图标位优先使用博主头像（后台「个人资料」维护），为空时回落到 Logo / 站名 */
const avatar = computed(() => (site.settings.owner_avatar || '').trim())
</script>

<template>
  <!-- 博主头像优先占用图标位 -->
  <img
    v-if="avatar"
    :src="avatar"
    :alt="site.settings.owner_name || site.settings.site_name || 'ycms2.0'"
    :class="[boxSizes[size] || boxSizes.md, 'rounded-full object-cover flex-shrink-0 ring-1 ring-white/15']"
  />
  <img
    v-else-if="site.settings.logo_type === 'image' && site.settings.logo_image"
    :src="site.settings.logo_image"
    :alt="site.settings.site_name || 'ycms2.0'"
    :class="[boxSizes[size] || boxSizes.md, 'object-cover flex-shrink-0']"
  />
  <div v-else class="leading-tight min-w-0">
    <div class="font-serif font-bold text-slate-100 truncate" :class="textSizes[size] || textSizes.md">
      {{ site.settings.site_name || 'ycms2.0' }}
    </div>
  </div>
</template>
