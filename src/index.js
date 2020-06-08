import './styles.css';
import loginFormRender from './templates/login-form.hbs';
import chatFormRender from './templates/chat-form.hbs';
import messagesRender from './templates/messages.hbs';
import participantsRender from './templates/participants.hbs';


let socket = io();
let authorName = '';

function chatInit() {
    const container = document.querySelector('.container');
    container.innerHTML = loginFormRender({});

    const nameInput = document.querySelector('.login-form__nameInput');
    const nicknameInput = document.querySelector('.login-form__nicknameInput');
    const loginButton = document.querySelector('.login-form__sendButton');

    loginButton.addEventListener('click', () => {
        socket.emit('participantLogin', `${nameInput.value};${nicknameInput.value}`);
        authorName = nameInput.value;

        container.innerHTML = chatFormRender({});

        socket.on('updateParticipantsCount', (data) => {
            let countCaption = document.querySelector('#activeParticipantsCount');
            console.log(countCaption);

            if (countCaption !== undefined) {
                countCaption.innerHTML = data.description;
            }
        });

        socket.on('updateParticipants', (response) => {
            let participants = JSON.parse(response.description);

            let participantsBlock = document.querySelector('.participants-block__wrapper');
            participantsBlock.innerHTML = participantsRender({ participants: participants });
        });

        socket.on('updateMessages', (response) => {
            let messages = JSON.parse(response.description);

            let messagesBlock = document.querySelector('.messages-block__wrapper');
            messagesBlock.innerHTML = messagesRender({ messages: messages });


            let sendMessageButton = document.querySelector('.chat-form__sendButton');
            let messageInput = document.querySelector('.chat-form__messageInput');

            sendMessageButton.addEventListener('click', () => {
                socket.emit('sendMessage', `${messageInput.value}&&&${authorName}`);
                messageInput.value = '';
            })
        });
    });
}

chatInit();
