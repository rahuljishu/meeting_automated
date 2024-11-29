chrome.alarms.onAlarm.addListener(function(alarm) {
  chrome.storage.local.get(['meetings'], function(result) {
    const meetings = result.meetings || [];
    const meeting = meetings.find(m => m.id.toString() === alarm.name);
    
    if (meeting) {
      // Open meeting in new tab
      chrome.tabs.create({ url: meeting.link }, function(tab) {
        // Wait for page to load
        setTimeout(() => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
              // Function to click buttons
              function clickButton() {
                // Try to find and click the join button
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                  // Check for different variations of join button text
                  if (
                    button.textContent.toLowerCase().includes('join now') ||
                    button.textContent.toLowerCase().includes('join meeting') ||
                    button.textContent.toLowerCase().includes('join')
                  ) {
                    button.click();
                    return true;
                  }
                }
                return false;
              }

              // First attempt
              if (!clickButton()) {
                // If button not found, try again after a short delay
                setTimeout(clickButton, 2000);
              }

              // Turn off camera and microphone (optional)
              setTimeout(() => {
                document.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'e',
                  code: 'KeyE',
                  ctrlKey: true
                }));
                document.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'd',
                  code: 'KeyD',
                  ctrlKey: true
                }));
              }, 3000);
            }
          });
        }, 5000);  // Wait 5 seconds for page to load
      });
    }
  });
});