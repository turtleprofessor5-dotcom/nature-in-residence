# Nature in Residence

Editable website source for Climate Crisis Group 2, Royal College of Art.

## 中文协作说明

本项目包含当前本地网站的文字、图片和交互动效。无需安装依赖或编译。

- 修改文字、章节、图片说明：`index.html`
- 修改版式、字体、颜色和鼠标悬停效果：`exhibition.css`
- 替换图片：`assets/`（保留原文件名，或同时修改 HTML / CSS 中的路径）
- 图片全屏、返回位置和鼠标追随：`interactions.js`
- 照片手风琴：`gallery.js`
- 滚动渐变与入场动效：`scroll-effects.js`

### 在线编辑

在 GitHub 仓库页面按键盘 `.`，即可打开浏览器编辑器。完成修改后在 Source Control 中提交更改。要运行预览，可在仓库 Code → Codespaces 中创建环境（依 GitHub 账号额度可能收费）；运行 `python -m http.server 8000`，然后打开端口 8000 的预览。

GitHub 在线编辑器本身不运行网站。也可下载整个项目，在浏览器打开 `index.html` 查看效果。

### 邀请同学

仓库所有者进入 Settings → Collaborators → Add people，输入同学的 GitHub 用户名，邀请其协作；同学接受后即可编辑。请优先创建 Private 仓库。仓库链接本身不会赋予编辑权限。

### 更新方式

多人修改时建议各自建立分支并提交 Pull Request，检查后再合并到 main，避免互相覆盖。

### 内容与素材

仍缺少的研究、物种记录、试装许可和测试结论保留为待补充内容，请勿改写为已确认或已安装。组员提供的照片和设计素材保留原有权利；第三方交互代码的授权见 THIRD-PARTY-LICENSES.txt 及脚本内版权声明。本仓库不授予第三方重新授权。
