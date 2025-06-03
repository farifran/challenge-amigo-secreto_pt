const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read the HTML file
const html = fs.readFileSync('index.html', 'utf-8');

// Create a JSDOM instance
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

// Make JSDOM's window and document global
global.window = dom.window;
global.document = dom.window.document;
// global.alert is not sufficient, app.js runs in dom.window context
dom.window.alert = (message) => { // Assign mock to dom.window.alert
    console.log(`DOM Alert: ${message}`);
    global.lastAlertMessage = message; // Store for assertions
};
global.console = dom.window.console; // Use JSDOM's console

// Load app.js content
let appJsContent = fs.readFileSync('app.js', 'utf-8');
// Explicitly make 'amigos' a property of 'window' in the JSDOM context
appJsContent = appJsContent.replace('let amigos = [];', 'window.amigos = [];');
dom.window.eval(appJsContent); // Execute modified app.js in JSDOM's context

// Helper function for delays
const delay = (ms) => new Promise(resolve => dom.window.setTimeout(resolve, ms)); // Use JSDOM's setTimeout

// Access functions and variables from app.js (now in JSDOM's window scope)
const sortearAmigo = dom.window.sortearAmigo; // Use the original function
const criarLista = dom.window.criarLista;
// amigos array will be accessed via dom.window.amigos. Its *contents* will be modified.

// --- Test Suite ---
let passedTests = 0;
let failedTests = 0;

async function describe(description, fn) { // Make describe async
    console.log(`\n--- ${description} ---`);
    await fn(); // Await the async callback
}

async function it(description, fn) {
    console.log(`\n  Running: ${description}`);
    global.lastAlertMessage = null; // Reset last alert message
    try {
        await fn();
        console.log(`  PASSED: ${description}`);
        passedTests++;
    } catch (error) {
        console.error(`  FAILED: ${description}`);
        console.error(error);
        failedTests++;
    }
}

function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${actual} to be ${expected}`);
            }
        },
        toContain: (expectedSubstring) => {
            if (typeof actual !== 'string' || !actual.includes(expectedSubstring)) {
                throw new Error(`Expected "${actual}" to contain "${expectedSubstring}"`);
            }
        },
        toBeOneOf: (expectedArray) => {
            if (!expectedArray.includes(actual)) {
                throw new Error(`Expected ${actual} to be one of [${expectedArray.join(', ')}]`);
            }
        },
        toBeNullOrEmpty: () => {
            if (actual !== null && actual !== '') {
                throw new Error(`Expected "${actual}" to be null or empty`);
            }
        },
        toHaveClass: (className) => {
            if (!actual || !actual.classList || !actual.classList.contains(className)) {
                throw new Error(`Expected element to have class "${className}". Actual classes: ${actual ? actual.className : 'null'}`);
            }
        }
    };
}


async function runTests() {
    await describe('Functional Testing of sortearAmigo()', async () => { // Make describe's callback async
        // Setup common elements
        const resultadoElement = document.getElementById('resultado');
        const myNameInput = document.getElementById('inputMyName');
        const sortearButton = document.querySelector('.button-draw');

        // Test Case 1: Test with multiple friends
        await it('should correctly sort with multiple friends and handle animation states', async () => {
            // Modify contents of dom.window.amigos, not the reference
            dom.window.amigos.length = 0; // Clear existing
            dom.window.amigos.push("Alice", "Bob", "Charlie", "Diana");

            if (typeof criarLista !== 'function') throw new Error('criarLista is not loaded correctly for test 1');
            criarLista();

            if (typeof sortearAmigo !== 'function') throw new Error('sortearAmigo is not loaded correctly for test 1');
            sortearAmigo();

            // Check button is disabled (short delay for JS to execute)
            await delay(100);
            expect(sortearButton.disabled).toBe(true);

            // Total animation time is 3s. Wait a bit longer.
            await delay(3400); // Total wait 3.5s from sortearAmigo call. (100 + 3400)

            const finalResultLI = resultadoElement.querySelector('li.final-result');
            if (!finalResultLI) throw new Error("Final result <li> element not found or missing 'final-result' class in test 1.");
            expect(finalResultLI.textContent).toBeOneOf(["Alice", "Bob", "Charlie", "Diana"]);
            expect(sortearButton.disabled).toBe(false);
            resultadoElement.innerHTML = ''; // Clean up
            dom.window.amigos.length = 0; // Clean up amigos array for next test
        });

        // Test Case 2: Test with "Your name" exclusion
        await it('should exclude "Your name" from the draw', async () => {
            dom.window.amigos.length = 0;
            dom.window.amigos.push("Alice", "Bob", "Charlie");
            myNameInput.value = "Alice";
            if (typeof criarLista !== 'function') throw new Error('criarLista is not loaded correctly for test 2');
            criarLista();

            if (typeof sortearAmigo !== 'function') throw new Error('sortearAmigo is not loaded correctly for test 2');
            sortearAmigo();

            await delay(3500); // Wait for animation to complete.

            const finalResultLI = resultadoElement.querySelector('li.final-result');
            if (!finalResultLI) throw new Error("Final result <li> element not found for name exclusion test (test 2).");
            expect(finalResultLI.textContent).toBeOneOf(["Bob", "Charlie"]);
            expect(finalResultLI.textContent === "Alice").toBe(false); // Ensure Alice is not chosen

            resultadoElement.innerHTML = '';
            myNameInput.value = '';
            dom.window.amigos.length = 0;
        });

        // Test Case 3: Test with an empty list
        await it('should handle an empty friend list gracefully', async () => {
            dom.window.amigos.length = 0;
            if (typeof sortearAmigo !== 'function') throw new Error('sortearAmigo is not loaded correctly for test 3');
            sortearAmigo();
            await delay(100); // Short delay for alert processing

            expect(resultadoElement.innerHTML).toBeNullOrEmpty();
            expect(global.lastAlertMessage).toBe("A lista de amigos está vazia. Adicione amigos primeiro.");
            resultadoElement.innerHTML = ''; // Clean up
            // dom.window.amigos is already empty
        });

        // Test Case 4: Test with only "Your name" present or all names excluded
        await it('should handle cases where all potential targets are excluded', async () => {
            dom.window.amigos.length = 0;
            dom.window.amigos.push("David");
            myNameInput.value = "David";
            if (typeof criarLista !== 'function') throw new Error('criarLista is not loaded correctly for test 4');
            criarLista();

            if (typeof sortearAmigo !== 'function') throw new Error('sortearAmigo is not loaded correctly for test 4');
            sortearAmigo();
            await delay(100); // Short delay for alert processing

            expect(resultadoElement.innerHTML).toBeNullOrEmpty();
            expect(global.lastAlertMessage).toBe("Não foi possível sortear um amigo diferente. Verifique a lista ou o nome a ser excluído.");
            resultadoElement.innerHTML = '';
            myNameInput.value = '';
            dom.window.amigos.length = 0;
        });
    });

    console.log(`\n--- Test Summary ---`);
    // console.log(`Total tests: ${tests.length}`); // Removed as it was not updating
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);

    // Exit with status code 0 if all tests passed, 1 otherwise
    if (failedTests > 0) {
        console.error("\nSome tests failed. Exiting with status 1.");
        process.exit(1);
    } else {
        console.log("\nAll tests passed. Exiting with status 0.");
        process.exit(0);
    }
}

// Run the tests once and handle exit.
runTests();

// Remove mainTimeout and the second runTests() call.
// JSDOM's timers (like setInterval from app.js) might keep Node alive.
// The process.exit() in runTests() is now the definitive way this script ends.
// If app.js's setInterval is not cleared by JSDOM automatically upon exit,
// this script might hang if process.exit() was not called.
// However, for testing purposes, explicit exit is fine.

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
