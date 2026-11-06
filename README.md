# 康腾甲的学术个人主页

这是 Tengjia Kang（康腾甲）的静态学术主页，用于长期展示个人介绍、研究兴趣、论文、科研项目、教育经历、学术动态和简历。

- 当前身份：哈尔滨工业大学博士研究生。
- 研究兴趣：人工智能、计算机图形学。
- 目标网址：<https://kangtengjia.github.io/>。
- 技术：HTML、CSS、原生 JavaScript，没有运行时第三方依赖。
- 默认英文、浅色模式，可切换中文和深色模式，并在当前浏览器记住偏好。

网站无需安装 Node.js、Ruby、Jekyll，也无需执行 `npm build`。直接将根目录的静态文件交给 GitHub Pages 即可。文中的 Node.js 和浏览器工具仅用于开发检查，发布不需要它们。

## 1. 本地预览

**快速查看**：双击根目录的 `index.html`，用浏览器打开。简介、研究方向、语言切换和主题切换都可以运行。

**推荐方法**：在此项目文件夹打开终端，执行：

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Windows 上如果命令不可用，可尝试 `py -m http.server 8000 --bind 127.0.0.1`。

在浏览器访问 <http://127.0.0.1:8000/>。停止预览时，在终端按 `Ctrl+C`。也可以使用 VS Code 的 Live Server 扩展。

预览服务器只帮助浏览器读取本地文件，网站上线后不需要任何服务器端程序。由于浏览器限制，双击文件时不检测 CV，请用 HTTP 预览验证 CV 下载。

## 2. 文件结构

```text
.
├── index.html                 # 主页结构、默认英文和 SEO 元信息
├── style.css                  # 排版、响应式布局、浅色/深色主题
├── script.js                  # 渲染、切换语言/主题、筛选和 PDF 验证
├── data.js                    # 日常更新入口：个人资料和全部双语内容
├── assets/
│   ├── favicon.svg            # TK 首字母图标
│   └── images/
│       ├── social-card.svg    # 社交分享图片的可编辑源文件
│       └── social-card.png    # 供 Open Graph 使用的分享图
├── 404.html                   # GitHub Pages 找不到页面时的提示
├── robots.txt                 # 搜索引擎抓取规则
├── sitemap.xml                # 网站地图
├── .nojekyll                  # 告诉 GitHub Pages 直接发布静态文件
├── tests/
│   ├── check.mjs              # 无第三方依赖的静态检查
│   └── browser-check.mjs      # 可选的真实浏览器交互检查
├── legacy/                    # 完整保留旧版 Academic Pages / Jekyll 源码与资源
├── LICENSE                    # 保留原项目许可证与署名
└── README.md
```

旧站文件以原内容保存在 `legacy/`，新版不加载其中的脚本、样式、示例论文或历史简介。旧配置中的身份、邮箱等信息也不会自动导入新版。`legacy/README.md` 是旧模板说明，不是当前部署步骤。保留源文件不等于继续生成旧版 Jekyll 页面，旧的 `/publications/` 等地址可能进入 404 页面。搜索引擎规则会请求不抓取 `legacy/`；这个目录仍是公开仓库的一部分，并非私有备份。

## 3. 修改个人简介和链接

用文本编辑器打开 `data.js`。中文和英文统一保存在一个对象中：

```js
intro: {
  en: "Your confirmed English introduction.",
  zh: "你的真实中文简介。"
}
```

- `profile.name`：中英文姓名。
- `profile.role`：当前身份。
- `profile.institution`：学校或单位。
- `profile.intro`：首页的简短介绍。
- `profile.about`：About me 区域的完整介绍。
- `links.github`、`links.email`、`links.scholar`、`links.orcid`：个人链接。

邮箱只填写地址本身，程序会添加 `mailto:`。未知链接保持 `""`，页面就不会生成对应按钮。英文和中文都建议填写；缺少某种语言时会回退到已提供的内容。

日常内容更新只需修改 `data.js`。如果以后更改姓名、学校、站点地址或默认简介，还应同步 `index.html` 中用于搜索引擎和禁用 JavaScript 时显示的默认英文、meta 与 JSON-LD，以及 `sitemap.xml`、`robots.txt` 和分享图片。搜索爬虫不一定执行 JavaScript。

## 4. 更新研究方向

在 `research` 数组中修改或添加对象：

```js
{
  id: "a-unique-id",
  label: "可选简写",
  title: { en: "Confirmed research interest", zh: "真实研究方向" },
  description: { en: "A brief description.", zh: "简短介绍。" }
}
```

`id` 用于辨识数据，建议每项不同；`label` 是研究模块上方的小字，可省略。方向不限两个，布局会自动换行。只填写实际研究方向。

## 5. 新增论文

初始 `publications: []` 是空数组，网页只显示简洁提示。请把真实论文对象加入方括号内；多篇论文之间用英文逗号分隔。以下是**结构说明，不是真实论文**，需要替换所有内容后再使用：

```js
publications: [
  {
    title: { en: "真实英文论文标题", zh: "真实论文中文标题或英文原文" },
    authors: ["Tengjia Kang", "其他真实作者"],
    year: null, // 必须替换为真实数字年份，不加引号；null 的草稿不会显示。
    venue: { en: "真实会议或期刊", zh: "真实会议或期刊" },
    links: {
      pdf: "",
      doi: "",
      project: "",
      code: ""
    },
    thumbnail: null
  }
]
```

链接请填写真实的完整网址或仓库内的文件路径，例如将实际论文 PDF 放在 `assets/papers/` 后填写相对路径。DOI 请使用 `https://doi.org/` 开头的真实完整链接。没有的链接保持空字符串，不生成无效按钮。

有缩略图时，将 `thumbnail: null` 改为：

```js
thumbnail: {
  src: "assets/images/paper.webp",
  alt: { en: "A meaningful description of the paper figure.", zh: "对论文示意图的简明说明。" }
}
```

只有标题非空、年份为正整数的论文才会显示。页面按年份倒序分组，自动生成年份筛选按钮。作者列表中的 `Tengjia Kang` 或 `康腾甲` 会自动加粗。切换语言时保留当前年份筛选。

## 6. 新增科研项目

向 `projects` 数组加入真实项目，按希望的展示顺序排列：

```js
{
  title: { en: "真实项目名称", zh: "真实项目名称" },
  period: { en: "真实项目时间", zh: "真实项目时间" },
  description: { en: "A factual description.", zh: "真实项目简介。" },
  technologies: [],
  image: null,
  links: { website: "", github: "", paper: "" }
}
```

`technologies` 可填真实使用的技术名称。`image` 的结构与论文 `thumbnail` 相同。不设置图片时自动使用纯文本布局，不会留出空的封面位置。未知时间可以留空。

## 7. 更新教育经历和学术动态

`education` 按希望的展示顺序排列。每项包含 `institution`、`role`、可选的 `period` 和 `details`，都支持双语对象。当前只展示哈尔滨工业大学、博士研究生，没有推测起止年份、专业、导师或学院。

`news` 没有数据时整个栏目隐藏。添加一条真实动态：

```js
{
  date: "", // 替换为真实日期，格式 YYYY-MM-DD。
  text: { en: "A confirmed academic update.", zh: "已确认的学术动态。" },
  url: ""
}
```

动态按日期倒序显示，无效日期或空文本会被忽略。`url` 可选。

## 8. 替换头像

1. 准备自己的照片，建议裁剪为接近 5:6 的竖图，宽度约 456–800 像素。
2. 建议使用 WebP 或压缩后的 JPEG，尽量控制在 200 KB 左右。
3. 将文件放到 `assets/images/portrait.webp`，也可使用自己的文件名。
4. 修改 `data.js` 中的 `profile.portrait.src`，填写 `"assets/images/portrait.webp"`。
5. 更新 `profile.portrait.alt.en` 和 `.zh`，提供真实且简洁的头像说明。

没有头像时保持 `src: ""`，页面显示 TK 首字母。图片加载失败也会回退到首字母。首屏头像优先加载，论文和项目图片使用懒加载。

## 9. 添加 CV

1. 将**真实的 PDF** 文件放在 `assets/cv.pdf`，注意大小写。
2. 在 `data.js` 中将 `cv.enabled` 改成 `true`，保持 `cv.path: "assets/cv.pdf"`。
3. 用 HTTP 本地预览或上线后的地址检查。

程序会验证同源文件存在、响应为 PDF 类型，并检查 `%PDF-` 文件签名；验证通过后才在个人介绍和 CV 区域生成下载链接。404 页面、HTML 响应、伪装成 PDF 的文本和请求失败都不会生成下载按钮。只读取文件头，不必先下载完整简历。

初始 `enabled: false` 不请求不存在的文件。移除 CV 时建议同时将 `enabled` 改回 `false`。浏览器直接打开 `file://` 时受安全限制，不检测 CV；这不影响 GitHub Pages 上的功能。

## 10. 修改中英文翻译

内容翻译在 `SITE_DATA` 的 `{ en, zh }` 对象中。导航、按钮、栏目名、空状态和页脚等界面翻译在同一个 `data.js` 文件底部的 `SITE_I18N.en` 和 `SITE_I18N.zh` 中。

新增界面翻译时，两个字典必须使用相同的键名。保留 `{count}`、`{name}` 等变量占位符。切换语言会同步更新 `<html lang>`、页面说明和 Open Graph 的语言信息。

偏好保存在浏览器的 `tk-language` 和 `tk-theme` 中；浏览器限制本地存储时仍可切换，只是不记住选择。首次访问默认英文和浅色，不跟随系统自动改为深色。

## 11. 检查修改

修改后先在电脑和手机尺寸检查：导航、双语、浅深色、论文筛选、图片和下载。检查浏览器控制台是否有语法或资源错误。

安装 Node.js 后可运行不依赖任何第三方包的静态检查：

```bash
node tests/check.mjs
```

可选的真实浏览器检查使用 Playwright 和 axe，它们**只安装在临时文件夹，不是网站依赖**。以下命令适合 Linux/macOS，Windows 可换成自己的临时路径：

```bash
npm install --prefix /tmp/tengjia-homepage-qa --no-package-lock playwright @axe-core/playwright
/tmp/tengjia-homepage-qa/node_modules/.bin/playwright install chromium --no-shell
```

先在另一个终端启动本地 HTTP 预览（端口 8000），再运行：

```bash
node tests/browser-check.mjs http://127.0.0.1:8000 /tmp/tengjia-homepage-qa/node_modules
```

它会检查桌面、手机、多种宽度、键盘导航、语言与主题持久化、无 JavaScript 的基本内容、可访问性、论文分组和筛选、动态排序及不同 PDF 响应。测试用论文与项目仅通过浏览器请求拦截临时注入，不写入 `data.js`。截图与结果保存在被 Git 忽略的 `test-results/`。

自动可访问性检查不替代人工阅读或屏幕阅读器检查。

## 12. 更新代码并发布

可以在 GitHub 网页直接编辑 `data.js`，也可以在本地编辑后提交。建议继续通过分支和 Pull Request 审核：

```bash
git switch main
git pull origin main
git switch -c content/update-profile
# 编辑、预览、检查文件后：
git add data.js assets/
git commit -m "Update academic profile"
git push -u origin content/update-profile
```

然后在 GitHub 打开 Pull Request，目标分支选择 `main`。合并后 GitHub Pages 会自动更新。初次重构的 PR 也应先审核并合并，再把发布源切到 `main`。

原仓库默认分支是 `master`。如果尚无 `main`，先从当前 `master` 创建 `main`，再将重构 PR 合并到 `main`。不需要删除 `master`。为便于长期维护，可在仓库的分支设置中将默认分支设为 `main`，这与 Pages 发布源是两个独立设置。

## 13. GitHub Pages 部署步骤

1. 确认重构代码已合并到 `kangtengjia/kangtengjia.github.io` 的 `main` 分支，且根目录存在 `index.html` 和 `.nojekyll`。
2. 打开仓库 **Settings → Pages → Build and deployment**。
3. **Source** 选择 **Deploy from a branch**。
4. **Branch** 选择 **main**。
5. **Folder** 选择 **/(root)**。
6. 点击 **Save**。
7. 等待 GitHub 完成发布，在 Pages 设置或 Actions 中查看平台生成的发布状态。
8. 访问 <https://kangtengjia.github.io/>，确认显示新版页面，再检查 `style.css` 和 `script.js` 均能正常加载。

不需要自己编写 GitHub Actions 流程。GitHub 可能仍会显示平台自动运行的 `pages-build-deployment`，这是正常的。`.nojekyll` 会跳过原来的 Jekyll 主题处理。

仓库名必须保持 `kangtengjia.github.io`。站点资源使用相对路径；404 页面特意设置根目录为资源基准，以便在缺失的多层路径下仍能加载样式。如果以后改为项目子目录托管，还需同步修改 404 页的 `<base>`、站点 URL、canonical 和分享图 URL。

详细步骤可参考 [GitHub 官方发布源文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。只有远端页面实际显示新版并检查成功后，才可以认定新版本已部署；本地检查通过或 PR 已创建都不等于已上线。

## 14. 常见问题

| 问题 | 处理方式 |
| --- | --- |
| 更新后仍显示旧网站 | 检查是否已合并到 `main`，Pages 是否选择 `main / (root)`，等待发布完成，再强制刷新。 |
| 首页出现 404 | 检查仓库名、Pages 发布分支，以及根目录是否有小写 `index.html`。 |
| 样式或图片不显示 | 文件名大小写必须一致；用 `/` 分隔路径，不使用本地硬盘路径；确认文件已提交到 GitHub。 |
| `data.js` 修改后内容没更新 | 打开控制台查看是否缺少英文逗号、引号或括号。双语对象之间也要有逗号。 |
| 论文不显示 | 检查 `title` 是否有内容，`year` 是否为不带引号的正整数，是否仍保留 `null`。 |
| 论文中的链接没出现 | 空字符串会隐藏链接；检查是否填写了真实、格式正确的 URL。上传 PDF 后才填写本地路径。 |
| CV 没有下载入口 | 确认 `cv.enabled: true`，文件确为 PDF，大小写正确，使用 HTTP 预览，服务器 MIME 类型为 `application/pdf`。 |
| News 栏目没出现 | 空数组会隐藏；检查每条数据有真实的 `YYYY-MM-DD` 日期和文本。 |
| 手机端找不到菜单 | 点击顶部三横线按钮；支持 Enter、Space 展开以及 Escape 关闭。 |
| 首次打开是中文或深色 | 浏览器记住了之前的偏好；点 EN、切换浅色即可。清除站点存储可恢复默认。 |
| 没有 Google Scholar 或邮箱按钮 | 这些资料未提供，初始隐藏；填入 `data.js` 的真实链接后显示。 |
| 改旧 `_config.yml` 没有效果 | 新版不使用 Jekyll，请改根目录的 `data.js`。旧文件仅保留在 `legacy/`。 |

## 内容真实性

新版没有自动继承旧模板的示例信息或历史论文。论文、项目、动态初始为空；导师、实验室、学院、起止年份、奖项、邮箱及其他学术账号均未推测。请在确认真实信息后自行补充。
