chrome.runtime.onInstalled.addListener(() => {
    console.log("Gmail Notifier installed.");
});

chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError || !token) {
        console.error(chrome.runtime.lastError);
        return;
    }

    fetch('https://www.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&maxResults=1&q=is:unread', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(response => response.json()).then(data => {
        if (data.messages && data.messages.length > 0) {
            const messageId = data.messages[0].id;

            fetch('https://www.googleapis.com/gmail/v1/users/me/messages/' + messageId, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            }).then(response => response.json()).then(messageData => {
                const headers = messageData.payload.headers;
                const subjectHeader = headers.find(header => header.name === 'Subject');
                const fromHeader = headers.find(header => header.name === 'From');

                const subject = subjectHeader ? subjectHeader.value : 'No Subject';
                const from = fromHeader ? fromHeader.value : 'Unknown Sender';

                chrome.notifications.create('', {
                    title: from,
                    message: subject,
                    iconUrl: 'icons/icon128.png',
                    type: 'basic'
                });
            });
        }
    });
});
