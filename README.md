# hato-atama

## サービス概要
- 使い捨てURL短縮サービス
ddddd
## URL
<https://hato-atama.an.r.appspot.com/>

## 想定している流れ
- 入力欄にURLを入力するとシステム側で短縮URLを発行する。
- 発行した短縮URLは3回使用したら使用不可になる。なお、使用可能回数は短縮URL発行時に変更可能。

## 開発環境
### 設定
誤ってクレデンシャルをコミットしないよう、以下のhookを設定する。

1. 以下のスクリプトを `.git/hooks/pre-commit` として保存する。
    ```sh
    #!/bin/bash

    source `dirname ${0}`/_local-hook-exec
    declare scriptDir=$(cd $(dirname $0);pwd)
    declare parentDir="$(dirname "${scriptDir}")"
    declare FILES=$(git diff --cached --name-only --diff-filter=ACMR | sed 's| |\\ |g')
    [ -z "$FILES" ] && exit 0
    echo "  ▶ Check credentials by secretlint"
    npm install
    # Secretlint all selected files
    echo "$FILES" | xargs npx secretlint --maskSecrets
    RET=$?
    if [ $RET -eq 0 ] ;then
        exit 0
    else
        exit 1
    fi
    EOF
    ```
1. `.git/hooks/pre-commit` に実行権限を付与する。
    ```sh
    chmod +x .git/hooks/pre-commit
    ```

### 立ち上げ
#### 編集するとhot reloadが走る、開発に適したバージョン
```sh
TAG_NAME=`git symbolic-ref --short HEAD | sed -e "s:/:-:g"` docker-compose -f dev.docker-compose.yml up --build
```

#### 限りなく本番のapp engineに近い設定で動くバージョン
```sh
TAG_NAME=`git symbolic-ref --short HEAD | sed -e "s:/:-:g"` docker-compose -f staging.docker-compose.yml up --build
```
