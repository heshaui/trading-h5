export const windowOpen = (url: string) => {
    if (url.startsWith("http")) {
        window.open(url, "_blank", "noopener");
    } else {
        // window.location.href = url;
        console.log('错误地址：',url);
        
    }
}