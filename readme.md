1.nest g resource <folder name> => คำสั่งสร้างโฟลเดอร์ให้เสร็จสรรพ พร้อม 
    - service(เป็นฟังก์ชันทำงาน),
    - controller(เหมือน route และเรียกใช้ service),
    - module(ตัวเชื่อม service กับ controller) และ 
    - entity(model ของ database),
    - dto(เหมือนตัวกรองข้อมูลก่อนเข้า)
2.relation => oneToMany กับ manyToOne ต้องใช้ด้วยกัน เช่น user <oneToMany> order และ order <manyToOne> user
    ซึ่ง table ที่จะเก็บ fk คือฝั่ง many, ฝั่ง one เอาไว้ชี้เฉยๆ
    ManyToMany ถ้าใช้แค่เชื่อม id ของ 2 ตาราง ไม่ต้องสร้าง resource ใหม่ ใช้ ManyToMany เชื่อมทั้ง 2 ตาราง แล้วใช้ JoinTable ที่ตารางหลัก
    แล้วเก็บ id ของตารางหลักตรง joinColumm และของอีกอันตรง inverseJoinColumn

<!-- Docker -->
1.สร้าง postgres ผ่าน cml
    - เปิด docket desktop แล้วใช้คำสั่ง => docker run --name nest-shaved-ice_postgres -e POSTGRES_PASSWORD=nest_shaved_ice -p 5431:5432 -d postgres
    - https://www.youtube.com/watch?v=Hs9Fh1fr5s8 : คลิปสอน
    - register server ของ docker เข้ามาเลยใน pgAdmin ตามที่สร้างไว้
2.เอา code ขึ้น docker
    - ถ้ามีการแก้โค้ดต้อง build ใหม่ => docker-compose up --build
    - รัน api : docker-compose up เพื่อรันใหม้ ถ้าแก้แค่ .env
    - docker exec -it nest_app sh ใช้ในการเข้าถึง nest-app บน docker แล้วค่อยใช้คำสั่งพวก migration, seeder นู่นนี่
    - docker cp nest_app:/usr/src/app ./source-code คัดลอกไฟล์จาก docker ที่อยู่ใน usr/src/app ออกมาอยู่ในโฟลเดอร์ source-code
