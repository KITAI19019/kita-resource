/* ============================================================
   KITA Resource — 全局脚本
   ============================================================ */

// ---------- Article Search ----------
(function () {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (!searchInput || !searchResults) return;

    // Build article index from .post elements on the page
    const posts = Array.from(document.querySelectorAll('.post[data-title]'));
    const articles = posts.map(post => ({
        title: post.getAttribute('data-title') || '',
        tags: post.getAttribute('data-tags') || '',
        summary: post.querySelector('p') ? post.querySelector('p').textContent : '',
        link: post.querySelector('h2 a') ? post.querySelector('h2 a').getAttribute('href') : '#',
        element: post
    }));

    searchInput.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();
        if (!query) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            // Show all posts
            posts.forEach(p => p.classList.remove('search-hidden'));
            return;
        }

        const matches = articles.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.tags.toLowerCase().includes(query) ||
            a.summary.toLowerCase().includes(query)
        );

        // Filter visible posts
        posts.forEach(p => {
            const title = (p.getAttribute('data-title') || '').toLowerCase();
            const tags = (p.getAttribute('data-tags') || '').toLowerCase();
            const text = p.textContent.toLowerCase();
            if (title.includes(query) || tags.includes(query) || text.includes(query)) {
                p.classList.remove('search-hidden');
            } else {
                p.classList.add('search-hidden');
            }
        });

        // Build dropdown
        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(m =>
                `<a class="result-item" href="${m.link}">
                    <div>${m.title}</div>
                    <div class="result-meta">${m.tags}</div>
                </a>`
            ).join('');
        } else {
            searchResults.innerHTML = '<div class="no-result">没有找到相关文章</div>';
        }
        searchResults.classList.add('active');
    });

    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });

    // Re-show all posts when clearing search
    searchInput.addEventListener('search', function () {
        if (!this.value) {
            posts.forEach(p => p.classList.remove('search-hidden'));
            searchResults.classList.remove('active');
        }
    });
})();

// ---------- Download Alert (with Toast) ----------
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function downloadAlert(event) {
    if (typeof gtag === 'function') {
        gtag('event', 'download', {
            'file_name': event.target.href ? event.target.href.split('/').pop() : 'unknown',
            'category': '资源下载'
        });
    }
    showToast('感谢下载！欢迎反馈。若视频不显示请尝试更换浏览器或设备');
}

// Bind download events (once)
document.querySelectorAll('a[download]').forEach(link => {
    link.addEventListener('click', downloadAlert);
});
