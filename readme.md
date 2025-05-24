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