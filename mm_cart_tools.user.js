// ==UserScript==
// @name         MM cart tools
// @namespace    http://tampermonkey.net/
// @version      2023-12-20
// @description  try to take over the world!
// @author       xob0t
// @match        https://megamarket.ru/multicart/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=megamarket.ru
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {

    'use strict';
    // Create a container div for button, input field, and submit button
    var container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';
    container.style.alignItems = 'center';

    // Create an input field for user input
    var inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Enter cart data';
    inputField.style.height = '40px'; // Increase height to match buttons
    inputField.style.flex = '1'; // Take remaining space
    inputField.style.marginRight = '10px';

    // Create a submit button for user input
    var submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.style.padding = '10px';
    submitButton.style.backgroundColor = 'blue';
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '5px';

    // Create a button element for copying stringified array of currentItems
    var copyButton = document.createElement('button');
    copyButton.textContent = 'Copy Cart';
    copyButton.style.padding = '10px';
    copyButton.style.backgroundColor = 'green';
    copyButton.style.color = 'white';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '5px';
    copyButton.style.marginRight = '10px';

    // Append copyButton and submitButton to the container
    container.appendChild(copyButton);
    container.appendChild(submitButton);
    container.appendChild(inputField);

    // Append container to the body
    document.body.appendChild(container);




    // Function to handle button click to copy stringified array of currentItems
    function handleCopy() {
        var dataLayerCart = dataLayer.find(item => item.cart);
        if (dataLayerCart) {
            var cartId = dataLayerCart.cart.lineItems[0].cartId;
            getCartData(cartId)
                .then(cart => {
                var currentItems = extractItems(cart.itemGroups);
                var currentItemsStringified = JSON.stringify(currentItems);
                copyToClipboard(currentItemsStringified);
                copyButton.textContent = 'Copied!'; // Change button text when copied
                copyButton.style.backgroundColor = 'orange';
                setTimeout(function() {
                    copyButton.textContent = 'Copy Cart'; // Revert button text after a brief delay
                    copyButton.style.backgroundColor = 'green';
                }, 3000); // Change button text back after 3 seconds
            })
                .catch(error => {
                console.error("Error occurred while fetching cart data:", error);
            });
        } else {
            console.log('Cart JSON not found in the dataLayer array. Retrying...');
            setTimeout(checkForCart, 1000); // Check again after 1 second
        }
    }

    // Function to handle user input and addToCart if needed
    function handleSubmit() {
        var enteredText = inputField.value.trim();
        if (enteredText !== '') {
            var newItems;
            try {
                newItems = JSON.parse(enteredText);
            } catch (error) {
                console.error('Invalid input. Please enter a valid JSON array.');
                return;
            }

            var dataLayerCart = dataLayer.find(item => item.cart);
            var cartId = null; // Initialize cartId as null

            var currentItems = []; // Initialize currentItems as an empty array

            if (dataLayerCart && dataLayerCart.cart && dataLayerCart.cart.lineItems && dataLayerCart.cart.lineItems.length > 0) {
                cartId = dataLayerCart.cart.lineItems[0].cartId;
            }

            if (cartId) {
                getCartData(cartId)
                    .then(cart => {
                    currentItems = extractItems(cart.itemGroups) || []; // Set currentItems to an empty array if null
                    if (!allItemsInCurrentItems(currentItems, newItems)) {
                        addToCart(newItems, cartId);
                        location.reload();
                    } else {
                        console.log('All items from newItems are already in currentItems.');
                    }
                })
                    .catch(error => {
                    console.error("Error occurred while fetching cart data:", error);
                });
            } else {
                console.log('Cart ID not found or invalid. Proceeding without cartId.');
                addToCart(newItems, cartId);
                location.reload();
                // Perform an action here if cartId is not available
                // For example, you might want to handle adding items to the cart without a cartId
            }
        } else {
            console.log('Please enter valid data.');
        }
    }

    // Add click event listener to the copyButton
    copyButton.addEventListener('click', handleCopy);

    // Add click event listener to the submitButton
    submitButton.addEventListener('click', handleSubmit);


    function extractItems(itemGroups) {
        return itemGroups.map(item => {
            return {
                offer: {
                    id: null,
                    merchantId: item.merchant.id ? parseInt(item.merchant.id) : null
                },
                goods: {
                    goodsId: item.goods.goodsId
                },
                quantity: item.quantity,
                isBpg20: false,
                discounts: []
            };
        });
    }
    function addToCart(items, cartId) {
    fetch("https://megamarket.ru/api/mobile/v2/cartService/offers/add", {
        "body": JSON.stringify({
            "identification": {
                "id": cartId
            },
            "items": items,
            "cartType": "CART_TYPE_DEFAULT",
            "clientAddress": null,
            "locationId": null
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    })
    .then(response => response.json())
    .then(data => {
        console.log("Cart Data:", data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

        // Function to copy text to clipboard
    function copyToClipboard(text) {
        var textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }


    function getCartData(cartId) {
        return fetch("https://megamarket.ru/api/mobile/v2/cartService/cart/get", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "identification": {
                    "id": cartId
                },
                "isCartStateValidationRequired": true,
                "isSelectedItemGroupsOnly": false,
                "loyaltyCalculationRequired": true,
                "isSkipPersonalDiscounts": true
            })
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
            .catch(error => {
            console.error('Error:', error);
            throw error;
        });
    }

    function allItemsInCurrentItems(arr1, arr2) {
        const arr1Str = arr1.map(item => JSON.stringify(item));
        const arr2Str = arr2.map(item => JSON.stringify(item));

        return arr2Str.every(item => arr1Str.includes(item));
    }


})();
