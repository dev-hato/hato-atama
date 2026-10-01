<!-- textlint-disable terminology -->

# e2e test folder

<!-- textlint-enable terminology -->

ここはe2eテストのフォルダです。

cypressを使用しています。

## CIでの再試行

CIでは、全ブラウザのmini/allテストに共通の`scripts/release/run_cypress.sh`を使います。
Cypressの実行に失敗した場合は、エラーの種類を問わず5秒待って最大3回再試行します。
初回を含む4回すべてが失敗した場合は、ジョブも失敗します。`npm ci`は再試行の対象に含みません。

## ディレクトリ説明

### cypress/e2e/mini

cypressが最小限・最低限動くかどうかのテストをします。

cypressが動く以上の保証はしないでください。

PRが更新されるたびに、実際のサーバーにアクセスします。

### cypress/e2e/all

PRが更新されるたびに、ローカルのDocker compose環境に対してテストされます。

masterマージ後のリリース前には、実際のサーバーに対してもテストされます。
