<script setup>
/**
 * 影云CMS 2.0 | 基于 PHP + Node.js 的轻量内容管理系统
 * Copyright © 2026 影云网络科技（石家庄）有限公司
 * 开源协议：AGPLv3 License
 * GitHub：https://github.com/sjzyingyunkeji/yinyun-cms
 * 本程序遵循 AGPLv3 协议：公网提供服务、衍生分发时，必须同步开放对应源码；
 * 如有商用授权、定制合作需求，欢迎联系：info@sjzyingyun.cn
 */


import { ref } from 'vue'
import { useSiteStore } from '../../core/stores/site.js'
import BaseModal from '../../shared/components/BaseModal.vue'

const site = useSiteStore()
const qrOpen = ref(false)

// 社交入口（后台「站点设置」中留空即隐藏）
const socials = [
  {
    key: 'social_github',
    label: 'GitHub',
    icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 4.44-2.34 4.44-5.12 0-1.34-.47-2.58-1.32-3.57.41-1.09.37-2.28-.06-3.35 0 0-1.05-.33-3.5 1.3a12.4 12.4 0 00-6.35 0C6.86 3.18 5.8 3.5 5.8 3.5c-.43 1.07-.47 2.26-.06 3.35A5.03 5.03 0 004 10.4c0 2.78 1.3 4.77 4.44 5.12a3.37 3.37 0 00-.94 2.58V22',
  },
  {
    key: 'social_email',
    label: 'Email',
    icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  },
  {
    key: 'social_weibo',
    label: '微博',
    icon: 'M18 8a4 4 0 00-4-4 4 4 0 00-8 0c0 4 3.5 5 6 7 3 2.5 3 6 0 8s-7-1-8-4',
  },
  {
    key: 'social_zhihu',
    label: '知乎',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 12h8M12 8v8',
  },
  { key: 'social_csdn', label: 'CSDN', icon: 'M4 5h16v14H4zM8 9h8M8 13h5' },
]

// 微信：有二维码则弹窗，只有链接则直接跳转
function wechatKind() {
  if (site.settings.social_wechat_qr) return 'qr'
  if (site.settings.social_wechat) return 'link'
  return ''
}

function openWechat() {
  const kind = wechatKind()
  if (kind === 'qr') {
    qrOpen.value = true
  } else if (kind === 'link') {
    window.open(site.settings.social_wechat, '_blank', 'noopener')
  }
}

function socialHref(key) {
  return key === 'social_email' ? `mailto:${site.settings[key]}` : site.settings[key]
}
</script>

<template>
  <footer class="relative mt-24 border-t border-white/[0.06]">
    <div class="max-w-6xl mx-auto px-5 py-12">
      <div class="glass-medium p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="text-center md:text-left">
          <div class="font-serif text-lg text-slate-200 mb-1">{{ site.settings.site_name || '影云CMS' }}</div>
          <p class="text-sm text-star-dim max-w-md">{{ site.settings.site_description }}</p>
        </div>

        <div class="flex items-center gap-3">
          <template v-for="item in socials" :key="item.key">
            <a
              v-if="site.settings[item.key]"
              :href="socialHref(item.key)"
              target="_blank"
              rel="noopener"
              class="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:border-star-violet/50 transition-all duration-300 hover:-translate-y-1"
              :title="item.label"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path :d="item.icon" />
              </svg>
            </a>
          </template>

          <button
            v-if="wechatKind()"
            class="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:border-star-violet/50 transition-all duration-300 hover:-translate-y-1"
            title="微信公众平台"
            @click="openWechat"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-6 text-center text-xs text-star-dim space-y-1">
        <!-- 自定义页脚信息（站点设置，支持 HTML） -->
        <div v-if="site.settings.footer_html" class="footer-custom" v-html="site.settings.footer_html" />
        <div v-else>
          © {{ new Date().getFullYear() }} {{ site.settings.owner_name || '星辰' }} · Powered by
          <span class="text-star-glow/80">影云CMS</span>
          <span v-if="site.settings.site_icp" class="ml-2">
            <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener" class="hover:text-slate-400 transition-colors">{{ site.settings.site_icp }}</a>
          </span>
        </div>
        <div class="opacity-60">愿你的代码如星空般璀璨，愿你的 bug 如流星般稀少</div>
      </div>
    </div>

    <BaseModal v-model="qrOpen" title="微信公众平台" width="max-w-xs">
      <div class="text-center">
        <div class="rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03] p-3 inline-block">
          <img :src="site.settings.social_wechat_qr" alt="微信二维码" class="w-56 h-56 object-contain" />
        </div>
        <p class="text-xs text-star-dim mt-4">扫码关注微信公众平台</p>
        <a
          v-if="site.settings.social_wechat"
          :href="site.settings.social_wechat"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 text-xs text-star-glow hover:text-white transition-colors duration-300 mt-2"
        >
          或访问主页
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>
    </BaseModal>
  </footer>
</template>

<style scoped>
/* 自定义页脚（支持 HTML）：统一链接观感 */
.footer-custom :deep(a) {
  color: #c4b5fd;
  text-decoration: none;
}
.footer-custom :deep(a:hover) {
  color: #e9d5ff;
  text-decoration: underline;
}
</style>
