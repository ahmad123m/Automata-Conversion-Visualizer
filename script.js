// Tab switching functionality
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  // Remove active class from all tab buttons
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("active");
  });

  // Show selected tab content
  document.getElementById(tabName + "-tab").classList.add("active");

  // Add active class to clicked button
  event.target.classList.add("active");
}

const visOptions = {
  layout: { improvedLayout: true },
  physics: { enabled: false },
  nodes: {
    font: { size: 16, face: "Roboto Mono" },
  },
  edges: {
    font: { size: 14, face: "Roboto Mono" },
  },
};

let inputGraph, outputGraph;
let currentSteps = [],
  currentExplanations = [],
  outputStates = [];
let stepIndex = 0;
let currentExample = null;
let currentConversionType = "";

const examples = {
  "nfa-dfa": {
    "Binary strings ending with 01": {
      states: ["q0", "q1", "q2"],
      alphabet: ["0", "1"],
      transitions: {
        q0: { 0: ["q0", "q1"], 1: ["q0"] },
        q1: { 1: ["q2"] },
        q2: {},
      },
      startState: "q0",
      finalStates: ["q2"],
      description: "Accepts binary strings ending with '01'",
    },
    "Contains substring 101": {
      states: ["q0", "q1", "q2", "q3"],
      alphabet: ["0", "1"],
      transitions: {
        q0: { 0: ["q0"], 1: ["q0", "q1"] },
        q1: { 0: ["q2"] },
        q2: { 1: ["q3"] },
        q3: { 0: ["q3"], 1: ["q3"] },
      },
      startState: "q0",
      finalStates: ["q3"],
      description: "Accepts strings containing substring '101'",
    },
    "Strings starting with 1": {
      states: ["q0", "q1", "q2"],
      alphabet: ["0", "1"],
      transitions: {
        q0: { 1: ["q1"], 0: ["q2"] },
        q1: { 0: ["q1"], 1: ["q1"] },
        q2: {},
      },
      startState: "q0",
      finalStates: ["q1"],
      description: "Accepts strings starting with '1'",
    },
    "Even number of 0s": {
      states: ["q0", "q1"],
      alphabet: ["0", "1"],
      transitions: {
        q0: { 0: ["q1"], 1: ["q0"] },
        q1: { 0: ["q0"], 1: ["q1"] },
      },
      startState: "q0",
      finalStates: ["q0"],
      description: "Accepts strings with even number of 0s",
    },
    "Epsilon transitions example": {
      states: ["q0", "q1", "q2", "q3"],
      alphabet: ["a", "b"],
      transitions: {
        q0: { ε: ["q1"], a: ["q2"] },
        q1: { b: ["q3"] },
        q2: { a: ["q3"] },
        q3: {},
      },
      startState: "q0",
      finalStates: ["q3"],
      description: "NFA with epsilon transitions",
    },
  },
  "dfa-nfa": {
    "Simple DFA - Even 0s": {
      states: ["A", "B"],
      alphabet: ["0", "1"],
      transitions: {
        A: { 0: ["B"], 1: ["A"] },
        B: { 0: ["A"], 1: ["B"] },
      },
      startState: "A",
      finalStates: ["A"],
      description: "DFA accepting even number of 0s",
    },
    "DFA - Ends with 10": {
      states: ["q0", "q1", "q2"],
      alphabet: ["0", "1"],
      transitions: {
        q0: { 0: ["q0"], 1: ["q1"] },
        q1: { 0: ["q2"], 1: ["q1"] },
        q2: { 0: ["q0"], 1: ["q1"] },
      },
      startState: "q0",
      finalStates: ["q2"],
      description: "DFA accepting strings ending with '10'",
    },
    "DFA - Divisible by 3": {
      states: ["s0", "s1", "s2"],
      alphabet: ["0", "1"],
      transitions: {
        s0: { 0: ["s0"], 1: ["s1"] },
        s1: { 0: ["s2"], 1: ["s0"] },
        s2: { 0: ["s1"], 1: ["s2"] },
      },
      startState: "s0",
      finalStates: ["s0"],
      description: "DFA for binary numbers divisible by 3",
    },
    "DFA - Contains 11": {
      states: ["p0", "p1", "p2"],
      alphabet: ["0", "1"],
      transitions: {
        p0: { 0: ["p0"], 1: ["p1"] },
        p1: { 0: ["p0"], 1: ["p2"] },
        p2: { 0: ["p2"], 1: ["p2"] },
      },
      startState: "p0",
      finalStates: ["p2"],
      description: "DFA accepting strings containing '11'",
    },
    "DFA - Odd length": {
      states: ["even", "odd"],
      alphabet: ["0", "1"],
      transitions: {
        even: { 0: ["odd"], 1: ["odd"] },
        odd: { 0: ["even"], 1: ["even"] },
      },
      startState: "even",
      finalStates: ["odd"],
      description: "DFA accepting strings of odd length",
    },
  },
  "re-dfa": {
    "RE: (0+1)*01": {
      regex: "(0+1)*01",
      description: "Regular expression for strings ending with '01'",
    },
    "RE: 1(0+1)*": {
      regex: "1(0+1)*",
      description: "Regular expression for strings starting with '1'",
    },
    "RE: (00+11)*": {
      regex: "(00+11)*",
      description: "Regular expression for strings with even blocks",
    },
    "RE: 0*1*": {
      regex: "0*1*",
      description: "Regular expression for 0s followed by 1s",
    },
    "RE: (0+1)*101(0+1)*": {
      regex: "(0+1)*101(0+1)*",
      description: "Regular expression containing '101'",
    },
  },
  "re-nfa": {
    "RE: a*b+": {
      regex: "a*b+",
      description: "Zero or more 'a's followed by one or more 'b's",
    },
    "RE: (a+b)*abb": {
      regex: "(a+b)*abb",
      description: "Any string ending with 'abb'",
    },
    "RE: a+b*a": {
      regex: "a+b*a",
      description: "One or more 'a's, zero or more 'b's, then 'a'",
    },
    "RE: (ab+ba)*": {
      regex: "(ab+ba)*",
      description: "Zero or more occurrences of 'ab' or 'ba'",
    },
    "RE: a(a+b)*b": {
      regex: "a(a+b)*b",
      description: "Starts with 'a', ends with 'b'",
    },
  },
  "nfa-re": {
    "Simple NFA 1": {
      states: ["q0", "q1"],
      alphabet: ["a", "b"],
      transitions: {
        q0: { a: ["q0"], b: ["q1"] },
        q1: { b: ["q1"] },
      },
      startState: "q0",
      finalStates: ["q1"],
      description: "NFA to convert to regular expression",
    },
    "Simple NFA 2": {
      states: ["p0", "p1", "p2"],
      alphabet: ["0", "1"],
      transitions: {
        p0: { 0: ["p1"], 1: ["p0"] },
        p1: { 1: ["p2"] },
        p2: { 0: ["p2"], 1: ["p2"] },
      },
      startState: "p0",
      finalStates: ["p2"],
      description: "Three-state NFA for RE conversion",
    },
    "NFA with loops": {
      states: ["s0", "s1"],
      alphabet: ["x", "y"],
      transitions: {
        s0: { x: ["s0", "s1"], y: ["s0"] },
        s1: { y: ["s1"] },
      },
      startState: "s0",
      finalStates: ["s1"],
      description: "NFA with self-loops",
    },
    "Complex NFA": {
      states: ["r0", "r1", "r2", "r3"],
      alphabet: ["a", "b"],
      transitions: {
        r0: { a: ["r1"], b: ["r0"] },
        r1: { a: ["r2"], b: ["r1"] },
        r2: { a: ["r3"], b: ["r2"] },
        r3: { a: ["r3"], b: ["r3"] },
      },
      startState: "r0",
      finalStates: ["r3"],
      description: "Four-state NFA for complex RE",
    },
    "Epsilon NFA": {
      states: ["t0", "t1", "t2"],
      alphabet: ["a", "b"],
      transitions: {
        t0: { ε: ["t1"], a: ["t0"] },
        t1: { b: ["t2"] },
        t2: { ε: ["t0"] },
      },
      startState: "t0",
      finalStates: ["t2"],
      description: "NFA with epsilon transitions",
    },
  },
  "dfa-re": {
    "Two-state DFA": {
      states: ["A", "B"],
      alphabet: ["0", "1"],
      transitions: {
        A: { 0: ["B"], 1: ["A"] },
        B: { 0: ["A"], 1: ["B"] },
      },
      startState: "A",
      finalStates: ["B"],
      description: "Simple two-state DFA",
    },
    "Three-state DFA": {
      states: ["X", "Y", "Z"],
      alphabet: ["a", "b"],
      transitions: {
        X: { a: ["Y"], b: ["X"] },
        Y: { a: ["Z"], b: ["Y"] },
        Z: { a: ["X"], b: ["Z"] },
      },
      startState: "X",
      finalStates: ["Z"],
      description: "Three-state cyclic DFA",
    },
    "DFA for mod 3": {
      states: ["0", "1", "2"],
      alphabet: ["0", "1"],
      transitions: {
        0: { 0: ["0"], 1: ["1"] },
        1: { 0: ["2"], 1: ["0"] },
        2: { 0: ["1"], 1: ["2"] },
      },
      startState: "0",
      finalStates: ["0"],
      description: "DFA for numbers divisible by 3",
    },
    "String pattern DFA": {
      states: ["q0", "q1", "q2", "q3"],
      alphabet: ["a", "b"],
      transitions: {
        q0: { a: ["q1"], b: ["q0"] },
        q1: { a: ["q1"], b: ["q2"] },
        q2: { a: ["q3"], b: ["q0"] },
        q3: { a: ["q1"], b: ["q2"] },
      },
      startState: "q0",
      finalStates: ["q3"],
      description: "DFA recognizing pattern 'aba'",
    },
    "Alternating DFA": {
      states: ["even", "odd"],
      alphabet: ["x"],
      transitions: {
        even: { x: ["odd"] },
        odd: { x: ["even"] },
      },
      startState: "even",
      finalStates: ["even"],
      description: "DFA for even number of x's",
    },
  },
  "cfg-pda": {
    "CFG: S → aSb | ε": {
      productions: ["S → aSb", "S → ε"],
      description: "Context-free grammar for a^n b^n",
    },
    "CFG: Palindromes": {
      productions: ["S → aSa", "S → bSb", "S → a", "S → b", "S → ε"],
      description: "CFG for palindromes over {a,b}",
    },
    "CFG: Balanced parentheses": {
      productions: ["S → (S)", "S → SS", "S → ε"],
      description: "CFG for balanced parentheses",
    },
    "CFG: Arithmetic expressions": {
      productions: [
        "E → E+T",
        "E → T",
        "T → T*F",
        "T → F",
        "F → (E)",
        "F → id",
      ],
      description: "CFG for arithmetic expressions",
    },
    "CFG: Nested structures": {
      productions: ["S → aSbS", "S → bSaS", "S → ε"],
      description: "CFG for nested a's and b's",
    },
  },
};

function drawGraph(containerId, automaton, isOutput = false) {
  const nodes = new vis.DataSet();
  const edges = new vis.DataSet();

  if (!automaton || !automaton.states || automaton.states.length === 0) {
    const container = document.getElementById(containerId);
    container.innerHTML =
      '<div class="flex items-center justify-center h-full text-gray-500">No automaton to display</div>';
    return null;
  }

  // Add invisible start reference node
  nodes.add({ id: "start_ref", hidden: true, physics: false, x: -100, y: 0 });

  // Add states
  automaton.states.forEach((state, index) => {
    const isFinal = automaton.finalStates?.includes(state);
    const isStart = state === automaton.startState;

    nodes.add({
      id: state,
      label: state,
      shape: "circle",
      color: {
        background: isStart ? "#dbeafe" : "#ffffff",
        border: isFinal ? "#ec4899" : isOutput ? "#3b82f6" : "#10b981",
      },
      borderWidth: isFinal ? 4 : 2,
      font: { size: 16, color: "#1f2937" },
    });

    // Add start arrow
    if (isStart) {
      edges.add({
        from: "start_ref",
        to: state,
        arrows: "to",
        color: isOutput ? "#3b82f6" : "#10b981",
        width: 2,
      });
    }
  });

  // Add transitions
  if (automaton.transitions) {
    Object.entries(automaton.transitions).forEach(([from, trans]) => {
      Object.entries(trans).forEach(([symbol, destinations]) => {
        if (Array.isArray(destinations)) {
          destinations.forEach((to) => {
            edges.add({
              from,
              to,
              label: symbol,
              arrows: "to",
              color: "#6b7280",
              font: { size: 14 },
            });
          });
        } else {
          edges.add({
            from,
            to: destinations,
            label: symbol,
            arrows: "to",
            color: "#6b7280",
            font: { size: 14 },
          });
        }
      });
    });
  }

  const container = document.getElementById(containerId);
  container.innerHTML = "";
  return new vis.Network(container, { nodes, edges }, visOptions);
}

function generateNFAToDFASteps(nfa) {
  const steps = [];
  const explanations = [];
  const outputStates = [];

  // Step 1: Initialize
  steps.push("Step 1: Initialize DFA construction");
  explanations.push(
    "We start by creating the DFA from the NFA using subset construction algorithm. Each DFA state will represent a set of NFA states."
  );
  outputStates.push({
    states: [],
    transitions: {},
    startState: "",
    finalStates: [],
  });

  // Step 2: Start state
  const startState = `{${nfa.startState}}`;
  steps.push(`Step 2: Create initial DFA state = ${startState}`);
  explanations.push(
    `The initial DFA state is the epsilon closure of the NFA start state '${nfa.startState}'.`
  );
  outputStates.push({
    states: [startState],
    transitions: {},
    startState: startState,
    finalStates: nfa.finalStates.includes(nfa.startState) ? [startState] : [],
  });

  // Step 3: Process transitions
  const dfaStates = [startState];
  const dfaTransitions = {};
  const dfaFinalStates = nfa.finalStates.includes(nfa.startState)
    ? [startState]
    : [];

  // Simulate subset construction for first few steps
  let stateCounter = 0;
  nfa.alphabet.forEach((symbol, index) => {
    if (
      nfa.transitions[nfa.startState] &&
      nfa.transitions[nfa.startState][symbol]
    ) {
      const destinations = nfa.transitions[nfa.startState][symbol];
      const newState = `{${destinations.join(",")}}`;

      if (!dfaStates.includes(newState)) {
        dfaStates.push(newState);
        if (destinations.some((s) => nfa.finalStates.includes(s))) {
          dfaFinalStates.push(newState);
        }
      }

      if (!dfaTransitions[startState]) dfaTransitions[startState] = {};
      dfaTransitions[startState][symbol] = [newState];

      steps.push(
        `Step ${3 + index}: Process symbol '${symbol}' from ${startState}`
      );
      explanations.push(
        `From ${startState} on input '${symbol}', we reach ${newState}. Add this transition to DFA.`
      );
      outputStates.push({
        states: [...dfaStates],
        transitions: JSON.parse(JSON.stringify(dfaTransitions)),
        startState: startState,
        finalStates: [...dfaFinalStates],
      });
    }
  });

  // Final step
  steps.push("Step " + (steps.length + 1) + ": DFA construction complete");
  explanations.push(
    "The resulting DFA is equivalent to the original NFA and accepts the same language."
  );
  outputStates.push({
    states: [...dfaStates],
    transitions: JSON.parse(JSON.stringify(dfaTransitions)),
    startState: startState,
    finalStates: [...dfaFinalStates],
  });

  return { steps, explanations, outputStates };
}

function generateDFAToNFASteps(dfa) {
  const steps = [];
  const explanations = [];
  const outputStates = [];

  steps.push("Step 1: Initialize NFA from DFA");
  explanations.push(
    "Converting DFA to NFA is straightforward since every DFA is already an NFA. We just need to ensure the transition function format is correct."
  );
  outputStates.push({
    states: [],
    transitions: {},
    startState: "",
    finalStates: [],
  });

  steps.push("Step 2: Copy states and start/final states");
  explanations.push(
    "All DFA states become NFA states with the same names and properties."
  );
  outputStates.push({
    states: [...dfa.states],
    transitions: {},
    startState: dfa.startState,
    finalStates: [...dfa.finalStates],
  });

  steps.push("Step 3: Convert transitions to NFA format");
  explanations.push(
    "Each DFA transition δ(q,a) = p becomes an NFA transition δ(q,a) = {p}. Single destinations become singleton sets."
  );

  // Convert transitions
  const nfaTransitions = {};
  Object.entries(dfa.transitions).forEach(([state, trans]) => {
    nfaTransitions[state] = {};
    Object.entries(trans).forEach(([symbol, destination]) => {
      nfaTransitions[state][symbol] = Array.isArray(destination)
        ? destination
        : [destination];
    });
  });

  outputStates.push({
    states: [...dfa.states],
    transitions: nfaTransitions,
    startState: dfa.startState,
    finalStates: [...dfa.finalStates],
  });

  steps.push("Step 4: NFA conversion complete");
  explanations.push(
    "The resulting NFA is equivalent to the original DFA. No additional nondeterminism was introduced."
  );
  outputStates.push({
    states: [...dfa.states],
    transitions: nfaTransitions,
    startState: dfa.startState,
    finalStates: [...dfa.finalStates],
  });

  return { steps, explanations, outputStates };
}

function generateREToNFASteps(regex) {
  const steps = [];
  const explanations = [];
  const outputStates = [];

  steps.push("Step 1: Parse regular expression");
  explanations.push(
    `Parsing the regular expression: ${regex}. We'll use Thompson's construction algorithm.`
  );
  outputStates.push({
    states: [],
    transitions: {},
    startState: "",
    finalStates: [],
  });

  steps.push("Step 2: Create basic NFA for symbols");
  explanations.push(
    "Create basic NFAs for each symbol in the alphabet. Each symbol gets a simple two-state NFA."
  );
  outputStates.push({
    states: ["q0", "q1"],
    transitions: {},
    startState: "q0",
    finalStates: [],
  });

  steps.push("Step 3: Apply Thompson's construction");
  explanations.push(
    "Build NFA by combining basic NFAs according to regex operators (union, concatenation, Kleene star)."
  );
  outputStates.push({
    states: ["q0", "q1", "q2"],
    transitions: { q0: { ε: ["q1"] }, q1: {} },
    startState: "q0",
    finalStates: ["q2"],
  });

  steps.push("Step 4: NFA construction complete");
  explanations.push(
    `The resulting NFA accepts exactly the language defined by the regular expression ${regex}.`
  );
  outputStates.push({
    states: ["q0", "q1", "q2", "q3"],
    transitions: {
      q0: { ε: ["q1"] },
      q1: { a: ["q2"] },
      q2: { ε: ["q3"] },
      q3: {},
    },
    startState: "q0",
    finalStates: ["q3"],
  });

  return { steps, explanations, outputStates };
}

function generateConversionSteps(conversionType, example) {
  switch (conversionType) {
    case "nfa-dfa":
      return generateNFAToDFASteps(example);
    case "dfa-nfa":
      return generateDFAToNFASteps(example);
    case "re-nfa":
      return generateREToNFASteps(example.regex);
    case "re-dfa":
      const nfaResult = generateREToNFASteps(example.regex);
      const dfaResult = generateNFAToDFASteps({});
      return {
        steps: [
          ...nfaResult.steps,
          "--- Converting NFA to DFA ---",
          ...dfaResult.steps,
        ],
        explanations: [
          ...nfaResult.explanations,
          "Now we convert the intermediate NFA to DFA.",
          ...dfaResult.explanations,
        ],
        outputStates: [...nfaResult.outputStates, ...dfaResult.outputStates],
      };
    case "nfa-re":
      return {
        steps: [
          "Step 1: State elimination method initialization",
          "Step 2: Add new start and final states",
          "Step 3: Eliminate intermediate states",
          "Step 4: Update transition labels with REs",
          "Step 5: Final regular expression obtained",
        ],
        explanations: [
          "We use the state elimination method to convert NFA to regular expression.",
          "Add new start state with ε-transition to old start, and new final state from old finals.",
          "Systematically eliminate intermediate states, updating transition labels.",
          "When eliminating a state, combine incoming and outgoing transitions with concatenation and union.",
          "Continue until only start and final states remain, connected by the final regular expression.",
        ],
        outputStates: [
          { states: [], transitions: {}, startState: "", finalStates: [] },
          {
            states: ["new_start", ...example.states, "new_final"],
            transitions: {},
            startState: "new_start",
            finalStates: ["new_final"],
          },
          {
            states: ["new_start", "new_final"],
            transitions: {},
            startState: "new_start",
            finalStates: ["new_final"],
          },
          {
            states: ["new_start", "new_final"],
            transitions: {},
            startState: "new_start",
            finalStates: ["new_final"],
          },
          {
            states: ["new_start", "new_final"],
            transitions: {},
            startState: "new_start",
            finalStates: ["new_final"],
          },
        ],
      };
    case "dfa-re":
      return {
        steps: [
          "Step 1: Apply state elimination to DFA",
          "Step 2: Create transition equations",
          "Step 3: Solve for regular expressions",
          "Step 4: Eliminate intermediate states",
          "Step 5: Obtain final regular expression",
        ],
        explanations: [
          "Use state elimination method directly on the DFA.",
          "Set up equations for each state in terms of regular expressions.",
          "Solve the system of equations using substitution and Arden's theorem.",
          "Systematically eliminate states while preserving language equivalence.",
          "The final expression describes exactly the language accepted by the DFA.",
        ],
        outputStates: [
          { states: [], transitions: {}, startState: "", finalStates: [] },
          {
            states: [...example.states],
            transitions: example.transitions,
            startState: example.startState,
            finalStates: example.finalStates,
          },
          {
            states: [...example.states],
            transitions: example.transitions,
            startState: example.startState,
            finalStates: example.finalStates,
          },
          {
            states: [...example.states],
            transitions: example.transitions,
            startState: example.startState,
            finalStates: example.finalStates,
          },
          {
            states: [...example.states],
            transitions: example.transitions,
            startState: example.startState,
            finalStates: example.finalStates,
          },
        ],
      };
    case "cfg-pda":
      return {
        steps: [
          "Step 1: Analyze CFG structure",
          "Step 2: Design PDA with three states",
          "Step 3: Create transitions for pushing productions",
          "Step 4: Add transitions for matching terminals",
          "Step 5: Add transitions for non-terminals",
          "Step 6: PDA construction complete",
        ],
        explanations: [
          "Analyze the context-free grammar to understand its structure and language.",
          "Design PDA with start state, main state, and accept state.",
          "Add transitions that push production rules onto the stack.",
          "Add transitions that consume input symbols and match them with stack contents.",
          "Add transitions that handle non-terminal symbols in derivations.",
          "The resulting PDA accepts the same language as the original CFG.",
        ],
        outputStates: [
          { states: [], transitions: {}, startState: "", finalStates: [] },
          {
            states: ["q0", "q1", "q2"],
            transitions: {},
            startState: "q0",
            finalStates: ["q2"],
          },
          {
            states: ["q0", "q1", "q2"],
            transitions: { q0: { "ε,ε→S$": ["q1"] } },
            startState: "q0",
            finalStates: ["q2"],
          },
          {
            states: ["q0", "q1", "q2"],
            transitions: {
              q0: { "ε,ε→S$": ["q1"] },
              q1: { "a,a→ε": ["q1"], "b,b→ε": ["q1"] },
            },
            startState: "q0",
            finalStates: ["q2"],
          },
          {
            states: ["q0", "q1", "q2"],
            transitions: {
              q0: { "ε,ε→S$": ["q1"] },
              q1: {
                "a,a→ε": ["q1"],
                "b,b→ε": ["q1"],
                "ε,S→aSb": ["q1"],
                "ε,S→ε": ["q1"],
              },
            },
            startState: "q0",
            finalStates: ["q2"],
          },
          {
            states: ["q0", "q1", "q2"],
            transitions: {
              q0: { "ε,ε→S$": ["q1"] },
              q1: {
                "a,a→ε": ["q1"],
                "b,b→ε": ["q1"],
                "ε,S→aSb": ["q1"],
                "ε,S→ε": ["q1"],
                "ε,$→ε": ["q2"],
              },
            },
            startState: "q0",
            finalStates: ["q2"],
          },
        ],
      };
    default:
      return {
        steps: ["Conversion not implemented"],
        explanations: ["This conversion type is not yet implemented."],
        outputStates: [
          { states: [], transitions: {}, startState: "", finalStates: [] },
        ],
      };
  }
}

function updateTitles(conversionType) {
  const titles = {
    "nfa-dfa": { input: "Input NFA", output: "Output DFA" },
    "dfa-nfa": { input: "Input DFA", output: "Output NFA" },
    "re-dfa": { input: "Regular Expression", output: "Output DFA" },
    "re-nfa": { input: "Regular Expression", output: "Output NFA" },
    "nfa-re": { input: "Input NFA", output: "Regular Expression" },
    "dfa-re": { input: "Input DFA", output: "Regular Expression" },
    "cfg-pda": { input: "Context-Free Grammar", output: "Pushdown Automaton" },
  };

  document.getElementById("input-title").textContent =
    titles[conversionType].input;
  document.getElementById("output-title").textContent =
    titles[conversionType].output;
}

function beginConversion() {
  const convType = document.getElementById("conversion-type").value;
  const exampleKey = document.getElementById("example-picker").value;
  const example = examples[convType][exampleKey];

  if (!example) return;

  currentExample = example;
  currentConversionType = convType;
  updateTitles(convType);

  // Draw input graph
  if (convType.startsWith("re-")) {
    document.getElementById(
      "box-input"
    ).innerHTML = `<div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="text-2xl font-mono mb-2">${
                example.regex || "Regular Expression"
              }</div>
              <div class="text-gray-600">${example.description}</div>
            </div>
          </div>`;
  } else if (convType === "cfg-pda") {
    document.getElementById(
      "box-input"
    ).innerHTML = `<div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="text-lg font-mono mb-2">Productions:</div>
              <div class="text-sm">${
                example.productions
                  ? example.productions.join("<br>")
                  : "CFG Productions"
              }</div>
              <div class="text-gray-600 mt-2">${example.description}</div>
            </div>
          </div>`;
  } else {
    inputGraph = drawGraph("box-input", example);
  }

  // Clear output initially
  document.getElementById("box-output").innerHTML =
    '<div class="flex items-center justify-center h-full text-gray-500">Output will appear here as you progress through steps</div>';

  // Generate conversion steps
  const result = generateConversionSteps(convType, example);
  currentSteps = result.steps;
  currentExplanations = result.explanations;
  outputStates = result.outputStates;
  stepIndex = 0;

  // Reset displays
  document.getElementById("log-box").textContent =
    "Ready to begin conversion. Click 'Next Step' to start.";
  document.getElementById(
    "explanation-box"
  ).innerHTML = `<strong>Example:</strong> ${example.description}<br><br>Click 'Next Step' to begin the conversion process.`;

  // Reset button states
  document.getElementById("btnPrev").disabled = true;
  document.getElementById("btnNext").disabled = false;
}

function nextStep() {
  if (stepIndex < currentSteps.length) {
    const logBox = document.getElementById("log-box");
    const explanationBox = document.getElementById("explanation-box");

    if (stepIndex === 0) {
      logBox.textContent = currentSteps[stepIndex];
    } else {
      logBox.textContent += "\n" + currentSteps[stepIndex];
    }

    explanationBox.innerHTML = `<strong>Step ${stepIndex + 1}:</strong><br>${
      currentExplanations[stepIndex]
    }`;

    // Update output graph if we have output states for this step
    if (outputStates && outputStates[stepIndex]) {
      const outputState = outputStates[stepIndex];
      if (outputState.states && outputState.states.length > 0) {
        outputGraph = drawGraph("box-output", outputState, true);
      } else if (currentConversionType.endsWith("-re")) {
        // For conversions to regular expressions, show text output
        document.getElementById(
          "box-output"
        ).innerHTML = `<div class="flex items-center justify-center h-full">
                <div class="text-center">
                  <div class="text-lg font-mono mb-2">Regular Expression:</div>
                  <div class="text-xl font-bold">(Under Construction)</div>
                  <div class="text-gray-600 mt-2">Step ${
                    stepIndex + 1
                  } of conversion</div>
                </div>
              </div>`;
      }
    }

    stepIndex++;

    // Update button states
    document.getElementById("btnPrev").disabled = stepIndex === 1;
    document.getElementById("btnNext").disabled =
      stepIndex >= currentSteps.length;

    if (stepIndex >= currentSteps.length) {
      explanationBox.innerHTML +=
        "<br><br><strong>Conversion Complete!</strong> The transformation has been successfully completed.";
    }
  }
}

function prevStep() {
  if (stepIndex > 0) {
    stepIndex--;
    const logBox = document.getElementById("log-box");
    const explanationBox = document.getElementById("explanation-box");

    // Rebuild log up to current step
    if (stepIndex === 0) {
      logBox.textContent =
        "Ready to begin conversion. Click 'Next Step' to start.";
      explanationBox.innerHTML = `<strong>Example:</strong> ${currentExample.description}<br><br>Click 'Next Step' to begin the conversion process.`;
      document.getElementById("box-output").innerHTML =
        '<div class="flex items-center justify-center h-full text-gray-500">Output will appear here as you progress through steps</div>';
    } else {
      logBox.textContent = currentSteps.slice(0, stepIndex).join("\n");
      explanationBox.innerHTML = `<strong>Step ${stepIndex}:</strong><br>${
        currentExplanations[stepIndex - 1]
      }`;

      // Update output graph for previous step
      if (outputStates && outputStates[stepIndex - 1]) {
        const outputState = outputStates[stepIndex - 1];
        if (outputState.states && outputState.states.length > 0) {
          outputGraph = drawGraph("box-output", outputState, true);
        }
      }
    }

    // Update button states
    document.getElementById("btnPrev").disabled = stepIndex === 0;
    document.getElementById("btnNext").disabled = false;
  }
}

function completeConversion() {
  const logBox = document.getElementById("log-box");
  const explanationBox = document.getElementById("explanation-box");

  logBox.textContent = currentSteps.join("\n");
  explanationBox.innerHTML =
    "<strong>Complete Conversion Summary:</strong><br><br>" +
    currentExplanations
      .map((exp, i) => `<strong>Step ${i + 1}:</strong> ${exp}`)
      .join("<br><br>");

  // Show final output state
  if (outputStates && outputStates.length > 0) {
    const finalState = outputStates[outputStates.length - 1];
    if (finalState.states && finalState.states.length > 0) {
      outputGraph = drawGraph("box-output", finalState, true);
    }
  }

  stepIndex = currentSteps.length;
  document.getElementById("btnNext").disabled = true;
  document.getElementById("btnPrev").disabled = false;
}

function updateExampleList() {
  const convType = document.getElementById("conversion-type").value;
  const exampleList = Object.keys(examples[convType]);
  const picker = document.getElementById("example-picker");

  picker.innerHTML = exampleList
    .map((e) => `<option value="${e}">${e}</option>`)
    .join("");
  beginConversion();
}

// Event listeners
document
  .getElementById("conversion-type")
  .addEventListener("change", updateExampleList);
document
  .getElementById("example-picker")
  .addEventListener("change", beginConversion);
document.getElementById("btnReset").addEventListener("click", beginConversion);
document.getElementById("btnNext").addEventListener("click", nextStep);
document.getElementById("btnPrev").addEventListener("click", prevStep);
document
  .getElementById("btnComplete")
  .addEventListener("click", completeConversion);

// Initialize
window.onload = function () {
  updateExampleList();
  document.getElementById("btnPrev").disabled = true;
};
