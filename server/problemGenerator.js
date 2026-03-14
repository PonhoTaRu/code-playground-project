const problemTemplates = require("./problemTemplates");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildStaticProblem(template) {
  return {
    id: template.templateId,
    templateId: template.templateId,
    title: template.title,
    prompt: template.prompt,
    hints: template.hints || [],
    starter: template.starter || "",
    language: template.language || "javascript",
    samples: template.samples || [],
    tests: template.tests || [],
    validator: template.validator || { type: "exact" }
  };
}

function buildMultiplyProblem(template) {
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);

  const a2 = randomInt(5, 20);
  const b2 = randomInt(5, 20);

  return {
    id: `${template.templateId}-${Date.now()}`,
    templateId: template.templateId,
    title: template.title,
    prompt: template.prompt,
    hints: template.hints || [],
    starter: template.starter || "",
    language: template.language || "javascript",
    samples: [
      { input: `${a} ${b}`, output: String(a * b) }
    ],
    tests: [
      { input: `${a} ${b}`, expected: String(a * b) },
      { input: `${a2} ${b2}`, expected: String(a2 * b2) }
    ],
    validator: template.validator
  };
}

function generateFromTemplate(template) {
  if (template.type === "static") {
    return buildStaticProblem(template);
  }

  if (template.generator === "multiplyTwoNumbers") {
    return buildMultiplyProblem(template);
  }

  throw new Error("Unknown template");
}

function generateProblems(count = 3) {
  const selected = shuffle(problemTemplates).slice(0, count);
  return selected.map(generateFromTemplate);
}

module.exports = {
  generateProblems
};