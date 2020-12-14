const socket = io();
let isNickSet = false;

socket.on('chat', function(data) {
    $('textarea').val($('textarea').val() + data + '\n')
});

socket.on('userlist', (data) => {
    console.log("client : userlist event : data => ", data)
    $('#activeuser').empty()
    data.map((item) => {
        $('#activeuser').append(`nickname: <strong>${item}<strong><br/>`)
    })
    let total = data.length;
    document.getElementById('listu').innerHTML = total
    $('b').val(total);
});

$(function() {
    $('#nick').on('click', function(event) {
        event.preventDefault()
        socket.emit('nick', $('#nickText').val());
        $('#nick').hide()
        isNickSet = true
    });
    $('#chat').on('click', function(event) {
        event.preventDefault()
        if (isNickSet) {
            socket.emit('chat', {
                message: $('#chatText').val()
            });
        }
        $('#chatText').val('')
    });
});