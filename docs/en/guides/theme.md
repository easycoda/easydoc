---
title: 'Theme Configuration'
description: 'Describe how to customize themes for EasyDoc'
order: 30
---

# Theme Configuration

EasyDoc styles are based on tailwindcss 4, and you can custom theme to any style as you want just by editing `index.css` file.

In `index.css` file, replace `:root` , `.dark` and `@theme inline` section to your favourate styles. Here are some theme examples:

## Theme Preview

### Default Theme (Claude Style)

| Light | Dark | 
|--------|----------|
| ![Default Light Home](/default-light.jpg) ![Default Light Doc](/default-light-doc.jpg) | ![Default Dark Home](/default-dark.jpg) ![Default Dark Doc](/default-dark-doc.jpg) |

<details>
<summary>Click to view theme code</summary>

```css
:root {
  --background: oklch(0.9818 0.0054 95.0986);
  --foreground: oklch(0.3438 0.0269 95.7226);
  --card: oklch(0.9818 0.0054 95.0986);
  --card-foreground: oklch(0.1908 0.0020 106.5859);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.2671 0.0196 98.9390);
  --primary: oklch(0.6171 0.1375 39.0427);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.9245 0.0138 92.9892);
  --secondary-foreground: oklch(0.4334 0.0177 98.6048);
  --muted: oklch(0.9341 0.0153 90.2390);
  --muted-foreground: oklch(0.6059 0.0075 97.4233);
  --accent: oklch(0.9245 0.0138 92.9892);
  --accent-foreground: oklch(0.2671 0.0196 98.9390);
  --destructive: oklch(0.1908 0.0020 106.5859);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.8847 0.0069 97.3627);
  --input: oklch(0.7621 0.0156 98.3528);
  --ring: oklch(0.6171 0.1375 39.0427);
  --chart-1: oklch(0.5583 0.1276 42.9956);
  --chart-2: oklch(0.6898 0.1581 290.4107);
  --chart-3: oklch(0.8816 0.0276 93.1280);
  --chart-4: oklch(0.8822 0.0403 298.1792);
  --chart-5: oklch(0.5608 0.1348 42.0584);
  --sidebar: oklch(0.9663 0.0080 98.8792);
  --sidebar-foreground: oklch(0.3590 0.0051 106.6524);
  --sidebar-primary: oklch(0.6171 0.1375 39.0427);
  --sidebar-primary-foreground: oklch(0.9881 0 0);
  --sidebar-accent: oklch(0.9245 0.0138 92.9892);
  --sidebar-accent-foreground: oklch(0.3250 0 0);
  --sidebar-border: oklch(0.9401 0 0);
  --sidebar-ring: oklch(0.7731 0 0);
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --radius: 0.5rem;
  --shadow-x: 0;
  --shadow-y: 1px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.1;
  --shadow-color: oklch(0 0 0);
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark {
  --background: oklch(0.2679 0.0036 106.6427);
  --foreground: oklch(0.8074 0.0142 93.0137);
  --card: oklch(0.2679 0.0036 106.6427);
  --card-foreground: oklch(0.9818 0.0054 95.0986);
  --popover: oklch(0.3085 0.0035 106.6039);
  --popover-foreground: oklch(0.9211 0.0040 106.4781);
  --primary: oklch(0.6724 0.1308 38.7559);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.9818 0.0054 95.0986);
  --secondary-foreground: oklch(0.3085 0.0035 106.6039);
  --muted: oklch(0.2213 0.0038 106.7070);
  --muted-foreground: oklch(0.7713 0.0169 99.0657);
  --accent: oklch(0.2130 0.0078 95.4245);
  --accent-foreground: oklch(0.9663 0.0080 98.8792);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.3618 0.0101 106.8928);
  --input: oklch(0.4336 0.0113 100.2195);
  --ring: oklch(0.6724 0.1308 38.7559);
  --chart-1: oklch(0.5583 0.1276 42.9956);
  --chart-2: oklch(0.6898 0.1581 290.4107);
  --chart-3: oklch(0.2130 0.0078 95.4245);
  --chart-4: oklch(0.3074 0.0516 289.3230);
  --chart-5: oklch(0.5608 0.1348 42.0584);
  --sidebar: oklch(0.2357 0.0024 67.7077);
  --sidebar-foreground: oklch(0.8074 0.0142 93.0137);
  --sidebar-primary: oklch(0.3250 0 0);
  --sidebar-primary-foreground: oklch(0.9881 0 0);
  --sidebar-accent: oklch(0.1680 0.0020 106.6177);
  --sidebar-accent-foreground: oklch(0.8074 0.0142 93.0137);
  --sidebar-border: oklch(0.9401 0 0);
  --sidebar-ring: oklch(0.7731 0 0);
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --radius: 0.5rem;
  --shadow-x: 0;
  --shadow-y: 1px;
  --shadow-blur: 3px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.1;
  --shadow-color: oklch(0 0 0);
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}
```

</details>

### Vercel Theme

 | Light | Dark | 
|--------|----------|
| ![Vercel Light Home](/vercel-light.jpg) ![Vercel Light Doc](/vercel-light-doc.jpg) | ![Vercel Dark Home](/vercel-dark.jpg) ![Vercel Dark Doc](/vercel-dark-doc.jpg) |

<details>
<summary>Click to view theme code</summary>

```css

:root {
  --background: oklch(0.9900 0 0);
  --foreground: oklch(0 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0 0 0);
  --popover: oklch(0.9900 0 0);
  --popover-foreground: oklch(0 0 0);
  --primary: oklch(0 0 0);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.9400 0 0);
  --secondary-foreground: oklch(0 0 0);
  --muted: oklch(0.9700 0 0);
  --muted-foreground: oklch(0.4400 0 0);
  --accent: oklch(0.9400 0 0);
  --accent-foreground: oklch(0 0 0);
  --destructive: oklch(0.6300 0.1900 23.0300);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.9200 0 0);
  --input: oklch(0.9400 0 0);
  --ring: oklch(0 0 0);
  --chart-1: oklch(0.8100 0.1700 75.3500);
  --chart-2: oklch(0.5500 0.2200 264.5300);
  --chart-3: oklch(0.7200 0 0);
  --chart-4: oklch(0.9200 0 0);
  --chart-5: oklch(0.5600 0 0);
  --sidebar: oklch(0.9900 0 0);
  --sidebar-foreground: oklch(0 0 0);
  --sidebar-primary: oklch(0 0 0);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.9400 0 0);
  --sidebar-accent-foreground: oklch(0 0 0);
  --sidebar-border: oklch(0.9400 0 0);
  --sidebar-ring: oklch(0 0 0);
  --font-sans: Geist, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: Geist Mono, monospace;
  --radius: 0.5rem;
  --shadow-x: 0px;
  --shadow-y: 1px;
  --shadow-blur: 2px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.18;
  --shadow-color: hsl(0 0% 0%);
  --shadow-2xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.09);
  --shadow-xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.09);
  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 1px 2px -1px hsl(0 0% 0% / 0.18);
  --shadow: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 1px 2px -1px hsl(0 0% 0% / 0.18);
  --shadow-md: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 2px 4px -1px hsl(0 0% 0% / 0.18);
  --shadow-lg: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 4px 6px -1px hsl(0 0% 0% / 0.18);
  --shadow-xl: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 8px 10px -1px hsl(0 0% 0% / 0.18);
  --shadow-2xl: 0px 1px 2px 0px hsl(0 0% 0% / 0.45);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark {
  --background: oklch(0 0 0);
  --foreground: oklch(1 0 0);
  --card: oklch(0.1400 0 0);
  --card-foreground: oklch(1 0 0);
  --popover: oklch(0.1800 0 0);
  --popover-foreground: oklch(1 0 0);
  --primary: oklch(1 0 0);
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.2500 0 0);
  --secondary-foreground: oklch(1 0 0);
  --muted: oklch(0.2300 0 0);
  --muted-foreground: oklch(0.7200 0 0);
  --accent: oklch(0.3200 0 0);
  --accent-foreground: oklch(1 0 0);
  --destructive: oklch(0.6900 0.2000 23.9100);
  --destructive-foreground: oklch(0 0 0);
  --border: oklch(0.2600 0 0);
  --input: oklch(0.3200 0 0);
  --ring: oklch(0.7200 0 0);
  --chart-1: oklch(0.8100 0.1700 75.3500);
  --chart-2: oklch(0.5800 0.2100 260.8400);
  --chart-3: oklch(0.5600 0 0);
  --chart-4: oklch(0.4400 0 0);
  --chart-5: oklch(0.9200 0 0);
  --sidebar: oklch(0.1800 0 0);
  --sidebar-foreground: oklch(1 0 0);
  --sidebar-primary: oklch(1 0 0);
  --sidebar-primary-foreground: oklch(0 0 0);
  --sidebar-accent: oklch(0.3200 0 0);
  --sidebar-accent-foreground: oklch(1 0 0);
  --sidebar-border: oklch(0.3200 0 0);
  --sidebar-ring: oklch(0.7200 0 0);
  --font-sans: Geist, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: Geist Mono, monospace;
  --radius: 0.5rem;
  --shadow-x: 0px;
  --shadow-y: 1px;
  --shadow-blur: 2px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.18;
  --shadow-color: hsl(0 0% 0%);
  --shadow-2xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.09);
  --shadow-xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.09);
  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 1px 2px -1px hsl(0 0% 0% / 0.18);
  --shadow: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 1px 2px -1px hsl(0 0% 0% / 0.18);
  --shadow-md: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 2px 4px -1px hsl(0 0% 0% / 0.18);
  --shadow-lg: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 4px 6px -1px hsl(0 0% 0% / 0.18);
  --shadow-xl: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 8px 10px -1px hsl(0 0% 0% / 0.18);
  --shadow-2xl: 0px 1px 2px 0px hsl(0 0% 0% / 0.45);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}

```

</details>


### Terminal Theme

 | Light | Dark | 
|--------|----------|
| ![Terminal Light Home](/terminal-light.jpg) ![Terminal Light Doc](/terminal-light-doc.jpg) | ![Terminal Dark Home](/terminal-dark.jpg) ![Terminal Dark Doc](/terminal-dark-doc.jpg) |

<details>
<summary>Click to View theme code</summary>

```css
:root {
  --background: oklch(0 0 0);
  --foreground: oklch(0.8686 0.2776 144.4661);
  --card: oklch(0.1149 0 0);
  --card-foreground: oklch(0.8686 0.2776 144.4661);
  --popover: oklch(0 0 0);
  --popover-foreground: oklch(0.8686 0.2776 144.4661);
  --primary: oklch(0.8686 0.2776 144.4661);
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.3053 0.1039 142.4953);
  --secondary-foreground: oklch(0.8686 0.2776 144.4661);
  --muted: oklch(0.1887 0.0642 142.4953);
  --muted-foreground: oklch(0.5638 0.1872 143.2450);
  --accent: oklch(0.8686 0.2776 144.4661);
  --accent-foreground: oklch(0.8686 0.2776 144.4661);
  --destructive: oklch(0.6280 0.2577 29.2339);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.3053 0.1039 142.4953);
  --input: oklch(0 0 0);
  --ring: oklch(0.8686 0.2776 144.4661);
  --chart-1: oklch(0.8686 0.2776 144.4661);
  --chart-2: oklch(0.5638 0.1872 143.2450);
  --chart-3: oklch(0.3053 0.1039 142.4953);
  --chart-4: oklch(0.1179 0.0327 343.3438);
  --chart-5: oklch(0.8686 0.2776 144.4661);
  --sidebar: oklch(0.1149 0 0);
  --sidebar-foreground: oklch(0.8686 0.2776 144.4661);
  --sidebar-primary: oklch(0.8686 0.2776 144.4661);
  --sidebar-primary-foreground: oklch(0 0 0);
  --sidebar-accent: oklch(0.3053 0.1039 142.4953);
  --sidebar-accent-foreground: oklch(0.8686 0.2776 144.4661);
  --sidebar-border: oklch(0.3053 0.1039 142.4953);
  --sidebar-ring: oklch(0.8686 0.2776 144.4661);
  --font-sans: "VT323", "Courier New", monospace;
  --font-serif: Georgia, serif;
  --font-mono: "VT323", monospace;
  --radius: 0rem;
  --shadow-x: 0px;
  --shadow-y: 0px;
  --shadow-blur: 15px;
  --shadow-spread: 2px;
  --shadow-opacity: 0.4;
  --shadow-color: #00FF41;
  --shadow-2xs: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.20);
  --shadow-xs: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.20);
  --shadow-sm: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 1px 2px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 1px 2px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow-md: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 2px 4px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow-lg: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 4px 6px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow-xl: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 8px 10px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow-2xl: 0px 0px 15px 2px hsl(135.2941 100% 50% / 1.00);
}

.dark {
  --background: oklch(0 0 0);
  --foreground: oklch(0.8686 0.2776 144.4661);
  --card: oklch(0.1149 0 0);
  --card-foreground: oklch(0.8686 0.2776 144.4661);
  --popover: oklch(0 0 0);
  --popover-foreground: oklch(0.8686 0.2776 144.4661);
  --primary: oklch(0.8686 0.2776 144.4661);
  --primary-foreground: oklch(0 0 0);
  --secondary: oklch(0.3053 0.1039 142.4953);
  --secondary-foreground: oklch(0.8686 0.2776 144.4661);
  --muted: oklch(0.1887 0.0642 142.4953);
  --muted-foreground: oklch(0.5638 0.1872 143.2450);
  --accent: oklch(0.8686 0.2776 144.4661);
  --accent-foreground: oklch(0.8686 0.2776 144.4661);
  --destructive: oklch(0.6280 0.2577 29.2339);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.3053 0.1039 142.4953);
  --input: oklch(0 0 0);
  --ring: oklch(0.8686 0.2776 144.4661);
  --chart-1: oklch(0.8686 0.2776 144.4661);
  --chart-2: oklch(0.5638 0.1872 143.2450);
  --chart-3: oklch(0.3053 0.1039 142.4953);
  --chart-4: oklch(0.1179 0.0327 343.3438);
  --chart-5: oklch(0.8686 0.2776 144.4661);
  --sidebar: oklch(0.1149 0 0);
  --sidebar-foreground: oklch(0.8686 0.2776 144.4661);
  --sidebar-primary: oklch(0.8686 0.2776 144.4661);
  --sidebar-primary-foreground: oklch(0 0 0);
  --sidebar-accent: oklch(0.3053 0.1039 142.4953);
  --sidebar-accent-foreground: oklch(0.8686 0.2776 144.4661);
  --sidebar-border: oklch(0.3053 0.1039 142.4953);
  --sidebar-ring: oklch(0.8686 0.2776 144.4661);
  --font-sans: "VT323", "Courier New", monospace;
  --font-serif: Georgia, serif;
  --font-mono: "VT323", monospace;
  --radius: 0rem;
  --shadow-x: 0px;
  --shadow-y: 0px;
  --shadow-blur: 15px;
  --shadow-spread: 2px;
  --shadow-opacity: 0.4;
  --shadow-color: #00FF41;
  --shadow-2xs: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.20);
  --shadow-xs: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.20);
  --shadow-sm: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 1px 2px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 1px 2px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow-md: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 2px 4px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow-lg: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 4px 6px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow-xl: 0px 0px 15px 2px hsl(135.2941 100% 50% / 0.40), 0px 8px 10px 1px hsl(135.2941 100% 50% / 0.40);
  --shadow-2xl: 0px 0px 15px 2px hsl(135.2941 100% 50% / 1.00);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}


@layer base {
  * {
    @apply border-border outline-ring/50;
    }
  body {
    @apply bg-background text-foreground;
    }
  html {
    @apply font-mono;
    }
}

```
</details>

### Blue Theme

 | Light | Dark | 
|--------|----------|
| ![Blue Light Home](/blue-light.jpg) ![Blue Light Doc](/blue-light-doc.jpg) | ![Blue Dark Home](/blue-dark.jpg) ![Blue Dark Doc](/blue-dark-doc.jpg) |

<details>
<summary>Click to View theme code</summary>

```css
:root {
  --background: oklch(0.9946 0.0026 286.3519);
  --foreground: oklch(0.1615 0.0105 285.1663);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0.1615 0.0105 285.1663);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.1615 0.0105 285.1663);
  --primary: oklch(0.5565 0.2430 261.9529);
  --primary-foreground: oklch(0.9670 0.0029 264.5419);
  --secondary: oklch(0.9475 0.0268 290.4744);
  --secondary-foreground: oklch(0.4143 0.1248 286.0391);
  --muted: oklch(0.9601 0.0093 286.2229);
  --muted-foreground: oklch(0.5052 0.0379 284.9640);
  --accent: oklch(0.9634 0.0175 279.0619);
  --accent-foreground: oklch(0.5553 0.2554 283.4559);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(0.9842 0.0034 247.8575);
  --border: oklch(0.9163 0.0162 286.0759);
  --input: oklch(0.9163 0.0162 286.0759);
  --ring: oklch(0.5565 0.2430 261.9529);
  --chart-1: oklch(0.5553 0.2554 283.4559);
  --chart-2: oklch(0.6037 0.2141 267.5162);
  --chart-3: oklch(0.7495 0.1297 210.9704);
  --chart-4: oklch(0.8023 0.1492 175.5763);
  --chart-5: oklch(0.6945 0.1422 167.0638);
  --sidebar: oklch(0.9946 0.0026 286.3519);
  --sidebar-foreground: oklch(0.1615 0.0105 285.1663);
  --sidebar-primary: oklch(0.5565 0.2430 261.9529);
  --sidebar-primary-foreground: oklch(1.0000 0 0);
  --sidebar-accent: oklch(0.9634 0.0175 279.0619);
  --sidebar-accent-foreground: oklch(0.5553 0.2554 283.4559);
  --sidebar-border: oklch(0.9163 0.0162 286.0759);
  --sidebar-ring: oklch(0.5565 0.2430 261.9529);
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Merriweather', serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 1.4rem;
  --shadow-x: 0px;
  --shadow-y: 4px;
  --shadow-blur: 15px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.15;
  --shadow-color: #000000;
  --shadow-2xs: 0px 4px 15px 0px hsl(0 0% 0% / 0.07);
  --shadow-xs: 0px 4px 15px 0px hsl(0 0% 0% / 0.07);
  --shadow-sm: 0px 4px 15px 0px hsl(0 0% 0% / 0.15), 0px 1px 2px -1px hsl(0 0% 0% / 0.15);
  --shadow: 0px 4px 15px 0px hsl(0 0% 0% / 0.15), 0px 1px 2px -1px hsl(0 0% 0% / 0.15);
  --shadow-md: 0px 4px 15px 0px hsl(0 0% 0% / 0.15), 0px 2px 4px -1px hsl(0 0% 0% / 0.15);
  --shadow-lg: 0px 4px 15px 0px hsl(0 0% 0% / 0.15), 0px 4px 6px -1px hsl(0 0% 0% / 0.15);
  --shadow-xl: 0px 4px 15px 0px hsl(0 0% 0% / 0.15), 0px 8px 10px -1px hsl(0 0% 0% / 0.15);
  --shadow-2xl: 0px 4px 15px 0px hsl(0 0% 0% / 0.38);
  --tracking-normal: -0.01em;
  --spacing: 0.25rem;
}

.dark {
  --background: oklch(0.1457 0.0043 285.8570);
  --foreground: oklch(0.9803 0.0053 286.3017);
  --card: oklch(0.1840 0.0081 285.5768);
  --card-foreground: oklch(0.9803 0.0053 286.3017);
  --popover: oklch(0.1840 0.0081 285.5768);
  --popover-foreground: oklch(0.9803 0.0053 286.3017);
  --primary: oklch(0.6449 0.2024 288.1131);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.2434 0.0577 285.6789);
  --secondary-foreground: oklch(0.8684 0.0704 292.0563);
  --muted: oklch(0.2225 0.0194 284.7155);
  --muted-foreground: oklch(0.7155 0.0288 285.6486);
  --accent: oklch(0.2793 0.0598 283.1864);
  --accent-foreground: oklch(0.8201 0.0997 293.7767);
  --destructive: oklch(0.3958 0.1331 25.7230);
  --destructive-foreground: oklch(0.9842 0.0034 247.8575);
  --border: oklch(0.2897 0.0199 285.0881);
  --input: oklch(0.2897 0.0199 285.0881);
  --ring: oklch(0.6449 0.2024 288.1131);
  --chart-1: oklch(0.6231 0.1880 259.8145);
  --chart-2: oklch(0.6268 0.2325 303.9004);
  --chart-3: oklch(0.5854 0.2041 277.1173);
  --chart-4: oklch(0.6056 0.2189 292.7172);
  --chart-5: oklch(0.7845 0.1325 181.9120);
  --sidebar: oklch(0.1795 0.0082 285.5496);
  --sidebar-foreground: oklch(0.9197 0.0040 286.3202);
  --sidebar-primary: oklch(0.6449 0.2024 288.1131);
  --sidebar-primary-foreground: oklch(1.0000 0 0);
  --sidebar-accent: oklch(0.2434 0.0577 285.6789);
  --sidebar-accent-foreground: oklch(0.8684 0.0704 292.0563);
  --sidebar-border: oklch(0.2739 0.0055 286.0326);
  --sidebar-ring: oklch(0.6449 0.2024 288.1131);
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Merriweather', serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 1.4rem;
  --shadow-x: 0px;
  --shadow-y: 10px;
  --shadow-blur: 25px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.15;
  --shadow-color: #000000;
  --shadow-2xs: 0px 10px 25px 0px hsl(0 0% 0% / 0.07);
  --shadow-xs: 0px 10px 25px 0px hsl(0 0% 0% / 0.07);
  --shadow-sm: 0px 10px 25px 0px hsl(0 0% 0% / 0.15), 0px 1px 2px -1px hsl(0 0% 0% / 0.15);
  --shadow: 0px 10px 25px 0px hsl(0 0% 0% / 0.15), 0px 1px 2px -1px hsl(0 0% 0% / 0.15);
  --shadow-md: 0px 10px 25px 0px hsl(0 0% 0% / 0.15), 0px 2px 4px -1px hsl(0 0% 0% / 0.15);
  --shadow-lg: 0px 10px 25px 0px hsl(0 0% 0% / 0.15), 0px 4px 6px -1px hsl(0 0% 0% / 0.15);
  --shadow-xl: 0px 10px 25px 0px hsl(0 0% 0% / 0.15), 0px 8px 10px -1px hsl(0 0% 0% / 0.15);
  --shadow-2xl: 0px 10px 25px 0px hsl(0 0% 0% / 0.38);
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}


```
</details>

## Get More

Want more theme? You can get more theme at [TWEAKCN](https://tweakcn.com/community)