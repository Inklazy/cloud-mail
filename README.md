<p align="center">
    <img src="doc/demo/logo.png" width="80px" />
    <h1 align="center">Cloud Mail Netflix/TG 转发增强版</h1>
    <p align="center">基于 Cloudflare Workers 的域名邮箱系统，增强了指定邮箱快速转发到 Telegram 群组/私聊的能力。</p>
    <p align="center">
        简体中文 | <a href="/README-en.md" style="margin-left: 5px">English</a>
    </p>
    <p align="center">
        <a href="https://github.com/Inklazy/cloud-mail" target="_blank">
            <img src="https://img.shields.io/badge/fork-Inklazy/cloud--mail-blue" />
        </a>
        <a href="https://github.com/maillab/cloud-mail" target="_blank">
            <img src="https://img.shields.io/badge/upstream-maillab/cloud--mail-green" />
        </a>
        <a href="https://github.com/Inklazy/cloud-mail/blob/main/LICENSE" target="_blank">
            <img src="https://img.shields.io/badge/license-MIT-green" />
        </a>
    </p>
</p>

## 项目说明

本仓库基于 [maillab/cloud-mail](https://github.com/maillab/cloud-mail) v3.0.0 系列修改，保留原版 Cloud Mail 的域名邮箱、邮件收发、后台管理、Telegram 推送、邮件黑名单、验证码识别等能力，并额外加入了更适合 Netflix 合租车主使用的“指定邮箱 Telegram 快速转发”功能。

典型用法：

```text
netflix@your-domain.com 作为 Netflix 登录邮箱
收到 Netflix 邮件后立即转发到 Telegram 群组
敏感邮件按黑白名单过滤，只发拦截提醒或直接放行
```

相比使用 Gmail IMAP + mail2telegram 轮询，本方案直接在 Cloudflare 收信链路里处理邮件，延迟更低，也不需要依赖第三方邮箱的 IMAP 拉取。

## 本版本新增功能

- 指定邮箱转发：可以为 `netflix@your-domain.com` 这类邮箱单独配置 Telegram 转发规则。
- 群组推送支持：支持 Telegram 私聊、群组、超级群 `-100...` chat_id。
- 保留查看原邮件：继续保留原 Cloud Mail 的 `View` 查看原邮件按钮；群组中自动使用 URL 按钮，避免 Telegram `web_app` 群组限制。
- 后台规则编辑：在 `系统设置 -> 邮件推送 -> 指定邮箱转发` 中编辑规则。
- Telegram 命令管理：管理员可私聊机器人执行 `/add`、`/remove`、`/list`、`/reload` 管理黑白名单。
- 每邮箱独立配置：每条规则可配置收件邮箱、TG chat_id、管理员 ID、发件人白名单、关键词白名单、关键词黑名单、拦截提醒。
- 安全拦截提醒：命中拦截规则时只发送摘要提醒，不发送邮件正文。
- 原地升级友好：只追加 `setting.forward_rules` 字段，不删除历史邮件、用户、账号、附件等数据。
- 兼容 v3.0 黑名单：保留上游 v3.0 的全局邮件黑名单能力，指定邮箱规则只控制 Telegram 转发。

## 过滤规则说明

指定邮箱转发的过滤顺序如下：

1. 发件人白名单不为空时，先检查发件人是否命中；不命中则拦截。
2. 关键词白名单命中时直接放行。
3. 关键词黑名单命中时拦截。
4. 以上都没有命中时默认放行。

注意：指定邮箱规则只影响 Telegram 转发，不会删除邮件。邮件仍会正常保存到 Cloud Mail 邮件列表中。

## Netflix 规则示例

下面是一份常用参考配置，可按自己的车队情况调整。

关键词白名单：

```text
同户,存取码,同戶,存取碼,旅行,临时访问,新设备登录,登录代码
```

关键词黑名单：

```text
password,重置,reset,修改,密码已更改,密码已更新,已更改,手机号码,更改,Krak,Google,帐户信息
```

发件人白名单：

```text

```

留空表示不限制发件人。若只想接收 Netflix 官方邮件，可以填：

```text
netflix.com
```

## 快速升级教程

适合已经部署过 Cloud Mail 的用户。

1. 备份 Cloudflare D1 数据库。升级不会主动清空数据，但备份永远是好习惯。
2. 确认 Cloudflare Worker 仍使用原来的绑定和环境变量。

```text
D1 绑定名：db
KV 绑定名：kv
R2 绑定名：r2，可选
AI 绑定名：ai，可选，验证码识别需要
环境变量：domain、admin、jwt_secret
```

3. 将 Cloudflare Pages/Workers 的 GitHub 仓库指向本仓库，或同步本仓库代码到你自己的 fork。
4. 等 Cloudflare 自动构建并部署完成。
5. 部署完成后访问一次初始化地址：

```text
https://你的域名/api/init/你的jwt_secret
```

看到 `success` 即表示数据库字段和 KV 缓存已刷新。

6. 进入后台：

```text
系统设置 -> 邮件推送 -> Telegram 机器人
```

保存你的 Bot Token，并建议把自定义域填为：

```text
https://你的域名
```

7. 设置 Telegram Webhook：

```text
https://api.telegram.org/bot你的BotToken/setWebhook?url=https://你的域名/api/telegram/webhook&secret_token=你的jwt_secret
```

返回 `{"ok":true,...}` 即表示设置成功。

8. 进入后台：

```text
系统设置 -> 邮件推送 -> 指定邮箱转发
```

填写：

```text
指定邮箱：netflix@你的域名
TG chat_id：群组或个人 chat_id，例如 -1001234567890
管理员 Telegram ID：允许私聊机器人管理规则的用户 ID
关键词白名单：同户,存取码,旅行
关键词黑名单：reset,password,重置
```

保存后重新发送一封新邮件测试。历史邮件不会补发。

## 全新部署简版

如果你还没有部署过 Cloud Mail，可参考上游文档的 Cloudflare Dashboard 部署方式：

- 原版部署文档：[https://doc.skymail.ink/guide/dashboard.html](https://doc.skymail.ink/guide/dashboard.html)
- 本仓库地址：[https://github.com/Inklazy/cloud-mail](https://github.com/Inklazy/cloud-mail)

简略步骤：

1. Fork 本仓库。
2. 在 Cloudflare 创建 D1 数据库和 KV Namespace。
3. 在 Cloudflare Workers 中通过 GitHub 导入本仓库。
4. 配置绑定名：`db`、`kv`，可选 `r2`、`ai`。
5. 配置环境变量：`domain`、`admin`、`jwt_secret`。
6. 部署完成后访问 `/api/init/你的jwt_secret` 初始化。
7. 登录后台添加邮箱账号，并配置 Telegram 推送和指定邮箱转发。

## Telegram 命令

只有在指定邮箱规则中填写了“管理员 Telegram ID”的用户，才能私聊机器人执行命令。

```text
/list netflix@your-domain.com
/add netflix@your-domain.com black reset
/add netflix@your-domain.com white household
/add netflix@your-domain.com sender netflix.com
/add netflix@your-domain.com admin 123456789
/remove netflix@your-domain.com black reset
/reload netflix@your-domain.com
```

命令说明：

- `black`：关键词黑名单。
- `white`：关键词白名单。
- `sender`：发件人白名单。
- `admin`：管理员 Telegram ID。
- `/reload`：刷新 KV 中的设置缓存。

## 常见问题

### 群组收不到消息

先用 Telegram API 测试机器人是否能发群：

```text
https://api.telegram.org/bot你的BotToken/sendMessage?chat_id=群组chat_id&text=test
```

如果返回 `ok:true`，说明机器人和群权限正常。若 Cloud Mail 仍不推送，请检查：

- 指定邮箱规则中的 TG chat_id 是否是群组 ID，通常以 `-100` 开头。
- 机器人是否还在群里，并有发消息权限。
- 新邮件的收件人是否正好命中规则里的邮箱。
- Cloudflare Worker 日志中是否有 `转发 Telegram 失败`。

### `/api/init/...` 提示 `kv.put is not a function`

说明 Cloudflare 里的 `kv` 不是 KV Namespace 绑定，可能被误填成普通环境变量。请在 Worker 的 Bindings 中配置：

```text
KV Namespace 绑定名：kv
D1 Database 绑定名：db
```

绑定名必须小写且完全一致。

### 私聊能收到，群组收不到

请更新到本仓库最新版本。本版本已兼容 Telegram 群组按钮限制：私聊使用 `web_app` 按钮，群组使用普通 URL 按钮。

### 暴露了 Bot Token 或 jwt_secret 怎么办

Bot Token 泄露后请立即去 `@BotFather` 执行 `/revoke` 重新生成。`jwt_secret` 泄露后请在 Cloudflare 环境变量中更换，并重新访问 `/api/init/新的jwt_secret`。

## 原版 Cloud Mail 功能

本版本仍保留上游 Cloud Mail 的主要能力：

- Cloudflare Workers 部署，低成本运行。
- 多邮箱账号管理。
- 邮件接收、发送、附件收发。
- Telegram 全局邮件推送。
- 第三方邮箱转发。
- 全局邮件黑名单。
- Workers AI 验证码识别。
- R2 附件存储。
- RBAC 权限控制。
- Turnstile 人机验证。
- ECharts 数据统计。

## 技术栈

- 平台：[Cloudflare Workers](https://developers.cloudflare.com/workers/)
- Web 框架：[Hono](https://hono.dev/)
- ORM：[Drizzle](https://orm.drizzle.team/)
- 前端：[Vue 3](https://vuejs.org/)
- UI：[Element Plus](https://element-plus.org/)
- 缓存：[Cloudflare KV](https://developers.cloudflare.com/kv/)
- 数据库：[Cloudflare D1](https://developers.cloudflare.com/d1/)
- 文件存储：[Cloudflare R2](https://developers.cloudflare.com/r2/)
- 邮件发送：[Resend](https://resend.com/)

## 与上游的关系

本仓库是面向 Netflix/TG 转发场景的增强 fork。原项目请见：

- 上游仓库：[maillab/cloud-mail](https://github.com/maillab/cloud-mail)
- 上游文档：[doc.skymail.ink](https://doc.skymail.ink)

感谢原作者和 Cloud Mail 项目。

## 许可证

本项目继承上游，采用 [MIT](LICENSE) 许可证。


## 当前生产部署

- 仓库：`Inklazy/cloud-mail`，生产分支 `main`。
- 现有 Worker：`cloud-mail`，访问地址：https://mail.inklazy.com/。
- Cloudflare Workers Builds 根目录：`/mail-worker`；构建命令留空，部署命令：`npx wrangler deploy`。Wrangler 的自定义构建会安装并打包 `mail-vue`。
- D1、KV、AI 和邮件路由继续使用现有资源；运行时变量由 `keep_vars = true` 保留。不要把生产密钥放进 GitHub。
- 推送 `main` 后由 Cloudflare 自动部署。上游 GitHub Actions 部署流程仅保留手动触发，避免重复部署；日常维护无需配置 GitHub 部署密钥或再次初始化数据库。

本仓库从旧号当前源码 ZIP 迁移，保留 Netflix/TG 转发定制，不包含旧提交历史。
