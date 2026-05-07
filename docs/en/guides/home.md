---
title: 'Home Page Configuration'
description: 'Describe how to customize home page for EasyDoc'
order: 60
---

# Home Page Configuration

The home page is written in react and shadcn/ui, you can write your own home page code in `src/pages/Home.tsx`, 

Also, you can rewrite Hero and feature section in `src/components/HeroSection.tsx` and `src/components/FeatureCards.tsx` to your owns.

These pages will be rendered to static html files at building time with ssr plugin.