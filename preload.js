window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})


// Electron は Chromium (ブラウザ) と Node.js を組み合わせて動作する。
// Electron のアプリケーションは、以下の二つの主要なプロセスタイプで構成されます。

// 1. メインプロセス:
// アプリケーションのエントリーポイントとして機能し、アプリケーションのライフサイクルを管理する（ウィンドウの生成、アプリの終了など）。
// 全てのElectron APIの大部分にアクセス可能で、特に BrowserWindow インスタンスを作成するために使用される。

// 2. レンダラープロセス:
// 通常、それぞれの BrowserWindow インスタンスにはそれぞれ独立したレンダラープロセスが割り当てられる。
// レンダラープロセスは、ウェブページを表示するために使用されるプロセスで、通常のウェブページと同様に HTML/CSS/JavaScript を使ってUIを構築する。


// Preload スクリプトについて
// Preload スクリプトは、レンダラープロセスが完全に分離される前に実行されるスクリプト。
// これは、セキュリティ上の理由からレンダラープロセスから Node.js 環境や一部の Electron API を直接アクセスすることが制限されるため、そのギャップを埋める役割を果たす。
// レンダラープロセスが安全であることを保証しつつ、必要な機能（例えば、メインプロセスとの IPC 通信）を安全に提供することができる。

// Preload スクリプトに IPC 通信の関数を追加する理由
// Electron のセキュリティモデルでは、レンダラープロセスからメインプロセスへの直接的なアクセスを制限している。
// これは、悪意のあるコードがレンダラープロセスを通じてシステムにアクセスするリスクを減らすため。
// Preload スクリプトを通じて、必要なメソッドを contextBridge を使用して安全に露出させることができる。
// これにより、レンダラープロセス（ウェブページ）から安全にメインプロセスへメッセージを送信する機能を実装することができます。
// contextBridge.exposeInMainWorld メソッドを使用して、レンダラーから安全に呼び出せるメソッドを公開し、
// レンダラープロセス内のコードが Node.js や Electron のメインプロセスの API に直接触れることなく、必要な操作を行うことが可能になります。


// preloadスクリプトを介してレンダラープロセスとメインプロセス間のAPIを公開
// contextBridge は、レンダラープロセスとメインプロセス間の安全な、且つ制限された通信チャネルを提供するために使用される。
// ipcRenderer は、レンダラープロセスからメインプロセスへ非同期メッセージを送信するために使われる。
const { contextBridge, ipcRenderer } = require('electron');

// レンダラープロセスのグローバルなスコープに名前付きオブジェクトを公開します。
// ここでは、electronAPI という名前でオブジェクトが公開されています。
contextBridge.exposeInMainWorld('electronAPI', {


    // ***** ファイル保存 *****
    saveFileDialog: (data) => ipcRenderer.invoke('save-file-dialog', data),
    
    // ***** ファイル読み込み *****
    // ファイルダイアログを開くことをメインプロセスに依頼する。
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    // データの読み込みをメインプロセスに依頼する。
    loadData: (filePath) => ipcRenderer.send('load-data', filePath),
    // load-data-response イベントに対するレスポンスを待ち受けるために、コールバック関数を登録する。
    receiveLoadDataResponse: (callback) => ipcRenderer.on('load-data-response', callback)

});

