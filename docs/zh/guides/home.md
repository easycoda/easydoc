---
title: '首页配置'
description: '描述了如何修改 EasyDoc 的首页配置修改'
order: 60
---

# 首页配置

EasyDoc 的首页是由 React 和 shadcn 编写，您可以自定义您的首页通过修改文件 `src/pages/Home.tsx`, 

同时，您可以修改首页和 英雄区域 和 特性卡片 列表 `src/components/HeroSection.tsx` and `src/components/FeatureCards.tsx` 为您自己的站点内容.

所有的修改都会在编译阶段被渲染成静态 HTML 文件。