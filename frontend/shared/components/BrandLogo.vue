<script setup>
/**
 * 影云CMS 2.0 | 基于 PHP + Node.js 的轻量内容管理系统
 * Copyright © 2026 影云网络科技（石家庄）有限公司
 * 开源协议：AGPLv3 License
 * GitHub：https://github.com/sjzyingyunkeji/yinyun-cms
 * 本程序遵循 AGPLv3 协议：公网提供服务、衍生分发时，必须同步开放对应源码；
 * 如有商用授权、定制合作需求，欢迎联系：info@sjzyingyun.cn
 */


import { computed, ref, watch } from 'vue'
import { useSiteStore } from '../../core/stores/site.js'
import { PRODUCT_NAME } from '../product.js'

/**
 * 品牌 Logo 组件
 *  前台（默认）：按「站点设置」显示自定义图片或站点名称
 *  后台（product）：固定展示产品名称，图片作为图标前置，不随站点名称变化
 */
const props = defineProps({
  /** 显示尺寸：sm / md / lg */
  size: { type: String, default: 'md' },
  /** 是否作为后台产品品牌位（固定展示产品名） */
  product: { type: Boolean, default: false },
})

const site = useSiteStore()

/** 图片加载失败时回退为纯文字，避免破图或裸 alt 文本 */
const imgFailed = ref(false)
watch(
  () => site.settings.logo_image,
  () => {
    imgFailed.value = false
  }
)

const showImage = computed(
  () => site.settings.logo_type === 'image' && !!site.settings.logo_image && !imgFailed.value
)

const displayName = computed(() => (props.product ? PRODUCT_NAME : site.settings.site_name || PRODUCT_NAME))

const imgSizes = { sm: 'w-8 h-8 rounded-lg', md: 'w-9 h-9 rounded-xl', lg: 'w-12 h-12 rounded-2xl' }
const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
}
</script>

<template>
  <!-- 后台品牌位：仅展示产品名（不显示站点 Logo 图标） -->
  <div v-if="product" class="min-w-0 flex items-center">
    <div
      class="font-semibold text-[var(--y-text)] truncate"
      :class="textSizes[size] || textSizes.md"
    >
      {{ PRODUCT_NAME }}
    </div>
  </div>
  <!-- 前台：图片 / 文字二选一 -->
  <template v-else>
    <img
      v-if="showImage"
      :src="site.settings.logo_image"
      :alt="displayName"
      :class="[imgSizes[size] || imgSizes.md, 'object-cover flex-shrink-0']"
      @error="imgFailed = true"
    />
    <div v-else class="leading-tight min-w-0 flex items-center gap-2">
      <div class="w-1.5 h-1.5 rounded-full bg-[var(--y-primary)] flex-shrink-0" />
      <div
        class="font-semibold text-[var(--y-text)] truncate"
        :class="textSizes[size] || textSizes.md"
      >
        {{ displayName }}
      </div>
    </div>
  </template>
</template>
