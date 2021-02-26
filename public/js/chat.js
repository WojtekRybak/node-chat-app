const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoscroll = () => {
    //new message element
    const $newMessages = $newMessages.lastElementChild

    //hight of the new messages
    const newMessagesStyles = getComputedStyle($newMessages)
    const newMessageMargin = parseInt(newMessagesStyles.marginBottom)
    const newMessageHight = $newMessages.offsetHeight + newMessageMargin
    
    //visible height
    const visibleHeight = $messages.offsetHeight;
    //height of mess container
    const containerHeight = $messages.scrollHeight
    // how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
    
}

socket.on('message', (message) => {             //message is an object with text and createdAt
    
    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message : message.text,                         //vars is being sent to  mustache
        createdAt : moment(message.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (data) => {
    const html = Mustache.render(locationMessageTemplate, {
        username : data.username,
        url : data.url,
        createdAt : moment(data.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})
socket.on('roomData', ({room, users})=> {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

socket.emit('join', {username,room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/';
    }
})