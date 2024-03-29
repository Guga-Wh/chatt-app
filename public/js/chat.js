const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//options
const { username,room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('Message', (m) =>{
    console.log(m)
    const html = Mustache.render(messageTemplate , {
        username:m.username,
        message:m.text,
        createdAt:moment(m.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage' ,(url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate ,{
        username:url.username,
        url:url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',  ({room, users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
} )

$messageForm.addEventListener('submit', (e) => {
   e.preventDefault()


   $messageFormButton.setAttribute('disabled','disabled')

   //disable
     const message = e.target.elements.message.value


    socket.emit('sendMessage', message, (error) => {
        // enable

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ' '
        $messageFormInput.focus()
        if(error){ 
            return console.log(error)
        }
        console.log('The message was dellivered')
    })


})

$sendLocationButton.addEventListener('click',() =>{

   if (!navigator.geolocation) {
        return alert('The browser have not support for Geolocation.')
    } 
    $sendLocationButton.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords)
        socket.emit('sendLocation', { 
           latitude: position.coords.latitude,
          longitude:  position.coords.longitude
        },() => {
        console.log('The location has shared.')
        $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username,room},(error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
} )