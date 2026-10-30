const fs = require('node:fs')

const patch = (file, pairs) => {
  let s = fs.readFileSync(file, 'utf8')
  let hit = 0
  for (const [from, to] of pairs) {
    if (s.includes(from)) {
      s = s.replace(from, to)
      hit++
    }
  }
  fs.writeFileSync(file, s, 'utf8')
  console.log(`${file}: 命中 ${hit}/${pairs.length}`)
}

patch('README.md', [
  [
    '> 开源版随仓库附带 `default` 与 `star` 两套主题源码，站点根入口固定由 `default` 接管；主题在线安装与运行时切换为商业版能力。',
    '> 主题源码按仓库拆分：主仓库只含默认主题 `frontend/site`，星空版仓库只含 `frontend/star`；站点根入口由本仓库唯一主题接管，主题在线安装与运行时切换为商业版能力。',
  ],
  [
    'npm run pack:all       # 两套主题一起构建并打包，清单保留全部条目',
    'npm run pack:all       # 构建并打包本仓库全部主题，清单按 slug 合并',
  ],
  [
    '- **构建分层**：`frontend/core`（与主题无关）+ `shared`（通用组件与样式）+ `admin`（后台入口）+ `site`（默认主题）+ `star`（星空主题），Vite 多模式独立构建',
    '- **构建分层**：`frontend/core`（与主题无关）+ `shared`（通用组件与样式）+ `admin`（后台入口）+ 主题目录（`site` 默认主题 / `star` 星空主题），Vite 多模式独立构建，构建时按仓库实际存在的主题自动遍历',
  ],
  [
    '#   两套主题端口相同，需要同时预览时追加 -- --port 5174',
    '#   同一端口，需要同时预览多主题时追加 -- --port 5174',
  ],
])

patch('docs/deployment.md', [
  ['npm run pack:all          # 两套主题一起打包', 'npm run pack:all          # 打包本仓库全部主题'],
  [
    '> 开源版随仓库附带 `default` 与 `star` 两套主题源码，站点根入口固定由 `default` 接管；主题在线安装/切换属于商业版能力。',
    '> 主题源码按仓库拆分：主仓库只含默认主题 `frontend/site`，星空版仓库只含 `frontend/star`；站点根入口由本仓库唯一主题接管，主题在线安装/切换属于商业版能力。',
  ],
])
