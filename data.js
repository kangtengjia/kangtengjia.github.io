/*
 * 网站内容的唯一维护入口。双语字段统一使用 { en: "…", zh: "…" }。
 * 空字符串 / null 表示暂不展示；请仅填写已经确认的真实信息。
 * 详细示例见本文件底部和 README.md。
 */
window.SITE_DATA = {
  site: {
    title: "Tengjia Kang | Academic Homepage",
    url: "https://kangtengjia.github.io/",
    description: {
      en: "Personal academic website of Tengjia Kang, a Ph.D. student at Harbin Institute of Technology, with research interests in Artificial Intelligence and Computer Graphics.",
      zh: "康腾甲的学术个人主页。哈尔滨工业大学博士研究生，研究兴趣包括人工智能和计算机图形学。"
    }
  },
  profile: {
    name: { en: "Tengjia Kang", zh: "康腾甲" },
    initials: "TK",
    role: { en: "Ph.D. Student", zh: "博士研究生" },
    institution: { en: "Harbin Institute of Technology", zh: "哈尔滨工业大学" },
    portrait: {
      src: "", // 例如 "assets/images/portrait.webp"；留空显示姓名首字母。
      alt: { en: "Portrait of Tengjia Kang", zh: "康腾甲的个人头像" }
    },
    intro: {
      en: "I am a Ph.D. student at Harbin Institute of Technology. My research interests include Artificial Intelligence and Computer Graphics.",
      zh: "我是哈尔滨工业大学的一名博士研究生，研究兴趣包括人工智能和计算机图形学。"
    },
    about: {
      en: "I am currently pursuing my Ph.D. at Harbin Institute of Technology. My academic interests lie in Artificial Intelligence and Computer Graphics. I am interested in exploring computational methods and their applications to visual and graphical problems.",
      zh: "我目前在哈尔滨工业大学攻读博士学位，主要研究兴趣包括人工智能和计算机图形学。我关注计算方法及其在视觉与图形相关问题中的应用。"
    }
  },
  links: {
    github: "https://github.com/kangtengjia",
    email: "", // 填写邮箱地址本身，无须 mailto: 前缀。
    scholar: "",
    orcid: ""
  },
  research: [
    {
      id: "ai",
      label: "AI",
      title: { en: "Artificial Intelligence", zh: "人工智能" },
      description: {
        en: "Computational methods for learning, reasoning, and solving problems.",
        zh: "关注用于学习、推理与问题求解的计算方法。"
      }
    },
    {
      id: "graphics",
      label: "CG",
      title: { en: "Computer Graphics", zh: "计算机图形学" },
      description: {
        en: "Computational approaches to the representation and creation of visual content.",
        zh: "关注视觉内容表达与生成的计算方法。"
      }
    }
  ],
  education: [
    {
      institution: { en: "Harbin Institute of Technology", zh: "哈尔滨工业大学" },
      role: { en: "Ph.D. Student", zh: "博士研究生" },
      period: "", // 未知年份、学院、专业、导师均不推测。
      details: { en: "", zh: "" }
    }
  ],
  publications: [],
  projects: [],
  news: [], // 留空时整个 News 栏目隐藏。
  cv: {
    enabled: false, // 上传真实 PDF 后改为 true；仅验证通过才显示下载按钮。
    path: "assets/cv.pdf"
  }
};

// 所有界面翻译集中在此，内容翻译在上方对应的数据字段中维护。
window.SITE_I18N = {
  en: {
    navLabel: "Main navigation", home: "Home", about: "About", research: "Research",
    publications: "Publications", projects: "Projects", education: "Education", cv: "CV",
    news: "News", skip: "Skip to content", menuOpen: "Open navigation", menuClose: "Close navigation",
    language: "Language", themeDark: "Switch to dark mode", themeLight: "Switch to light mode",
    academicHomepage: "Academic homepage", researchInterests: "Research interests",
    aboutTitle: "About me", researchTitle: "Research interests", publicationsTitle: "Publications",
    projectsTitle: "Research projects", educationTitle: "Education", newsTitle: "News",
    cvTitle: "Curriculum vitae", publicationsEmpty: "Publication details will be added here.",
    projectsEmpty: "Research project details will be added here.",
    cvEmpty: "A curriculum vitae will be shared here when available.",
    allYears: "All years", yearFilter: "Filter publications by year",
    publicationCount: "Showing {count} publications", pdf: "PDF", doi: "DOI",
    projectPage: "Project page", code: "Code", projectLink: "Website", paper: "Paper",
    downloadCV: "Download CV", cvFormat: "PDF document", email: "Email",
    scholar: "Google Scholar", orcid: "ORCID", github: "GitHub",
    footerBuilt: "Built with GitHub Pages", backToTop: "Back to top",
    portraitPlaceholder: "Initials of {name}", notFoundTitle: "Page not found",
    notFoundText: "This page may have moved. You can return to the academic homepage below.",
    returnHome: "Return to homepage"
  },
  zh: {
    navLabel: "主导航", home: "首页", about: "关于", research: "研究", publications: "论文",
    projects: "项目", education: "教育", cv: "简历", news: "动态", skip: "跳至正文",
    menuOpen: "展开导航", menuClose: "收起导航", language: "语言",
    themeDark: "切换至深色模式", themeLight: "切换至浅色模式", academicHomepage: "学术个人主页",
    researchInterests: "研究兴趣", aboutTitle: "关于我", researchTitle: "研究兴趣",
    publicationsTitle: "学术论文", projectsTitle: "科研项目", educationTitle: "教育经历",
    newsTitle: "学术动态", cvTitle: "学术简历", publicationsEmpty: "论文信息将在补充后展示于此。",
    projectsEmpty: "科研项目信息将在补充后展示于此。", cvEmpty: "学术简历将在准备就绪后提供。",
    allYears: "全部年份", yearFilter: "按年份筛选论文", publicationCount: "共显示 {count} 篇论文",
    pdf: "PDF", doi: "DOI", projectPage: "项目主页", code: "代码", projectLink: "项目网站",
    paper: "论文", downloadCV: "下载简历", cvFormat: "PDF 文档", email: "邮箱",
    scholar: "谷歌学术", orcid: "ORCID", github: "GitHub", footerBuilt: "使用 GitHub Pages 构建",
    backToTop: "返回顶部", portraitPlaceholder: "{name}的姓名首字母", notFoundTitle: "未找到页面",
    notFoundText: "此页面可能已迁移，你可以通过下方链接返回学术主页。", returnHome: "返回主页"
  }
};

/*
添加论文：将以下对象复制进 publications 的 [] 内，替换为真实内容。
不要取消示例注释后直接发布；year 必须填写真实的数字年份。
{
  title: { en: "真实英文标题", zh: "中文标题（也可保持原文）" },
  authors: ["Tengjia Kang", "其他真实作者"],
  year: null,
  venue: { en: "真实期刊或会议", zh: "真实期刊或会议" },
  links: { pdf: "", doi: "", project: "", code: "" },
  thumbnail: null
  // 可选：thumbnail: { src: "assets/images/paper.webp", alt: { en: "…", zh: "…" } }
}

添加项目：复制进 projects。无图片、无技术标签、无链接均可正常展示。
{
  title: { en: "真实项目名称", zh: "真实项目名称" },
  period: { en: "真实项目时间", zh: "真实项目时间" },
  description: { en: "真实项目简介", zh: "真实项目简介" },
  technologies: [],
  image: null,
  links: { website: "", github: "", paper: "" }
}

添加动态：复制进 news，date 填写真实 ISO 日期，例如 YYYY-MM-DD。
{
  date: "",
  text: { en: "真实学术动态", zh: "真实学术动态" },
  url: ""
}
*/
