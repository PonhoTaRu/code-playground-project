const problemTemplates = [
  {
    templateId: "hello-name",
    difficulty: "easy",
    type: "template",
    title: "ทักทายชื่อผู้ใช้",
    prompt: "อ่านชื่อจาก input 1 บรรทัด แล้วพิมพ์ว่า\nสวัสดี <ชื่อ>",
    hints: [
      "อ่านข้อความจาก input ให้ครบทั้งบรรทัด",
      "นำคำว่า สวัสดี ไปต่อกับชื่อ",
      "ระวังเว้นวรรคระหว่างคำว่า สวัสดี กับชื่อ"
    ],
    starter: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

// สร้างข้อความทักทาย แล้วแสดงผล
// ตัวอย่าง: สวัสดี มินท์
`,
    language: "javascript",
    generator: "helloName",
    validator: { type: "exact" },
    score: 10,
    revealDelaySec: 30,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

console.log("สวัสดี " + input);
`
  },

  {
    templateId: "sum-two-numbers",
    difficulty: "easy",
    type: "template",
    title: "ผลบวกของตัวเลขสองจำนวน",
    prompt: "รับตัวเลข 2 จำนวน คั่นด้วยช่องว่าง แล้วแสดงผลรวม",
    hints: [
      "ใช้ split(' ') แยกข้อมูลออกเป็น 2 ส่วน",
      "ใช้ map(Number) เพื่อแปลงข้อความเป็นตัวเลข",
      "นำตัวเลขทั้งสองมาบวกกันแล้วแสดงผล"
    ],
    starter: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

const [a, b] = input.split(" ").map(Number);

// หาผลรวมของ a และ b แล้วแสดงผล
`,
    language: "javascript",
    generator: "sumTwoNumbers",
    validator: { type: "number" },
    score: 10,
    revealDelaySec: 30,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

const [a, b] = input.split(" ").map(Number);
console.log(a + b);
`
  },

  {
    templateId: "multiply-two-numbers",
    difficulty: "easy",
    type: "template",
    title: "ผลคูณของตัวเลขสองจำนวน",
    prompt: "รับตัวเลข 2 จำนวน คั่นด้วยช่องว่าง แล้วแสดงผลคูณ",
    hints: [
      "แยกข้อมูลด้วย split(' ')",
      "แปลงเป็นตัวเลขก่อนคูณ",
      "นำค่าทั้งสองมาคูณกันแล้วแสดงผล"
    ],
    starter: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

const [a, b] = input.split(" ").map(Number);

// หาผลคูณของ a และ b แล้วแสดงผล
`,
    language: "javascript",
    generator: "multiplyTwoNumbers",
    validator: { type: "number" },
    score: 10,
    revealDelaySec: 30,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

const [a, b] = input.split(" ").map(Number);
console.log(a * b);
`
  },

  {
    templateId: "average-three-numbers",
    difficulty: "medium",
    type: "template",
    title: "ค่าเฉลี่ยของตัวเลขสามจำนวน",
    prompt: "รับตัวเลข 3 จำนวน คั่นด้วยช่องว่าง แล้วแสดงค่าเฉลี่ย",
    hints: [
      "แยกข้อมูลออกเป็น 3 ค่า",
      "นำทั้ง 3 ค่ามาบวกกัน",
      "นำผลรวมไปหารด้วย 3"
    ],
    starter: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

const [a, b, c] = input.split(" ").map(Number);

// หาผลรวมของ a, b, c
// จากนั้นหาค่าเฉลี่ย แล้วแสดงผล
`,
    language: "javascript",
    generator: "averageThreeNumbers",
    validator: { type: "number" },
    score: 20,
    revealDelaySec: 100,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

const [a, b, c] = input.split(" ").map(Number);
console.log((a + b + c) / 3);
`
  },

  {
    templateId: "max-of-two",
    difficulty: "easy",
    type: "template",
    title: "หาค่าที่มากกว่า",
    prompt: "รับตัวเลข 2 จำนวน คั่นด้วยช่องว่าง แล้วแสดงค่าที่มากกว่า",
    hints: [
      "เปรียบเทียบค่าทั้งสอง",
      "อาจใช้ if...else",
      "หรือใช้ Math.max ก็ได้"
    ],
    starter: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

const [a, b] = input.split(" ").map(Number);

// หาเลขที่มากกว่า ระหว่าง a กับ b
// แล้วแสดงผล
`,
    language: "javascript",
    generator: "maxOfTwo",
    validator: { type: "number" },
    score: 10,
    revealDelaySec: 30,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

const [a, b] = input.split(" ").map(Number);
console.log(Math.max(a, b));
`
  },

  {
    templateId: "even-or-odd",
    difficulty: "easy",
    type: "template",
    title: "เลขคู่หรือเลขคี่",
    prompt: "รับจำนวนเต็ม 1 จำนวน แล้วพิมพ์ว่า Even ถ้าเป็นเลขคู่ หรือ Odd ถ้าเป็นเลขคี่",
    hints: [
      "ใช้เครื่องหมาย % 2",
      "ถ้าเศษเป็น 0 แปลว่าเป็นเลขคู่",
      "ถ้าไม่ใช่ 0 แปลว่าเป็นเลขคี่"
    ],
    starter: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

const n = Number(input);

// ตรวจว่า n เป็นเลขคู่หรือเลขคี่
// แล้วพิมพ์ Even หรือ Odd
`,
    language: "javascript",
    generator: "evenOrOdd",
    validator: { type: "exact" },
    score: 10,
    revealDelaySec: 30,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

const n = Number(input);

if (n % 2 === 0) {
  console.log("Even");
} else {
  console.log("Odd");
}
`
  },

  {
    templateId: "celsius-to-fahrenheit",
    difficulty: "medium",
    type: "template",
    title: "แปลงอุณหภูมิ Celsius เป็น Fahrenheit",
    prompt: "รับค่าอุณหภูมิหน่วยเซลเซียส 1 จำนวน แล้วแสดงผลเป็นฟาเรนไฮต์ โดยใช้สูตร (C × 9/5) + 32",
    hints: [
      "แปลง input เป็นตัวเลขก่อน",
      "ใช้สูตร (C * 9 / 5) + 32",
      "แสดงค่าที่คำนวณได้ออกมา"
    ],
    starter: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

const c = Number(input);

// ใช้สูตรแปลง C เป็น F
// แล้วแสดงผลลัพธ์
`,
    language: "javascript",
    generator: "celsiusToFahrenheit",
    validator: { type: "number" },
    score: 20,
    revealDelaySec: 100,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

const c = Number(input);
console.log((c * 9) / 5 + 32);
`
  },

  {
    templateId: "rectangle-area",
    difficulty: "easy",
    type: "template",
    title: "หาพื้นที่สี่เหลี่ยมผืนผ้า",
    prompt: "รับค่าความกว้างและความยาว 2 จำนวน คั่นด้วยช่องว่าง แล้วแสดงพื้นที่สี่เหลี่ยมผืนผ้า",
    hints: [
      "แยกค่าความกว้างและความยาวออกจาก input",
      "พื้นที่ = กว้าง × ยาว",
      "อย่าลืมแปลงค่าที่อ่านได้เป็นตัวเลข"
    ],
    starter: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

const [width, height] = input.split(" ").map(Number);

// หาพื้นที่สี่เหลี่ยมผืนผ้า
// แล้วแสดงผล
`,
    language: "javascript",
    generator: "rectangleArea",
    validator: { type: "number" },
    score: 10,
    revealDelaySec: 30,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

const [width, height] = input.split(" ").map(Number);
console.log(width * height);
`
  },

  {
    templateId: "string-length",
    difficulty: "medium",
    type: "template",
    title: "นับจำนวนตัวอักษร",
    prompt: "อ่านข้อความ 1 บรรทัด แล้วแสดงจำนวนตัวอักษรทั้งหมด",
    hints: [
      "สตริงมี property ชื่อ length",
      "อ่านข้อความจาก input ให้ครบทั้งบรรทัด",
      "แสดงค่าความยาวของข้อความออกมา"
    ],
    starter: `const fs = require("fs");
const text = fs.readFileSync("/dev/stdin").toString().trim();

// หาจำนวนตัวอักษรของ text
// แล้วแสดงผล
`,
    language: "javascript",
    generator: "stringLength",
    validator: { type: "number" },
    score: 20,
    revealDelaySec: 30,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

console.log(input.length);
`
  },

  {
    templateId: "reverse-string",
    difficulty: "hard",
    type: "template",
    title: "กลับลำดับข้อความ",
    prompt: "อ่านข้อความ 1 บรรทัด แล้วแสดงข้อความนั้นในลำดับกลับกัน",
    hints: [
      "แปลงข้อความเป็น array ด้วย split('')",
      "ใช้ reverse() เพื่อกลับลำดับ",
      "ใช้ join('') เพื่อนำตัวอักษรมาต่อกันกลับเป็นข้อความ"
    ],
    starter: `const fs = require("fs");
const text = fs.readFileSync("/dev/stdin").toString().trim();

// กลับลำดับข้อความของ text
// แล้วแสดงผล
`,
    language: "javascript",
    generator: "reverseString",
    validator: { type: "exact" },
    score: 30,
    revealDelaySec: 30,
    exampleSolution: `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString().trim();

console.log(input.split("").reverse().join(""));
`
  }
];

module.exports = problemTemplates;