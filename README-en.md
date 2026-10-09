<p align="center">
    <img src="doc/demo/logo.png" width="80px" />
    <h1 align="center">Cloud Mail Netflix/TG Forwarding Edition</h1>
    <p align="center">A Cloudflare Workers based mail service with targeted Telegram forwarding for dedicated inboxes.</p>
    <p align="center">
       <a href="/README.md" style="margin-left: 5px">简体中文</a> | English
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

## About

This repository is a fork of [maillab/cloud-mail](https://github.com/maillab/cloud-mail), based on the v3.0.0 series. It keeps the original Cloud Mail features and adds targeted Telegram forwarding for dedicated recipient addresses such as:

```text
netflix@example.com -> Telegram group or private chat
```

It is intended for users who want domain-based Netflix account mailboxes with faster Telegram delivery than IMAP polling workflows.

## Added Features

- Targeted Telegram forwarding by recipient address.
- Per-address Telegram chat IDs, including groups and supergroups.
- Per-address Telegram admin IDs for private bot commands.
- Sender whitelist, keyword whitelist, keyword blacklist.
- Block notices with summary only, without forwarding sensitive body text.
- Telegram private commands: `/list`, `/add`, `/remove`, `/reload`.
- Compatible `View` button: web app button in private chats, URL button in groups.
- Data-safe upgrade: only adds `setting.forward_rules`; existing mail, accounts, users, and attachments are preserved.
- Coexists with Cloud Mail v3 global mail blacklist.

## Filtering Order

1. Sender whitelist is checked first when it is not empty.
2. Keyword whitelist allows the message immediately.
3. Keyword blacklist blocks the Telegram forwarding.
4. If nothing matches, forwarding is allowed.

The mail is still stored in Cloud Mail. These rules only control Telegram forwarding.

## Upgrade Guide

For an existing Cloud Mail deployment:

1. Back up your Cloudflare D1 database.
2. Keep your current Worker, custom domain, D1/KV/R2 resources, and environment variables.
3. Make sure bindings keep these names:

```text
D1 binding: db
KV binding: kv
R2 binding: r2, optional
AI binding: ai, optional
Environment variables: domain, admin, jwt_secret
```

4. Deploy this fork through your existing Cloudflare GitHub deployment.
5. Visit:

```text
https://your-domain/api/init/your_jwt_secret
```

6. In the admin panel, save your Telegram bot token under:

```text
System Settings -> Email Push -> Telegram Bot
```

7. Set the Telegram webhook:

```text
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://your-domain/api/telegram/webhook&secret_token=your_jwt_secret
```

8. Configure targeted forwarding under:

```text
System Settings -> Email Push -> Targeted Forwarding
```

## Telegram Commands

Only Telegram users listed as admins in a targeted forwarding rule can use these private bot commands:

```text
/list netflix@example.com
/add netflix@example.com black reset
/add netflix@example.com white household
/add netflix@example.com sender netflix.com
/add netflix@example.com admin 123456789
/remove netflix@example.com black reset
/reload netflix@example.com
```

## Original Cloud Mail Features

This fork still keeps the original Cloud Mail feature set:

- Cloudflare Workers deployment.
- Multiple domain mailboxes.
- Mail receiving and sending.
- Attachments with R2 storage.
- Telegram global forwarding.
- External email forwarding.
- Global mail blacklist.
- Workers AI code recognition.
- RBAC permissions.
- Turnstile verification.
- ECharts statistics.

## Upstream

- Original project: [maillab/cloud-mail](https://github.com/maillab/cloud-mail)
- Original documentation: [doc.skymail.ink](https://doc.skymail.ink)

Thanks to the original Cloud Mail project.

## License

This project is licensed under the [MIT](LICENSE) License.
