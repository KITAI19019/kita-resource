function downloadAlert(event) {
    gtag('event', 'download', {  // 发事件到Google
        'file_name': event.target.href.split('/').pop(),  // 取文件名
        'category': '资源下载'
    });
    alert("感谢下载！欢迎反馈。若视频不显示请尝试更换浏览器或设备");
}
// 加到链接
document.querySelectorAll('a[download]').forEach(link => {
    link.addEventListener('click', downloadAlert);
});

// 选所有下载链接，加点击事件
const downloadLinks = document.querySelectorAll('a.transl[download]');
downloadLinks.forEach(link => {
    link.addEventListener('click', downloadAlert);
});


