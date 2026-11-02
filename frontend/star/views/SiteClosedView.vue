<script setup>
/**
 * 影云CMS 2.0 | 基于 PHP + Node.js 的轻量内容管理系统
 * Copyright © 2026 影云网络科技（石家庄）有限公司
 * 开源协议：AGPLv3 License
 * GitHub：https://github.com/sjzyingyunkeji/yinyun-cms
 * 本程序遵循 AGPLv3 协议：公网提供服务、衍生分发时，必须同步开放对应源码；
 * 如有商用授权、定制合作需求，欢迎联系：info@sjzyingyun.cn
 */


import { useSiteStore } from '../../core/stores/site.js'
import BrandLogo from '../components/BrandLogo.vue'

const site = useSiteStore()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-5">
    <div class="w-full max-w-lg text-center">
      <div class="inline-flex items-center justify-center mb-8">
        <div class="relative">
          <div class="absolute inset-0 rounded-2xl bg-star-violet/20 blur-2xl" />
          <div class="relative opacity-60 grayscale-[0.4]">
            <BrandLogo size="lg" />
          </div>
        </div>
      </div>

      <h1 class="font-serif text-3xl font-bold text-slate-100 mb-5">站点暂时关闭</h1>

      <div class="glass-medium p-7 md:p-8 mb-8">
        <p class="text-slate-300 leading-relaxed whitespace-pre-wrap">
          {{ site.settings.site_closed_message || '站点正在维护升级中，暂时关闭访问，请稍后再来。' }}
        </p>
      </div>
    </div>
  </div>
</template>
