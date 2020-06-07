import { createPW } from './pw.js';

var userColor = new Map();
const getUserColor = (user) => {
    if(!userColor.has(user)) userColor.set(user, `hsl(${Math.floor(Math.random() * 361)}, ${(Math.floor(Math.random() * 50) + 40)}%, 50%`);
    return userColor.get(user);
}

const parseDate = (date) => {
  const parsed = Date.parse(date);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return Date.parse(date.replace(/-/g, '/').replace(/[a-z]+/gi, ' '));
}
var lastMsg = { user: undefined, time: {hours: undefined, minuts: undefined} };
const addToTalk = (timestamp, nickname, text) => {
    var hours, minuts, seconds, now;
    if (timestamp == null) {
        now = new Date;

        hours = now.getUTCHours().toString();
        minuts = now.getUTCMinutes().toString();
        seconds = now.getUTCSeconds().toString();
    }
    else {
        now = new Date(parseDate(timestamp));

        hours = now.getHours().toString();
        minuts = now.getMinutes().toString();
        seconds = now.getSeconds().toString();
    }

    if (hours.length == "1") hours = "0" + hours;
    if (minuts.length == "1") minuts = "0" + minuts;
    if (seconds.length == "1") seconds = "0" + seconds;

    var textTime =hours + ':' + minuts;
    var textUser = nickname;
    var textMessage = text;

    var blockCap = document.createElement('div');
    blockCap.className = 'phrase-cap ng-non-bindable';
    var blockTime = document.createElement('div');
    blockTime.className = 'phrase-line1 fs-xs ng-non-bindable';
    var blockUser = document.createElement('div');
    blockUser.className = 'phrase-line2 fs-md ng-non-bindable';
    blockUser.setAttribute('onclick', 'selectTalkUsers(this)');
    var blockMessage = document.createElement('div');
    blockMessage.className = 'phrase-line3 fs-sm ng-non-bindable';

    blockCap.textContent = textUser.substring(0, 2);
    blockTime.textContent = textTime;
    blockUser.textContent = textUser;

    /* Find and attach links in user message. */
    const LINK_PATTERN = /\b(http|https):\/\/\S+/g;
    if(LINK_PATTERN.test(textMessage)) {
        var links = textMessage.match(LINK_PATTERN);
        var subMessStart = 0;
        var subMessEnd = textMessage.indexOf(links[0]);
        for(let index in links) {
            blockMessage.appendChild(document.createTextNode(textMessage.substring(subMessStart, subMessEnd)));
            
            var link = document.createElement('a');
            link.href = links[index];
            link.target = "_blank";
            link.rel = "noopener noreferrer"
            link.style.wordBreak = "break-all";
            link.textContent = links[index];
            blockMessage.appendChild(link);
            
            subMessStart = (subMessEnd + links[index].length);
            subMessEnd = subMessStart + (textMessage.substring(subMessStart, textMessage.length)).search(LINK_PATTERN);
        }
        blockMessage.appendChild(document.createTextNode(textMessage.substring(subMessStart, textMessage.length)));
    } else {
        blockMessage.textContent = textMessage;
    }

    var blockPhrase = document.createElement('div');
    blockPhrase.className = 'phrase-talk';

    if (lastMsg.user === nickname && lastMsg.time.hours ===  hours && lastMsg.time.minuts === minuts && !document.getElementById('form-talk').lastChild.classList.contains('days-ago-talk')) {
        blockCap.style.height = '0px';
        blockPhrase.appendChild(blockCap);
        blockPhrase.appendChild(blockMessage);
        document.getElementById('form-talk').lastChild.style.paddingBottom = "0";
        blockPhrase.style.padding = "0 0 8px";
    } else {
        const userColor = getUserColor(nickname);

        blockCap.style.background = userColor;
        blockUser.style.color = userColor;
        
        blockPhrase.appendChild(blockCap);
        blockPhrase.appendChild(blockTime);
        blockPhrase.appendChild(blockUser);
        blockPhrase.appendChild(blockMessage);
        lastMsg.user = nickname;
        lastMsg.time.hours = hours;
        lastMsg.time.minuts = minuts;
    }
    document.getElementById('form-talk').appendChild(blockPhrase);
    scrollToBottom("talk-content");
}

const addToTalkSection = (datatext) => {
    var blockMessage = document.createElement('div');
    blockMessage.className ="days-ago-talk fs-md";
    blockMessage.textContent = datatext;

    document.getElementById('form-talk').appendChild(blockMessage);
    scrollToBottom("talk-content");
}

var daysAgoToday = false;
var historyCount = 0;
const downloadHistoryTalk = () => {
    let talkSVG = document.getElementById('form-talk').childNodes[0];
    if (getComputedStyle(talkSVG).display === 'none') {
        let formTalk = document.getElementById('form-talk');
        formTalk.textContent = '';
        formTalk.append(talkSVG);
    }
    xhr.open('Post', "php/talkHistory.php", false);
    var formData = new FormData();
    formData.append("action", "get");
    xhr.send(formData);
    if (xhr.responseText == "Invalid request")
        location.reload();
    var talkHistory  = JSON.parse(xhr.responseText);
    var options = {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timezone: 'UTC'};

    historyCount = 0;
    for(let i = 4; i !== -1; i--) {
        var daysAgo = null;
        if (talkHistory.hasOwnProperty(i)) {
            if (talkHistory[i] !== null && talkHistory[i].length > 0) {
                if (i==0) {
                    daysAgo = "Today";
                    daysAgoToday = true;
                }
                else {
                    if (i==1)
                        daysAgo = "Yesterday";
                    else {
                        var dateHistory = new Date(Date.now() - (i*1000*60*60*24));
                        daysAgo = dateHistory.toLocaleString("en-US", options);
                    }
                }

                historyCount++;
                addToTalkSection(daysAgo);

                talkHistory[i].forEach(function(el) {
                    addToTalk(el['msgtime'], el['name'], el['text']);
                });
            }
        }
    }
}

const createTalkPW = (p) => {
    if (document.getElementById('talkForm') === null) {
        p.append(createPW({
            id: 'talkForm',
            header: {
                title: "Talk",
                buttons: [{
                        class: 'mobile-only', onClick: 'closePW()', toolTip: 'Close[ese]',
                        img: { src: './img/cross-filled.svg', alt: 'Cross Image' }
                    }, {
                        class: 'mobile-only', onClick: "openPWDrawer('talkPWDrawer', 'talkPWOverlay')", toolTip: 'People',
                        img: { class: 'touch-ic__w-free', src: './img/people-filled.svg', alt: 'People Image' }
                    }
                ]
            },
            content: {
                id: 'talk-content',
                child: bakeEl({ type: 'div', att: { id: 'form-talk' },
                    child: bakeEl({ type: 'div', att: { class: 'talk-svg fs-md' },
                        child: [
                            bakeEl({ type: 'img', att: { class:"secondary-icon", style:"margin-bottom: 48px;", src:"./img/message-filled.svg", alt: "SWViewer image", width: "100px" } }),
                            bakeEl({ type: 'span', child: 'No messages' })
                        ]
                    })
                }),
                floatbar: {
                    onSubmit: "event.preventDefault(); document.getElementById('btn-send-talk').onclick();",
                    input: {
                        id: 'phrase-send-talk',
                        onFocus: "scrollToBottom('talk-content')",
                        maxLength: '600',
                        placeholder: "What's on your mind?"
                    },
                    buttons: [{
                            id: 'btn-send-talk',
                            onClick: "angular.element(document.getElementById('angularapp')).scope().sendTalkMsg()",
                            toolTip: 'Send',
                            img: {
                                src: './img/send-filled.svg',
                                alt: 'Send image'    
                            }
                        }
                    ]
                }
            },
            drawer: {
                id: 'talkPWDrawer',
                child: [
                    bakeEl({ type: 'div', att: { class: 'action-header__sticky' }, child: bakeEl({ type: 'span', child: 'People', att: {class: 'action-header__title fs-lg' } }) }),
                    bakeEl({ type: 'div', att: { id: 'talkPeopleContent', class: 'pw__drawer__content' } })
                ]
            },
            overlay: {
                id: 'talkPWOverlay',
                onClick: "closePWDrawer('talkPWDrawer', 'talkPWOverlay')"
            }
        }));
        downloadHistoryTalk();
        angular.element(document.getElementById('angularapp')).scope().displayTalkPeople();
    }
};

export { createTalkPW, downloadHistoryTalk, addToTalk, addToTalkSection, daysAgoToday, historyCount }