# docker/Dockerfile.app

####################
# Development Stage
####################
FROM node:20-alpine AS development
WORKDIR /usr/src/app
# ติดตั้ง dependencies
COPY package*.json ./
RUN npm ci
# คัดลอก source code ทั้งหมด
COPY . .
# ใช้ user ธรรมดา (ปลอดภัยขึ้น)
USER node

################
# Build Stage
################
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY . .
# รัน build (จะคอมไพล์จาก src ไป dist)
RUN npm run build
# ตั้ง environment สำหรับ production
ENV NODE_ENV production
# ติดตั้งเฉพาะ production deps
RUN npm ci --only=production && npm cache clean --force
USER node

###################
# Production Stage
###################
FROM node:20-alpine AS production
WORKDIR /usr/src/app
# คัดลอก production deps และไฟล์ที่ build แล้วเท่านั้น
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/package*.json ./

# เพิ่มบรรทัดนี้เพื่อให้ Render รู้ว่ารันที่ port ไหน
EXPOSE 3000

# รันแอปจาก dist/main.js
CMD ["node", "dist/main.js"]