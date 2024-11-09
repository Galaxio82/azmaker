function navigateTo(page) {
    window.api.navigateTo(page);
}

function showNotification(message, isError = false) {
    const notification = $('#notification').removeClass('notification error').addClass(isError ? 'notification error' : 'notification').text(message);
    notification.show();
    setTimeout(() => {
        notification.hide();
    }, 3000);
}