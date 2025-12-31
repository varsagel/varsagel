
const puppeteer = require('puppeteer');
const fs = require('fs');
const XLSX = require('xlsx');

(async () => {
  // --- STATE ---
  let allRows = [];
  let currentRow = [];
  let isRecording = false;

  // --- BROWSER LAUNCH ---
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--disable-blink-features=AutomationControlled' // Helps evade detection
    ]
  });

  const page = await browser.newPage();
  
  // Spoof User Agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // --- NODE <-> BROWSER COMMUNICATION ---

  // 1. Receive text from browser click
  await page.exposeFunction('node_onTextCaptured', (text) => {
    const cleanText = text.trim();
    if (cleanText && isRecording) {
      currentRow.push(cleanText);
      console.log('Captured:', cleanText);
      return currentRow; // Return updated row to UI
    }
    return currentRow;
  });

  // 2. Toggle Recording State
  await page.exposeFunction('node_toggleRecording', (state) => {
    isRecording = state;
    console.log('Recording:', isRecording ? 'ON' : 'OFF');
    return isRecording;
  });

  // 3. Save Current Row
  await page.exposeFunction('node_saveRow', () => {
    if (currentRow.length > 0) {
      allRows.push([...currentRow]);
      console.log('Row Saved:', currentRow);
      currentRow = [];
      return true;
    }
    return false;
  });

  // 4. Export to Excel
  await page.exposeFunction('node_exportData', () => {
    if (allRows.length === 0) {
      console.log('No data to export.');
      return false;
    }
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Scraped Data');
    
    const filename = `scraped_sahibinden_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
    console.log(`Exported to ${filename}`);
    return filename;
  });

  // 5. Get Initial State (on reload)
  await page.exposeFunction('node_getState', () => {
    return {
      currentRow,
      isRecording,
      totalSaved: allRows.length
    };
  });

  // --- INJECT UI SCRIPT ON EVERY NAVIGATION ---
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('DOMContentLoaded', () => {
      // Create UI Container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '10px';
      container.style.right = '10px';
      container.style.width = '300px';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
      container.style.color = 'white';
      container.style.padding = '15px';
      container.style.borderRadius = '8px';
      container.style.zIndex = '999999';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
      
      // Header
      const header = document.createElement('h3');
      header.innerText = 'Varsagel Scraper';
      header.style.margin = '0 0 10px 0';
      header.style.color = '#00ffff';
      header.style.fontSize = '16px';
      container.appendChild(header);

      // Status
      const statusDiv = document.createElement('div');
      statusDiv.style.marginBottom = '10px';
      statusDiv.innerHTML = 'Status: <span id="status-text" style="color:red">OFF</span>';
      container.appendChild(statusDiv);

      // Current Row Display
      const rowDisplay = document.createElement('div');
      rowDisplay.id = 'row-display';
      rowDisplay.style.backgroundColor = '#333';
      rowDisplay.style.padding = '5px';
      rowDisplay.style.marginBottom = '10px';
      rowDisplay.style.minHeight = '20px';
      rowDisplay.style.fontSize = '12px';
      rowDisplay.innerText = 'No data captured yet...';
      container.appendChild(rowDisplay);

      // Buttons Container
      const btnContainer = document.createElement('div');
      btnContainer.style.display = 'flex';
      btnContainer.style.flexWrap = 'wrap';
      btnContainer.style.gap = '5px';
      container.appendChild(btnContainer);

      // Toggle Button
      const toggleBtn = document.createElement('button');
      toggleBtn.innerText = 'Start Rec';
      toggleBtn.style.padding = '5px 10px';
      toggleBtn.style.cursor = 'pointer';
      toggleBtn.style.backgroundColor = '#28a745';
      toggleBtn.style.color = 'white';
      toggleBtn.style.border = 'none';
      toggleBtn.style.borderRadius = '4px';
      btnContainer.appendChild(toggleBtn);

      // Save Row Button
      const saveBtn = document.createElement('button');
      saveBtn.innerText = 'Save Row';
      saveBtn.style.padding = '5px 10px';
      saveBtn.style.cursor = 'pointer';
      saveBtn.style.backgroundColor = '#007bff';
      saveBtn.style.color = 'white';
      saveBtn.style.border = 'none';
      saveBtn.style.borderRadius = '4px';
      btnContainer.appendChild(saveBtn);

      // Export Button
      const exportBtn = document.createElement('button');
      exportBtn.innerText = 'Export XLSX';
      exportBtn.style.padding = '5px 10px';
      exportBtn.style.cursor = 'pointer';
      exportBtn.style.backgroundColor = '#ffc107';
      exportBtn.style.color = 'black';
      exportBtn.style.border = 'none';
      exportBtn.style.borderRadius = '4px';
      btnContainer.appendChild(exportBtn);

      document.body.appendChild(container);

      // --- LOGIC ---
      let localRecording = false;

      // Update UI Helper
      function updateUI(currentRow, totalSaved) {
        const statusText = document.getElementById('status-text');
        statusText.innerText = localRecording ? 'RECORDING' : 'OFF';
        statusText.style.color = localRecording ? '#00ff00' : 'red';
        toggleBtn.innerText = localRecording ? 'Stop Rec' : 'Start Rec';
        toggleBtn.style.backgroundColor = localRecording ? '#dc3545' : '#28a745';

        const display = document.getElementById('row-display');
        if (currentRow && currentRow.length > 0) {
            display.innerHTML = currentRow.map((item, i) => 
                `<div>${i+1}. ${item}</div>`
            ).join('');
        } else {
            display.innerText = 'Waiting for clicks...';
        }
      }

      // Initialize State from Node
      window.node_getState().then(state => {
        localRecording = state.isRecording;
        updateUI(state.currentRow, state.totalSaved);
      });

      // Click Listener
      document.addEventListener('click', async (e) => {
        if (!localRecording) return;
        
        // Don't capture clicks on our own UI
        if (container.contains(e.target)) return;

        // Try to find a meaningful text element
        let target = e.target;
        // Walk up a bit to find <a> or <li> if clicked on span
        if (target.tagName !== 'A' && target.tagName !== 'LI' && target.parentElement) {
            if (target.parentElement.tagName === 'A' || target.parentElement.tagName === 'LI') {
                target = target.parentElement;
            }
        }

        const text = target.innerText || target.textContent;
        if (text) {
            // Flash element
            const originalBorder = target.style.border;
            target.style.border = '2px solid red';
            setTimeout(() => target.style.border = originalBorder, 500);

            // Send to Node
            const newRow = await window.node_onTextCaptured(text);
            updateUI(newRow);
        }
      }, true); // Capture phase

      // Button Handlers
      toggleBtn.onclick = async () => {
        localRecording = !localRecording;
        await window.node_toggleRecording(localRecording);
        // Refresh state to be sure
        const state = await window.node_getState();
        updateUI(state.currentRow);
      };

      saveBtn.onclick = async () => {
        const success = await window.node_saveRow();
        if (success) {
            alert('Row saved!');
            const state = await window.node_getState();
            updateUI(state.currentRow);
        } else {
            alert('Row is empty!');
        }
      };

      exportBtn.onclick = async () => {
        const filename = await window.node_exportData();
        if (filename) {
            alert(`Exported to ${filename}`);
        } else {
            alert('Nothing to export');
        }
      };

    });
  });

  // Navigate to site
  try {
    console.log('Navigating to sahibinden.com...');
    await page.goto('https://www.sahibinden.com/kategori/otomobil', { waitUntil: 'domcontentloaded' });
  } catch (e) {
    console.log('Navigation error (might be blocked or handled manually):', e.message);
  }

  console.log('Collector is ready. Please interact with the browser window.');

})();
