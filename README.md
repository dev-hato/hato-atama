# hato-atama

## サービス概要

- 使い捨てURL短縮サービス

## URL

<https://hato-atama.an.r.appspot.com/>

## 想定している流れ

- 入力欄にURLを入力するとシステム側で短縮URLを発行する。
- 発行した短縮URLは3回使用したら使用不可になる。なお、使用可能回数は短縮URL発行時に変更可能。

## 開発環境

### 設定

<https://pre-commit.com/>の手順に従って`pre-commit`をインストールする。  
これにより、[.pre-commit-config.yaml](.pre-commit-config.yaml)の設定に基づいて、コミット時にクレデンシャルが含まれていないかの検査が行われるようになる。

リポジトリ直下の`.env`にDocker Composeで使うポートを定義している。既定値ではフロントエンドが`http://localhost:8080/`、サーバーが`http://localhost:8082/`で起動する。

### 立ち上げ

#### 編集するとhot reloadが走る、開発に適したバージョン

```sh
export TAG_NAME=`git symbolic-ref --short HEAD | sed -e "s:/:-:g" | sed -e "s/^master$/latest/g"`
docker compose -f compose.yml -f dev.base.compose.yml -f dev.compose.yml build
docker compose -f compose.yml -f dev.base.compose.yml -f dev.compose.yml watch
```

#### 限りなく本番のapp engineに近い設定で動くバージョン

```sh
TAG_NAME=`git symbolic-ref --short HEAD | sed -e "s:/:-:g" | sed -e "s/^master$/latest/g"` docker compose -f compose.yml -f staging.compose.yml up --build
```

### ローカル検証

Goのテストは次のコマンドで実行する。

```sh
go test ./...
```

フロントエンドの本番ビルドは次のコマンドで確認する。

```sh
npm --prefix frontend ci
npm --prefix frontend run build
```

### Node.jsの更新

Node.jsは、[frontend/Dockerfile](frontend/Dockerfile)の`base`ステージで使うDockerイメージを基準にする。Dockerイメージを更新すると、`release`の`update-package`が実コンテナからNode.jsの版を取得する。取得した版をルート・`frontend`・`test/e2e`の`.node-version`と`engines.node`へ反映する。`engines.node`には、Dependabotの実行環境用に許容している版も含める。

同期後に`npm install`でlockfileを更新し、差分があれば`actions-diff-pr-management`で元のPR向けの修正PRを作成する。修正PRを元のブランチへマージしてから、Dockerイメージの更新PRを取り込む。

Node.jsの設定だけを先に更新することを防ぐため、RenovateとDependabotの個別更新から除外している。基準となるDockerイメージの更新は、RenovateとDependabotで継続する。

### lint依存の更新

ESLint、textlintとそのプラグイン・ルールは、RenovateとDependabotの個別更新から除外している。Super-Linterに同梱されるパッケージは同梱版に揃え、追加のプラグイン・ルールは同梱ツールに対応する安定版を選ぶ。追加パッケージの更新は、同梱ツールのバージョンが変わったとき、または現在の依存関係が対応範囲を外れたときに行う。Git参照で指定したルールは、その参照を維持する。

`release`の`update-package`がバージョンとlockfileを更新し、`actions-diff-pr-management`で修正PRを作成する。修正PRを元のPRのブランチへマージすると、元のPRでも同期済みの状態でCIが実行される。Gitleaksは既存の`update-gitleaks`が同じ流れでSuper-Linterの同梱版に同期する。

Go本体はサーバーのDockerイメージとApp Engineを基準に管理する。

## ARM64環境に対応したElmコンパイラに関して

ARM64環境に対応したElmコンパイラを`elm/elm_arm64`として配置しています。  
ARM64環境で開発環境を立ち上げると、こちらのコンパイラを使ってフロントエンドのビルドが行われます。  
ARM64環境に対応したElmコンパイラのビルドを行いたい場合はARM64環境で次のコマンドを実行します。

```sh
cd elm
./make_compiler.sh
```
