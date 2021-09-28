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
誤ってクレデンシャルをコミットしないよう、https://pre-commit.com/ の手順に従って `pre-commit` をインストールする。

### 立ち上げ
#### 編集するとhot reloadが走る、開発に適したバージョン
```sh
TAG_NAME=`git symbolic-ref --short HEAD | sed -e "s:/:-:g"` docker-compose -f dev.docker-compose.yml up --build
```

#### 限りなく本番のapp engineに近い設定で動くバージョン
```sh
TAG_NAME=`git symbolic-ref --short HEAD | sed -e "s:/:-:g"` docker-compose -f staging.docker-compose.yml up --build
```
