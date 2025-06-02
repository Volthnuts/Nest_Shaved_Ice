# -------------------------------
# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# ติดตั้ง dependency
COPY package*.json ./
RUN npm install --legacy-peer-deps

# คัดลอก source code
COPY . .

# Build TypeScript
RUN npm run build

# -------------------------------
# Production Stage
FROM node:20-alpine AS production

WORKDIR /app

# คัดลอกเฉพาะสิ่งที่จำเป็นจาก builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# ตั้งค่า environment และ port
ENV NODE_ENV=production
EXPOSE 3000

# เริ่มแอป
CMD ["node", "dist/main"]
