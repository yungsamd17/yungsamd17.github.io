# Links Page

A simple, clean page that displays all your social links and profiles in one place.

**Live page:** [yungsamd17.github.io/links](https://yungsamd17.github.io/links)

---

## Features

- **Uses main website styles** - Loads `../src/style.css` for consistent look/feel
- **Platform + Username** - Each link shows the platform name and your username
- **Font Awesome icons** - Visual icons for each platform
- **Hover effects** - Subtle lift and color change on hover
- **Theme support** - Detects system preference (dark/light) on first visit
- **Auto-updating year** - Footer year updates automatically
- **Back to Home** - "Back to Home" link at the bottom
- **Easy to extend** - Just copy/paste a link block to add more

---

## How to Add a New Link

1. **Open `links/index.html`**
2. **Copy an existing `.link-item` block:**
```html
<a href="YOUR_URL" target="_blank" rel="noopener" class="link-item">
    <i class="fa-brands fa-ICON_NAME"></i>
    <div class="link-info">
        <span class="link-platform">Platform Name</span>
        <span class="link-username">your_username</span>
    </div>
</a>
```

3. **Update the fields:**
   - `href` - Your full profile URL
   - `fa-ICON_NAME` - Find the icon name on [Font Awesome](https://fontawesome.com/icons)
   - `link-platform` - Platform name (e.g., "GitHub", "Instagram")
   - `link-username` - Your username on that platform

### Example - Adding Instagram:
```html
<a href="https://instagram.com/yungsamd17" target="_blank" rel="noopener" class="link-item">
    <i class="fa-brands fa-instagram"></i>
    <div class="link-info">
        <span class="link-platform">Instagram</span>
        <span class="link-username">yungsamd17</span>
    </div>
</a>
```

---

## Finding Font Awesome Icons

1. Go to [fontawesome.com/icons](https://fontawesome.com/icons)
2. Search for the platform (e.g., "github", "twitter")
3. Click the icon and copy the class name (e.g., `fa-brands fa-github`)
4. Use `fa-brands` for brands, `fa-solid` for solid icons.

### Common Icons:
| Platform | Icon Class |
|----------|------------|
| GitHub | `fa-brands fa-github` |
| X/Twitter | `fa-brands fa-x-twitter` |
| Twitch | `fa-brands fa-twitch` |
| Discord | `fa-brands fa-discord` |
| YouTube | `fa-brands fa-youtube` |
| Instagram | `fa-brands fa-instagram` |
| LinkedIn | `fa-brands fa-linkedin` |
| Email | `fa-solid fa-envelope` |
| Website | `fa-solid fa-globe` |
| Ko-fi | `fa-solid fa-mug-hot` |

---

## Customization

### Change Theme Default:
```javascript
// In the <script> tag at the bottom:
const savedTheme = localStorage.getItem('theme');
const currentTheme = savedTheme || getSystemTheme(); // Remove "|| getSystemTheme()" to always default to light
```

### Add More Fields:
You can add more info to each link by adding elements inside `.link-info`:
```html
<div class="link-info">
    <span class="link-platform">GitHub</span>
    <span class="link-username">yungsamd17</span>
    <span class="link-desc">Open source projects</span>  <!-- New field -->
</div>
```

Then add CSS in the `<style>` tag:
```css
.link-desc {
    display: block;
    font-size: .72rem;
    color: var(--mid);
    margin-top: 2px;
}
```

---

## Structure

```
links/
├── index.html          # The links page (uses ../src/style.css)
└── README.md          # This documentation
```

The page uses **your main website's `style.css`** for consistent theming (dark/light variables, focus styles, etc.). Only link-specific styles are embedded inline.

---

**Last updated:** May 2026
