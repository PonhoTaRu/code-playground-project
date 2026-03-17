✅ การเตรียมตัวก่อนรันโปรเจกต์
1. ติดตั้งโปรแกรมที่จำเป็น

Node.js (แนะนำ v18+)
npm

2. เตรียมโปรเจกต์
แตกไฟล์โปรเจกต์

โครงสร้างต้องมี:

code-playground/ (Frontend)

server/ (Backend)

3. ติดตั้ง dependencies

ฝั่ง Backend:

cd server
npm install

ฝั่ง Frontend:

cd code-playground
npm install
4. ตั้งค่า Judge0 API

สมัคร RapidAPI (Judge0)

นำ API Key ไปใส่ใน .env หรือ server.js

5. รันระบบ

รัน Backend:

node server.js

รัน Frontend:

npm run dev
6. ตรวจสอบการเชื่อมต่อ

Frontend ต้องเรียก API ไปที่ Backend ถูก (เช่น localhost:3000)

Backend ต้องเชื่อม Judge0 ได้

7. ทดสอบการทำงาน

สมัคร / Login

เขียนโค้ด

กด Run / Submit แล้วมีผลลัพธ์
