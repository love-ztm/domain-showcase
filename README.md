# oooooooooooo.cc.cd — 科技感域名展示站

赛博朋克风格的个人域名展示主页，带后台管理系统，支持内容在线编辑。

## 项目结构

```
domain-showcase/
├── public/                 # 前端静态资源
│   ├── index.html          # 主页
│   ├── admin.html          # 管理后台
│   ├── css/                # 样式
│   └── js/                 # 脚本
├── functions/api/          # Cloudflare Pages Functions
│   └── content.js          # API: GET/PUT/PATCH /api/content
├── data/content.json       # 本地开发数据存储
├── server.js               # Express 服务器（Docker 用）
├── wrangler.toml           # Cloudflare 配置
├── Dockerfile              # Docker 构建文件
└── package.json
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 访问 http://localhost:3000
# 后台 http://localhost:3000/admin.html
```

---

## 部署方式一：GitHub + Cloudflare Pages

### 1. 初始化 Git 仓库

```bash
cd domain-showcase
git init
git add .
git commit -m "init: domain showcase"
```

### 2. 推送到 GitHub

```bash
# 在 GitHub 创建仓库后：
git remote add origin https://github.com/你的用户名/domain-showcase.git
git branch -M main
git push -u origin main
```

### 3. 创建 Cloudflare KV 命名空间

```bash
# 安装 wrangler CLI（如果还没装）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 KV 命名空间
npx wrangler kv namespace create SITE_CONTENT
```

执行后会输出类似：
```
{binding = "SITE_CONTENT", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
```

### 4. 更新 wrangler.toml

将上面获取的 `id` 填入 `wrangler.toml`：
```toml
[[kv_namespaces]]
binding = "SITE_CONTENT"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 5. 连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 选择你的 GitHub 仓库
4. 配置：
   - **Production branch:** `main`
   - **Build command:** 留空（纯静态站，无需构建）
   - **Build output directory:** `public`
5. 点击 **Save and Deploy**

### 6. 绑定 KV 到 Pages

1. 在 Cloudflare Dashboard 进入你的 Pages 项目
2. **Settings** → **Functions** → **KV namespace bindings**
3. 添加绑定：
   - **Variable name:** `SITE_CONTENT`
   - **KV namespace:** 选择之前创建的 `SITE_CONTENT`
4. 重新部署项目

### 7. 自定义域名

1. **Settings** → **Custom domains**
2. 添加 `oooooooooooo.cc.cd`
3. 按提示配置 DNS

---

## 部署方式二：Docker（VPS 部署）

### 1. 上传项目到服务器

```bash
# 方式 A：通过 Git
git clone https://github.com/你的用户名/domain-showcase.git

# 方式 B：直接 scp
scp -r domain-showcase/ root@你的服务器IP:/opt/
```

### 2. 构建并运行

```bash
cd /opt/domain-showcase

# 构建镜像
docker build -t domain-showcase .

# 运行容器
docker run -d \
  --name domain-showcase \
  --restart always \
  -p 3000:3000 \
  domain-showcase
```

### 3. 验证

```bash
# 检查容器状态
docker ps

# 查看日志
docker logs domain-showcase

# 测试 API
curl http://localhost:3000/api/content
```

### 4. 用 Nginx 反向代理（可选）

如果需要通过域名访问，在 VPS 上配置 Nginx：

```nginx
server {
    listen 80;
    server_name oooooooooooo.cc.cd;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. 配置 HTTPS（可选）

```bash
# 使用 certbot 获取免费 SSL 证书
apt install certbot python3-certbot-nginx
certbot --nginx -d oooooooooooo.cc.cd
```

---

## 管理后台

访问 `/admin.html` 即可进入管理后台，支持可视化编辑：

| 板块 | 说明 |
|------|------|
| 首屏 | 域名标题、副标题、描述 |
| 关于 | 个人简介、头像、统计数据 |
| 技能 | 技能名称、熟练度、图标 |
| 项目 | 项目标题、描述、技术标签、链接 |
| 链接 | 社交媒体链接 |
| 页脚 | 页脚文字、实时时钟开关 |
| 主题 | 主色调、强调色、背景风格 |
| JSON编辑 | 直接编辑原始 JSON 数据 |

## License

ISC
