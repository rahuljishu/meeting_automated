document.addEventListener('DOMContentLoaded', function() {
  // Load scheduled meetings
  showMeetings();

  // Schedule new meeting
  document.getElementById('schedule').addEventListener('click', function() {
    const link = document.getElementById('meetLink').value;
    const date = document.getElementById('meetDate').value;
    const time = document.getElementById('meetTime').value;

    if (!link || !date || !time) {
      alert('Please fill all fields');
      return;
    }

    const meetingTime = new Date(date + 'T' + time);
    const meeting = {
      link: link,
      time: meetingTime.getTime(),
      id: Date.now()
    };

    // Save meeting
    chrome.storage.local.get(['meetings'], function(result) {
      const meetings = result.meetings || [];
      meetings.push(meeting);
      chrome.storage.local.set({ meetings: meetings }, function() {
        // Create alarm
        chrome.alarms.create(meeting.id.toString(), {
          when: meeting.time
        });
        showMeetings();
      });
    });
  });
});

function showMeetings() {
  const list = document.getElementById('meetingsList');
  chrome.storage.local.get(['meetings'], function(result) {
    const meetings = result.meetings || [];
    list.innerHTML = '';
    
    meetings.forEach(meeting => {
      const div = document.createElement('div');
      div.className = 'meeting';
      const time = new Date(meeting.time);
      div.innerHTML = `
        <div>${meeting.link}</div>
        <div>${time.toLocaleString()}</div>
        <button onclick="deleteMeeting(${meeting.id})">Delete</button>
      `;
      list.appendChild(div);
    });
  });
}

function deleteMeeting(id) {
  chrome.storage.local.get(['meetings'], function(result) {
    const meetings = result.meetings.filter(m => m.id !== id);
    chrome.storage.local.set({ meetings: meetings }, function() {
      chrome.alarms.clear(id.toString());
      showMeetings();
    });
  });
}