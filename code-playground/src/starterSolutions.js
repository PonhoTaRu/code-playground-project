// starterSolutions.js
// โค้ดเริ่มต้นสำหรับผู้เริ่มต้น (มี TODO ให้เติม)
// แต่ละ entry เป็น string ที่แสดงใน Editor เป็นค่าเริ่มต้น

const starterSolutions = {
  "hello-world": `// สวัสดีโลก: พิมพ์คำว่า "สวัสดีโลก" ออกทางหน้าจอ
console.log("สวัสดีโลก");`,

  "greet-yourself": `// ทักทายตัวเอง: แก้ชื่อเป็นชื่อของคุณ
const name = "มินท์"; // TODO: แก้ชื่อของคุณที่นี่
console.log("สวัสดี " + name);`,

  "repeat-3": `// พิมพ์คำว่า "สวัสดี" 3 ครั้ง (ขึ้นบรรทัดละหนึ่งครั้ง)
console.log("สวัสดี");
console.log("สวัสดี");
console.log("สวัสดี");`,

  "simple-add": `// ประกาศตัวแปรสองตัว แล้วพิมพ์ผลลัพธ์ในรูปแบบ "5 + 7 = 12"
const a = 5;
const b = 7;
// TODO: แสดงผลรูปแบบ "a + b = sum"
console.log(a + " + " + b + " = " + (a + b));`,

  "my-age": `// คำนวณอายุจากปีปัจจุบันและปีเกิด
const yearNow = 2025;
const birthYear = 2005;
// TODO: คำนวณอายุและพิมพ์ "ฉันอายุ X ปี"
const age = yearNow - birthYear;
console.log("ฉันอายุ " + age + " ปี");`,

  "sum-scores": `// รวมคะแนนจาก 3 วิชา
const s1 = 25;
const s2 = 30;
const s3 = 20;
// TODO: รวมคะแนนทั้งหมดและพิมพ์ "คะแนนรวมคือ X"
const total = s1 + s2 + s3;
console.log("คะแนนรวมคือ " + total);`,

  "concat-intro": `// ต่อข้อความจากตัวแปรชื่อและอาชีพ
const name = "มินท์";
const job = "นักเรียน";
// TODO: ต่อเป็นประโยคและพิมพ์ออกมา
console.log("สวัสดี ฉันชื่อ " + name + " ฉันเป็น" + " " + job);`,

  "multiline-days": `// แสดงหลายบรรทัด
console.log("วันจันทร์");
console.log("วันอังคาร");
console.log("วันพุธ");`,

  "name-length": `// นับจำนวนตัวอักษรในชื่อ
const myName = "มินท์"; // TODO: เปลี่ยนเป็นชื่อของคุณ
// TODO: พิมพ์ "ชื่อของฉันมี X ตัวอักษร"
console.log("ชื่อของฉันมี " + myName.length + " ตัวอักษร");`,

  "star-pattern": `// พิมพ์ลวดลายตัวอักษร
console.log("*");
console.log("**");
console.log("***");`
};

export default starterSolutions;
