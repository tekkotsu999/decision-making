## Decision Making Analysis Tool

### 概要
このプロジェクトは、Electronを使用して構築された意思決定分析ツールです。評価基準と選択肢を入力し、それぞれの重み付けを行って、最適な選択肢を視覚的に分析できます。

### 機能
- **評価基準と選択肢の入力**: ユーザーはテキストエリアに評価基準と選択肢を入力します。
- **データの保存と読み込み**: 入力されたデータをローカルファイルとして保存し、後で読み込むことが可能です。
- **グラフィカルなフィードバック**: 評価基準と選択肢の重み付けに基づいたグラフィカルな表現を通じて、最適な選択肢を視覚的に分析できます。
- **ドラッグアンドドロップによる順位の入れ替え**: ユーザーはドラッグアンドドロップを利用して評価基準と選択肢の順位を簡単に入れ替えることができます。これにより、重み付けの調整と再計算が即座に行われます。

### コンポーネント
- **index.html**: ユーザーインターフェースを提供します。
- **styles.css**: ページのスタイルを定義します。
- **script.js**: ブラウザ上での動作を制御するスクリプトです。
- **main.js**: Electronのメインプロセスを定義し、アプリケーションウィンドウを管理します。
- **preload.js**: レンダラープロセスとメインプロセス間のセキュアな通信を設定します。
- **start.py**: アプリケーションの起動スクリプトです。

### インストール方法
1. プロジェクトをクローンまたはダウンロードします。
2. 依存関係をインストールするために、プロジェクトディレクトリで `npm install` を実行します。
3. `start.py` スクリプトを実行してアプリケーションを起動します。

### 使い方
1. アプリケーションを起動後、評価基準と選択肢をそれぞれのテキストエリアに入力します。
2. 「Generate Lists」ボタンをクリックして、入力データに基づく分析を開始します。
3. 結果は右パネルにグラフとして表示されます。
4. 「Save Data」ボタンで現在のセッションを保存し、「Load Data」ボタンで以前のセッションを読み込むことができます。
5. 評価基準と選択肢のリストはドラッグアンドドロップによって順位の入れ替えが可能です。順位の変更により重み付けが自動的に更新され、結果が再計算されます。

### 開発環境
このプロジェクトはElectron、HTML、CSS、JavaScriptを使用して開発されています。