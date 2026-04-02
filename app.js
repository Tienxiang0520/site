const COMPANIES_URL = "./data/companies.json";
const NEWS_URL = "./data/news.json";

initPage();

async function initPage() {
    const pageType = document.body.dataset.page;
    if (!pageType) {
        return;
    }

    try {
        const [companies, newsItems] = await Promise.all([
            fetchJson(COMPANIES_URL, "無法讀取 companies.json"),
            fetchJson(NEWS_URL, "無法讀取 news.json")
        ]);
        if (pageType === "home") {
            renderHomePage(newsItems);
            return;
        }
        if (pageType === "companies") {
            renderCompaniesPage(companies);
            return;
        }
        if (pageType === "company") {
            renderCompanyPage(companies, newsItems);
        }
    } catch (error) {
        renderLoadError(String(error?.message || "資料載入失敗"));
    }
}

async function fetchJson(url, errorMessage) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(errorMessage);
    }
    return response.json();
}

function renderHomePage(newsItems) {
    const grid = document.querySelector("#home-news-grid");
    if (!grid) {
        return;
    }

    const topNews = newsItems.slice(0, 3);
    grid.innerHTML = topNews.map(item => `
        <article class="news-card">
            <p class="news-type">${escapeHtml(item.segment)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            <p class="news-meta">${escapeHtml(item.source)} | ${escapeHtml(item.published_at)}</p>
            <a href="${escapeAttribute(item.link)}" target="_blank" rel="noreferrer">查看原文</a>
        </article>
    `).join("");
}

function renderCompaniesPage(companies) {
    const grid = document.querySelector("#companies-grid");
    if (!grid) {
        return;
    }

    grid.innerHTML = companies.map(company => `
        <article class="catalog-card">
            <p class="card-tag">${escapeHtml(company.segment)}</p>
            <h2>${escapeHtml(company.name)}</h2>
            <p class="ticker">${escapeHtml(company.ticker)}</p>
            <p><strong>角色：</strong>${escapeHtml(company.role)}</p>
            <p><strong>重點：</strong>${escapeHtml(company.focus)}</p>
            <p>${escapeHtml(company.summary)}</p>
            <a class="card-link" href="${escapeAttribute(company.detail_link)}">查看公司頁</a>
        </article>
    `).join("");
}

function renderCompanyPage(companies, newsItems) {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const company = companies.find(item => item.slug === slug) || companies[0];
    if (!company) {
        renderLoadError("找不到公司資料");
        return;
    }

    const title = document.querySelector("#company-title");
    const intro = document.querySelector("#company-intro");
    const facts = document.querySelector("#company-facts");
    const watchItems = document.querySelector("#company-watch-items");
    const links = document.querySelector("#company-links");
    const angles = document.querySelector("#company-angles");
    const companyNews = document.querySelector("#company-news");
    const relatedNews = newsItems.filter(item => Array.isArray(item.companies) && item.companies.includes(company.slug));

    if (title) {
        title.textContent = company.name;
    }
    if (intro) {
        intro.textContent = `${company.positioning} 目前最值得先追的是：${company.focus}`;
    }
    if (facts) {
        facts.innerHTML = `
            <li>代號：${escapeHtml(company.ticker)}</li>
            <li>Segment：${escapeHtml(company.segment)}</li>
            <li>角色：${escapeHtml(company.role)}</li>
            <li>關鍵字：${escapeHtml(company.keywords.join(" / "))}</li>
        `;
    }
    if (watchItems) {
        watchItems.innerHTML = company.watch_items.map(item => `
            <li>${escapeHtml(item)}</li>
        `).join("");
    }
    if (links) {
        links.innerHTML = company.supply_chain_links.map(item => `
            <li>${escapeHtml(item)}</li>
        `).join("");
    }
    if (angles) {
        angles.innerHTML = company.recent_angles.map((item, index) => `
            <article class="news-card">
                <p class="news-type">Angle ${index + 1}</p>
                <h3>${escapeHtml(company.name)} 觀察角度</h3>
                <p>${escapeHtml(item)}</p>
                <a href="./companies.html">回到公司列表</a>
            </article>
        `).join("");
    }
    if (companyNews) {
        companyNews.innerHTML = relatedNews.length > 0
            ? relatedNews.map(item => `
                <article class="news-card">
                    <p class="news-type">${escapeHtml(item.segment)}</p>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.impact)}</p>
                    <p class="news-meta">${escapeHtml(item.source)} | ${escapeHtml(item.published_at)}</p>
                    <a href="${escapeAttribute(item.link)}" target="_blank" rel="noreferrer">查看原文</a>
                </article>
            `).join("")
            : `
                <article class="news-card">
                    <p class="news-type">No News Yet</p>
                    <h3>這家公司還沒有整理好的新聞卡片</h3>
                    <p>下一步可以補更多新聞資料，讓公司頁更像真的追蹤站。</p>
                    <a href="./companies.html">回到公司列表</a>
                </article>
            `;
    }
}

function renderLoadError(message) {
    const targets = document.querySelectorAll("[data-load-error]");
    targets.forEach(target => {
        target.innerHTML = `<p class="load-error">${escapeHtml(message)}</p>`;
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}
