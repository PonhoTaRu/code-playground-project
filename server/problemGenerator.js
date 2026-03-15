const problemTemplates = require("./problemTemplates");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeProblem(template, samples, tests, promptOverride = null) {
  return {
    id: uniqueId(template.templateId),
    templateId: template.templateId,
    title: template.title,
    prompt: promptOverride || template.prompt,
    hints: template.hints || [],
    starter: template.starter || "",
    language: template.language || "javascript",
    samples,
    tests,
    validator: template.validator || { type: "exact" }
  };
}

function buildHelloNameProblem(template) {
  const names = ["มินท์", "ปาล์ม", "เจ", "นนท์", "ฟ้า", "ออม", "เมย์", "ต้น"];
  const n1 = randomChoice(names);
  const n2 = randomChoice(names.filter((n) => n !== n1));
  const n3 = randomChoice(names.filter((n) => n !== n1 && n !== n2));

  return makeProblem(
    template,
    [{ input: n1, output: `สวัสดี ${n1}` }],
    [
      { input: n1, expected: `สวัสดี ${n1}` },
      { input: n2, expected: `สวัสดี ${n2}` },
      { input: n3, expected: `สวัสดี ${n3}` }
    ]
  );
}

function buildSumTwoNumbersProblem(template) {
  const a1 = randomInt(1, 20), b1 = randomInt(1, 20);
  const a2 = randomInt(10, 50), b2 = randomInt(10, 50);
  const a3 = randomInt(50, 100), b3 = randomInt(50, 100);

  return makeProblem(
    template,
    [{ input: `${a1} ${b1}`, output: String(a1 + b1) }],
    [
      { input: `${a1} ${b1}`, expected: String(a1 + b1) },
      { input: `${a2} ${b2}`, expected: String(a2 + b2) },
      { input: `${a3} ${b3}`, expected: String(a3 + b3) }
    ]
  );
}

function buildMultiplyTwoNumbersProblem(template) {
  const a1 = randomInt(1, 10), b1 = randomInt(1, 10);
  const a2 = randomInt(2, 20), b2 = randomInt(2, 20);
  const a3 = randomInt(5, 30), b3 = randomInt(5, 30);

  return makeProblem(
    template,
    [{ input: `${a1} ${b1}`, output: String(a1 * b1) }],
    [
      { input: `${a1} ${b1}`, expected: String(a1 * b1) },
      { input: `${a2} ${b2}`, expected: String(a2 * b2) },
      { input: `${a3} ${b3}`, expected: String(a3 * b3) }
    ]
  );
}

function buildAverageThreeNumbersProblem(template) {
  const a1 = randomInt(1, 9), b1 = randomInt(1, 9), c1 = randomInt(1, 9);
  const a2 = randomInt(3, 15), b2 = randomInt(3, 15), c2 = randomInt(3, 15);
  const a3 = randomInt(6, 30), b3 = randomInt(6, 30), c3 = randomInt(6, 30);

  const avg = (a, b, c) => (a + b + c) / 3;

  return makeProblem(
    template,
    [{ input: `${a1} ${b1} ${c1}`, output: String(avg(a1, b1, c1)) }],
    [
      { input: `${a1} ${b1} ${c1}`, expected: String(avg(a1, b1, c1)) },
      { input: `${a2} ${b2} ${c2}`, expected: String(avg(a2, b2, c2)) },
      { input: `${a3} ${b3} ${c3}`, expected: String(avg(a3, b3, c3)) }
    ]
  );
}

function buildMaxOfTwoProblem(template) {
  const a1 = randomInt(1, 30), b1 = randomInt(1, 30);
  const a2 = randomInt(20, 60), b2 = randomInt(20, 60);
  const a3 = randomInt(50, 100), b3 = randomInt(50, 100);

  const mx = (a, b) => Math.max(a, b);

  return makeProblem(
    template,
    [{ input: `${a1} ${b1}`, output: String(mx(a1, b1)) }],
    [
      { input: `${a1} ${b1}`, expected: String(mx(a1, b1)) },
      { input: `${a2} ${b2}`, expected: String(mx(a2, b2)) },
      { input: `${a3} ${b3}`, expected: String(mx(a3, b3)) }
    ]
  );
}

function buildEvenOrOddProblem(template) {
  const n1 = randomInt(1, 20);
  const n2 = randomInt(21, 50);
  const n3 = randomInt(51, 100);

  const label = (n) => (n % 2 === 0 ? "Even" : "Odd");

  return makeProblem(
    template,
    [{ input: String(n1), output: label(n1) }],
    [
      { input: String(n1), expected: label(n1) },
      { input: String(n2), expected: label(n2) },
      { input: String(n3), expected: label(n3) }
    ]
  );
}

function buildCelsiusToFahrenheitProblem(template) {
  const c1 = randomInt(0, 20);
  const c2 = randomInt(21, 40);
  const c3 = randomInt(-10, 10);

  const convert = (c) => (c * 9) / 5 + 32;

  return makeProblem(
    template,
    [{ input: String(c1), output: String(convert(c1)) }],
    [
      { input: String(c1), expected: String(convert(c1)) },
      { input: String(c2), expected: String(convert(c2)) },
      { input: String(c3), expected: String(convert(c3)) }
    ]
  );
}

function buildRectangleAreaProblem(template) {
  const w1 = randomInt(1, 10), h1 = randomInt(1, 10);
  const w2 = randomInt(5, 20), h2 = randomInt(5, 20);
  const w3 = randomInt(10, 30), h3 = randomInt(10, 30);

  const area = (w, h) => w * h;

  return makeProblem(
    template,
    [{ input: `${w1} ${h1}`, output: String(area(w1, h1)) }],
    [
      { input: `${w1} ${h1}`, expected: String(area(w1, h1)) },
      { input: `${w2} ${h2}`, expected: String(area(w2, h2)) },
      { input: `${w3} ${h3}`, expected: String(area(w3, h3)) }
    ]
  );
}

function buildStringLengthProblem(template) {
  const words = [
    "hello",
    "javascript",
    "coding",
    "banana",
    "playground",
    "computer",
    "student",
    "practice"
  ];

  const s1 = randomChoice(words);
  const s2 = randomChoice(words.filter((w) => w !== s1));
  const s3 = randomChoice(words.filter((w) => w !== s1 && w !== s2));

  return makeProblem(
    template,
    [{ input: s1, output: String(s1.length) }],
    [
      { input: s1, expected: String(s1.length) },
      { input: s2, expected: String(s2.length) },
      { input: s3, expected: String(s3.length) }
    ]
  );
}

function buildReverseStringProblem(template) {
  const words = [
    "hello",
    "world",
    "coding",
    "banana",
    "student",
    "orange",
    "school",
    "planet"
  ];

  const s1 = randomChoice(words);
  const s2 = randomChoice(words.filter((w) => w !== s1));
  const s3 = randomChoice(words.filter((w) => w !== s1 && w !== s2));

  const reverse = (s) => s.split("").reverse().join("");

  return makeProblem(
    template,
    [{ input: s1, output: reverse(s1) }],
    [
      { input: s1, expected: reverse(s1) },
      { input: s2, expected: reverse(s2) },
      { input: s3, expected: reverse(s3) }
    ]
  );
}

function generateFromTemplate(template) {
  switch (template.generator) {
    case "helloName":
      return buildHelloNameProblem(template);
    case "sumTwoNumbers":
      return buildSumTwoNumbersProblem(template);
    case "multiplyTwoNumbers":
      return buildMultiplyTwoNumbersProblem(template);
    case "averageThreeNumbers":
      return buildAverageThreeNumbersProblem(template);
    case "maxOfTwo":
      return buildMaxOfTwoProblem(template);
    case "evenOrOdd":
      return buildEvenOrOddProblem(template);
    case "celsiusToFahrenheit":
      return buildCelsiusToFahrenheitProblem(template);
    case "rectangleArea":
      return buildRectangleAreaProblem(template);
    case "stringLength":
      return buildStringLengthProblem(template);
    case "reverseString":
      return buildReverseStringProblem(template);
    default:
      throw new Error(`Unknown generator: ${template.generator}`);
  }
}

function generateProblems(count = 3) {
  const selectedTemplates = shuffle(problemTemplates).slice(0, count);
  return selectedTemplates.map(generateFromTemplate);
}

module.exports = {
  generateProblems,
  generateFromTemplate
};