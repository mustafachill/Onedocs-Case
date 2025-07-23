$(document).ready(function() {
  $('.chat-button').on('click', function() {
    $('.chat-button').css({
      "display": "none"
    });
    $('.chat-box').css({
      "visibility": "visible"
    });
  });

  $('.chat-box .chat-box-header p').on('click', function() {
    $('.chat-button').css({
      "display": "block"
    });
    $('.chat-box').css({
      "visibility": "hidden"
    });
  });

  $("#addExtra").on("click", function() {
    $(".modal").toggleClass("show-modal");
  });

  $(".modal-close-button").on("click", function() {
    $(".modal").toggleClass("show-modal");
  });

  // Chat functionality
  const chatBody = $('#chatBody');
  const messageInput = $('#messageInput');
  const sendButton = $('#sendButton');

  // Send message function
  function sendMessage() {
    const message = messageInput.val().trim();
    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, 'send');
    
    // Clear input
    messageInput.val('');

    // Send to server
    $.ajax({
      url: '/web/chat',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ message: message }),
      success: function(response) {
        // Add bot response to chat
        addMessageToChat(response.message, 'receive');
      },
      error: function() {
        addMessageToChat('❌ Bağlantı hatası. Lütfen tekrar deneyin.', 'receive');
      }
    });
  }

  // Add message to chat UI
  function addMessageToChat(message, type) {
    const currentTime = new Date().toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const messageHtml = `
      <div class="chat-box-body-${type}">
        <p>${message.replace(/\n/g, '<br>')}</p>
        <span>${currentTime}</span>
      </div>
    `;
    
    chatBody.append(messageHtml);
    
    // Scroll to bottom
    chatBody.scrollTop(chatBody[0].scrollHeight);
  }

  // Send button click
  sendButton.on('click', sendMessage);

  // Enter key press
  messageInput.on('keypress', function(e) {
    if (e.which === 13) { // Enter key
      sendMessage();
    }
  });
});