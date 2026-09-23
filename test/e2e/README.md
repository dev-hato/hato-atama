<!-- textlint-disable terminology -->

# e2e test folder

<!-- textlint-enable terminology -->

ここはe2eテストのフォルダです。

cypressを使用しています。

## CIでのブラウザ接続失敗

CIでは、`scripts/release/run_cypress.sh`でCypressを実行します。
Chrome DevTools Protocolへの再接続に失敗した場合は、5秒待ってCypressを起動し直します。
再試行は最大2回です。各試行の出力と再試行の警告はジョブログに残ります。

テストの失敗が報告されている場合や、それ以外のエラーでは再試行せずに終了します。
再試行しても接続できなければ、ジョブは失敗します。
`npm ci`は再試行の対象に含みません。

この処理のテストは、リポジトリのルートで`node --test scripts/release/run_cypress.test.mjs`を実行すると確認できます。

## ディレクトリ説明

### cypress/e2e/mini

cypressが最小限・最低限動くかどうかのテストをします。

cypressが動く以上の保証はしないでください。

PRが更新されるたびに、実際のサーバーにアクセスします。

### cypress/e2e/all

PRが更新されるたびに、ローカルのDocker compose環境に対してテストされます。

masterマージ後のリリース前には、実際のサーバーに対してもテストされます。
