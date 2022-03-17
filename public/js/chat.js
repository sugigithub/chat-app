const socket = io();
const $form = document.querySelector("#message-form");
const $forminput = $form.querySelector('input');
const $formBtn = $form.querySelector('button');
const $locationBtn = document.querySelector("#location");
const $messages = document.querySelector("#messages");

const $loctionTemp = document.querySelector("#location-template").innerHTML;
const $sidebar = document.querySelector("#sidebar-template").innerHTML;

const autoscroll = () => {
    // new message element
    $newmsg = $messages.lastElementChild

    // height of last mesage
    const msgmargin = parseInt(getComputedStyle($newmsg).marginBottom);
    const msgheight = $newmsg.offsetHeight + msgmargin;
    console.log(msgmargin);

    // visible height
    const visibleheight = $messages.offsetHeight;
    const totalHeight = $messages.scrollHeight;

    // how far scrolles

    const scrolloffset = $messages.scrollTop + visibleheight;

    if (totalHeight - msgheight <= scrolloffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
console.log($loctionTemp)
const $template = document.querySelector("#message-template").innerHTML;

// eent handlers

socket.on('message', message => {
    console.log(message, "message on");
    const html = Mustache.render($template, {
        username: message.username,
        message: message.msg,
        time: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})
socket.on('locationMessage', (location) => {
    console.log(location);
    const html = Mustache.render($loctionTemp, {
        username: location.username,
        url: location.url,
        time: moment(location.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomdata', ({ room, users }) => {
    console.log(room, users);
    const html = Mustache.render($sidebar, {
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML = html;
})

$form.addEventListener('submit', (e) => {
    e.preventDefault();
    $formBtn.setAttribute('disabled', 'disabled');
    const message = $forminput.value;
    socket.emit('sendMessage', message, (error) => {
        $formBtn.removeAttribute('disabled');
        $forminput.value = '';
        $forminput.focus();
        if (error) return console.log(error);
        console.log('message delivered successfully')
    });
});

$locationBtn.addEventListener('click', (e) => {

    if (!navigator.geolocation) {
        return alert('Geolocation not supported');
    }
    $locationBtn.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { latitide: position.coords.latitude, longitude: position.coords.longitude }, (msg) => {
            console.log(msg)
            $locationBtn.removeAttribute('disabled');

        });

    })
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
});