// 示例：下载时弹窗
function downloadAlert() {
    alert("感谢下载！欢迎反馈。");
}

// 选所有下载链接，加点击事件
const downloadLinks = document.querySelectorAll('a.transl[download]');
downloadLinks.forEach(link => {
    link.addEventListener('click', downloadAlert);
});