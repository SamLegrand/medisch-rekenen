$(document).ready(function(){
    $('#LoginForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: '/api/login',
            data: {
                "username": $('input[name="username"]').val(),
                "email": $('input[name="email"]').val()
            },
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "ErrorUser") {
                    $("#userError").slideDown();
                }
                else if (response.Status === "Success") {
                    window.location.href = '/evaluation';
                }
                else {
                    console.log(response);
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
    
    $('#AdminForm').submit(function(e) {
        e.preventDefault();
        $.ajax({
            url: '/api/login',
            data: {
                "username": 'admin',
                "password": $('input[name="password"]').val()
            },
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.Status === "ErrorPass") {
                    $("#passError").slideDown();
                }
                else if (response.Status === "Success") {
                    window.location.href = '/admin';
                }
                else {
                    console.log(response);
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
    
    $('#adminLogin').on('click', function(e) {
        $('#LoginForm').slideUp();
        $('#AdminForm').slideDown();
    });
    
    $('#studentLogin').on('click', function(e) {
        $('#AdminForm').slideUp();
        $('#LoginForm').slideDown();
    });
    
    $('#to-instructions').on('click', function(e) {
         $('#welcome').slideUp();
         $('#instructions').slideDown();
    });
    
    $('#back-welcome').on('click', function(e) {
         $('#welcome').slideDown();
         $('#instructions').slideUp();
    });
    
});
