# e2e test folder

ここは e2e テストのフォルダです。

cypress を使用しています。

## ディレクトリ説明

### cypress/integration/mini

cypress が最小限・最低限動くかどうかのテストをします。

cypress が動く以上の保証はしないでください。

PR が更新されるたびに、実際のサーバーにアクセスします。

### cypress/integration/all

PR が更新されるたびに、ローカルの docker-compose 環境に対してテストされます。

master マージ後のリリース前には、実際のサーバーに対してもテストされます。
