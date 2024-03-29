// ==UserScript==
// @name         hide VK ads
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  x
// @author       xb0t
// @match        https://vk.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vk.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

const waitInterval = setInterval(async () => {

try {
    let wall_marked_as_ads = getElementByXpath("//div[not(@hidden)][@data-post-id][.//div[@class='wall_marked_as_ads']]")
    wall_marked_as_ads.style.display = "none";
    wall_marked_as_ads.setAttribute('hidden', 'hidden');
    console.log('реклама спрятана');
    } catch(e) {};
try {
    let postwithalink = getElementByXpath("//div[not(@hidden)][@data-post-id][.//a[@class='mail_link ']]")
    postwithalink.style.display = "none";
    postwithalink.setAttribute('hidden', 'hidden');
    console.log('пост с ссылкой спрятан');
    } catch(e) {};
try {
    let ad_post = getElementByXpath("//div[not(@hidden)][@data-ad-block-uid]");
    ad_post.style.display = "none";
    ad_post.setAttribute('hidden', 'hidden');
    console.log('реклама спрятана');
    } catch(e) {};
try {
    let SecondaryAttachment = getElementByXpath("//div[not(@hidden)][@data-post-id][.//a[@class='SecondaryAttachment SecondaryAttachment--interactive']]")
    SecondaryAttachment.style.display = "none";
    SecondaryAttachment.setAttribute('hidden', 'hidden');
    console.log('пост с "SecondaryAttachment" ссылкой спрятан');
    } catch(e) {};


    }, 100);
})();
