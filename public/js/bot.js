window.onload = async () => {
    $('.profile-pic').css({
        'background-image': `url(https://cdn.discordapp.com/embed/avatars/0.png)`,
        'background-size': 'cover'
    });

    loadBot();
    loadBotInfo();
};

async function loadBot() {
    const loadBot = await window.api.loadComponent({ name: "config", project: true });
    $('#token').val(loadBot.token);
    $('#client-secret').val(loadBot.clientSecret);
    $('#guild-id').val(loadBot.guildId);
}

function loadBotInfo() {
    const botInfo = JSON.parse(localStorage.getItem('botInfo'));
    if (botInfo) {
        $('#bot-name').text(`${botInfo.username}`);
        $('#bot-id').text(`${botInfo.id}`);
        $('#bot-status').text(`${botInfo.status}`);

        $('.profile-pic').css({
            'background-image': `url(${botInfo.avatar})`,
            'background-size': 'cover'
        });
    }
}

async function startBot() {
    const token = $('#token').val();
    const clientSecret = $('#client-secret').val();
    const guildId = $('#guild-id').val();
    if (token && clientSecret && guildId) {
        window.api.startBot(token, clientSecret, guildId);
        loadBot();
    } else {
        return showNotification("Veuillez entrer un token, client-secret et guild-id valide", true);
    }
}

window.apiReceive.receiveBotStatus((event, response) => {
    if (response.success) {
        $('#bot-name').text(`${response.data.username}`);
        $('#bot-id').text(`${response.data.id}`);
        $('#bot-status').text(`${response.data.status}`);

        $('.profile-pic').css({
            'background-image': `url(${response.data.avatar})`,
            'background-size': 'cover'
        });

        localStorage.setItem('botInfo', JSON.stringify(response.data));

    } else {
        showNotification(response.message, true)
    }
})

function stopBot() {
    window.api.stopBot();

    $('.profile-pic').css({
        'background-image': `url(https://cdn.discordapp.com/embed/avatars/0.png)`,
        'background-size': 'cover'
    });

    $('#bot-name').text('');
    $('#bot-id').text('');
    $('#bot-status').text('');

    localStorage.removeItem('botInfo');
}

function toggleVisibility(inputId, buttonId) {
    const inputField = $(`#${inputId}`);
    const button = $(`#${buttonId}`);

    if (inputField.attr('type') === 'password') {
        inputField.attr('type', 'text');
        button.text('Masquer');
    } else {
        inputField.attr('type', 'password');
        button.text('Afficher');
    }
}