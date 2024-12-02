// ==UserScript==
// @name         YouTube PIP Button
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Adds a Picture-in-Picture button to the YouTube video player
// @author       idkjonas
// @match        https://*.youtube.com/*
// @match        https://youtube.com/*
// @grant        none
// @license      MIT
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function() {
  'use strict';

  const enterPipSVG = `
    <svg height="100%" viewBox="0 0 36 36" width="100%" xmlns="http://www.w3.org/2000/svg">
      <use class="ytp-svg-shadow"></use>
      <path d="M8 17V15H11.6L7.3 10.7L8.7 9.29999L13 13.6V9.99999H15V17H8ZM10 26C9.45 26 8.97917 25.8042 8.5875 25.4125C8.19583 25.0208 8 24.55 8 24V19H10V24H18V26H10ZM26 19V12H17V9.99999H26C26.55 9.99999 27.0208 10.1958 27.4125 10.5875C27.8042 10.9792 28 11.45 28 12V19H26ZM20 26V21H28V26H20Z" fill="white"/>
    </svg>
  `;

  const exitPipSVG = `
    <svg height="100%" viewBox="0 0 36 36" width="100%" xmlns="http://www.w3.org/2000/svg">
      <use class="ytp-svg-shadow"></use>
      <path d="M10 26C9.45 26 8.97917 25.8042 8.5875 25.4125C8.19583 25.0208 8 24.55 8 24V17H10V24H26V12H17V10H26C26.55 10 27.0208 10.1958 27.4125 10.5875C27.8042 10.9792 28 11.45 28 12V24C28 24.55 27.8042 25.0208 27.4125 25.4125C27.0208 25.8042 26.55 26 26 26H10ZM23.075 22.5L24.5 21.075L21.4 18H24V16H18V22H20V19.425L23.075 22.5ZM8 15V10H15V15H8Z" fill="white"/>
    </svg>
  `;
  
  let settingButton = undefined;
  let player = undefined;
  const tooltip = {
    element: undefined,
    text: undefined
  };

  function showTooltip(text, referenceButton, withoutEvent) {
    if (!withoutEvent) settingButton.dispatchEvent(new MouseEvent("mouseover"));
    
    if (!player) {
      player = document.querySelector("#player:not(.skeleton)");
      tooltip.element = document.querySelector(".ytp-tooltip-text-wrapper").parentElement;
      tooltip.text = tooltip.element.querySelector(".ytp-tooltip-text");
    }

    tooltip.text.textContent = text;
    tooltip.element.style.left = "0px";
    
    const buttonRect = referenceButton.getBoundingClientRect();
    const tooltipRect = tooltip.element.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    
    const buttonRelativePos = buttonRect.x - playerRect.x;
    const buttonRelativeCenter = buttonRelativePos + buttonRect.width / 2;
    const left = buttonRelativeCenter - tooltipRect.width / 2;
    
    tooltip.element.style.left = `${left}px`;
  }

  function hideTooltip() {
    settingButton.dispatchEvent(new MouseEvent("mouseout")); 
  }

  const video = document.querySelector(".video-stream");
  const mpBtn = document.querySelector(".ytp-miniplayer-button");
  settingButton = document.querySelector(".ytp-settings-button");

  if (!mpBtn && !video) {
    return;
  }
  
  const newBtn = mpBtn.cloneNode(true);

  const updateButton = () => {
    newBtn.children[0].outerHTML = document.pictureInPictureElement ? exitPipSVG : enterPipSVG;
    newBtn.title = document.pictureInPictureElement ? "Exit Picture-in-Picture" : "Enter Picture-in-Picture";
  };

  updateButton();

  video.addEventListener('enterpictureinpicture', updateButton);
  video.addEventListener('leavepictureinpicture', updateButton);
  
  newBtn.onclick = () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture();
    }
  };

  newBtn.onmouseover = () => showTooltip(newBtn.title, newBtn);
  newBtn.onmouseout = () => hideTooltip();
  
  mpBtn.insertAdjacentElement("afterend", newBtn);
})();
