# e2e test folder

ここはe2eテストのフォルダです。

cypressを使用しています。

## ディレクトリ説明

### cypress/e2e/mini

cypressが最小限・最低限動くかどうかのテストをします。

cypressが動く以上の保証はしないでください。

PRが更新されるたびに、実際のサーバーにアクセスします。

### cypress/e2e/all

PRが更新されるたびに、ローカルのdocker compose環境に対してテストされます。

masterマージ後のリリース前には、実際のサーバーに対してもテストされます。
