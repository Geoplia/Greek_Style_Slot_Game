/*------------------------------------------------------------------  CONST VARIABLES  ------------------------------------------------------------------*/
const symbols = ['10', 'J', 'Q', 'K', 'A', 'Zeus', 'Poseidon', 'Athena', 'Bonus', 'Bottle', 'Harp', 'Olive', 'Wild'];
const numRows = 4; // Number of rows
const numColumns = 5; // Number of columns
const numPaylines = 40; // Number of paylines
// Set the maximum allowed volume
const MAX_VOLUME = 0.5; 
const MAX_VOLUME_BONUS=0.20; 
const audio = new Audio(src="audio/epic-strings.mp3");

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
    'Olive': 'olive_symbol.png',
    'Wild' : 'lightning_wild.png'
};
// Winning combinations and their payouts
const basePayouts = {
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
// button and pop-up screen elements
const openPopupButton = document.getElementById('openPopupButton');
const closePopupButton = document.getElementById('closePopupButton');
const popupScreen = document.getElementById('popupScreen');

/*------------------------------------------------------------------ LET VARIABLES  ------------------------------------------------------------------*/
let bonusModeActive = false;// track whether bonus mode is active
let freeSpinsCount = 0; //track the number of free spins
let wildPositions = []; //store the positions of Wild symbols
let remainingFreeSpins = 8; // track the number of remaining free spins
let balance = 100; // Initial balance
let lastBonusColumn = null; 
let spinning = false; //track whether a spin is in progress
let payouts = JSON.parse(JSON.stringify(basePayouts));
let stopAutoSpinsImmediately = false; // track whether auto spins should be stopped immediately
let stopAutoSpinsAfterCurrentSpin = false; // indicate whether to stop auto spins after the current spin finishes

/*------------------------------------------------------------------  FUNCTIONS ------------------------------------------------------------------*/

// Function to select a symbol for a given column
function selectSymbol(column) {
    let symbol;
    let imgSrc;

    // Exclude bonus symbols if it's the same column as the lastBonusColumn during normal spins
    if (!bonusModeActive) {
        do {
            const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
            symbol = symbols[randomSymbolIndex];
            imgSrc = symbolImages[symbol];
        } while (symbol === 'Bonus' && column === lastBonusColumn);
    } else { // Exclude bonus symbols during bonus mode
        do {
            const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
            symbol = symbols[randomSymbolIndex];
            imgSrc = symbolImages[symbol];
        } while (symbol === 'Bonus' || (symbol === 'Wild' && column === 0)); // Exclude Wild symbol in the first column during bonus mode
    }

    // Update lastBonusColumn if the symbol is a bonus symbol
    if (symbol === 'Bonus') {
        lastBonusColumn = column;
    }

    return { symbol, imgSrc };
}

// Function to extract symbols from the table and store them in a matrix
function getSymbolMatrix() {
    const table = document.getElementById('slotMachine');
    const symbolMatrix = [];

    for (let i = 0; i < table.rows.length; i++) {
        const row = [];
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            const cell = table.rows[i].cells[j];
            const img = cell.querySelector('img');
            const symbol = img ? img.alt : ''; // Check if the img exists 
            row.push(symbol);
        }
        symbolMatrix.push(row);
    }
    return symbolMatrix;
}

// Function to update the table with new symbols
function updateTable(symbolMatrix) {
    const table = document.getElementById('slotMachine');

    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            const cell = table.rows[i].cells[j];
            const imgSrc = symbolImages[symbolMatrix[i][j]];
            const img = cell.querySelector('img');
            img.src = imgSrc;
            img.alt = symbolMatrix[i][j]; // Update alt attribute with symbol name
        }
    }
}

// Function to check for wild symbols in the matrix
function checkWildSymbols(symbolMatrix) {
    wildPositions = [];
    symbolMatrix.forEach((row, rowIndex) => {
        row.forEach((symbol, colIndex) => {
            if (symbol === 'Wild') {
                wildPositions.push({ row: rowIndex, col: colIndex });
                ThunderSound(); // thunder sound when Wild symbol is detected
            }
        });
    });
}

// Function to display the bonus confirmation popup
function showBonusConfirmation() {
    const popup = document.getElementById('BonusBuyPopupScreen');
    popup.style.display = 'block';
}

// Function to hide the bonus confirmation popup
function hideBonusConfirmation() {
    const popup = document.getElementById('BonusBuyPopupScreen');
    popup.style.display = 'none';
}

// Function to check balance and activate bonus accordingly
function checkAndActivateBonus() {
    const betSelect = document.getElementById('betSelect');
    const selectedBet = parseFloat(betSelect.value);  
    const betAmount = selectedBet * 50; // Calculate the bet amount

    // Check if the balance is sufficient
    if (balance >= betAmount) {
        balance -= betAmount; 
        document.getElementById('balance').textContent = `Balance: $${balance.toFixed(2)}`; // Update the balance display
        updatePayouts(betSelect.value);
        activateBonus();  
        hideBonusConfirmation(); 
    } else {
        alert('Not enough balance!'); // Alert if balance is insufficient
    }
}

// Function to handle the bonus mode
function activateBonus() {
    const popupContent = document.getElementById('popupScreen');
    bonusModeActive = true;
    popupContent.style.display = 'block';
    const popup = document.getElementById('wonAmount');
    popup.style.display = 'none';
    wildPositions = [];
    hideBonusConfirmation();
}

//Function to play thunder sound. It is used during the bonusMode, when a wild is detected
function ThunderSound() {
    var ThunderSound = document.getElementById("Thunder");
    ThunderSound.play();
}

// Function to handle starting 8 free spins
function startFreeSpins() {
    document.getElementById('popupScreen').style.display = 'none';
    document.getElementById('wonAmount').style.display = 'none'; 

    // Change the background image
    document.body.style.backgroundImage = 'url("symbols/bonus_background.jpg")';
    document.body.classList.add('bonus-background');
    document.body.style.backgroundSize = 'cover';
    const table = document.getElementById('slotMachine');
    //Stop the main background music
    var backgroundMusic = document.getElementById("backgroundMusic");
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset the song to the beginning
    //Start the bonus mode music
    var bonusModeSong = document.getElementById("bonusModeSong");
    bonusModeSong.play();
    freeSpinsCount = 0;
    remainingFreeSpins = 7; // Reset to 8 spins
    spinForFree(table); // Start the first free spin
}
// Function to animate total winnings after bonus round
function showTotalWinnings(finalWinnings) {
    const popup = document.getElementById('totalWinningsPopup');
    const totalWinningsAmount = document.getElementById('totalWinningsAmount');
    audio.loop = true; // Loop the sound while the winnings are being incremented
    // final winnings in the 'data-winnings' attribute
    totalWinningsAmount.setAttribute('data-winnings', `Total Winnings: $${finalWinnings.toFixed(2)}`);

    // Animate the winnings from $0.00 to the final amount
    let currentWinnings = 0.00;
    const animationDuration = 5000; // 5 seconds for the animation
    const increment = finalWinnings / (animationDuration / 50); // Increment per frame (50ms per frame)
    // Play the sound when the animation starts
    audio.play();
    const animationInterval = setInterval(() => {
        currentWinnings += increment;
        if (currentWinnings >= finalWinnings) {
            currentWinnings = finalWinnings; // Stop at the final value
            clearInterval(animationInterval); // Stop the animation loop
            stopMusic(); // Stop the sound when animation completes
        }
        // Update the display value during the animation
        totalWinningsAmount.innerHTML = `Total Winnings: $${currentWinnings.toFixed(2)}`;
    }, 50);
    popup.style.display = 'block';// Show the popup with the updated total winnings
}

// Function to hide the popup
function hideTotalWinningsPopup() {
    const popup = document.getElementById('totalWinningsPopup');
    popup.style.display = 'none';
  
    // Revert the background to the original+
    document.body.classList.remove('bonus-background');
    document.body.style.backgroundImage = 'url("symbols/slot_background.png")';
    document.body.style.backgroundSize = 'cover'; 
    document.getElementById("remainingSpinsContainer").style.display = "none";


    //Stop the bonus music
    var bonusModeSong = document.getElementById("bonusModeSong");
    bonusModeSong.pause();

    stopMusic(); 
    bonusModeSong.currentTime = 0; // Reset the song to the beginning
}

function spinForFree(table) {
    let totalBonusWinnings = 0; // Initialize total winnings for the bonus mode

    // Inner function to handle a single spin
    function performSpin() {
        let spinWinnings = 0; // Winnings for the current spin

        // Check if all free spins are completed
        if (freeSpinsCount >= 8) {
            // Reset the free spins count
            freeSpinsCount = 0;
            // Add the total bonus winnings to the balance
            balance += totalBonusWinnings;
            //document.getElementById('balance').textContent = `Balance: $${balance}`;
            document.getElementById('balance').textContent = `Balance: $${balance.toFixed(2)}`;
            // Trigger the total winnings popup
            showTotalWinnings(totalBonusWinnings); 

            // Reset bonus mode and enable spin button
            bonusModeActive = false;
           // document.getElementById('spinButton').disabled = false; // Enable the spin button again

            return;
        }

        document.getElementById("remainingSpinsContainer").style.display = "block";
        // Display remaining free spins on the screen
        document.getElementById('remainingSpins').textContent = `Remaining Spins: ${remainingFreeSpins}`;
        
        // Decrement the remaining free spins counter
        remainingFreeSpins--;

        // Iterate over rows
        for (let j = 0; j < table.rows.length; j++) {
            // Then iterate over columns
            for (let k = 0; k < table.rows[j].cells.length; k++) {
                setTimeout(() => {
                    let symbol, imgSrc;

                    // Check if the current position is a stored wild position
                    const isWild = wildPositions.some(pos => pos.row === j && pos.col === k);
                    if (isWild) {
                        // Display the Wild symbol in the same cell for all remaining free spins
                        table.rows[j].cells[k].innerHTML = `<img src="symbols/${symbolImages['Wild']}" alt="Wild">`;
                    } else {
                        // Use the regular symbol selection logic, including wild symbols
                        ({ symbol, imgSrc } = selectSymbol(k));

                        // Check if the symbol is Wild and bonus mode is active
                        if (symbol === 'Wild' && bonusModeActive) {
                            // Store the position of the Wild symbol
                            wildPositions.push({ row: j, col: k });
                            ThunderSound();
                            // Display the Wild symbol
                            table.rows[j].cells[k].innerHTML = `<img src="symbols/${imgSrc}" alt="Wild">`;
                        } else {
                            // Display the regular symbol
                            table.rows[j].cells[k].innerHTML = `<img src="symbols/${imgSrc}" alt="${symbol}">`;
                        }
                    }

                    // After the last symbol is set, calculate winnings
                    if (j === table.rows.length - 1 && k === table.rows[j].cells.length - 1) {
                        // Get the current symbol matrix
                        const symbolMatrix = getSymbolMatrix();
                        // Calculate the spin payout and add to spinWinnings
                        spinWinnings = calculateTotalPayout(symbolMatrix);
                                             
                        // Add the spin winnings to the total bonus winnings
                        totalBonusWinnings += spinWinnings;

                        // If all free spins are done, display total winnings
                        if (freeSpinsCount >= 8) {
                            // Reset the free spins count
                            freeSpinsCount = 0;
                            // Add total bonus winnings to balance
                            balance += totalBonusWinnings;
                            //document.getElementById('balance').textContent = `Balance: $${balance}`;
                            document.getElementById('balance').textContent = `Balance: $${balance.toFixed(2)}`;
                            // Trigger the total winnings popup
                            showTotalWinnings(totalBonusWinnings); 
                        } else {
                            // Continue to the next free spin
                            freeSpinsCount++;
                            setTimeout(performSpin, 3000); // Adjust the delay as needed
                        }
                    }
                }, (k * table.rows.length + j) * 120); // Adjust the delay as needed
            }
        }
    }

    // Start the first spin
    performSpin();
}

// Function to calculate total payout based on the symbol matrix
function calculateTotalPayout(symbolMatrix) {
    let totalPayout = 0;
    const winningSymbols = []; // Array to store the positions of winning symbols

    paylines.forEach(payline => {
        let wildCount = 0;
        let primarySymbol = null;
        let occurrences = 0;
        let winningPayline = []; // To track positions of winning symbols in this payline
        let maxOccurrences = 0; // Track the maximum occurrences for this payline

        for (let i = 0; i < payline.length; i++) {
            const cellIndex = payline[i];
            const row = Math.floor(cellIndex / numColumns);
            const col = cellIndex % numColumns;
            const symbol = symbolMatrix[row][col];

            // Handle Wild symbols
            if (symbol === 'Wild') {
                wildCount++;
                occurrences++;
                winningPayline.push({ row, col });
            } 
            // Handle first primary symbol that is not Bonus
            else if (primarySymbol === null && symbol !== 'Bonus') {
                primarySymbol = symbol;
                occurrences = 1;
                winningPayline.push({ row, col });
            } 
            // Handle matching symbols (including Wild substitutes)
            else if (symbol === primarySymbol) {
                occurrences++;
                winningPayline.push({ row, col });
            } 
            // Break the sequence if the symbol doesn't match
            else {
                break; 
            }
        }

        // Check if the payline results in a payout
        if (primarySymbol && payouts[primarySymbol] && payouts[primarySymbol][occurrences]) {
            if (occurrences > maxOccurrences) {
                maxOccurrences = occurrences; // Update max occurrences
                // Add the payout for this occurrence
                totalPayout += payouts[primarySymbol][occurrences];
                winningSymbols.push(...winningPayline); // Store positions of the winning symbols
            }
        }
    });

    // If total payout is greater than 0, play the payout sound
    if (totalPayout > 0) {
        playPayoutSound();
    }

    // Highlight the winning symbols on the board
    highlightWinningSymbols(winningSymbols);

    // Return the total payout for this spin
    return totalPayout;
}
// Function to highlith the winning cells 
function highlightWinningSymbols(winningSymbols) {
    removeFlashEffect();

    // Flash effect logic
    winningSymbols.forEach(pos => {
        const cell = document.querySelector(`#slotMachine tr:nth-child(${pos.row + 1}) td:nth-child(${pos.col + 1}) img`);
        if (cell) {
            cell.classList.add('flash');
        }
    });

    setTimeout(() => {
        removeFlashEffect();
    }, 2000);
}

function removeFlashEffect() {
    const cells = document.querySelectorAll('#slotMachine td img');
    cells.forEach(cell => cell.classList.remove('flash'));
}

// Function to update payouts based on selected bet value
function updatePayouts(betValue) {
    payouts = JSON.parse(JSON.stringify(basePayouts)); // Reset payouts to the original base values

    for (const symbol in payouts) {
        for (const count in payouts[symbol]) {
            payouts[symbol][count] = basePayouts[symbol][count] * betValue;
        }
    }
}

// Function to perform a spin and calculate the payout
function spin() {
    if (spinning || bonusModeActive) return;

    spinning = true;
    startBackgroundMusic();
    
    const betValue = parseFloat(document.getElementById('betValue').value);

    if (balance >= betValue) {
        balance -= betValue;
        updateBalanceDisplay();
        updatePayouts(betValue);
        removeFlashEffect();

        const table = document.getElementById('slotMachine');
        let bonusCount = 0; // Track the number of Bonus symbols
        let revealDelay = 120; // Initial delay between reveals
        let animationApplied = false; // Track if animation has been applied
        let column = 0; 
        let row = 0; 

        const revealSymbol = () => {
            // Select and display the symbol for the current row and column
            const { symbol, imgSrc } = selectSymbol(column);
            const cell = table.rows[row].cells[column]; 

            // If the symbol is a Bonus, increment the bonus count
            if (symbol === 'Bonus') {
                bonusCount++;
            }

            // If 2 Bonus symbols appear, apply the spin-fade-in animation for remaining symbols
            if (bonusCount >= 2 && !animationApplied) {
                revealDelay = 500; // Increase the delay
                animationApplied = true; // Mark animation as applied
            }

            // Insert the symbol image and apply animation class if bonusCount >= 2
            cell.innerHTML = `<img src="symbols/${imgSrc}" alt="${symbol}" class="${bonusCount >= 2 ? 'spin-fade-in' : ''}">`;

            row++; // Move to the next row in the current column

            // If we've revealed all rows in the current column, move to the next column
            if (row >= table.rows.length) {
                row = 0; 
                column++; 
            }

            // If all columns are revealed, handle spin completion
            if (column < numColumns) {
                setTimeout(revealSymbol, revealDelay); 
            } else {
                spinning = false;
                // After all symbols are shown, calculate the payout
                const symbolMatrix = getSymbolMatrix();
                const totalPayout = calculateTotalPayout(symbolMatrix);

                // Add the payout to the balance and update the display
                balance += parseFloat(totalPayout);
                updateBalanceDisplay();

                document.getElementById('result').textContent = `Total Winnings: $${totalPayout}`;
                document.getElementById('wonAmountValue').textContent = totalPayout.toFixed(2);
                document.getElementById('wonAmount').style.display = 'block';

                // Check for bonus symbols
                const bonusCount = symbolMatrix.flat().filter(symbol => symbol === 'Bonus').length;
                if (bonusCount >= 3) {
                    activateBonus();
                }
            }
        };

        revealSymbol();
    } else {
        alert('Insufficient balance!');
        spinning = false;
    }
}

// Function to play payout sound
function playPayoutSound() {
    const payoutSound = new Audio(src="audio/harp.mp3");
    payoutSound.play();
}
// Update the balance display
function updateBalanceDisplay() {
    document.getElementById('balance').textContent = `Balance: $${balance.toFixed(2)}`;
}

function toggleAutoSpins() {
    const autoSpinHandler = document.getElementById('autoSpinControls');
    const enableAutoSpinsButton = document.getElementById('enableAutoSpins');

    // Toggle the display property of the auto spin controls
    if (autoSpinHandler.style.display === 'none') {
        autoSpinHandler.style.display = 'block';
        enableAutoSpinsButton.textContent = 'Disable Auto Spins';
    } else {
        autoSpinHandler.style.display = 'none';
        enableAutoSpinsButton.textContent = 'Enable Auto Spins';
    }
}

// Function to stop auto spins
function stopAutoSpins() {
    // Reset spinning status to false to allow manual spins
    spinning = false;
    // Reset the flag
    stopAutoSpinsAfterCurrentSpin = false;
    // Hide the "Stop auto spins" button
    document.getElementById('stopAutoSpins').style.display = 'none';
}

// Function to stop auto spins after the current spin finishes
function stopAutoSpinsAfterCurrent() {
    // Set the flag to stop auto spins after the current spin finishes
    stopAutoSpinsAfterCurrentSpin = true;
    // Hide the "Stop auto spins" button temporarily until the current spin finishes
    document.getElementById('stopAutoSpins').style.display = 'none';
}

// Function to perform auto spins
function performAutoSpins() {
    // Reset the flag indicating to stop auto spins after the current spin
    stopAutoSpinsAfterCurrentSpin = false;
    // Read the selected number of auto spins from the slider
    const numAutoSpins = document.getElementById('autoSpinSlider').value;
    // Show the "Stop auto spins" button
    document.getElementById('stopAutoSpins').style.display = 'block';
    let spinCount = 0;
    function autoSpinLoop() {
        // Check if all auto spins are completed or if auto spins should be stopped after the current spin
        if (spinCount >= numAutoSpins || stopAutoSpinsAfterCurrentSpin) {
            document.getElementById('enableAutoSpins').disabled = false;
            stopAutoSpins(); // Stop auto spins
            return;
        }
        setTimeout(() => {
            // Check if a spin is already in progress or if auto spins should be stopped after the current spin
            if (!spinning && !stopAutoSpinsAfterCurrentSpin) {
                // Call the spin function to perform a spin
                spin();
                spinCount++;
            }
            setTimeout(autoSpinLoop, 200); 
        }, 500); 
    }

    autoSpinLoop();
}

// Function to toggle music volume control bar
function toggleMusicVolume() {
    var volumeSlider = document.getElementById("volumeSlider");
    if (volumeSlider.style.display === "block") {
        volumeSlider.style.display = "none";
    } else {
        volumeSlider.style.display = "block";
    }
}

function adjustVolume() {
    var volume = document.getElementById("volumeSlider").value;
    var backgroundAudio = document.getElementById("backgroundMusic");
    var bonusAudio = document.getElementById("bonusModeSong");
    backgroundAudio.volume = volume / 100;
    bonusAudio.volume = volume / 100
}

function startBackgroundMusic() {
    var backgroundMusic = document.getElementById('backgroundMusic');
    if (backgroundMusic.paused) {
        backgroundMusic.play(); 
    }
}

// Function to initialize background music and set the volume limit
function initializeBackgroundMusic() {
    const backgroundMusic = document.getElementById('backgroundMusic');
    const bonusModeSong = document.getElementById('bonusModeSong');
    backgroundMusic.volume = MAX_VOLUME;
    bonusModeSong.volume = MAX_VOLUME_BONUS;

}

// Function to stop this specific audio
function stopMusic() {
    audio.pause();         
    audio.currentTime = 0; // Reset to the beginning
}

function updateBonusValue() {
    const betSelect = document.getElementById('betSelect');
    const selectedBet = parseFloat(betSelect.value); // Get the selected bet multiplier
    const totalBonusValue = selectedBet * 50; // Bonus buy is x50 of the bet

    // Update the display with the calculated total bonus value
    document.getElementById('bonusValueDisplay').textContent = `Bonus Value: $${totalBonusValue.toFixed(2)}`;
}

// Call this function on page load to set the initial value
updateBonusValue();
// Call this function to initialize the background music on page load or when needed
initializeBackgroundMusic();
/*------------------------------------------------------------------  EVENT LISTENERS ------------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", function() {
    // Define references to HTML elements
    const openPopupButton = document.getElementById("openPopupButton");
    const closePopupButton = document.getElementById("closePopupButton");
    const popupScreen = document.getElementById("infoPopUpScreen");
    const popupContentContainer = document.getElementById("popupContentContainer");
    const prevPageButton = document.getElementById("prevPageButton");
    const nextPageButton = document.getElementById("nextPageButton");

    // Initialize page index
    let currentPageIndex = 0;

    // Content for each page
    const pagesContent = [
        document.getElementById("page1Content"),
        document.getElementById("page2Content"),
        document.getElementById("page3Content")
    ];

    // Function to show/hide pop-up screen
    function openPopup() {
        popupScreen.style.display = "block";
    }

    function closePopup() {
        popupScreen.style.display = "none";
    }

    // Function to show/hide pages based on current index
    function showPage(pageIndex) {
        pagesContent.forEach((page, index) => {
            if (index === pageIndex) {
                page.style.display = "block";
            } else {
                page.style.display = "none";
            }
        });
    }

    // Event listener for open popup button
    openPopupButton.addEventListener("click", openPopup);

    // Event listener for close popup button
    closePopupButton.addEventListener("click", closePopup);

    // Event listener for next page button
    nextPageButton.addEventListener("click", function() {
        currentPageIndex = (currentPageIndex + 1) % pagesContent.length;
        showPage(currentPageIndex);
    });

    // Event listener for previous page button
    prevPageButton.addEventListener("click", function() {
        currentPageIndex = (currentPageIndex - 1 + pagesContent.length) % pagesContent.length;
        showPage(currentPageIndex);
    });

    // Show initial page
    showPage(currentPageIndex);
});

// Function to handle volume changes from the slider
document.getElementById('musicControl').addEventListener('input', function(event) {
    const volumeSlider = event.target;
    const backgroundMusic = document.getElementById('backgroundMusic');
    const bonusModeSong = document.getElementById('bonusModeSong');

    // Convert the slider value (0-100) to a fraction (0-1)
    let volumeValue = volumeSlider.value / 100;
    
    // Ensure the volume does not exceed the MAX_VOLUME
    if (volumeValue > MAX_VOLUME) {
        volumeValue = MAX_VOLUME;
    }

    if (volumeValue > MAX_VOLUME_BONUS) {
        volumeValue = MAX_VOLUME_BONUS;
    }

    // Set the background music volume
    backgroundMusic.volume = volumeValue;
    bonusModeSong.volume = volumeValue;
});

document.addEventListener("DOMContentLoaded", () => {
    const betValue = parseFloat(document.getElementById('betValue').value);
    updatePayouts(betValue);
});
// Add event listener for the "Stop auto spins" button
document.getElementById('stopAutoSpins').addEventListener('click', stopAutoSpinsAfterCurrent);

// Event listener for updating auto spins value display
document.getElementById('autoSpinSlider').addEventListener('input', () => {
    document.getElementById('autoSpinValue').textContent = document.getElementById('autoSpinSlider').value;
});

// Add event listener for the "Stop auto spins" button
document.getElementById('stopAutoSpins').addEventListener('click', stopAutoSpinsAfterCurrent);

// Add event listener for keydown event to trigger spin on spacebar press
document.addEventListener('keydown', function(event) {
       if (event.code === 'Space') {
        event.preventDefault(); // Prevent default behavior like page scrolling
        spin(); 
    }
});
