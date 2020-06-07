import './styles.css';
import loginFormRender from './templates/login-form.hbs';
import chatFormRender from './templates/chat-form.hbs';
import messagesRender from './templates/messages.hbs';
import participantsRender from './templates/participants.hbs';


let socket = io();

function chatInit() {
    const container = document.querySelector('.container');
    container.innerHTML = loginFormRender({});

    const nameInput = document.querySelector('.login-form__nameInput');
    const nicknameInput = document.querySelector('.login-form__nicknameInput');
    const sendButton = document.querySelector('.login-form__sendButton');

    sendButton.addEventListener('click', () => {
        socket.emit('participantLogin', `${nameInput.value};${nicknameInput.value}`);

        let participants = [];
        let activeParticipantsCount = 0;

        socket.on('getParticipants', (response) => {
            participants = JSON.parse(response.description);

            socket.on('getActiveParticipantsCount', (response) => {
                activeParticipantsCount = Number(response.description);

                container.innerHTML = chatFormRender({});

                let participantsBlock = document.querySelector('.participants-block__wrapper');
                let messagesBlock = document.querySelector('.messages-block__wrapper');

                // console.log(participants[0].name);
                // console.log(participants[0].photoUrl);
                // console.log(participants[0].lastMessage);

                participantsBlock.innerHTML = participantsRender({ participants: participants });
                messagesBlock.innerHTML = messagesRender({ activeParticipantsCount: activeParticipantsCount, messages: [] });
            });
        });
    });
}


chatInit();
