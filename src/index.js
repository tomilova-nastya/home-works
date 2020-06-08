import './styles.css';
import loginFormRender from './templates/login-form.hbs';
import chatFormRender from './templates/chat-form.hbs';
import uploadFormRender from './templates/upload-form.hbs';
import messagesRender from './templates/messages.hbs';
import participantsRender from './templates/participants.hbs';


let socket = io();
let authorName = '';
let authorNickname = '';

function chatInit() {
    const container = document.querySelector('.container');
    container.innerHTML = loginFormRender({});

    const nameInput = document.querySelector('.login-form__nameInput');
    const nicknameInput = document.querySelector('.login-form__nicknameInput');
    const loginButton = document.querySelector('.login-form__sendButton');

    loginButton.addEventListener('click', () => {
        socket.emit('participantLogin', `${nameInput.value};${nicknameInput.value}`);
        authorName = nameInput.value;
        authorNickname = nicknameInput.value;

        openChatForm(container);
    });
}

function openChatForm(container) {
    container.innerHTML = chatFormRender({});

    socket.on('updateParticipantsCount', (data) => {
        let countCaption = document.querySelector('#activeParticipantsCount');

        if (countCaption !== undefined) {
            countCaption.innerHTML = data.description;
        }
    });

    socket.on('updateParticipants', (response) => {
        let participants = JSON.parse(response.description);

        let participantsBlock = document.querySelector('.participants-block__wrapper');
        participantsBlock.innerHTML = participantsRender({ participants: participants });


        let photo = document.querySelector(`.participantPhoto.${authorNickname}`);
        photo.addEventListener('click', () => {
            openUploadForm(container);
        })
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
}

function openUploadForm(container) {
    container.innerHTML = uploadFormRender({});

    let uploadButton = document.querySelector('.upload-form__uploadButton');

    uploadButton.addEventListener('change', (evt) => {
        let file = evt.target.files;
        let f = file[0];

        if (!f.type.match('image.*')) {
            alert("Image only please....");
        }

        let reader = new FileReader();

        reader.onload = (function(theFile) {
            return function(e) {
                let uploadImage = document.querySelector('.upload-form__uploadOutput',);
                uploadImage.innerHTML = ['<img class="" title="', escape(theFile.name), '" src="', e.target.result, '" />'].join('');


                let saveButton = document.querySelector('.upload-form__saveButton');

                saveButton.addEventListener('click', () => {
                    socket.emit('writeFile', { description: `${authorNickname}&&&&&${reader.result}` });
                });
            };

        })(f);

        // reader.onload = (function(theFile) {
        //     return function(e) {
        //         let saveButton = document.querySelector('.upload-form__saveButton');
        //
        //         saveButton.addEventListener('click', () => {
        //             socket.emit('writeFile', { description: `${authorNickname}&&&&&${reader.result}` });
        //         });
        //     };
        //
        // })(f);

        reader.readAsDataURL(f);
    })

    let cancelButton = document.querySelector('.upload-form__cancelButton');
    cancelButton.addEventListener('click', () => {
        openChatForm();
    })
}

chatInit();
