# Kristo — Portfolio Site

A static, dependency-free portfolio: plain HTML, CSS, and JavaScript. No build
step, no framework, nothing to install. If you can edit a text file and push to
GitHub, you can maintain this site.

## Project structure

```
portfolio/
├── index.html        # All content and structure
├── css/
│   └── styles.css    # Design tokens, layout, responsive rules, animations
├── js/
│   └── main.js       # Hero regression animation, scroll reveals, contact form
├── assets/           # (create this) resume.pdf, images, favicon
└── README.md
```

## Before you deploy — customization checklist

Search `index.html` for `TODO` and `YOUR` and replace:

- [ ] `YOUR-USERNAME` → your GitHub username (appears in project links + contact)
- [ ] `YOUR-HANDLE` → your LinkedIn handle
- [ ] `you@example.com` → your real email (two places: contact list + form fallback)
- [ ] `YOUR_FORM_ID` → your Formspree form ID (see "Contact form" below)
- [ ] Project links → your actual repo URLs and demo/write-up links
- [ ] `assets/resume.pdf` → drop your resume PDF into an `assets/` folder,
      or delete the Resume nav link if you'd rather not host it
- [ ] Last name in the `<title>` tag and nav brand if you want it shown

## Previewing locally

Option A (simplest): double-click `index.html`. Everything works from the
filesystem except the Formspree POST.

Option B (better): in any JetBrains IDE, right-click `index.html` →
**Open In → Browser**. JetBrains runs a tiny local web server automatically,
which matches how the site behaves once deployed.

## Contact form (Formspree, free)

GitHub Pages only serves static files — there's no server to receive form
submissions. Formspree fills that gap for free (50 submissions/month):

1. Sign up at https://formspree.io with your email
2. Create a new form; it gives you an endpoint like `https://formspree.io/f/abcd1234`
3. In `index.html`, replace `YOUR_FORM_ID` in the form's `action` attribute
4. Submit a test message from the live site and confirm it arrives

Until you do this, the form shows a friendly "not wired up yet" message
instead of failing silently.

## Deploying — GitHub Pages (recommended)

One important caveat first: **free GitHub Pages only works on public repos.**
Private repos require GitHub Pro (~$4/month). For a portfolio, public is
actually what you want — recruiters clicking your GitHub link seeing clean,
commented code is a feature. But if you want the repo private, see the
Netlify/Cloudflare option below (both deploy from private repos for free).

1. Create a repo on GitHub named `YOUR-USERNAME.github.io`
   (this exact name gives you the clean URL `https://YOUR-USERNAME.github.io`;
   any other repo name works too, but the site lives at
   `https://YOUR-USERNAME.github.io/repo-name/`)
2. Push this folder to it:

   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
   git push -u origin main
   ```

   (JetBrains equivalent: **VCS → Share Project on GitHub** does all of this
   from the GUI.)

3. On GitHub: repo → **Settings → Pages** → under "Build and deployment,"
   Source = **Deploy from a branch**, Branch = **main**, folder = **/ (root)** → Save
4. Wait 1–2 minutes. Your site is live at `https://YOUR-USERNAME.github.io`
5. Every future `git push` to main redeploys automatically

## Alternative: Netlify or Cloudflare Pages (works with private repos)

1. Sign up at https://netlify.com (or https://pages.cloudflare.com) with your
   GitHub account
2. "Add new site → Import from Git" → pick your repo (private is fine)
3. Build command: leave blank. Publish directory: `/` (root)
4. Deploy. You get a URL like `yourname.netlify.app`, and every push redeploys

## Optional: custom domain

A domain like `kristo.dev` or `yourname.com` runs ~$10–12/year (Namecheap,
Cloudflare Registrar, Porkbun). Both GitHub Pages and Netlify have a
"custom domain" setting where you paste it in and follow the DNS
instructions. Not required — a github.io URL is perfectly respectable —
but it looks sharp on a resume header.

## Design notes (in case anyone asks)

- Palette: paper white / ink navy / ultramarine accent — corporate with a
  math-journal feel
- Type: STIX Two Text (the typeface designed for scientific/mathematical
  publishing) for headings, IBM Plex Sans for body, IBM Plex Mono for labels
- The hero scatter plot is real: 42 seeded pseudo-random points and an
  actual ordinary-least-squares fit computed in `main.js`, not a decorative
  fake. The line that draws itself is your elevator pitch.
- Accessibility: keyboard focus states, `prefers-reduced-motion` respected,
  semantic HTML throughout
