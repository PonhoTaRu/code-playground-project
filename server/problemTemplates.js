function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSumProblem() {
  const a = randInt(1, 50);
  const b = randInt(1, 50);

  return {
    id: `sum-two-${a}-${b}`,
    title: "บวกเลขสองจำนวน",
    prompt: "รับตัวเลขสองจำนวนที่คั่นด้วยช่องว่าง แล้วพิมพ์ผลรวมของมัน",
    tests: [
      { in: `${a} ${b}`, out: String(a + b) },
      { in: `${b} ${a}`, out: String(a + b) }
    ],
    hints: [
      "ใช้ input().split() เพื่อแยกข้อมูล",
      "แปลงค่าด้วย int ก่อนบวก",
      "พิมพ์ผลลัพธ์ด้วย print(a + b)"
    ],
    starter: "a, b = map(int, input().split())\nprint(a + b)"
  };
}

function generateMultiplyProblem() {
  const a = randInt(1, 20);
  const b = randInt(1, 20);

  return {
    id: `multiply-two-${a}-${b}`,
    title: "คูณเลขสองจำนวน",
    prompt: "รับตัวเลขสองจำนวนที่คั่นด้วยช่องว่าง แล้วพิมพ์ผลคูณของมัน",
    tests: [
      { in: `${a} ${b}`, out: String(a * b) },
      { in: `${b} ${a}`, out: String(a * b) }
    ],
    hints: [
      "อ่านค่าจาก input().split()",
      "ใช้ int() แปลงเป็นตัวเลข",
      "ใช้เครื่องหมาย * ในการคูณ"
    ],
    starter: "a, b = map(int, input().split())\nprint(a * b)"
  };
}

function generateEvenOddProblem() {
  const n = randInt(1, 100);

  return {
    id: `even-odd-${n}`,
    title: "เลขคู่หรือเลขคี่",
    prompt: "รับจำนวนเต็มหนึ่งจำนวน แล้วพิมพ์ Even ถ้าเป็นเลขคู่ หรือ Odd ถ้าเป็นเลขคี่",
    tests: [
      { in: `${n}`, out: n % 2 === 0 ? "Even" : "Odd" },
      { in: `${n + 1}`, out: (n + 1) % 2 === 0 ? "Even" : "Odd" }
    ],
    hints: [
      "ใช้ % 2 เพื่อตรวจเลขคู่คี่",
      "ถ้าเศษเป็น 0 แปลว่าเป็นเลขคู่",
      "ใช้ if ... else"
    ],
    starter: "n = int(input())\nif n % 2 == 0:\n    print('Even')\nelse:\n    print('Odd')"
  };
}

const templates = [
  generateSumProblem,
  generateMultiplyProblem,
  generateEvenOddProblem
];

function generateRandomProblems(count = 3) {
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(fn => fn());
}

const problemTemplates = [
  {
    templateId: "hello-name",
    type: "static",
    title: "ทักทายชื่อผู้ใช้",
    prompt: "อ่านชื่อจาก input 1 บรรทัด แล้วพิมพ์ว่า\nสวัสดี <ชื่อ>",
    hints: ["อ่านค่าจาก input", "นำชื่อมาต่อกับคำว่า สวัสดี"],
    starter: `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

console.log("สวัสดี " + input);
`,
    language: "javascript",
    samples: [{ input: "มินท์", output: "สวัสดี มินท์" }],
    tests: [
      { input: "มินท์", expected: "สวัสดี มินท์" },
      { input: "ปาล์ม", expected: "สวัสดี ปาล์ม" }
    ],
    validator: { type: "exact" }
  }
];

module.exports = problemTemplates;