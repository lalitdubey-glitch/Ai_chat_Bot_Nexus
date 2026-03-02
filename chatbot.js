let GROQ_API_KEY = "Grok_key";
let currentChatId = Date.now().toString();
let chats = JSON.parse(localStorage.getItem('chat_history')) || {};

$(document).ready(function () {
    // Initialize Icons
    lucide.createIcons();

    // Load recent chats on init
    updateRecentList();
    resetChatUI();

    // Input height auto-adjust
    $('#userInput').on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Enter to send
    $('#userInput').on('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send button click
    $('#sendBtn').on('click', function () {
        sendMessage();
    });

    // Toggle Sidebar Mobile
    $('#toggleSidebar').on('click', function (e) {
        e.stopPropagation();
        $('#sidebar').toggleClass('active');
    });

    // Close sidebar when clicking outside on mobile
    $(document).on('click', function (e) {
        const sidebar = $('#sidebar');
        if (sidebar.hasClass('active') && !sidebar.is(e.target) && sidebar.has(e.target).length === 0) {
            sidebar.removeClass('active');
        }
    });

    // New Chat
    $('#newChatBtn').on('click', function () {
        startNewChat();
    });

    // Clear All History
    $('#sidebarClearChat').on('click', function () {
        clearAllHistory();
    });

    // Mode switch - Update suggestions and button text
    $('#chatMode').on('change', function () {
        const mode = $(this).val();
        const suggestions = $('#suggestions');
        const sendBtn = $('#sendBtn');

        if (mode === 'image') {
            sendBtn.html('<i data-lucide="image-plus"></i> Generate');
            sendBtn.css('min-width', '130px');
            suggestions.html(`
                <div class="suggestion-chip">Cyberpunk City 🌃</div>
                <div class="suggestion-chip">Mystical Forest 🌿</div>
                <div class="suggestion-chip">Sci-fi Cockpit 🚀</div>
                <div class="suggestion-chip">Royal Cat 👑</div>
            `).fadeIn(300);
            $('#userInput').attr('placeholder', 'Describe the image...');
        } else {
            sendBtn.html('<i data-lucide="send"></i>');
            sendBtn.css('min-width', '52px');
            suggestions.html(`
                <div class="suggestion-chip">Kaise ho? 👋</div>
                <div class="suggestion-chip">What can you do? 🤖</div>
                <div class="suggestion-chip">Tell a joke! 😂</div>
            `).fadeIn(300);
            $('#userInput').attr('placeholder', 'Ask anything...');
        }
        lucide.createIcons();
    });

    // Clear current chat
    $('#clearChat').on('click', function () {
        Swal.fire({
            title: 'Clear chat?',
            text: "Kya aap iss chat ko delete karna chahte hain?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Haan!',
            cancelButtonText: 'Nahi, rehne do',
            background: '#16161a',
            color: '#ffffff'
        }).then((result) => {
            if (result.isConfirmed) {
                resetChatUI();
                delete chats[currentChatId];
                saveChats();
                updateRecentList();
            }
        });
    });

    // Suggestion chips
    $(document).on('click', '.suggestion-chip', function () {
        let text = $(this).text().replace(/[👋🤖😂🌦️]/g, '').trim();
        $('#userInput').val(text).focus();
        sendMessage();
    });
});

function startNewChat() {
    currentChatId = Date.now().toString();
    resetChatUI();
    updateRecentList();
    if ($(window).width() < 768) $('#sidebar').removeClass('active');
}

function resetChatUI() {
    const hours = new Date().getHours();
    let greeting = "Good Evening";
    if (hours < 12) greeting = "Good Morning";
    else if (hours < 17) greeting = "Good Afternoon";

    $('#messages').html(`
        <div class="welcome">
            <div class="emoji">
                <i data-lucide="sparkles" style="width: 80px; height: 80px; color: var(--accent2);"></i>
            </div>
            <h2>${greeting}, Explorer.</h2>
            <p>I am Nexus AI. Ready to assist with your journey today. Ask anything or describe an image to create.</p>
        </div>
    `);
    $('#suggestions').fadeIn(300);
    $('#userInput').val('').css('height', 'auto');
    lucide.createIcons();
}

function saveChats() {
    localStorage.setItem('chat_history', JSON.stringify(chats));
}

function updateRecentList() {
    const list = $('#recentList');
    list.empty();

    const sortedIds = Object.keys(chats).sort((a, b) => b - a);

    if (sortedIds.length === 0) {
        list.append('<div class="no-chats">No recent chats</div>');
        return;
    }

    sortedIds.forEach(id => {
        const chat = chats[id];
        const title = chat.title || "New Chat";
        const activeClass = id === currentChatId ? 'active' : '';

        const item = $(`
            <div class="recent-item ${activeClass}" data-id="${id}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px;">
                <div class="chat-info" style="flex: 1; display: flex; align-items: center; gap: 10px; overflow: hidden; cursor: pointer;">
                    <i data-lucide="message-square" style="width: 16px; height: 16px; color: var(--accent2);"></i>
                    <span class="chat-title" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</span>
                </div>
                <button class="delete-chat-btn" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; font-size: 14px; display: none;">
                    <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                </button>
            </div>
        `);

        item.find('.chat-info').on('click', () => loadChat(id));
        item.find('.delete-chat-btn').on('click', (e) => {
            e.stopPropagation();
            deleteChat(id);
        });

        item.hover(
            function () { $(this).find('.delete-chat-btn').show(); },
            function () { $(this).find('.delete-chat-btn').hide(); }
        );

        list.append(item);
    });

    lucide.createIcons();
}

function deleteChat(id) {
    Swal.fire({
        title: 'Delete this chat?',
        text: "Ye conversation permanently delete ho jayegi.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Haan, delete kardo!',
        background: '#16161a',
        color: '#ffffff'
    }).then((result) => {
        if (result.isConfirmed) {
            delete chats[id];
            saveChats();
            if (id === currentChatId) startNewChat();
            else updateRecentList();
        }
    });
}

function loadChat(id) {
    if (id === currentChatId) return;

    currentChatId = id;
    const chat = chats[id];
    $('#messages').empty();

    chat.messages.forEach(msg => {
        addMessage(msg.type, msg.text, msg.imgSrc, msg.promptText, false);
    });

    $('#suggestions').hide();
    updateRecentList();

    if ($(window).width() < 768) $('#sidebar').removeClass('active');
    lucide.createIcons();
}

function clearAllHistory() {
    Swal.fire({
        title: 'Delete All History?',
        text: "Saari purani chats delete ho jayengi. Kya aap sure hain?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#7c3aed',
        confirmButtonText: 'Haan, sab delete kardo',
        background: '#16161a',
        color: '#ffffff'
    }).then((result) => {
        if (result.isConfirmed) {
            chats = {};
            saveChats();
            startNewChat();
            Swal.fire({
                title: 'Deleted!',
                text: 'History cleared successfully.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#16161a',
                color: '#ffffff'
            });
        }
    });
}

function formatMessage(text) {
    // Basic Markdown
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function addMessage(type, text, imgSrc = null, promptText = null, shouldSave = true) {
    let avatar = type === 'bot'
        ? '<i data-lucide="bot" style="width: 20px; height: 20px;"></i>'
        : '<i data-lucide="user" style="width: 20px; height: 20px;"></i>';
    let formattedText = formatMessage(text);

    // Save message to history
    if (shouldSave) {
        if (!chats[currentChatId]) {
            chats[currentChatId] = {
                title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
                messages: [],
                timestamp: Date.now()
            };
        }
        chats[currentChatId].messages.push({ type, text, imgSrc, promptText });
        saveChats();
        updateRecentList();
    }

    let content = imgSrc
        ? `<div class="bubble">${formattedText} 
            <div class="image-bubble" style="margin-top:10px;">
                <div class="skeleton-loader">
                    <div class="image-loader" style="padding:20px; text-align:center;">AI Painting... 🎨</div>
                </div>
                <img src="${imgSrc}" alt="AI Image" style="display:none; width:100%; border-radius:12px;" 
                     onload="$(this).fadeIn().siblings('.skeleton-loader').hide();"
                     onerror="$(this).siblings('.skeleton-loader').html('❌ Image Generation Pending/Failed. <br><small>Hamesha retry karke dekhein ya prompt badlein.</small>').css({'background':'rgba(255,0,0,0.1)','font-size':'12px','padding':'20px'});">
                
                <div class="image-controls">
                    <button class="img-action-btn" onclick="downloadImage('${imgSrc}')">📥 Download</button>
                    <button class="img-action-btn retry" onclick="retryImage('${promptText}')">🔄 Retry</button>
                </div>
            </div>
          </div>`
        : `<div class="bubble">${formattedText}</div>`;

    let msgDiv = $(`
        <div class="message ${type}">
            <div class="msg-avatar">${avatar}</div>
            ${content}
        </div>
    `);

    $('#messages').append(msgDiv);

    // Smooth scroll
    const messages = document.getElementById('messages');
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: 'smooth'
    });

    // Image click to open
    if (imgSrc) {
        msgDiv.find('img').on('click', function () {
            window.open(imgSrc, '_blank');
        });
    }

    // Refresh Icons
    lucide.createIcons();
}

// Global function for download
async function downloadImage(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = `AI_Image_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Downloading...',
            showConfirmButton: false,
            timer: 2000,
            background: '#16161a',
            color: '#fff'
        });
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback for cross-origin images
        window.open(url, '_blank');
    }
}

// Custom loader for images
function showImageSkeleton(prompt) {
    let formattedPrompt = formatMessage(`Ye rahi aapki image: **${prompt}**`);
    let skeletonDiv = $(`
        <div class="message bot" id="image-loading">
            <div class="msg-avatar"><i data-lucide="bot" style="width: 18px; height: 18px;"></i></div>
            <div class="bubble">
                ${formattedPrompt}
                <div class="image-bubble" style="margin-top:10px;">
                    <div class="skeleton-loader">
                        <div class="image-loader" style="padding:20px; text-align:center;">AI Painting... 🎨</div>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('#messages').append(skeletonDiv);
    const messages = document.getElementById('messages');
    messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
    lucide.createIcons();
}

function showTyping() {
    let typingDiv = $(`
        <div class="message bot" id="typing">
            <div class="msg-avatar"><i data-lucide="bot" style="width: 18px; height: 18px;"></i></div>
            <div class="bubble">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `);

    $('#messages').append(typingDiv);
    const messages = document.getElementById('messages');
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: 'smooth'
    });
    lucide.createIcons();
}

function hideTyping() {
    $('#typing').fadeOut(200, function () {
        $(this).remove();
    });
}

async function sendMessage() {
    if (!GROQ_API_KEY) {
        Swal.fire({
            icon: 'error',
            title: 'API Key Missing',
            text: 'Pehle Groq API key daalo!',
            background: '#16161a',
            color: '#ffffff',
            confirmButtonColor: '#7c3aed'
        });
        return;
    }

    let userMessage = $('#userInput').val().trim();
    if (!userMessage) return;

    let currentMode = $('#chatMode').val();

    // Reset input
    $('#userInput').val('').css('height', 'auto');
    $('#sendBtn').prop('disabled', true);
    $('#suggestions').fadeOut(300);

    addMessage('user', userMessage);

    // Artificial delay for personality
    setTimeout(async () => {
        try {
            if (currentMode === 'chat') {
                showTyping();
                let data = await callGroqAPI(userMessage);
                hideTyping();
                let botReply = data.choices[0].message.content;
                addMessage('bot', botReply);
            } else {
                // Image mode - Show skeleton immediately instead of bubbles
                showImageSkeleton(userMessage);

                let result = await generateImage(userMessage);

                // Hide the placeholder and show final message
                $('#image-loading').remove();
                addMessage('bot', `Ye rahi aapki image: **${userMessage}**`, result, userMessage);
            }
        } catch (error) {
            hideTyping();
            $('#image-loading').remove();
            addMessage('bot', '❌ Maaf kijiye, kuch error aa gaya. Kripya dobara koshish karein.');
            console.error(error);
        } finally {
            $('#sendBtn').prop('disabled', false);
            $('#userInput').focus();
        }
    }, 600);
}

// Global function to retry image generation
async function retryImage(prompt) {
    if (!prompt || prompt === 'null') return;

    showTyping();
    try {
        let result = await generateImage(prompt);
        hideTyping();
        addMessage('bot', `Dobara koshish: **${prompt}**`, result, prompt);
    } catch (error) {
        hideTyping();
        Swal.fire({
            icon: 'error',
            title: 'Retry Failed',
            text: 'Dobara generation fail ho gayi.',
            background: '#16161a',
            color: '#fff'
        });
    }
}

async function generateImage(prompt) {
    try {
        if (typeof puter !== 'undefined') {
            const cleanPrompt = prompt.replace(/[^\x00-\x7F]/g, "").trim();
            const enhancedPrompt = `${cleanPrompt}, high resolution, extremely detailed, cinematic lighting`;

            const imageElement = await puter.ai.txt2img(enhancedPrompt, {
                provider: "together",
                model: "ByteDance-Seed/Seedream-3.0", // Together ka model
                width: 1024,                       //Width pixels mein
                height: 1792                       // Height pixels mein — mobile portrait!
            });

            return imageElement.src;
        } else {
            throw new Error("Puter library not loaded");
        }
    } catch (e) {
        console.error("Puter Image Gen Error:", e);
        throw e;
    }
}
function callGroqAPI(userMessage) {
    let request = $.ajax({
        url: "/.netlify/functions/grok",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ userMessage: userMessage })
    });

    return request;
}

