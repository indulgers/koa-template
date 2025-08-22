FROM node:18.20.4-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json ./
COPY pnpm-lock.yaml* ./

# 安装 pnpm
RUN npm install -g pnpm@latest

# 复制源代码 (在安装依赖之前)
COPY . .

# 安装所有依赖 (包括 devDependencies)
RUN pnpm install

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["pnpm", "start"]