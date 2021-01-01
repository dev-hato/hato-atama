# hato-atama

## サービス概要
- 使い捨てURL短縮サービス

## 想定している流れ
- 入力欄にURLを入力するとシステム側で短縮URLを発行する。
- 発行した短縮URLは1回(デフォルト値。短縮URL発行時に回数変更可能)使用したら使用不可になる。

## 開発環境立ち上げ

```sh
docker-compose -f dev.docker-compose.yml up --build
```
