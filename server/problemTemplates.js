const starterJS = `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

// เขียนโค้ดที่นี่
`;

const problemTemplates = [
  {
    templateId: "hello-name",
    difficulty: "easy",
    type: "template",
    title: "ทักทายชื่อผู้ใช้",
    prompt: "อ่านชื่อจาก input 1 บรรทัด แล้วพิมพ์ว่า\nสวัสดี <ชื่อ>",
    hints: [
      "อ่านข้อมูลจาก input",
      "นำข้อความ สวัสดี ไปต่อกับชื่อ"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "helloName",
    validator: { type: "exact" },
    score: 10
  },

  {
    templateId: "sum-two-numbers",
    difficulty: "easy",
    type: "template",
    title: "ผลบวกของตัวเลขสองจำนวน",
    prompt: "รับตัวเลข 2 จำนวน คั่นด้วยช่องว่าง แล้วแสดงผลรวม",
    hints: [
      "ใช้ split(' ') แยกข้อมูล",
      "แปลงข้อความเป็นตัวเลขก่อนบวก"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "sumTwoNumbers",
    validator: { type: "number" },
    score: 10
  },

  {
    templateId: "multiply-two-numbers",
    difficulty: "easy",
    type: "template",
    title: "ผลคูณของตัวเลขสองจำนวน",
    prompt: "รับตัวเลข 2 จำนวน คั่นด้วยช่องว่าง แล้วแสดงผลคูณ",
    hints: [
      "ใช้ split(' ') แยกข้อมูล",
      "แปลงข้อความเป็นตัวเลขก่อนคูณ"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "multiplyTwoNumbers",
    validator: { type: "number" },
    score: 10
  },

  {
    templateId: "average-three-numbers",
    difficulty: "medium",
    type: "template",
    title: "ค่าเฉลี่ยของตัวเลขสามจำนวน",
    prompt: "รับตัวเลข 3 จำนวน คั่นด้วยช่องว่าง แล้วแสดงค่าเฉลี่ย",
    hints: [
      "นำตัวเลขทั้ง 3 มาบวกกัน",
      "หารด้วย 3"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "averageThreeNumbers",
    validator: { type: "number" },
    score: 20
  },

  {
    templateId: "max-of-two",
    difficulty: "easy",
    type: "template",
    title: "หาค่าที่มากกว่า",
    prompt: "รับตัวเลข 2 จำนวน คั่นด้วยช่องว่าง แล้วแสดงค่าที่มากกว่า",
    hints: [
      "เปรียบเทียบตัวเลขทั้งสอง",
      "อาจใช้ if หรือ Math.max"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "maxOfTwo",
    validator: { type: "number" },
    score: 10
  },

  {
    templateId: "even-or-odd",
    difficulty: "easy",
    type: "template",
    title: "เลขคู่หรือเลขคี่",
    prompt: "รับจำนวนเต็ม 1 จำนวน แล้วพิมพ์ว่า Even ถ้าเป็นเลขคู่ หรือ Odd ถ้าเป็นเลขคี่",
    hints: [
      "ใช้ % 2",
      "ถ้าเศษเป็น 0 คือเลขคู่"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "evenOrOdd",
    validator: { type: "exact" },
    score: 10
  },

  {
    templateId: "celsius-to-fahrenheit",
    difficulty: "medium",
    type: "template",
    title: "แปลงอุณหภูมิ Celsius เป็น Fahrenheit",
    prompt: "รับค่าอุณหภูมิหน่วยเซลเซียส 1 จำนวน แล้วแสดงผลเป็นฟาเรนไฮต์ โดยใช้สูตร (C × 9/5) + 32",
    hints: [
      "ใช้สูตร (C * 9 / 5) + 32",
      "แปลง input เป็นตัวเลขก่อน"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "celsiusToFahrenheit",
    validator: { type: "number" },
    score: 20
  },

  {
    templateId: "rectangle-area",
    difficulty: "easy",
    type: "template",
    title: "หาพื้นที่สี่เหลี่ยมผืนผ้า",
    prompt: "รับค่าความกว้างและความยาว 2 จำนวน คั่นด้วยช่องว่าง แล้วแสดงพื้นที่สี่เหลี่ยมผืนผ้า",
    hints: [
      "พื้นที่ = กว้าง × ยาว",
      "อย่าลืมแปลงเป็นตัวเลข"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "rectangleArea",
    validator: { type: "number" },
    score: 10
  },

  {
    templateId: "string-length",
    difficulty: "medium",
    type: "template",
    title: "นับจำนวนตัวอักษร",
    prompt: "อ่านข้อความ 1 บรรทัด แล้วแสดงจำนวนตัวอักษรทั้งหมด",
    hints: [
      "สตริงมี property ชื่อ length",
      "อ่านข้อความจาก input ให้ครบทั้งบรรทัด"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "stringLength",
    validator: { type: "number" },
    score: 20
  },

  {
    templateId: "reverse-string",
    difficulty: "hard",
    type: "template",
    title: "กลับลำดับข้อความ",
    prompt: "อ่านข้อความ 1 บรรทัด แล้วแสดงข้อความนั้นในลำดับกลับกัน",
    hints: [
      "อาจใช้ split(''), reverse(), join('')",
      "อ่านข้อความจาก input ให้ครบก่อน"
    ],
    starter: starterJS,
    language: "javascript",
    generator: "reverseString",
    validator: { type: "exact" },
    score: 30
  }
];

module.exports = problemTemplates;