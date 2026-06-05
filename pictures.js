/* ============================================================
   KITA Resource - picture gallery
   ============================================================ */

(function () {
    const owner = 'KITAI19019';
    const repo = 'pictures';
    const apiRoot = `https://api.github.com/repos/${owner}/${repo}`;
    const imagePattern = /\.(avif|gif|jpe?g|png|webp)$/i;
    const expectedPassword = 'KITA';
    const accessStorageKey = 'kita-picture-gallery-access';

    const gateEl = document.getElementById('pictureGate');
    const gateFormEl = document.getElementById('pictureGateForm');
    const gateMessageEl = document.getElementById('pictureGateMessage');
    const passwordInputEl = document.getElementById('picturePassword');
    const contentEl = document.getElementById('pictureContent');
    const listEl = document.getElementById('pictureList');
    const countEl = document.getElementById('pictureCount');
    const statusEl = document.getElementById('pictureStatus');
    const letterListEl = document.getElementById('letterList');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!listEl || !countEl || !statusEl || !letterListEl) return;

    let pictures = [];
    let activeLetter = 'all';
    let activeQuery = '';
    let hasLoaded = false;

    function readAccessState() {
        try {
            return sessionStorage.getItem(accessStorageKey) === 'granted';
        } catch {
            return false;
        }
    }

    function writeAccessState() {
        try {
            sessionStorage.setItem(accessStorageKey, 'granted');
        } catch {
            // The gate still opens even when sessionStorage is unavailable.
        }
    }

    function unlockGallery() {
        document.body.classList.remove('picture-locked');
        if (gateEl) gateEl.hidden = true;
        if (contentEl) contentEl.hidden = false;
        if (!hasLoaded) {
            hasLoaded = true;
            loadPictures().catch(error => {
                listEl.innerHTML = '<div class="picture-empty">图片列表读取失败，请稍后刷新重试。</div>';
                setStatus('读取失败', error.message);
            });
        }
    }

    function baseName(path) {
        const fileName = path.split('/').pop() || path;
        return fileName.replace(/\.[^.]+$/, '');
    }

    function firstLetter(name) {
        const first = name.trim().charAt(0).toUpperCase();
        if (/^[A-Z]$/.test(first)) return first;
        if (/^[0-9]$/.test(first)) return '#';
        return '其他';
    }

    function rawUrl(branch, path) {
        const encodedPath = path.split('/').map(encodeURIComponent).join('/');
        return `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${encodedPath}`;
    }

    function setStatus(count, message) {
        countEl.textContent = count;
        statusEl.textContent = message;
    }

    function makeCard(picture) {
        const article = document.createElement('article');
        article.className = 'picture-card';
        article.dataset.title = picture.title;
        article.dataset.letter = picture.letter;

        const title = document.createElement('h2');
        title.textContent = picture.title;

        const frame = document.createElement('a');
        frame.className = 'picture-frame';
        frame.href = picture.url;
        frame.target = '_blank';
        frame.rel = 'noopener';
        frame.setAttribute('aria-label', `打开图像：${picture.title}`);

        const img = document.createElement('img');
        img.src = picture.url;
        img.alt = picture.title;
        img.loading = 'lazy';
        img.decoding = 'async';

        frame.appendChild(img);
        article.append(title, frame);
        return article;
    }

    function renderLetters(items) {
        const letters = Array.from(new Set(items.map(item => item.letter))).sort((a, b) => {
            if (a === '#') return 1;
            if (b === '#') return -1;
            if (a === '其他') return 1;
            if (b === '其他') return -1;
            return a.localeCompare(b, 'en');
        });

        letterListEl.innerHTML = '';

        const allButton = document.createElement('button');
        allButton.type = 'button';
        allButton.className = 'letter-chip active';
        allButton.dataset.letter = 'all';
        allButton.textContent = '全部';
        letterListEl.appendChild(allButton);

        letters.forEach(letter => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'letter-chip';
            button.dataset.letter = letter;
            button.textContent = letter;
            letterListEl.appendChild(button);
        });
    }

    function renderGallery() {
        const query = activeQuery.trim().toLowerCase();
        const filtered = pictures.filter(picture => {
            const matchesLetter = activeLetter === 'all' || picture.letter === activeLetter;
            const matchesQuery = !query || picture.title.toLowerCase().includes(query) || picture.path.toLowerCase().includes(query);
            return matchesLetter && matchesQuery;
        });

        listEl.innerHTML = '';

        if (filtered.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'picture-empty';
            empty.textContent = pictures.length === 0 ? '暂时没有读取到可展示的图片。' : '没有匹配的图片。';
            listEl.appendChild(empty);
        } else {
            filtered.forEach(picture => listEl.appendChild(makeCard(picture)));
        }

        setStatus(
            `${filtered.length} / ${pictures.length}`,
            activeLetter === 'all' ? '按文件名升序排列' : `正在查看 ${activeLetter} 分组`
        );
    }

    async function loadPictures() {
        listEl.innerHTML = `
            <div class="picture-skeleton"></div>
            <div class="picture-skeleton"></div>
            <div class="picture-skeleton"></div>
        `;

        const repoResponse = await fetch(apiRoot, {
            headers: { Accept: 'application/vnd.github+json' }
        });
        if (!repoResponse.ok) throw new Error('无法读取图片仓库信息');

        const repoData = await repoResponse.json();
        const branch = repoData.default_branch || 'main';

        const treeResponse = await fetch(`${apiRoot}/git/trees/${encodeURIComponent(branch)}?recursive=1`, {
            headers: { Accept: 'application/vnd.github+json' }
        });
        if (!treeResponse.ok) throw new Error('无法读取图片仓库文件列表');

        const treeData = await treeResponse.json();
        const files = Array.isArray(treeData.tree) ? treeData.tree : [];

        pictures = files
            .filter(file => file.type === 'blob' && imagePattern.test(file.path))
            .map(file => {
                const title = baseName(file.path);
                return {
                    path: file.path,
                    title,
                    letter: firstLetter(title),
                    url: rawUrl(branch, file.path)
                };
            })
            .sort((a, b) => a.title.localeCompare(b.title, ['en', 'zh-Hans'], {
                numeric: true,
                sensitivity: 'base'
            }));

        renderLetters(pictures);
        renderGallery();
    }

    letterListEl.addEventListener('click', event => {
        const button = event.target.closest('.letter-chip');
        if (!button) return;

        activeLetter = button.dataset.letter || 'all';
        letterListEl.querySelectorAll('.letter-chip').forEach(chip => chip.classList.toggle('active', chip === button));
        renderGallery();
    });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            activeQuery = this.value;
            if (searchResults) {
                searchResults.classList.remove('active');
                searchResults.innerHTML = '';
            }
            renderGallery();
        });

        searchInput.addEventListener('search', function () {
            activeQuery = this.value;
            renderGallery();
        });
    }

    if (gateFormEl) {
        gateFormEl.addEventListener('submit', event => {
            event.preventDefault();
            const password = passwordInputEl ? passwordInputEl.value.trim() : '';

            if (password === expectedPassword) {
                writeAccessState();
                if (gateMessageEl) gateMessageEl.textContent = '';
                unlockGallery();
            } else {
                if (gateMessageEl) gateMessageEl.textContent = '密码不正确，请重新输入。';
                if (passwordInputEl) {
                    passwordInputEl.value = '';
                    passwordInputEl.focus();
                }
            }
        });
    }

    if (readAccessState()) {
        unlockGallery();
    } else {
        document.body.classList.add('picture-locked');
        if (gateEl) gateEl.hidden = false;
        if (contentEl) contentEl.hidden = true;
        if (passwordInputEl) passwordInputEl.focus();
    }
})();
