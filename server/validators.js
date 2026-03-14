function normalizeOutput(text = "") {
  return String(text)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n")
    .trim();
}

function exactMatch(actual, expected) {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

function numberMatch(actual, expected) {
  return Number(normalizeOutput(actual)) === Number(expected);
}

function validateOutput(actual, testCase, problem) {
  const type = problem.validator?.type || "exact";

  switch (type) {
    case "exact":
      return exactMatch(actual, testCase.expected);

    case "number":
      return numberMatch(actual, testCase.expected);

    default:
      return false;
  }
}

module.exports = {
  validateOutput
};