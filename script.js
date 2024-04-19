const symbols = ['10', 'J', 'Q', 'K', 'A', 'Zeus', 'Poseidon', 'Athena', 'Bonus', 'Bottle', 'Harp', 'Olive'];
const numRows = 4; // Number of rows
const numColumns = 5; // Number of columns
const numPaylines = 40; // Number of paylines

const symbolImages = {
    '10': '10_symbol.png',
    'J': 'J_symbol.png',
    'Q': 'Q_symbol.png',
    'K': 'K_symbol.png',
    'A': 'A_symbol.png',
    'Zeus': 'Zeus.jpg',
    'Poseidon': 'Poseidon.png',
    'Athena': 'Athena.jpg',
    'Bonus': 'Bonus.jpeg',
    'Bottle': 'bottle_symbol.png',
    'Harp': 'harp_symbol.png',
    'Olive': 'olive_symbol.png'
};
// Winning combinations and their payouts
const payouts = {
    '10': { 3: 0.10, 4: 0.25, 5: 1.00 },
    'J': { 3: 0.10, 4: 0.25, 5: 1.00   },
    'Q': { 3: 0.10, 4: 0.25, 5: 1.00   },
    'K': { 3: 0.15, 4: 0.30, 5: 1.50   },
    'A': { 3: 0.15, 4: 0.30, 5: 1.50   },
    'Bottle': { 3:0.25 , 4:0.5 , 5:2.50 }, 
    'Harp': { 3:0.35 , 4:0.75 , 5:3.75 }, 
    'Olive': { 3:0.50 , 4:1.25 , 5:5.00 } ,
    'Athena': { 3:0.75 , 4:2.00 , 5:7.50  },
    'Poseidon': { 3:1.25 , 4:3.75 , 5:12.50  },
    'Zeus': { 3:1.50 , 4:5.00 , 5:20.0  }
           
    
};
// Define paylines, each number represents the matrix
 const paylines = [
    // Horizontal paylines
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    
    // zig-zag lines
    [0, 6, 2, 8, 4],
    [5, 1, 7, 3, 9],
    [5, 11, 7, 13, 9],
    [10, 6, 12, 8, 14],
    [10, 16, 12, 18, 14],
    [15, 11, 17, 13, 19],
    [0,16,2,18,4],
    [15,1,17,3,19],

    //arrow up/down paylines 
    [0, 6, 12, 8, 4],
    [5, 11, 17, 13, 9],
    [10, 6, 2, 8, 14],
    [15, 11, 7, 13, 19],

    // _·_ paylines
    [0, 1, 7, 3, 4],
    [5, 6, 12, 8, 9],
    [10, 11, 17, 13, 14],
    [15, 16, 2, 18, 19],
    [15, 16, 12, 18, 19],
    [10, 11, 7, 13, 14],
    [5, 6, 2, 8, 9],
    [0, 1, 17, 3, 4],

    //·_· payline
    [0, 6, 7, 8, 4],
    [5, 11, 12, 13, 9],
    [10, 16, 17, 18, 14],
    [15, 1, 2, 3, 19],
    [15, 11, 12, 13, 19],
    [10, 6, 7, 8, 14],
    [5, 1, 2, 3, 9],
    [1, 16, 17, 18, 4],
    [5, 16, 7, 18, 9],
    [0, 11, 2, 13, 4],
    [10, 1, 12, 3, 14],
    [15, 6, 17, 8, 19],
    [15, 11, 7, 3, 9],
    [0, 6, 12, 18, 14],
    [15, 1, 7, 3, 19],
    [0, 16, 12, 18, 4]

    
]; 
let lastBonusColumn = -1; // Track the last column in which a bonus symbol appeared

// Function to check that nomud symbol olny shows up omce per reel
function selectSymbol(column) {
    let symbol;
    let imgSrc;

    // Ensure that a bonus symbol does not appear in the same column twice
    do {
        const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
        symbol = symbols[randomSymbolIndex];
        imgSrc = symbolImages[symbol];
    } while (symbol === 'Bonus' && column === lastBonusColumn);

    // Update lastBonusColumn if the symbol is a bonus symbol
    if (symbol === 'Bonus') {
        lastBonusColumn = column;
    }

    return { symbol, imgSrc };
}


//Function to handle the bonus mode
function activateBonus() {
    // Display bonus gates animation and message
    const bonusGates = document.getElementById('bonusGates');
    const bonusMessage = document.getElementById('bonusMessage');
    const table = document.getElementById('slotMachine');

    // Calculate position of the bonus gates
    const tableRect = table.getBoundingClientRect();
    const tableCenterX = tableRect.left + tableRect.width / 2;
    const tableCenterY = tableRect.top + tableRect.height / 2;

    bonusGates.style.left = tableCenterX - bonusGates.offsetWidth / 2 + 'px';
    bonusGates.style.top = tableCenterY - bonusGates.offsetHeight / 2 + 'px';

    bonusGates.style.display = 'block'; // Display the bonus gates
    bonusMessage.textContent = 'Bonus game activated! You won 10 free spins.'; // Display the bonus message

    // After a delay, hide the bonus gates and message
    setTimeout(() => {
        bonusGates.style.display = 'none';
        bonusMessage.textContent = '';
    }, 3000); // Adjust the delay as needed
}

// Function to check if any payline has a win
function hasWin(result, paylines) {
    // Iterate over each payline
    for (const payline of paylines) {
        // Check if the current payline has a win
        if (hasWinForPayline(result, payline)) {
            return true; // Return true if any payline has a win
        }
    }
    return false; // Return false if no payline has a win
}

// Function to check if a specific payline has a win
function hasWinForPayline(result, payline) {
    // Get symbols on the payline
    const symbolsOnPayline = payline.map(cellIndex => result[Math.floor(cellIndex / numColumns)][cellIndex % numColumns]);

    // Iterate over symbols on the payline
    for (let i = 0; i <= symbolsOnPayline.length - 3; i++) {
        // Check if three consecutive symbols are the same and not empty
        if (symbolsOnPayline[i] !== '' && symbolsOnPayline[i] === symbolsOnPayline[i+1] && symbolsOnPayline[i] === symbolsOnPayline[i+2]) {
            return true; // Return true if three consecutive symbols are found
        }
    }
    return false; // Return false if no winning combination is found
}

// Function to calculate payout based on symbols on a winning payline
// Function to calculate payout based on symbols on a winning payline
function calculatePayout(result, payline) {
    const symbol = result[Math.floor(payline[0] / numColumns)][payline[0] % numColumns];
    const count = payline.reduce((acc, cellIndex) => {
        if (result[Math.floor(cellIndex / numColumns)][cellIndex % numColumns] === symbol) {
            return acc + 1;
        } else {
            return acc;
        }
    }, 0);
    console.log("Symbol:", symbol, "Count:", count); // Debugging statement

    // Check if the symbol exists in the payouts object and if the count has a corresponding payout
    if (payouts[symbol] && payouts[symbol][count]) {
        console.log("Payout for symbol:", payouts[symbol][count]); // Debugging statement
        return payouts[symbol][count];
    } else {
        console.log("No payout for symbol or count:", symbol, count); // Debugging statement
        return 0; // If no payout is found, return 0
    }
}

//Function to simulate spinning and getting result
function spinAndGetResult() {
    // Simulate spinning and return result as a 2D array of symbols
    const result = [];
    for (let i = 0; i < numRows; i++) {
        const row = [];
        for (let j = 0; j < numColumns; j++) {
            const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
            row.push(symbols[randomSymbolIndex]);
        }
        result.push(row);
    }
    console.log("Result:", result); // Debugging statement
    return result;
}

let balance = 100; // Initial balance

let spinning = false; // Variable to track whether a spin is in progress

// Spin function using the selectSymbol function
function spin() {
    // Check if a spin is already in progress
    if (spinning) {
        return; // If spinning, exit the function early to prevent another spin
    }

    // Set spinning to true to indicate that a spin is in progress
    spinning = true;

    const betValue = document.getElementById('betValue').value; // Get selected bet value
    if (balance >= betValue) {
        balance -= betValue; // Deduct bet value from balance
        document.getElementById('balance').textContent = `Balance: $${balance}`; // Update balance display
        // Perform the spinning action
    } else {
        alert('Insufficient balance!'); // Show alert if balance is insufficient
        spinning = false; // Reset spinning status
        return; // Exit the function early if balance is insufficient
    }

    const table = document.getElementById('slotMachine');
    let totalPayout = 0;
    bonusCount = 0;

    // Reset result display
    document.getElementById('result').textContent = '';

    for (let i = 0; i < table.rows.length; i++) { // Iterate over rows
        for (let j = 0; j < table.rows[i].cells.length; j++) { // Then iterate over columns
            setTimeout(() => {
                const { symbol, imgSrc } = selectSymbol(j);
                table.rows[i].cells[j].innerHTML = `<img src="symbols/${imgSrc}" alt="${symbol}">`;

                // Check if the symbol is a bonus symbol
                if (symbol === 'Bonus') {
                    bonusCount++;
                }

                // Check if three bonus symbols have been shown
                if (bonusCount === 3) {
                    activateBonus(); // Trigger the bonus mode
                }

                // Check if all symbols are shown
                if (i === table.rows.length - 1 && j === table.rows[i].cells.length - 1) {
                    spinning = false; // Reset spinning status when all symbols are shown
                }

            }, (j * table.rows.length + i) * 120); // Adjust the delay as needed
        }
    }
}

// Add event listener for the "Enable auto spins" button
document.getElementById('enableAutoSpins').addEventListener('click', toggleAutoSpins);

// Function to toggle auto spins mode
function toggleAutoSpins() {
    const autoSpinControls = document.getElementById('autoSpinControls');
    autoSpinControls.style.display = autoSpinControls.style.display === 'block' ? 'none' : 'block';
}

// Event listener for updating auto spins value display
document.getElementById('autoSpinSlider').addEventListener('input', () => {
    document.getElementById('autoSpinValue').textContent = document.getElementById('autoSpinSlider').value;
});

// Function to perform auto spins
function performAutoSpins() {
    // Read the selected number of auto spins from the slider
    const numAutoSpins = document.getElementById('autoSpinSlider').value;
    
    // Disable auto spins button during auto spins
    document.getElementById('enableAutoSpins').disabled = true;
    
    // Perform the specified number of auto spins sequentially
    let spinCount = 0;
    function autoSpinLoop() {
        // Check if all auto spins are completed
        if (spinCount >= numAutoSpins) {
            // Re-enable auto spins button after auto spins are finished
            document.getElementById('enableAutoSpins').disabled = false;
            return;
        }

        // Wait for a brief moment before starting the next spin
        setTimeout(() => {
            // Check if a spin is already in progress
            if (!spinning) {
                // Call the spin function to perform a spin
                spin();
                spinCount++;
            }
            
            // Continue to the next spin after a short delay
            setTimeout(autoSpinLoop, 200); // Adjust the delay as needed
        }, 500); // Brief wait before starting the next spin
    }

    // Start the auto spin loop
    autoSpinLoop();
}

 /*function spin() {
    const betValue = document.getElementById('betValue').value; // Get selected bet value
    if (balance >= betValue) {
        balance -= betValue; // Deduct bet value from balance
        document.getElementById('balance').textContent = `Balance: $${balance}`; // Update balance display
    } else {
        alert('Insufficient balance!'); // Show alert if balance is insufficient
        return; // Stop further execution if balance is insufficient
    }

    const table = document.getElementById('slotMachine');
    let totalPayout = 0;
    bonusCount = 0;
    
    // Reset result display
    document.getElementById('result').textContent = '';

    // Simulate spinning and get the result
    const result = spinAndGetResult();
    console.log("Spin result:", result); // Debugging statement

    // Check each payline for a win
    paylines.forEach((payline, index) => {
        if (hasWin(result, payline)) {
            console.log("Payline", index, "has a win!"); // Debugging statement
            // Calculate the payout based on the symbols on the winning payline
            const payout = calculatePayout(result, payline);
            console.log("Payout for payline", index, ":", payout); // Debugging statement
            totalPayout += payout;
        }
    });

    // Update balance with total payout
    balance += totalPayout;
    document.getElementById('balance').textContent = `Balance: $${balance}`;

    // Display the result (optional)
    document.getElementById('result').textContent = `Total payout: $${totalPayout}`;

    // Update symbols on the table with the result of the spin
    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) 
        setTimeout(() => {
            const { symbol, imgSrc } = selectSymbol(j);
            table.rows[i].cells[j].innerHTML = `<img src="symbols/${imgSrc}" alt="${symbol}">`;
        }, (j * table.rows.length + i) * 120); // Adjust the delay as needed
    }
}*/



