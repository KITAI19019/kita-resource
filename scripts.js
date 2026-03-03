// 示例：下载时弹窗
function downloadAlert() {
    alert("感谢下载！欢迎反馈。");
}

// 选所有下载链接，加点击事件
const downloadLinks = document.querySelectorAll('a.transl[download]');
downloadLinks.forEach(link => {
    link.addEventListener('click', downloadAlert);
});

// 搜索功能（暂时不需要）
/*
function searchWorks() {
    let input = document.getElementById('searchInput').value.toLowerCase();  // 获取输入，转小写
    let works = document.querySelectorAll('.work-item');  // 选所有作品div
    
    works.forEach(work => {
        let title = work.querySelector('h3').textContent.toLowerCase();  // 取标题
        let desc = work.querySelector('p').textContent.toLowerCase();    // 取描述
        
        if (title.includes(input) || desc.includes(input)) {
            work.style.display = 'block';  // 显示匹配
        } else {
            work.style.display = 'none';   // 藏不匹配
        }
    });
}
*/

// 访客计数
function updateVisitorCount() {
    let count = localStorage.getItem('visitorCount') || 0; 
    count = parseInt(count) + 1;                           
    localStorage.setItem('visitorCount', count);          
    document.getElementById('visitorCount').textContent = count;
}

window.addEventListener('load', updateVisitorCount);