# Wonder World 6 Unit 1-4 Grammar Quiz

以 React + Vite 製作的國小英文文法測驗，練習 `is`、`are`、`do`、`does`。

## 本機執行

Windows 使用者可以直接雙擊 `啟動測驗.bat`，開啟後請勿關閉命令視窗。

也可以在 PowerShell 執行：

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

建置結果位於 `dist` 資料夾，可直接部署至 Netlify 或 GitHub Pages。

推送到 GitHub 的 `main` 分支後，GitHub Actions 會自動建置並部署到
GitHub Pages。

## 題庫

所有題目都放在 `src/data/questions.js`。新增題目時，請包含：

- `id`
- `question`
- `options`
- `answer`
- `hint`
