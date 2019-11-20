///************* Note : 在 manifest.json 中配置 brow-action 后该监听不会响应
// chrome.browserAction.onClicked.addListener(function(tab) {
//   // No tabs or host permissions needed!
//   console.log('Turning ' + tab.url + ' red!');
//   chrome.tabs.executeScript({
//     code: 'document.body.style.backgroundColor="red"'
//   });
// });


///************* 提供方法供 在pop.js 中调用
function test () {
    console.log("test");
}


///************* 监听 pop.js 发送信息
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息')
    sendResponse('发送返回值');
});


///************* 监听 pop.js 发送信息
// var port = chrome.runtime.connect();

// chrome.runtime.onConnect.addListener(port => {
//         console.log('connected ', port);

//         if (port.name === 'hi') {
//             port.nMessage.addListener(this.processMessage);
//         }
//     });


// window.addEventListener("message", function(event) {
//   // 我们只接受来自我们自己的消息
//   if (event.source != window)
//     return;

//   if (event.data.type && (event.data.type == "FROM_PAGE")) {
//     console.log("内容脚本接收到：" + event.data.text);
//     port.postMessage(event.data.text);
//   }
// }, false);o

//貌似 没鸟用
chrome.runtime.onInstalled.addListener(function(){
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    //过滤规则
                    new chrome.declarativeContent.PageStateMatcher({pageUrl: {schemes:['http','https'], hostEquals: 'manga.bilibili.com', pathContains:'detail'}})
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});